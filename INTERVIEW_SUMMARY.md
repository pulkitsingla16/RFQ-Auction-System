# 📚 INTERVIEW PREPARATION SUMMARY

**Interview Topic:** Auction System Deep Dive  
**Duration:** 1-2 hours  
**Level:** Senior Backend Engineer

---

## 🎯 Key Questions & Answers

### 1. RFQ & Auction Creation

**Q: How did you implement RFQ creation with British Auction enabled?**

A: RFQ creation is simple - just stores basic logistics data (origin, destination, pickup date). The British Auction parameters are set during auction creation, not RFQ creation.

```javascript
// RFQ: Basic data
{
  (title, description, origin, destination, pickupDate, currency);
}

// Auction: British Auction parameters added here
{
  (bidStartTime,
    bidCloseTime,
    forcedCloseTime,
    triggerWindowMinutes,
    extensionDurationMinutes);
}
```

---

**Q: Where do you validate `forcedCloseTime > bidCloseTime`?**

A: ❌ **Currently NOT validated** - This is a gap. Should add temporal validation:

```javascript
if (closeDate >= forcedDate) {
  return res.status(400).json({
    message: "Bid close time must be before forced close time",
  });
}
```

---

**Q: What happens in backend if invalid data is sent?**

A: Depends on validation:

- Missing fields → MongoDB validation error (400)
- Unauthorized buyer → 401 Not Authorized
- Invalid time ordering → ❌ Currently accepted (BUG!)
- Generic errors → Caught in catch block (400)

---

### 2. Bid Placement

**Q: How did you implement the place bid API?**

A: Three main parts:

1. **Status checks** - Auction exists, is active, within time window
2. **Bid creation** - Create Bid document
3. **Extension logic** - Check if auction should extend (British auction)

---

**Q: What checks happen before saving a bid?**

A:

| Check                      | Status | Implemented                        |
| -------------------------- | ------ | ---------------------------------- |
| Auction active?            | ✅     | Yes - checks status                |
| Within time?               | ✅     | Yes - compares now vs bidCloseTime |
| Lower than current lowest? | ❌     | **NO - This is missing!**          |

---

**Q: Where is this logic written? (controller vs service)**

A: Everything is in the controller (`bidController.js`). No separate service layer. This is okay for this system size but could be refactored later.

```
Request → bidController.placeBid() → All logic here
```

---

**Q: Did you validate on frontend, backend, or both?**

A: **Mostly backend**, which is correct:

- ✅ Backend: Status, time checks, authorization
- ⚠️ Frontend: Only checks amount > 0 (basic validation)
- ❌ Missing: Frontend should check current lowest bid

---

### 3. Ranking System

**Q: How did you implement supplier ranking?**

A: Simple sorting at query time:

```javascript
const bids = await Bid.find({ auctionId }).sort({ amount: 1 }); // Lowest first

// Map to add rank:
const ranked = bids.map((b, idx) => ({ ...b, rank: idx + 1 }));
```

---

**Q: Do you sort in database query or compute in backend logic?**

A: **Both!**

- Database: Sorts by amount (MongoDB handles this efficiently)
- Backend: Assigns rank numbers (simple map operation)

---

**Q: Is ranking stored or calculated dynamically?**

A: **Stored in schema but NOT maintained** - ranks are always recalculated on read.

**Problem:** Bid.rank field defaults to 1 for all bids

**Solution:** Remove stored rank, always compute on read

---

### 4. British Auction Extension

**Q: How did you implement trigger window logic?**

A: Compare milliseconds until close against trigger window:

```javascript
const msUntilClose = auction.bidCloseTime - now;
const triggerMs = triggerWindowMinutes * 60000;

if (msUntilClose <= triggerMs) {
  // Extend auction
}
```

---

**Q: Is extension synchronous or async?**

A: **Synchronous** - happens inside the bid API request itself.

Pros:

- ✅ Atomic - either applies or not
- ✅ Client gets updated time in response

Cons:

- ❌ Slower API response
- ❌ Could block under high load

---

**Q: How do you detect rank change programmatically?**

A: **Not implemented** - Would need:

```javascript
// 1. Get old rankings from DB
// 2. Get new rankings after bid
// 3. Compare and log differences
// 4. Optional: Trigger extension if L1 changed
```

---

### 5. Forced Close

**Q: How do you ensure auction never exceeds forced close time?**

A: Use Math.min() pattern:

```javascript
let newCloseTime = oldCloseTime + extension;

if (newCloseTime > forcedCloseTime) {
  newCloseTime = forcedCloseTime; // ← Clamp
}
```

---

### 6. Activity Logs

**Q: What do you store in logs?**

A:

| Event               | Details                     |
| ------------------- | --------------------------- |
| bid_placed          | supplierId, amount          |
| extension_triggered | newCloseTime, extendedBy    |
| rank_change         | oldRank, newRank, movedToL1 |
| bid_awarded         | bidId, supplierId, amount   |

---

### 7. Race Conditions

**Q: How do you handle simultaneous bids?**

A: ❌ **Currently NO protection** - Uses no locks

**Problem:** Two requests read same auction.bidCloseTime, both calculate extensions independently

**Lost Update Scenario:**

```
Request 1: Extends to 12:02 PM
Request 2: Extends to 12:03 PM (overwrites!)
Result: Only second extension applied
```

**Solution:** Use distributed lock:

```javascript
await withLock(`auction:${auctionId}:bid-lock`, async () => {
  // Only one request at a time
  // Safely read/write without overwrite
});
```

---

### 8. API Design

**Q: Show me your bid API request/response**

A:

**Request:**

```http
POST /api/bids
Authorization: Bearer <token>
Content-Type: application/json

{
  "auctionId": "auction-123",
  "amount": 4800,
  "offerDetails": "...",
  "deliveryTimeline": "5 days"
}
```

**Response (201):**

```json
{
  "_id": "bid-789",
  "auctionId": "auction-123",
  "supplierId": "supplier-456",
  "amount": 4800,
  "bidTime": "2026-04-29T11:59:00Z"
}
```

---

**Q: What status codes do you return?**

A:

| Code | Scenario                                   |
| ---- | ------------------------------------------ |
| 201  | Bid created                                |
| 400  | Bad request (missing data, auction closed) |
| 404  | Auction not found                          |
| 500  | Server error                               |

❌ **Issue:** All errors currently return 400

---

### 9. Edge Cases

**Q: How do you handle same bid value?**

A: ❌ **Undefined behavior** - No secondary sort

**Fix:** Add bidTime as secondary sort:

```javascript
.sort({ amount: 1, bidTime: 1 })  // FIFO for ties
```

---

**Q: What if bid arrives exactly at close time?**

A: Current code accepts it (grace period):

```javascript
if (now > bidCloseTime) {
  // ← Now > (not >=)
  // Reject only if strictly after
}
```

---

### 10. Performance

**Q: How many DB queries per bid?**

A: **3-4 queries:**

1. Read auction
2. Create bid
3. Update auction (if extension)
4. Log event

**Optimization:** Use Promise.all() for parallel reads

---

**Q: Do you have database indexes?**

A: ❌ **NO** - Missing indexes:

```javascript
bidSchema.index({ auctionId: 1, amount: 1 });
auctionLogSchema.index({ auctionId: 1, createdAt: -1 });
```

---

**Q: Did you implement caching?**

A: ❌ **NO** - Could add Redis:

```javascript
const cached = await redis.get(`auction:${id}:activity`);
if (cached) return cached;
// Fetch, then cache for 30 seconds
```

---

## 🔴 Critical Issues to Address

### 1. Time Validation in Auction Creation

**Impact:** ❌ HIGH  
**Fix Time:** 15 minutes  
**Importance:** Can't allow forcedClose < bidClose

### 2. Bid Amount Validation (Lower Than Lowest)

**Impact:** ❌ CRITICAL  
**Fix Time:** 20 minutes  
**Importance:** Core business logic - reverse auction must accept only lower bids

### 3. Race Condition Protection

**Impact:** ❌ HIGH  
**Fix Time:** 30 minutes  
**Importance:** Lost updates in concurrent scenarios

### 4. Error Handling Improvements

**Impact:** ⚠️ MEDIUM  
**Fix Time:** 15 minutes  
**Importance:** Current error handling is generic and unhelpful

### 5. Ranking Tie-Breaking

**Impact:** ⚠️ MEDIUM  
**Fix Time:** 10 minutes  
**Importance:** Deterministic ordering needed

---

## ✅ What You're Doing Well

- ✅ Basic validation for auth and existence
- ✅ Proper status transitions (scheduled → active → closed)
- ✅ Forced close time enforcement (Math.min clamping)
- ✅ Comprehensive activity logging
- ✅ Clean separation of concerns (controllers, models, routes)
- ✅ Mongoose for data validation

---

## 📋 Interview Strategy

### For Each Question:

1. **State current implementation** - Show you understand what exists
2. **Identify gaps** - Be honest about missing features
3. **Explain why it matters** - Business logic, not just nice-to-have
4. **Propose solution** - With code example if possible
5. **Discuss trade-offs** - Complexity vs benefit

### Example Answer Pattern:

```
Q: How do you prevent race conditions?

"Currently, we don't have explicit protection - the system uses no locks.
This could cause lost updates if two bids arrive simultaneously. For example,
if both bids extend the auction, the second one might overwrite the first
extension calculation.

To fix this, I would implement distributed locking using Redis. The flow would be:
1. Attempt to acquire lock on auction:id:bid-lock
2. If successful, proceed with bid logic
3. If locked, retry with backoff
4. Release lock after bid completes

This ensures only one bid is processed at a time for a given auction,
preventing lost updates while maintaining reasonable performance."
```

---

## 🎓 Learning Resources

- **British Auction:** https://en.wikipedia.org/wiki/English_auction (note: our system is REVERSE auction - lowest price wins)
- **Distributed Locking:** Redis SET with NX (not exists) flag
- **Race Conditions:** Compare-and-swap pattern, transactions
- **Database Indexes:** MongoDB explain() to analyze query performance

---

## Pre-Interview Checklist

- [ ] Understand RFQ → Auction flow
- [ ] Know all validation checks (and which are missing)
- [ ] Be ready to explain British auction extension logic
- [ ] Prepare answer about race condition scenario
- [ ] Have code examples ready
- [ ] Understand why each fix matters (business + technical)
- [ ] Practice explaining trade-offs
- [ ] Be honest about gaps - don't make up features

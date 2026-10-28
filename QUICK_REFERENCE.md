# ⚡ QUICK REFERENCE GUIDE

**Auction System - Key Points for Interview**

---

## 🏗️ System Architecture

```
Frontend (React)        Backend (Node.js)        Database (MongoDB)
├─ LoginPage      →    ├─ authController   →    ├─ User
├─ Dashboard      →    ├─ rfqController    →    ├─ RFQ
├─ AuctionPage    →    ├─ auctionController →   ├─ Auction
├─ BidForm        →    ├─ bidController    →    ├─ Bid
└─ RankingTable   →    ├─ awardController  →    └─ AuctionLog
                       └─ distributedLock (Redis)
```

---

## 🔑 Key Files

| File                   | Purpose                   | Status                   |
| ---------------------- | ------------------------- | ------------------------ |
| `bidController.js`     | Bid placement logic       | ⚠️ Needs validation      |
| `auctionController.js` | Auction creation          | ⚠️ Needs time validation |
| `Bid.js`               | Bid model                 | ⚠️ Remove rank field     |
| `Auction.js`           | Auction model             | ✅ Good                  |
| `AuctionLog.js`        | Audit trail               | ✅ Good                  |
| `distributedLock.js`   | Race condition protection | ✅ Ready to use          |

---

## 🎯 The 7 Key Flows

### 1. RFQ Creation

```
Buyer → POST /api/rfqs → Create RFQ → Store in DB
```

### 2. Auction Creation

```
Buyer → POST /api/auctions → ⚠️ Validate times → Create with British params
```

### 3. Bid Placement

```
Supplier → POST /api/bids → Check active → ⚠️ Validate lowest → Create bid → Check extension
```

### 4. Extension Trigger

```
Bid in trigger zone → Calculate new close time → Clamp to forced close → Save → Log
```

### 5. Ranking Update

```
New bid → Sort by amount → Assign ranks → Send to frontend
```

### 6. Bid Award

```
Buyer → POST /api/awards → Acquire lock → Update status → Emit WebSocket → Log
```

### 7. Get Activity

```
Frontend → GET /api/bids/:auctionId → Fetch & sort → Rank → Return with logs
```

---

## ⚠️ The 3 Critical Gaps

### Gap 1: Time Validation Missing

```javascript
// ❌ Current
const auction = await Auction.create({ bidCloseTime, forcedCloseTime })

// ✅ Should be
if (bidCloseTime >= forcedCloseTime) return 400 error
```

### Gap 2: Bid Amount Not Validated

```javascript
// ❌ Current - accepts any amount
const bid = await Bid.create({ amount })

// ✅ Should be
if (amount >= currentLowestBid) return 400 error
```

### Gap 3: No Race Condition Protection

```javascript
// ❌ Current - lost update possible
auction.bidCloseTime = newTime;
await auction.save();

// ✅ Should be
await withLock(`auction:${id}:lock`, async () => {
  // Safe read/write
});
```

---

## 💭 Common Interview Questions & Quick Answers

| Q                                       | A                                                 |
| --------------------------------------- | ------------------------------------------------- |
| How do you prevent double extension?    | Math.min(newTime, forcedCloseTime)                |
| What if two bids arrive simultaneously? | ❌ Lost update possible (need lock)               |
| How do you rank bids?                   | Sort by amount, assign index as rank              |
| What defines L1 vs L2?                  | L1 = lowest amount, L2 = 2nd lowest               |
| Does rank persist?                      | ❌ No - computed each query                       |
| How is extension time enforced?         | Inside bid API - synchronous                      |
| What's stored in logs?                  | Event type + details (bidder, amount, reason)     |
| How many DB queries per bid?            | 3-4 (read auction, create bid, maybe update, log) |

---

## 📊 Data Model Summary

```javascript
// Auction
{
  rfqId,                    // Link to RFQ
  bidStartTime,             // When bidding opens
  bidCloseTime,             // When bidding closes (can extend)
  forcedCloseTime,          // Maximum close time
  triggerWindowMinutes,     // Last X minutes trigger extension
  extensionDurationMinutes, // Extend by X minutes
  status: 'scheduled|active|closed',
  awardedBidId              // Winning bid
}

// Bid
{
  auctionId,                // Which auction
  supplierId,               // Which supplier
  amount,                   // Bid price
  bidTime,                  // When bid placed
  // rank NOT stored - computed on query
}

// AuctionLog
{
  auctionId,
  eventType: 'bid_placed|extension_triggered|...',
  details: { ... },         // Event-specific data
  createdAt                 // Auto timestamp
}
```

---

## 🚀 Extension Logic in 30 Seconds

```javascript
// 1. Bid arrives at 11:58 AM
// 2. Check: how long until 12:00 PM close? → 120 seconds

// 3. Check trigger: is 120 sec <= 120 sec trigger window?
//    YES! → Extend

// 4. Calculate: 12:00 PM + 2 min extension = 12:02 PM

// 5. Check forced close: is 12:02 > 12:10 PM forced?
//    NO → Accept 12:02 PM

// 6. Save new close time & log event
```

---

## 🔒 Race Condition Scenario

```
Bid 1 arrives         Bid 2 arrives (same time)
    ↓                      ↓
Read: close=12:00    Read: close=12:00 (same!)
Calc: 12:00+2=12:02  Calc: 12:00+3=12:03
Save: 12:02 PM       Save: 12:03 PM ← OVERWRITES!
    ↓                      ↓
Lost: 2-min ext      Kept: 3-min ext (wrong total)
```

**Fix:** Distributed lock ensures only one request at a time

---

## ✅ What Works

- ✅ JWT authentication
- ✅ Auction state transitions
- ✅ Forced close enforcement
- ✅ Activity logging
- ✅ Award button (newly implemented)
- ✅ Real-time WebSocket events
- ✅ Award controller with locks

---

## ❌ What Needs Work

- ❌ Temporal validation (times must be ordered)
- ❌ Bid amount validation (must be lower than lowest)
- ❌ Race condition protection (for concurrent bids)
- ❌ Error handling (generic 400s for everything)
- ❌ Tie-breaking (no secondary sort)
- ❌ Database indexes (missing for performance)
- ❌ Rank change detection (not implemented)

---

## 💡 Pro Tips for Interview

1. **Show ownership** - "I found these gaps and here's how to fix them"
2. **Explain why** - Not just "what" but "why it matters"
3. **Trade-offs** - "This adds complexity but prevents X problem"
4. **Concrete examples** - Use actual timestamps, amounts, scenarios
5. **Code evidence** - Reference actual file paths and line numbers
6. **Testing** - "I would test concurrent bids like this..."
7. **Scaling** - "If we hit 10k concurrent bids, I would..."

---

## 📈 Performance Improvements (Quick Wins)

| Improvement         | Time   | Impact                         |
| ------------------- | ------ | ------------------------------ |
| Add indexes         | 10 min | ✅ 5x faster queries           |
| Parallelize queries | 10 min | ✅ 2x faster activity fetch    |
| Secondary sort      | 5 min  | ✅ Deterministic ranking       |
| Redis cache         | 20 min | ✅ 40x faster repeated queries |

---

## 🎓 Key Terminology

| Term                 | Definition                                                |
| -------------------- | --------------------------------------------------------- |
| **L1**               | Lowest bid (rank 1) - winning position                    |
| **L2**               | Second lowest bid (rank 2)                                |
| **L3**               | Third lowest bid (rank 3)                                 |
| **British Auction**  | Reverse auction where lowest price wins (with extensions) |
| **Trigger Window**   | Last X minutes before close when bids trigger extension   |
| **Forced Close**     | Maximum time auction can extend to                        |
| **Race Condition**   | Two concurrent requests cause inconsistent state          |
| **Lost Update**      | One request's changes overwritten by another              |
| **Distributed Lock** | Redis-based lock for concurrent operations                |
| **Audit Trail**      | Complete log of all events for compliance                 |

---

## 🔄 State Machine

```
SCHEDULED → ACTIVE → CLOSED
   ↑         ↓        ↑
   |    (can extend)  |
   |___________________|
   (if no bids in trigger zone)
```

---

## 🧮 Quick Math

```
If triggerWindowMinutes = 2:
  → Last 120 seconds trigger extension

If extensionDurationMinutes = 3:
  → Each extension adds 180 seconds (3 min)

If bidCloseTime = 12:00 and forcedCloseTime = 12:10:
  → Can extend maximum 10 minutes total
  → Can have at most 3-4 extensions before forced close
```

---

## 📋 Pre-Interview Checklist

- [ ] Know all 3 critical gaps
- [ ] Can explain race condition scenario
- [ ] Have code fix examples ready
- [ ] Understand British auction vs English auction
- [ ] Know why each validation matters
- [ ] Prepared answer about trade-offs
- [ ] Can draw system architecture
- [ ] Know the file paths for each component

---

**Print this page. Read before interview. Reference during answer. 🎯**

# Revise — Reverse Auction OS

> **Enterprise-Grade British-Style Reverse Auction Procurement Platform**  
> **Author & Lead Engineer:** [Pulkit Singla](https://github.com/pulkitsingla16)  
> **GitHub Repository:** [https://github.com/pulkitsingla16/RFQ-Auction-System](https://github.com/pulkitsingla16/RFQ-Auction-System)

---

## 🌟 Overview

**Revise** is a high-velocity Reverse Auction OS engineered for procurement teams and logistics freight operators. In reverse auctions, **the lowest compliant price captures the contract (L1 rank)**. 

Revise incorporates dynamic British-style overtime triggers, forced close ceilings to prevent infinite bidding loops, audit trails, and an **AI Procurement & Bidding Advisor**.

---

## 🚀 Key Features

### 🏢 For Buyers (Procurement Heads)
- **Live RFQ Deployment:** Quickly define origins, destinations, cargo weights (cold-chain, hazmat, dry van), and reserve budgets.
- **British Overtime Windows:** Configure `triggerWindowMinutes` (e.g. final 2-3 mins) and `extensionDurationMinutes` (e.g. +2 mins).
- **Forced Close Cap:** Hard mathematical cap (`forcedCloseTime`) that prevents endless bidding wars and guarantees finality.
- **Contract Awarding & Confetti:** Formally award the contract to the winning L1 bid, permanently closing negotiations with an immutable audit log.
- **AI Lane Rate Estimator:** Automatically predicts fair market benchmark transit rates based on hub-to-hub distance and cargo regression.

### 🚚 For Suppliers (Carriers & Fleets)
- **Live L1/L2/L3 Leaderboard:** Real-time visibility into current market clearing prices and exact spreads.
- **AI Smart Bid Strategy Advisor:** Dynamically analyzes the spread and advises whether to undercut or defend position.
- **Tie-Breaking Rule:** Strict FIFO (First-In, First-Out) timestamp sorting for identical prices.

---

## 🤖 The AI Integration (Explainable for Interviews)

If asked in an interview: *"What AI did you integrate and how does it work?"*
You can explain:

1. **AI Heuristic Lane Rate Estimator:**
   - **How it works:** Uses a regression model based on hub-to-hub transit distance (e.g., Delhi-Mumbai: 1420 km, Bengaluru-Chennai: 350 km), cargo weight coefficients (₹2.45/tonne-km), and cold-chain/pharma multipliers (1.45x).
   - **Why it matters:** Suggests fair reserve budgets to buyers before launching an auction, preventing under-budgeted or overpriced RFQs.

2. **AI Bid Strategy Advisor:**
   - **How it works:** Analyzes the spread between your quote and the current L1 leader, along with remaining auction time. If time is low (< 3 mins), it suggests a *Snipe Under-cut* (1.5% drop); if holding L1, it switches to *Defense Mode* so you don't erode your profit margin unnecessarily.

3. **Auction Health & Liquidity Monitor:**
   - **How it works:** Computes a market competitiveness score (0-100) based on quote volume and extension count.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, React Router v6, Tailwind CSS (Modern Dark Zinc Aesthetic), Lucide Icons, Canvas-Confetti.
- **Engine:** Vite 5, In-Browser Reactive Database with LocalStorage persistence and instant state updates.
- **Audit Logging:** Immutable chronological activity trail capturing bids, British overtime triggers, and awards.

---

## 🏃 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Visit `http://localhost:5173` to explore the live Revise Reverse Auction OS!

---

**Built with pride by [Pulkit Singla](https://github.com/pulkitsingla16)**

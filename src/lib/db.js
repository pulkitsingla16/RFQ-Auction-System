/**
 * Revise - Reverse Auction OS
 * Built by Pulkit Singla (https://github.com/pulkitsingla16)
 * In-Memory & LocalStorage Engine for Auctions, Bids, RFQs, Audit Logs and Smart AI Assistant
 */

const STORAGE_KEYS = {
  USER: 'revise_current_user',
  USERS: 'revise_users_db',
  RFQS: 'revise_rfqs_db',
  AUCTIONS: 'revise_auctions_db',
  BIDS: 'revise_bids_db',
  LOGS: 'revise_logs_db'
};

// Initial Sample Data by Pulkit Singla
const DEFAULT_BUYER = {
  _id: 'user_pulkit_buyer',
  fullName: 'Pulkit Singla',
  email: 'pulkit@revise.dev',
  company: 'Singla Global Logistics Corp',
  role: 'buyer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  github: 'https://github.com/pulkitsingla16'
};

const DEFAULT_SUPPLIERS = [
  {
    _id: 'supp_apex',
    fullName: 'Apex Freight Solutions',
    company: 'Apex TransWorld',
    email: 'bids@apexfreight.com',
    role: 'supplier',
    rating: 4.9,
    fleetSize: 120
  },
  {
    _id: 'supp_bluejet',
    fullName: 'BlueJet Express Transit',
    company: 'BlueJet Intermodal',
    email: 'ops@bluejet.in',
    role: 'supplier',
    rating: 4.8,
    fleetSize: 85
  },
  {
    _id: 'supp_zenith',
    fullName: 'Zenith Swift Haulers',
    company: 'Zenith Logistics Ltd',
    email: 'contact@zenithhaul.com',
    role: 'supplier',
    rating: 4.7,
    fleetSize: 64
  }
];

const INITIAL_RFQS = [
  {
    _id: 'rfq_del_mum_01',
    buyerId: 'user_pulkit_buyer',
    buyerName: 'Pulkit Singla',
    title: '500-Ton Pharmaceutical Cold Chain Transit',
    description: 'Requires temperature-controlled (-20°C to 4°C) reefers with active telematics & GPS live pinging every 5 minutes.',
    origin: 'New Delhi ICD Tughlakabad',
    destination: 'JNPT Port, Mumbai (Maharashtra)',
    pickupDate: '2026-11-05T08:00:00.000Z',
    currency: 'INR',
    estimatedBudget: 450000,
    cargoWeightTonnes: 500,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: 'rfq_blr_che_02',
    buyerId: 'user_pulkit_buyer',
    buyerName: 'Pulkit Singla',
    title: 'High-Value Semiconductor Cleanroom Freight',
    description: 'Shock-absorbing air suspension vehicles required. 24/7 armed escort with tamper-evident seals.',
    origin: 'Electronics City, Bengaluru',
    destination: 'Ennore Port, Chennai',
    pickupDate: '2026-11-08T10:00:00.000Z',
    currency: 'INR',
    estimatedBudget: 280000,
    cargoWeightTonnes: 120,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const nowMs = Date.now();
const INITIAL_AUCTIONS = [
  {
    _id: 'auc_del_mum_live',
    rfqId: 'rfq_del_mum_01',
    buyerId: 'user_pulkit_buyer',
    bidStartTime: new Date(nowMs - 600000).toISOString(),
    bidCloseTime: new Date(nowMs + 900000).toISOString(), // 15 mins remaining
    forcedCloseTime: new Date(nowMs + 3600000).toISOString(), // 1 hr max
    triggerWindowMinutes: 3, // within last 3 mins
    extensionDurationMinutes: 2, // extend by 2 mins
    status: 'active',
    reservePrice: 420000,
    awardedBidId: null,
    totalExtensionsCount: 0
  },
  {
    _id: 'auc_blr_che_sched',
    rfqId: 'rfq_blr_che_02',
    buyerId: 'user_pulkit_buyer',
    bidStartTime: new Date(nowMs + 1800000).toISOString(),
    bidCloseTime: new Date(nowMs + 5400000).toISOString(),
    forcedCloseTime: new Date(nowMs + 10800000).toISOString(),
    triggerWindowMinutes: 2,
    extensionDurationMinutes: 2,
    status: 'scheduled',
    reservePrice: 260000,
    awardedBidId: null,
    totalExtensionsCount: 0
  }
];

const INITIAL_BIDS = [
  {
    _id: 'bid_01',
    auctionId: 'auc_del_mum_live',
    supplierId: 'supp_zenith',
    supplierName: 'Zenith Swift Haulers',
    amount: 410000,
    offerDetails: 'Includes full GPS telemetry & automated temperature alerts every 15 min.',
    deliveryTimeline: '32 Hours',
    bidTime: new Date(nowMs - 400000).toISOString()
  },
  {
    _id: 'bid_02',
    auctionId: 'auc_del_mum_live',
    supplierId: 'supp_bluejet',
    supplierName: 'BlueJet Intermodal',
    amount: 395000,
    offerDetails: 'Euro-6 standard reefers with backup cooling generators and dual-driver teams.',
    deliveryTimeline: '28 Hours',
    bidTime: new Date(nowMs - 250000).toISOString()
  },
  {
    _id: 'bid_03',
    auctionId: 'auc_del_mum_live',
    supplierId: 'supp_apex',
    supplierName: 'Apex TransWorld',
    amount: 382000,
    offerDetails: 'Direct route with priority toll fast-tag corridor & real-time buyer dashboard access.',
    deliveryTimeline: '26 Hours',
    bidTime: new Date(nowMs - 120000).toISOString()
  }
];

const INITIAL_LOGS = [
  {
    _id: 'log_01',
    auctionId: 'auc_del_mum_live',
    eventType: 'auction_created',
    details: { createdBy: 'Pulkit Singla', reservePrice: 420000 },
    timestamp: new Date(nowMs - 600000).toISOString()
  },
  {
    _id: 'log_02',
    auctionId: 'auc_del_mum_live',
    eventType: 'bid_placed',
    details: { supplierName: 'Zenith Swift Haulers', amount: 410000 },
    timestamp: new Date(nowMs - 400000).toISOString()
  },
  {
    _id: 'log_03',
    auctionId: 'auc_del_mum_live',
    eventType: 'bid_placed',
    details: { supplierName: 'BlueJet Intermodal', amount: 395000 },
    timestamp: new Date(nowMs - 250000).toISOString()
  },
  {
    _id: 'log_04',
    auctionId: 'auc_del_mum_live',
    eventType: 'bid_placed',
    details: { supplierName: 'Apex TransWorld', amount: 382000, rankStatus: 'L1 Position Captured' },
    timestamp: new Date(nowMs - 120000).toISOString()
  }
];

// Helper to seed localStorage once
export const initDatabase = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_BUYER));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_BUYER, ...DEFAULT_SUPPLIERS]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RFQS)) {
    localStorage.setItem(STORAGE_KEYS.RFQS, JSON.stringify(INITIAL_RFQS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUCTIONS)) {
    localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(INITIAL_AUCTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BIDS)) {
    localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(INITIAL_BIDS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
  }
};

// Database Accessors
export const db = {
  getCurrentUser: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || DEFAULT_BUYER;
    } catch {
      return DEFAULT_BUYER;
    }
  },
  setCurrentUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  getUsers: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },
  getRFQs: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RFQS) || '[]');
  },
  createRFQ: (data) => {
    const rfqs = db.getRFQs();
    const currentUser = db.getCurrentUser();
    const newRFQ = {
      _id: `rfq_${Date.now()}`,
      buyerId: currentUser._id,
      buyerName: currentUser.fullName,
      createdAt: new Date().toISOString(),
      ...data
    };
    rfqs.unshift(newRFQ);
    localStorage.setItem(STORAGE_KEYS.RFQS, JSON.stringify(rfqs));
    return newRFQ;
  },
  getAuctions: () => {
    const auctions = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUCTIONS) || '[]');
    const now = Date.now();
    // Auto status recalculation
    let changed = false;
    auctions.forEach((auc) => {
      const start = new Date(auc.bidStartTime).getTime();
      const close = new Date(auc.bidCloseTime).getTime();
      if (auc.status === 'scheduled' && now >= start && now < close) {
        auc.status = 'active';
        changed = true;
      } else if (auc.status === 'active' && now >= close) {
        auc.status = 'closed';
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions));
    }
    return auctions;
  },
  getAuctionById: (id) => {
    const auctions = db.getAuctions();
    const rfqs = db.getRFQs();
    const auction = auctions.find((a) => a._id === id);
    if (!auction) return null;
    const rfq = rfqs.find((r) => r._id === auction.rfqId) || null;
    return { ...auction, rfq };
  },
  createAuction: (data) => {
    const auctions = db.getAuctions();
    const currentUser = db.getCurrentUser();

    // Temporal Validation Check (Interview Fix #1)
    const startMs = new Date(data.bidStartTime).getTime();
    const closeMs = new Date(data.bidCloseTime).getTime();
    const forcedMs = new Date(data.forcedCloseTime).getTime();

    if (startMs >= closeMs) {
      throw new Error('Bid start time must be strictly before bid close time.');
    }
    if (closeMs >= forcedMs) {
      throw new Error('Bid close time must be strictly before maximum forced close cap.');
    }
    if (!data.triggerWindowMinutes || Number(data.triggerWindowMinutes) <= 0) {
      throw new Error('Trigger window must be at least 1 minute.');
    }
    if (!data.extensionDurationMinutes || Number(data.extensionDurationMinutes) <= 0) {
      throw new Error('Extension duration must be at least 1 minute.');
    }

    const newAuction = {
      _id: `auc_${Date.now()}`,
      buyerId: currentUser._id,
      totalExtensionsCount: 0,
      awardedBidId: null,
      status: startMs <= Date.now() ? 'active' : 'scheduled',
      ...data
    };
    auctions.unshift(newAuction);
    localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions));

    db.addLog(newAuction._id, 'auction_created', {
      createdBy: currentUser.fullName,
      reservePrice: newAuction.reservePrice
    });

    return newAuction;
  },
  getBids: (auctionId) => {
    const bids = JSON.parse(localStorage.getItem(STORAGE_KEYS.BIDS) || '[]');
    const filtered = bids.filter((b) => b.auctionId === auctionId);
    // Sort: Primary Amount (Ascending - lowest first), Secondary Time (FIFO for ties)
    filtered.sort((a, b) => {
      if (a.amount !== b.amount) return a.amount - b.amount;
      return new Date(a.bidTime).getTime() - new Date(b.bidTime).getTime();
    });
    // Dynamically assign ranks
    return filtered.map((b, idx) => ({
      ...b,
      rank: idx + 1,
      isL1: idx === 0,
      isL2: idx === 1,
      isL3: idx === 2
    }));
  },
  placeBid: ({ auctionId, amount, offerDetails, deliveryTimeline }) => {
    const auctions = db.getAuctions();
    const auctionIdx = auctions.findIndex((a) => a._id === auctionId);
    if (auctionIdx === -1) throw new Error('Auction not found');
    const auction = auctions[auctionIdx];

    const now = Date.now();
    const closeMs = new Date(auction.bidCloseTime).getTime();
    const forcedMs = new Date(auction.forcedCloseTime).getTime();

    if (now > closeMs || auction.status === 'closed') {
      auction.status = 'closed';
      auctions[auctionIdx] = auction;
      localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions));
      throw new Error('Auction has already closed. No new bids can be accepted.');
    }

    const currentBids = db.getBids(auctionId);
    const currentLowest = currentBids.length > 0 ? currentBids[0].amount : (auction.reservePrice || Infinity);
    const bidAmount = Number(amount);

    if (isNaN(bidAmount) || bidAmount <= 0) {
      throw new Error('Please enter a valid positive numeric bid amount.');
    }

    // Bid Amount Validation (Interview Fix #2 - Must beat current lowest)
    if (bidAmount >= currentLowest) {
      throw new Error(`Reverse Auction Rule: Your bid (₹${bidAmount.toLocaleString()}) must undercut the current lowest bid (₹${currentLowest.toLocaleString()}).`);
    }

    const currentUser = db.getCurrentUser();
    const newBid = {
      _id: `bid_${Date.now()}`,
      auctionId,
      supplierId: currentUser._id,
      supplierName: currentUser.fullName,
      company: currentUser.company || currentUser.fullName,
      amount: bidAmount,
      offerDetails: offerDetails || 'Standard logistics SLAs with direct transit tracking.',
      deliveryTimeline: deliveryTimeline || 'As per RFQ schedule',
      bidTime: new Date(now).toISOString()
    };

    const bids = JSON.parse(localStorage.getItem(STORAGE_KEYS.BIDS) || '[]');
    bids.push(newBid);
    localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(bids));

    // British-style Dynamic Extension Check
    const msUntilClose = closeMs - now;
    const triggerMs = (auction.triggerWindowMinutes || 2) * 60000;
    let extensionTriggered = false;
    let newCloseDate = null;

    if (msUntilClose <= triggerMs) {
      const extMs = (auction.extensionDurationMinutes || 2) * 60000;
      let calculatedClose = closeMs + extMs;

      // Clamping to forced close time
      if (calculatedClose > forcedMs) {
        calculatedClose = forcedMs;
      }

      if (calculatedClose > closeMs) {
        auction.bidCloseTime = new Date(calculatedClose).toISOString();
        auction.totalExtensionsCount = (auction.totalExtensionsCount || 0) + 1;
        auctions[auctionIdx] = auction;
        localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions));
        extensionTriggered = true;
        newCloseDate = auction.bidCloseTime;

        db.addLog(auctionId, 'extension_triggered', {
          extendedByMinutes: auction.extensionDurationMinutes,
          newCloseTime: auction.bidCloseTime,
          triggeredBySupplier: currentUser.fullName
        });
      }
    }

    db.addLog(auctionId, 'bid_placed', {
      supplierName: currentUser.fullName,
      amount: bidAmount,
      rankAssigned: 'L1 (New Lowest Price)',
      extensionTriggered
    });

    return {
      bid: newBid,
      extensionTriggered,
      newCloseTime: newCloseDate,
      auction: auctions[auctionIdx]
    };
  },
  awardContract: (auctionId, bidId) => {
    const auctions = db.getAuctions();
    const aucIdx = auctions.findIndex((a) => a._id === auctionId);
    if (aucIdx === -1) throw new Error('Auction not found');
    const auction = auctions[aucIdx];

    const bids = db.getBids(auctionId);
    const targetBid = bids.find((b) => b._id === bidId);
    if (!targetBid) throw new Error('Selected bid not found');

    auction.status = 'awarded';
    auction.awardedBidId = bidId;
    auctions[aucIdx] = auction;
    localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions));

    db.addLog(auctionId, 'bid_awarded', {
      awardedTo: targetBid.supplierName,
      winningAmount: targetBid.amount,
      awardedBy: db.getCurrentUser().fullName,
      deliveryTimeline: targetBid.deliveryTimeline
    });

    return { auction, winningBid: targetBid };
  },
  getLogs: (auctionId) => {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
    return logs
      .filter((l) => l.auctionId === auctionId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  addLog: (auctionId, eventType, details) => {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
    const newLog = {
      _id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      auctionId,
      eventType,
      details,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    return newLog;
  },
  resetToSampleData: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.RFQS);
    localStorage.removeItem(STORAGE_KEYS.AUCTIONS);
    localStorage.removeItem(STORAGE_KEYS.BIDS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    initDatabase();
  }
};

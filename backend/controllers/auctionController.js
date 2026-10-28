import Auction from '../models/Auction.js';
import RFQ from '../models/RFQ.js';
import Bid from '../models/Bid.js';
import AuctionLog from '../models/AuctionLog.js';

const updateAuctionStatus = async (auction) => {
  const now = new Date();
  let changed = false;
  if (auction.status !== 'closed' && now >= auction.bidCloseTime) {
    auction.status = 'closed';
    changed = true;
  } else if (auction.status === 'scheduled' && now >= auction.bidStartTime && now < auction.bidCloseTime) {
    auction.status = 'active';
    changed = true;
  }
  if (changed) {
    await Auction.updateOne({ _id: auction._id }, { status: auction.status });
  }
};

// @desc    Create an auction for an RFQ
// @route   POST /api/auctions
// @access  Private/Buyer
export const createAuction = async (req, res) => {
  try {
    const { rfqId, bidStartTime, bidCloseTime, forcedCloseTime, triggerWindowMinutes, extensionDurationMinutes, status } = req.body;

    const rfq = await RFQ.findById(rfqId);
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
    
    // Verify buyer owns RFQ
    if (rfq.buyerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized for this RFQ' });
    }

    const auction = await Auction.create({
      rfqId,
      bidStartTime,
      bidCloseTime,
      forcedCloseTime,
      triggerWindowMinutes,
      extensionDurationMinutes,
      status: status || 'scheduled',
    });
    
    await updateAuctionStatus(auction);

    res.status(201).json(auction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all auctions (with optional status filter)
// @route   GET /api/auctions
// @access  Private
export const getAuctions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // In a real app we might only fetch auctions for the buyer, or active auctions for suppliers.
    // For now, return all auctions but populated with RFQ info.
    const auctions = await Auction.find(filter)
      .populate('rfqId', 'title description origin destination currency pickupDate buyerId')
      .sort({ createdAt: -1 });

    // Attach basic bid stats and update status
    const results = [];
    for (let auction of auctions) {
      await updateAuctionStatus(auction);
      const bids = await Bid.find({ auctionId: auction._id }).sort({ amount: 1 });
      const obj = await auction.toObject();
      obj.bidCount = bids.length;
      obj.lowestBid = bids.length > 0 ? bids[0] : null;
      obj.isAwarded = !!obj.awardedBidId;
      results.push(obj);
    }
    
    // Filter for buyer specific. Suppliers see all (or public).
    let finalAuctions = results;
    if (req.user.role === 'buyer') {
      finalAuctions = results.filter(a => a.rfqId.buyerId.toString() === req.user._id.toString());
    }

    res.json(finalAuctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Auction by ID
// @route   GET /api/auctions/:id
// @access  Private
export const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('rfqId', 'title description origin destination currency pickupDate buyerId')
      .populate({ path: 'awardedBidId', populate: { path: 'supplierId', select: 'fullName company email' }});

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    await updateAuctionStatus(auction);
    
    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Award bid and close auction
// @route   PUT /api/auctions/:id/award
// @access  Private/Buyer
export const awardAuction = async (req, res) => {
  try {
    const { bidId } = req.body;
    const auction = await Auction.findById(req.params.id).populate('rfqId');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    if (auction.rfqId.buyerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized for this auction' });
    }

    const bid = await Bid.findById(bidId);
    if (!bid || bid.auctionId.toString() !== auction._id.toString()) {
      return res.status(404).json({ message: 'Bid not found for this auction' });
    }

    auction.awardedBidId = bid._id;
    auction.status = 'closed';
    await auction.save();

    await AuctionLog.create({
      auctionId: auction._id,
      eventType: 'bid_awarded',
      details: { bidId: bid._id, supplierId: bid.supplierId, amount: bid.amount }
    });

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Bid from '../models/Bid.js';
import Auction from '../models/Auction.js';
import AuctionLog from '../models/AuctionLog.js';

// @desc    Place a bid
// @route   POST /api/bids
// @access  Private/Supplier
export const placeBid = async (req, res) => {
  try {
    const { auctionId, amount, offerDetails, deliveryTimeline } = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    const now = new Date();
    
    if (auction.status !== 'closed' && now > auction.bidCloseTime) {
      auction.status = 'closed';
      await auction.save();
      return res.status(400).json({ message: 'Auction has already closed' });
    }
    
    if (auction.status === 'scheduled' && now >= auction.bidStartTime && now < auction.bidCloseTime) {
      auction.status = 'active';
      await auction.save();
    }

    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    const bid = await Bid.create({
      auctionId,
      supplierId: req.user._id,
      amount: Number(amount),
      offerDetails,
      deliveryTimeline,
      bidTime: now,
    });

    // Handle British Extension Math
    const msUntilClose = auction.bidCloseTime.getTime() - now.getTime();
    const triggerMs = auction.triggerWindowMinutes * 60000;
    
    if (msUntilClose <= triggerMs) {
      const extMs = auction.extensionDurationMinutes * 60000;
      let newCloseTime = new Date(auction.bidCloseTime.getTime() + extMs);
      
      if (newCloseTime > auction.forcedCloseTime) {
        newCloseTime = auction.forcedCloseTime;
      }
      
      if (newCloseTime.getTime() > auction.bidCloseTime.getTime()) {
        auction.bidCloseTime = newCloseTime;
        await auction.save();
        
        await AuctionLog.create({
          auctionId,
          eventType: 'extension_triggered',
          details: { newCloseTime, extendedBy: auction.extensionDurationMinutes }
        });
      }
    }

    await AuctionLog.create({
      auctionId,
      eventType: 'bid_placed',
      details: { supplierId: req.user._id, amount: Number(amount) }
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get bids and logs for an auction
// @route   GET /api/bids/:auctionId
// @access  Private
export const getAuctionActivity = async (req, res) => {
  try {
    const bids = await Bid.find({ auctionId: req.params.auctionId })
      .populate('supplierId', 'fullName company email')
      .sort({ amount: 1 }); // Lowest bid first
      
    // Re-rank dynamically based on amount
    const rankedBids = bids.map((b, index) => ({ ...b.toObject(), rank: index + 1 }));
    
    const logs = await AuctionLog.find({ auctionId: req.params.auctionId })
      .sort({ createdAt: -1 });

    res.json({ bids: rankedBids, logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

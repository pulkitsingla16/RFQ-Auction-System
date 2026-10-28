import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import AuctionLog from '../models/AuctionLog.js';
import { withLock } from '../utils/distributedLock.js';
import { invalidateAuctionCache } from '../utils/cache.js';

export const awardBid = async (req, res) => {
  try {
    const { auctionId, bidId } = req.body;
    const buyerId = req.user._id;

    // **USE DISTRIBUTED LOCK TO PREVENT DOUBLE-AWARD**
    const result = await withLock(`auction:${auctionId}:award-lock`, async () => {
      // Validate auction exists and user is buyer
      const auction = await Auction.findById(auctionId);
      if (!auction) {
        throw new Error('Auction not found');
      }

      if (auction.buyerId.toString() !== buyerId.toString()) {
        throw new Error('Only the buyer can award bids');
      }

      // Check if already awarded
      if (auction.awardedBidId) {
        throw new Error('This auction already has an awarded bid');
      }

      // Validate bid exists and belongs to this auction
      const bid = await Bid.findById(bidId)
        .populate('supplierId', 'name email company phone')
        .populate('auctionId');

      if (!bid) {
        throw new Error('Bid not found');
      }

      if (bid.auctionId._id.toString() !== auctionId) {
        throw new Error('Bid does not belong to this auction');
      }

      // Check auction status (should be closed or active)
      if (!['active', 'closed'].includes(auction.status)) {
        throw new Error('Can only award bids in active or closed auctions');
      }

      // Update bid status
      bid.status = 'awarded';
      await bid.save();

      // Update auction with awarded bid
      auction.awardedBidId = bidId;
      auction.status = 'closed'; // Mark as closed when awarded
      await auction.save();

      // Create audit log
      await AuctionLog.create({
        auctionId,
        eventType: 'bid_awarded',
        details: {
          awardedBy: buyerId,
          bidId,
          supplierId: bid.supplierId._id,
          amount: bid.amount,
          offerDetails: bid.offerDetails,
          deliveryTimeline: bid.deliveryTimeline,
          timestamp: new Date(),
        },
      });

      // Update all other bids to 'lost' status
      await Bid.updateMany(
        { auctionId, _id: { $ne: bidId } },
        { status: 'lost' }
      );

      // Invalidate cache
      await invalidateAuctionCache(auctionId);

      // Emit WebSocket event
      const io = req.app.locals.io;
      io.to(`auction:${auctionId}`).emit('bid-awarded', {
        auctionId,
        awardedBidId: bidId,
        supplierDetails: {
          id: bid.supplierId._id,
          name: bid.supplierId.name,
          email: bid.supplierId.email,
          company: bid.supplierId.company,
        },
        awardedAmount: bid.amount,
        timestamp: new Date(),
      });

      return {
        message: 'Bid awarded successfully',
        auction,
        awardedBid: bid,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAuctionWinner = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findById(auctionId)
      .populate({
        path: 'awardedBidId',
        populate: {
          path: 'supplierId',
          select: 'name email company phone address',
        },
      });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (!auction.awardedBidId) {
      return res.status(404).json({ message: 'No winner assigned yet' });
    }

    res.json({
      auction,
      winner: auction.awardedBidId.supplierId,
      winningBid: {
        amount: auction.awardedBidId.amount,
        offerDetails: auction.awardedBidId.offerDetails,
        deliveryTimeline: auction.awardedBidId.deliveryTimeline,
        bidTime: auction.awardedBidId.bidTime,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

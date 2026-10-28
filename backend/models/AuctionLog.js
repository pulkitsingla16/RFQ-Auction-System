import mongoose from 'mongoose';

const auctionLogSchema = new mongoose.Schema(
  {
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
    eventType: {
      type: String,
      enum: ['bid_placed', 'rank_change', 'extension_triggered', 'auction_closed', 'bid_awarded'],
      required: true,
    },
    details: { type: Object, default: {} },
  },
  { timestamps: true }
);

const AuctionLog = mongoose.model('AuctionLog', auctionLogSchema);

export default AuctionLog;

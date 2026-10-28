import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    offerDetails: { type: String },
    deliveryTimeline: { type: String },
    rank: { type: Number, default: 1 },
    bidTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;

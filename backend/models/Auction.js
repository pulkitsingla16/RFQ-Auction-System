import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema(
  {
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    bidStartTime: { type: Date, required: true },
    bidCloseTime: { type: Date, required: true },
    forcedCloseTime: { type: Date, required: true },
    triggerWindowMinutes: { type: Number, default: 2 },
    extensionDurationMinutes: { type: Number, default: 2 },
    status: { type: String, enum: ['scheduled', 'active', 'closed'], default: 'active' },
    awardedBidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', default: null },
  },
  { timestamps: true }
);

const Auction = mongoose.model('Auction', auctionSchema);

export default Auction;

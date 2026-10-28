import mongoose from 'mongoose';

const rfqSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    pickupDate: { type: Date, required: true },
    currency: { type: String, default: 'USD' },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const RFQ = mongoose.model('RFQ', rfqSchema);

export default RFQ;

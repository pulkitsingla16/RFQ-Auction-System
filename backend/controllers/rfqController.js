import RFQ from '../models/RFQ.js';
import Auction from '../models/Auction.js';

// @desc    Create new RFQ
// @route   POST /api/rfqs
// @access  Private/Buyer
export const createRFQ = async (req, res) => {
  try {
    const { title, description, origin, destination, pickupDate, currency } = req.body;

    const rfq = await RFQ.create({
      title,
      description,
      origin,
      destination,
      pickupDate,
      currency,
      buyerId: req.user._id,
    });

    res.status(201).json(rfq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all RFQs
// @route   GET /api/rfqs
// @access  Private
export const getRFQs = async (req, res) => {
  try {
    let rfqs;
    if (req.user.role === 'buyer') {
      rfqs = await RFQ.find({ buyerId: req.user._id }).sort({ createdAt: -1 });
    } else {
      // In a real app, suppliers might only see RFQs they are invited to or that are public via auctions
      rfqs = await RFQ.find({}).sort({ createdAt: -1 });
    }
    res.json(rfqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get RFQ by ID
// @route   GET /api/rfqs/:id
// @access  Private
export const getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }
    // Access control: buyers can only view their own RFQs
    if (req.user.role === 'buyer' && rfq.buyerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view this RFQ' });
    }
    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

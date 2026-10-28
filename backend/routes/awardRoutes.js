import express from 'express';
import { awardBid, getAuctionWinner } from '../controllers/awardController.js';
import { protect, buyerAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Award a bid (Buyer only)
router.post('/award', protect, buyerAuth, awardBid);

// Get auction winner
router.get('/winner/:auctionId', authenticate, getAuctionWinner);

export default router;

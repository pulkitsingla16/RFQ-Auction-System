import express from 'express';
import { createAuction, getAuctions, getAuctionById, awardAuction } from '../controllers/auctionController.js';
import { protect, buyerAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, buyerAuth, createAuction).get(protect, getAuctions);
router.route('/:id').get(protect, getAuctionById);
router.route('/:id/award').put(protect, buyerAuth, awardAuction);

export default router;

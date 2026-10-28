import express from 'express';
import { placeBid, getAuctionActivity } from '../controllers/bidController.js';
import { protect, supplierAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, supplierAuth, placeBid);
router.route('/:auctionId').get(protect, getAuctionActivity);

export default router;

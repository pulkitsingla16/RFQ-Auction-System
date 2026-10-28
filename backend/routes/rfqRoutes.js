import express from 'express';
import { createRFQ, getRFQs, getRFQById } from '../controllers/rfqController.js';
import { protect, buyerAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, buyerAuth, createRFQ).get(protect, getRFQs);
router.route('/:id').get(protect, getRFQById);

export default router;

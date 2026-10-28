import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import rfqRoutes from './routes/rfqRoutes.js';
import auctionRoutes from './routes/auctionRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import awardRoutes from './routes/awardRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('REVERSE Auction OS API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/awards', awardRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

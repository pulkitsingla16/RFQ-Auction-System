import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const buyerAuth = (req, res, next) => {
  if (req.user && req.user.role === 'buyer') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a buyer' });
  }
};

const supplierAuth = (req, res, next) => {
  if (req.user && req.user.role === 'supplier') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a supplier' });
  }
};

export { protect, buyerAuth, supplierAuth };

import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id);
    res.json({
      _id: user._id,
      fullName: user.fullName,
      company: user.company,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { fullName, company, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'Email address is already in use.' });
    return;
  }

  const user = await User.create({
    fullName,
    company,
    email,
    password,
    role,
  });

  if (user) {
    const token = generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      company: user.company,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      company: user.company,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

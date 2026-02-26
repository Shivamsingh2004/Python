const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { admin } = require('../config/firebase');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been suspended' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Firebase login / Google login
// @route   POST /api/auth/firebase
// @access  Public
const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOne({ $or: [{ firebaseUID: uid }, { email }] });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        firebaseUID: uid,
        profileImage: picture || '',
      });
    } else if (!user.firebaseUID) {
      user.firebaseUID = uid;
      if (picture && !user.profileImage) user.profileImage = picture;
      await user.save();
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been suspended' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, firebaseLogin, getMe };

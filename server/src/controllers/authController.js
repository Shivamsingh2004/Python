const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { initFirebase } = require('../config/firebase');
require('dotenv').config();

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been suspended.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.firebaseLogin = async (req, res, next) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ error: 'Firebase token is required.' });
    }

    const firebaseAdmin = initFirebase();
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(firebaseToken);

    let user = await User.findOne({
      $or: [{ firebaseUID: decodedToken.uid }, { email: decodedToken.email }],
    });

    if (!user) {
      user = await User.create({
        name: decodedToken.name || decodedToken.email.split('@')[0],
        email: decodedToken.email,
        firebaseUID: decodedToken.uid,
        profileImage: decodedToken.picture || undefined,
      });
    } else if (!user.firebaseUID) {
      user.firebaseUID = decodedToken.uid;
      await user.save();
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been suspended.' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .populate('followers', 'name profileImage')
      .populate('following', 'name profileImage');

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

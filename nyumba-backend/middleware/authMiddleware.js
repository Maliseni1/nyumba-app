const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

const identifyUser = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.log('identifyUser: Invalid token, user not identified.');
    }
  }
  
  next();
});

// --- 1. NEW PREMIUM USER MIDDLEWARE ---
const premiumUser = (req, res, next) => {
    // This middleware must run *after* 'protect'
    if (req.user && req.user.subscriptionStatus === 'active') {
        next();
    } else {
        res.status(403); // Forbidden
        throw new Error('This feature is only available to premium subscribers.');
    }
};
// --- END OF NEW MIDDLEWARE ---

// --- 2. EXPORT THE NEW FUNCTION ---
module.exports = { protect, admin, identifyUser, premiumUser };
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

// --- 1. NEW "SOFT" MIDDLEWARE ---
// This middleware will try to get a user, but will not fail if there's no token.
// This is for public routes (like getListings) that need to know *if* a user is logged in.
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
      // If token is expired or invalid, just move on. req.user will be undefined.
      console.log('identifyUser: Invalid token, user not identified.');
    }
  }
  
  // Always proceed, whether a user was found or not.
  next();
});
// --- END OF NEW MIDDLEWARE ---

// --- 3. EXPORT THE NEW FUNCTION ---
module.exports = { protect, admin, identifyUser };
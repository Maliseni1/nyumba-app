const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Listing = require('../models/listingModel');

// @desc    Get application statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAppStats = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments({});
    const listingCount = await Listing.countDocuments({});

    res.json({
        users: userCount,
        listings: listingCount,
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    // Find all users, but do not include their password
    const users = await User.find({}).select('-password'); 
    res.json(users);
});

module.exports = {
    getAppStats,
    getAllUsers,
};
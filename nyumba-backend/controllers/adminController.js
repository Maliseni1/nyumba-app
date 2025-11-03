const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Listing = require('../models/listingModel');

// @desc    Get application statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAppStats = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments({});
    const listingCount = await Listing.countDocuments({});
    
    // --- NEW: Count pending verifications ---
    const pendingVerificationCount = await User.countDocuments({
        verificationStatus: 'pending'
    });

    res.json({
        users: userCount,
        listings: listingCount,
        pendingVerifications: pendingVerificationCount, // Send new stat
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    // Find all users, but do not include their password
    // --- UPDATED: Also select the new status fields ---
    const users = await User.find({}).select('-password')
        .sort({ createdAt: -1 }); 
        
    res.json(users);
});

// --- 1. NEW FUNCTION ---
// @desc    Get all users with pending verification
// @route   GET /api/admin/verification-requests
// @access  Private/Admin
const getVerificationRequests = asyncHandler(async (req, res) => {
    const users = await User.find({ verificationStatus: 'pending' })
        .select('-password')
        .sort({ updatedAt: 1 }); // Show oldest requests first

    res.json(users);
});

// --- 2. NEW FUNCTION ---
// @desc    Approve or reject a verification request
// @route   PUT /api/admin/verify/:id
// @access  Private/Admin
const handleVerificationRequest = asyncHandler(async (req, res) => {
    const { action } = req.body; // action will be 'approve' or 'reject'
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (action === 'approve') {
        user.verificationStatus = 'approved';
        // Note: isVerified virtual will now be true if subscription is active
    } else if (action === 'reject') {
        user.verificationStatus = 'rejected';
    } else {
        res.status(400);
        throw new Error("Invalid action. Must be 'approve' or 'reject'.");
    }

    await user.save();
    
    // Send back all pending requests so the list can refresh
    const users = await User.find({ verificationStatus: 'pending' })
        .select('-password')
        .sort({ updatedAt: 1 });

    res.json(users);
});


module.exports = {
    getAppStats,
    getAllUsers,
    getVerificationRequests, // <-- Export new function
    handleVerificationRequest, // <-- Export new function
};
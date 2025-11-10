const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
// --- THIS IS THE FIX ---
// We must destructure the import because listingModel now exports an object
const { Listing } = require('../models/listingModel');
// --- END OF FIX ---
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');

// @desc    Get application statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAppStats = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments({});
    // This line will now work
    const listingCount = await Listing.countDocuments({}); 
    
    const pendingVerificationCount = await User.countDocuments({
        verificationStatus: 'pending'
    });

    res.json({
        users: userCount,
        listings: listingCount,
        pendingVerifications: pendingVerificationCount,
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password')
        .sort({ createdAt: -1 }); 
        
    res.json(users);
});

// @desc    Get all users with pending verification
// @route   GET /api/admin/verification-requests
// @access  Private/Admin
const getVerificationRequests = asyncHandler(async (req, res) => {
    const users = await User.find({ verificationStatus: 'pending' })
        .select('-password')
        .sort({ updatedAt: 1 }); 

    res.json(users);
});

// @desc    Approve or reject a verification request
// @route   PUT /api/admin/verify/:id
// @access  Private/Admin
const handleVerificationRequest = asyncHandler(async (req, res) => {
    const { action } = req.body; 
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (action === 'approve') {
        user.verificationStatus = 'approved';
    } else if (action === 'reject') {
        user.verificationStatus = 'rejected';
    } else {
        res.status(400);
        throw new Error("Invalid action. Must be 'approve' or 'reject'.");
    }

    await user.save();
    
    const users = await User.find({ verificationStatus: 'pending' })
        .select('-password')
        .sort({ updatedAt: 1 });

    res.json(users);
});

// @desc    Ban or unban a user
// @route   PUT /api/admin/ban/:id
// @access  Private/Admin
const banUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Toggle the ban status
    user.isBanned = !user.isBanned;
    await user.save();

    // Return all users so the list can refresh
    const allUsers = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(allUsers);
});

// @desc    Permanently delete a user (Admin)
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isAdmin) {
        res.status(400);
        throw new Error('Cannot delete an admin account.');
    }

    // Perform the same full deletion as the cron job
    console.log(`ADMIN: Deleting user ${user.email} (ID: ${user._id})`);
    
    // This line will now work
    await Listing.deleteMany({ owner: user._id });
    await Conversation.deleteMany({ participants: user._id });
    await Message.deleteMany({ sender: user._id });
    await User.updateMany(
        { savedListings: user._id },
        { $pull: { savedListings: user._id } }
    );
    await User.deleteOne({ _id: user._id });
    
    console.log(`ADMIN: Successfully deleted user ${user.email}.`);

    // Return all users so the list can refresh
    const allUsers = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(allUsers);
});


module.exports = {
    getAppStats,
    getAllUsers,
    getVerificationRequests,
    handleVerificationRequest,
    banUser,
    deleteUser
};
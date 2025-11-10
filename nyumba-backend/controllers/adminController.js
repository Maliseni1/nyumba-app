const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { Listing } = require('../models/listingModel');
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
// --- 1. IMPORT THE NEW AD MODEL ---
const { Ad } = require('../models/adModel');

// @desc    Get application statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAppStats = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments({});
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

    user.isBanned = !user.isBanned;
    await user.save();

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

    console.log(`ADMIN: Deleting user ${user.email} (ID: ${user._id})`);
    
    await Listing.deleteMany({ owner: user._id });
    await Conversation.deleteMany({ participants: user._id });
    await Message.deleteMany({ sender: user._id });
    await User.updateMany(
        { savedListings: user._id },
        { $pull: { savedListings: user._id } }
    );
    await User.deleteOne({ _id: user._id });
    
    console.log(`ADMIN: Successfully deleted user ${user.email}.`);

    const allUsers = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(allUsers);
});

// --- 2. NEW AD MANAGEMENT FUNCTIONS ---

// @desc    Get all ads
// @route   GET /api/admin/ads
// @access  Private/Admin
const adminGetAllAds = asyncHandler(async (req, res) => {
    const ads = await Ad.find({}).sort({ createdAt: -1 });
    res.json(ads);
});

// @desc    Create a new ad
// @route   POST /api/admin/ads
// @access  Private/Admin
const adminCreateAd = asyncHandler(async (req, res) => {
    const { companyName, linkUrl, location, isActive, expiresAt } = req.body;

    if (!req.file) {
        res.status(400);
        throw new Error('Ad image is required.');
    }
    if (!companyName || !linkUrl || !location) {
        res.status(400);
        throw new Error('CompanyName, linkUrl, and location are required.');
    }

    const ad = await Ad.create({
        companyName,
        linkUrl,
        location,
        imageUrl: req.file.path, // Get image URL from Cloudinary upload
        isActive: isActive !== undefined ? isActive : false,
        expiresAt: expiresAt || null,
    });

    res.status(201).json(ad);
});

// @desc    Update an ad
// @route   PUT /api/admin/ads/:id
// @access  Private/Admin
const adminUpdateAd = asyncHandler(async (req, res) => {
    const { companyName, linkUrl, location, isActive, expiresAt } = req.body;
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
        res.status(404);
        throw new Error('Ad not found');
    }

    ad.companyName = companyName || ad.companyName;
    ad.linkUrl = linkUrl || ad.linkUrl;
    ad.location = location || ad.location;
    ad.isActive = isActive !== undefined ? isActive : ad.isActive;
    ad.expiresAt = expiresAt || null; // Allow setting/clearing expiry

    // Check if a new image was uploaded
    if (req.file) {
        ad.imageUrl = req.file.path;
    }

    const updatedAd = await ad.save();
    res.json(updatedAd);
});

// @desc    Delete an ad
// @route   DELETE /api/admin/ads/:id
// @access  Private/Admin
const adminDeleteAd = asyncHandler(async (req, res) => {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
        res.status(404);
        throw new Error('Ad not found');
    }

    // Note: We are permanently deleting. 
    // If you prefer to deactivate, change this to:
    // ad.isActive = false;
    // await ad.save();
    await ad.deleteOne();
    
    res.json({ message: 'Ad removed successfully.' });
});


// --- 3. EXPORT ALL FUNCTIONS ---
module.exports = {
    getAppStats,
    getAllUsers,
    getVerificationRequests,
    handleVerificationRequest,
    banUser,
    deleteUser,
    adminGetAllAds,      // <-- ADDED
    adminCreateAd,       // <-- ADDED
    adminUpdateAd,       // <-- ADDED
    adminDeleteAd        // <-- ADDED
};
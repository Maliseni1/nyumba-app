const asyncHandler = require('express-async-handler');
const Reward = require('../models/rewardModel');
const User = require('../models/userModel');
const Listing = require('../models/listingModel');
const { handlePointsTransaction, POINTS_REASONS } = require('../utils/pointsManager');
const mongoose = require('mongoose'); // Import mongoose

// @desc    Get all active rewards FOR THE CURRENT USER'S ROLE
// @route   GET /api/rewards
// @access  Private
const getRewards = asyncHandler(async (req, res) => {
    const userRole = req.user.role; 

    const rewards = await Reward.find({ 
        isActive: true,
        role: { $in: [userRole, 'all'] }
    }).sort({ pointsCost: 1 });
    
    res.json(rewards);
});

// @desc    Redeem a reward
// @route   POST /api/rewards/redeem
// @access  Private
const redeemReward = asyncHandler(async (req, res) => {
    const { rewardId, listingId } = req.body;
    const user = await User.findById(req.user._id);

    const reward = await Reward.findById(rewardId);

    if (!reward || !reward.isActive) {
        res.status(404);
        throw new Error('Reward not found or is no longer available.');
    }

    if (reward.role !== 'all' && reward.role !== user.role) {
        res.status(403);
        throw new Error('This reward is not available for your account type.');
    }

    if (user.points < reward.pointsCost) {
        res.status(400);
        throw new Error('You do not have enough points to redeem this reward.');
    }

    let entityId = null;
    let successMessage = 'Reward redeemed successfully!';

    const reasonKeyString = Object.keys(POINTS_REASONS).find(
        key => key.startsWith('REDEEM_') && key.endsWith(reward.type)
    );

    if (!reasonKeyString) {
        res.status(500);
        throw new Error(`No points logic found for reward type: ${reward.type}`);
    }

    if (reward.type === 'LISTING_PRIORITY') {
        if (!listingId) {
            res.status(400);
            throw new Error('You must select one of your listings to apply this reward.');
        }

        const listing = await Listing.findById(listingId);
        if (!listing || listing.owner.toString() !== user._id.toString()) {
            res.status(404);
            throw new Error('Listing not found or you are not the owner.');
        }

        if (listing.isPriority) {
            res.status(400);
            throw new Error('This listing already has priority.');
        }

        listing.isPriority = true;
        if (reward.durationInDays) {
            listing.priorityExpiresAt = new Date(Date.now() + reward.durationInDays * 24 * 60 * 60 * 1000);
        }
        await listing.save();

        entityId = listing._id;
        successMessage = `"${listing.title}" is now a Priority Listing!`;
    
    } else if (reward.type === 'CASHBACK') {
        console.log(`CASHBACK REDEEMED: User ${user.email} (ID: ${user._id}) redeemed ${reward.pointsCost} points for K${reward.cashValue}.`);
        
        entityId = new mongoose.Types.ObjectId(); 
        successMessage = `K${reward.cashValue} cashback redeemed! Our team will process your payment within 48 hours.`;
    }

    const newPointsTotal = await handlePointsTransaction(
        user._id,
        reasonKeyString,
        entityId,
        reward.pointsCost
    );

    res.json({
        message: successMessage,
        newPointsTotal: newPointsTotal,
    });
});

// --- ADMIN FUNCTIONS ---

// @desc    Get ALL rewards (active and inactive)
// @route   GET /api/rewards/admin/all
// @access  Private/Admin
const adminGetAllRewards = asyncHandler(async (req, res) => {
    const rewards = await Reward.find({}).sort({ isActive: -1, pointsCost: 1 });
    res.json(rewards);
});

// @desc    Create a new reward
// @route   POST /api/rewards/admin
// @access  Private/Admin
const createReward = asyncHandler(async (req, res) => {
    const { 
        title, 
        description, 
        pointsCost, 
        type, 
        role, 
        durationInDays, 
        cashValue,
        isActive
    } = req.body;

    if (!title || !description || !pointsCost || !type || !role) {
        res.status(400);
        throw new Error('Please provide all required fields: title, description, pointsCost, type, and role.');
    }

    const reward = await Reward.create({
        title,
        description,
        pointsCost,
        type,
        role,
        durationInDays: durationInDays || null,
        cashValue: cashValue || null,
        isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(reward);
});

// @desc    Update an existing reward
// @route   PUT /api/rewards/admin/:id
// @access  Private/Admin
const updateReward = asyncHandler(async (req, res) => {
    const { 
        title, 
        description, 
        pointsCost, 
        type, 
        role, 
        durationInDays, 
        cashValue,
        isActive
    } = req.body;
    
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
        res.status(404);
        throw new Error('Reward not found.');
    }

    reward.title = title || reward.title;
    reward.description = description || reward.description;
    reward.pointsCost = pointsCost || reward.pointsCost;
    reward.type = type || reward.type;
    reward.role = role || reward.role;
    reward.durationInDays = durationInDays !== undefined ? durationInDays : reward.durationInDays;
    reward.cashValue = cashValue !== undefined ? cashValue : reward.cashValue;
    reward.isActive = isActive !== undefined ? isActive : reward.isActive;

    const updatedReward = await reward.save();
    res.json(updatedReward);
});

// @desc    Delete (deactivate) a reward
// @route   DELETE /api/rewards/admin/:id
// @access  Private/Admin
const deleteReward = asyncHandler(async (req, res) => {
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
        res.status(404);
        throw new Error('Reward not found.');
    }

    // We just deactivate it, we don't delete it
    reward.isActive = false;
    await reward.save();
    
    res.json({ message: 'Reward deactivated successfully.' });
});

module.exports = {
    getRewards,
    redeemReward,
    adminGetAllRewards, // <-- Export new admin function
    createReward,       // <-- Export new admin function
    updateReward,       // <-- Export new admin function
    deleteReward        // <-- Export new admin function
};
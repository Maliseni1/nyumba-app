const asyncHandler = require('express-async-handler');
const Reward = require('../models/rewardModel');
const User = require('../models/userModel');
const Listing = require('../models/listingModel');
const { handlePointsTransaction, POINTS_REASONS } = require('../utils/pointsManager');

// @desc    Get all active rewards
// @route   GET /api/rewards
// @access  Private
const getRewards = asyncHandler(async (req, res) => {
    const rewards = await Reward.find({ isActive: true }).sort({ pointsCost: 1 });
    res.json(rewards);
});

// @desc    Redeem a reward
// @route   POST /api/rewards/redeem
// @access  Private
const redeemReward = asyncHandler(async (req, res) => {
    const { rewardId, listingId } = req.body; // listingId is specific to LISTING_PRIORITY
    const user = await User.findById(req.user._id);

    const reward = await Reward.findById(rewardId);

    if (!reward || !reward.isActive) {
        res.status(404);
        throw new Error('Reward not found or is no longer available.');
    }

    // 1. Check if user has enough points
    if (user.points < reward.pointsCost) {
        res.status(400);
        throw new Error('You do not have enough points to redeem this reward.');
    }

    // 2. Handle the specific reward type
    let entityId = null;
    let successMessage = 'Reward redeemed successfully!';

    // Find the matching reason key from pointsManager.js
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

        // Apply the reward to the listing
        listing.isPriority = true;
        if (reward.durationInDays) {
            listing.priorityExpiresAt = new Date(Date.now() + reward.durationInDays * 24 * 60 * 60 * 1000);
        }
        await listing.save();

        entityId = listing._id;
        successMessage = `"${listing.title}" is now a Priority Listing!`;
    }

    // 3. Deduct the points and log the transaction
    const newPointsTotal = await handlePointsTransaction(
        user._id,
        reasonKeyString,
        entityId,
        reward.pointsCost // Pass the dynamic cost as the override
    );

    res.json({
        message: successMessage,
        newPointsTotal: newPointsTotal,
    });
});

module.exports = {
    getRewards,
    redeemReward,
};
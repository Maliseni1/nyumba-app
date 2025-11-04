const User = require('../models/userModel');
const PointsHistory = require('../models/pointsHistoryModel');

// 1. Define all point-earning/redeeming reasons
// This makes it easy to change point values later
const POINTS_REASONS = {
    // Earning points
    REVIEW_LISTING: {
        points: 10,
        description: 'Wrote a review for a listing',
        action: 'earn'
    },
    COMPLETE_PROFILE: {
        points: 5,
        description: 'Completed profile (bio & WhatsApp)',
        action: 'earn'
    },
    REFERRAL_SIGNUP: {
        points: 25,
        description: 'Referred a new user',
        action: 'earn'
    },
    
    // Redeeming points
    // This is now just a TEMPLATE for the description and action
    REDEEM_LISTING_PRIORITY: {
        // points cost is now dynamic, defined in the Reward model
        description: 'Redeemed "Priority Listing" reward',
        action: 'redeem'
    }
};

/**
 * @desc    Awards or redeems points for a user and logs the transaction.
 * @param   {string} userId - The ID of the user.
 * @param   {string} reasonKey - The key from POINTS_REASONS (e.g., 'REVIEW_LISTING').
 * @param   {string} [entityId] - Optional: The ID of the related item.
 * @param   {number} [overridePoints] - Optional: For redemptions, this is the *exact* (negative) point cost.
 */
const handlePointsTransaction = async (userId, reasonKey, entityId = null, overridePoints = null) => {
    try {
        const reason = POINTS_REASONS[reasonKey];
        if (!reason) {
            console.error(`Invalid points reason key: ${reasonKey}`);
            return;
        }

        const { description, action } = reason;
        
        // Use overridePoints if provided (for redemptions), otherwise use static points
        // We ensure redemption points are negative
        let pointsToTransact;
        if (overridePoints !== null) {
            pointsToTransact = action === 'redeem' ? -Math.abs(overridePoints) : Math.abs(overridePoints);
        } else {
            pointsToTransact = reason.points;
        }

        if (pointsToTransact === undefined || pointsToTransact === null) {
             console.error(`No points value found for ${reasonKey}`);
             return;
        }

        // 1. Update the user's total points
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { points: pointsToTransact } },
            { new: true } // Return the updated user
        );

        if (!user) {
            console.error(`User not found for points transaction: ${userId}`);
            return;
        }

        // 2. Create a history log for the transaction
        await PointsHistory.create({
            user: userId,
            points: pointsToTransact,
            action: action,
            description: description,
            entityId: entityId,
        });
        
        console.log(`Successfully handled points for ${user.email}: ${action} ${pointsToTransact} for ${description}`);
        
        return user.points;

    } catch (error) {
        console.error('Error in handlePointsTransaction:', error);
    }
};

module.exports = {
    handlePointsTransaction,
    POINTS_REASONS
};
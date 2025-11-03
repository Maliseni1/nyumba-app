const User = require('../models/userModel');
const PointsHistory = require('../models/pointsHistoryModel');

// --- 1. Define all point-earning reasons ---
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
    REDEEM_PRIORITY_LISTING: {
        points: -50,
        description: 'Redeemed "Priority Listing" reward',
        action: 'redeem'
    }
};

/**
 * @desc    Awards or redeems points for a user and logs the transaction.
 * @param   {string} userId - The ID of the user.
 * @param   {string} reasonKey - The key from POINTS_REASONS (e.g., 'REVIEW_LISTING').
 * @param   {string} [entityId] - Optional: The ID of the related item (e.g., the review ID or listing ID).
 */
const handlePointsTransaction = async (userId, reasonKey, entityId = null) => {
    try {
        const reason = POINTS_REASONS[reasonKey];
        if (!reason) {
            console.error(`Invalid points reason key: ${reasonKey}`);
            return;
        }

        const { points, description, action } = reason;

        // 1. Update the user's total points
        // We use $inc to safely add (or subtract) the points
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { points: points } },
            { new: true } // Return the updated user
        );

        if (!user) {
            console.error(`User not found for points transaction: ${userId}`);
            return;
        }

        // 2. Create a history log for the transaction
        await PointsHistory.create({
            user: userId,
            points: points,
            action: action,
            description: description,
            entityId: entityId,
        });

        console.log(`Successfully handled points for ${user.email}: ${action} ${points} for ${description}`);

        // We can return the new total if needed
        return user.points;

    } catch (error) {
        // Log the error but don't crash the main operation (e.g., review creation)
        console.error('Error in handlePointsTransaction:', error);
    }
};

module.exports = {
    handlePointsTransaction,
    POINTS_REASONS // Export reasons in case we need them elsewhere
};
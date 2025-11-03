const mongoose = require('mongoose');

const pointsHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true, // Add index for faster queries
    },
    points: {
        type: Number,
        required: true, // Can be positive (earn) or negative (redeem)
    },
    action: {
        type: String,
        required: true,
        enum: ['earn', 'redeem'],
    },
    description: {
        type: String,
        required: true, // e.g., "Wrote a review", "Redeemed 'Featured Listing' reward"
    },
    // Optional: Link to the entity that triggered the points
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
    }
}, {
    timestamps: true,
});

const PointsHistory = mongoose.model('PointsHistory', pointsHistorySchema);

module.exports = PointsHistory;
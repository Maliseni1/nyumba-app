const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    pointsCost: {
        type: Number,
        required: true,
        min: 1,
    },
    // 'type' tells our backend what action to perform when redeemed
    type: {
        type: String,
        required: true,
        enum: [
            'LISTING_PRIORITY', // For making a listing "featured"
            'DISCOUNT_VOUCHER', // For a discount code (future)
            'OTHER'
        ],
    },
    // We can add duration (in days) for time-based rewards
    durationInDays: {
        type: Number,
        default: null, // Not all rewards have a duration
    },
    isActive: {
        type: Boolean,
        default: true, // Allows admin to enable/disable rewards
    }
}, {
    timestamps: true,
});

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;
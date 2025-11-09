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
    type: {
        type: String,
        required: true,
        enum: [
            'LISTING_PRIORITY', // For making a listing "featured"
            'DISCOUNT_VOUCHER', // For a discount code (future)
            'CASHBACK', // --- 1. NEW TYPE FOR TENANTS ---
            'OTHER'
        ],
    },
    
    // --- 2. NEW FIELD: Who is this reward for? ---
    role: {
        type: String,
        required: true,
        enum: ['landlord', 'tenant', 'all'],
        default: 'all'
    },

    durationInDays: {
        type: Number,
        default: null, 
    },
    
    // --- 3. NEW FIELD: Value for cashback ---
    cashValue: {
        type: Number,
        default: null, // e.g., 50 (for K50)
    },
    
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;
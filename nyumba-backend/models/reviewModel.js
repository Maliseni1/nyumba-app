const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Listing',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    landlord: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});

// To ensure a user can only review a specific listing ONCE
reviewSchema.index({ listing: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    bedrooms: {
        type: Number,
        required: true,
    },
    bathrooms: {
        type: Number,
        required: true,
    },
    propertyType: {
        type: String,
        required: true,
        enum: ['House', 'Apartment', 'Land', 'Commercial'],
    },
    images: [{
        type: String,
    }],
    // --- THE FIX IS HERE ---
    // The field must be named 'owner', not 'user'
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
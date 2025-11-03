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
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
        },
        address: {
            type: String,
        },
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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },

    // --- 1. NEW FIELDS FOR LANDLORD DASHBOARD ---
    status: {
        type: String,
        enum: ['available', 'occupied'],
        default: 'available',
    },
    analytics: {
        views: {
            type: Number,
            default: 0,
        },
        inquiries: {
            type: Number,
            default: 0,
        },
    },
    // --- END OF NEW FIELDS ---

}, {
    timestamps: true,
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
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
    status: {
        type: String,
        enum: ['available', 'occupied'],
        default: 'available',
    },

    // --- 1. NEW FIELD FOR PRIORITY ACCESS ---
    // This is the time when the listing becomes visible to FREE users.
    // Premium tenants will be able to see it immediately.
    publicReleaseAt: {
        type: Date,
        default: Date.now, // Defaults to now, but we will override this
        index: true, // Add index for fast querying
    },
    // --- END OF NEW FIELD ---

    // --- REWARD FIELDS ---
    isPriority: {
        type: Boolean,
        default: false,
        index: true,
    },
    priorityExpiresAt: {
        type: Date,
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
        numReviews: {
            type: Number,
            default: 0,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
    },
}, {
    timestamps: true,
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
const mongoose = require('mongoose');

const amenityOptions = [
    'Pet Friendly',
    'Furnished',
    'WiFi Included',
    'Parking Available',
    'Security',
    'Borehole',
    'Pool'
];

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
    
    // --- 1. NEW VIDEO FIELD ---
    videoUrl: {
        type: String, // This will store the Cloudinary URL for the video
        default: null,
    },
    // --- END OF NEW FIELD ---

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
    publicReleaseAt: {
        type: Date,
        default: Date.now, 
        index: true,
    },
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
    amenities: [{
        type: String,
        enum: amenityOptions
    }]
}, {
    timestamps: true,
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = {
    Listing,
    amenityOptions 
};
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
    
    // --- THIS IS THE UPDATED FIELD ---
    location: {
        type: {
            type: String,
            enum: ['Point'], // GeoJSON type
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere', // For fast map queries
        },
        address: { // The original string from the user
            type: String,
        },
    },
    // --- END OF UPDATE ---

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
}, {
    timestamps: true,
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
const mongoose = require('mongoose');
// Import the amenities list to ensure they match
const { amenityOptions } = require('./listingModel'); 

const tenantPreferenceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // Each user can only have one preference profile
        index: true,
    },
    // Location: For Phase 1, we will just match on a text string.
    location: {
        type: String,
        trim: true,
    },
    propertyTypes: [{
        type: String,
        enum: ['House', 'Apartment', 'Land', 'Commercial'],
    }],
    minPrice: {
        type: Number,
        default: 0
    },
    maxPrice: {
        type: Number,
    },
    minBedrooms: {
        type: Number,
        default: 1
    },
    minBathrooms: {
        type: Number,
        default: 1
    },
    // Store the amenities the tenant *requires*
    amenities: [{
        type: String,
        enum: amenityOptions // Uses the same list from listingModel
    }],
    // This allows tenants to opt-out of notifications
    notifyImmediately: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const TenantPreference = mongoose.model('TenantPreference', tenantPreferenceSchema);

module.exports = TenantPreference;
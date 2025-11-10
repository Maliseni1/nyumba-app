const mongoose = require('mongoose');

// We'll pre-define ad locations so you can easily add new ones.
const adLocationOptions = [
    'homepage_banner',    // A large banner on the homepage
    'listing_sidebar',    // A vertical ad on the listing detail page
    'search_results_top'  // An ad that appears above search results
];

const adSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
    },
    // The URL the ad will link to
    linkUrl: {
        type: String,
        required: true,
    },
    // The URL of the ad image (hosted on Cloudinary)
    imageUrl: {
        type: String,
        required: true,
    },
    // Where this ad should appear on the site
    location: {
        type: String,
        required: true,
        enum: adLocationOptions,
    },
    isActive: {
        type: Boolean,
        default: false, // Default to 'false' so ads are not live until you approve them
        index: true,
    },
    // Optional: Set a date for the ad to automatically stop running
    expiresAt: {
        type: Date,
    },
    // Analytics
    clicks: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

const Ad = mongoose.model('Ad', adSchema);

module.exports = {
    Ad,
    adLocationOptions
};
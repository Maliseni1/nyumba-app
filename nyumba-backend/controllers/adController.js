const asyncHandler = require('express-async-handler');
const { Ad } = require('../models/adModel');

// @desc    Get an active ad for a specific location
// @route   GET /api/ads
// @access  Public
const getAdByLocation = asyncHandler(async (req, res) => {
    const { location } = req.query;
    if (!location) {
        res.status(400);
        throw new Error('Ad location is required');
    }

    // Find all active ads for the requested location that have not expired
    const potentialAds = await Ad.find({
        location: location,
        isActive: true,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    });

    if (potentialAds.length === 0) {
        return res.json(null); // No ad to show
    }

    // Simple random selection
    const ad = potentialAds[Math.floor(Math.random() * potentialAds.length)];

    // We can track a "view" here, but it's more reliable to track impressions on the frontend
    // For now, we'll just return the ad.
    res.json({
        _id: ad._id,
        linkUrl: ad.linkUrl,
        imageUrl: ad.imageUrl,
        companyName: ad.companyName
    });
});

// @desc    Track a click on an ad
// @route   POST /api/ads/click
// @access  Public
const trackAdClick = asyncHandler(async (req, res) => {
    const { adId } = req.body;
    if (!adId) {
        res.status(400);
        throw new Error('Ad ID is required');
    }

    // Find the ad and increment its click count
    await Ad.updateOne(
        { _id: adId },
        { $inc: { clicks: 1 } }
    );

    res.status(200).json({ message: 'Ad click tracked' });
});

module.exports = {
    getAdByLocation,
    trackAdClick
};
const asyncHandler = require('express-async-handler');
const Review = require('../models/reviewModel');
const Listing = require('../models/listingModel');
const User = require('../models/userModel');
// --- 1. IMPORT THE NEW POINTS MANAGER ---
const { handlePointsTransaction } = require('../utils/pointsManager');

// @desc    Create a new review for a listing
// @route   POST /api/reviews/:listingId
// @access  Private
const createListingReview = asyncHandler(async (req, res) => {
    const { listingId } = req.params;
    const { rating, comment } = req.body;
    const user = req.user;

    // 1. Find the listing being reviewed
    const listing = await Listing.findById(listingId);
    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    // 2. Check if user is the owner
    if (listing.owner.toString() === user._id.toString()) {
        res.status(400);
        throw new Error('You cannot review your own listing');
    }

    // 3. Check if user has already reviewed this listing
    const alreadyReviewed = await Review.findOne({ 
        listing: listingId, 
        user: user._id 
    });
    if (alreadyReviewed) {
        res.status(400);
        throw new Error('You have already reviewed this listing');
    }

    // 4. Create the new review
    const review = new Review({
        listing: listingId,
        user: user._id,
        landlord: listing.owner,
        rating: Number(rating),
        comment,
    });
    await review.save();

    // 5. Update the Listing's average rating
    const listingReviews = await Review.find({ listing: listingId });
    listing.analytics.numReviews = listingReviews.length;
    listing.analytics.averageRating = 
        listingReviews.reduce((acc, item) => item.rating + acc, 0) / listingReviews.length;
    await listing.save();

    // 6. Update the Landlord's overall average rating
    const landlord = await User.findById(listing.owner);
    const landlordReviews = await Review.find({ landlord: listing.owner });
    landlord.numReviews = landlordReviews.length;
    landlord.averageRating = 
        landlordReviews.reduce((acc, item) => item.rating + acc, 0) / landlordReviews.length;
    await landlord.save();

    // --- 7. AWARD POINTS FOR THE REVIEW ---
    const newPointsTotal = await handlePointsTransaction(
        user._id, 
        'REVIEW_LISTING', // The reason key from pointsManager.js
        review._id        // The ID of the new review
    );
    // --- END OF POINTS LOGIC ---

    res.status(201).json({ 
        message: 'Review added', 
        newPointsTotal: newPointsTotal // Send the new point total to the frontend
    });
});

// @desc    Get all reviews for a listing
// @route   GET /api/reviews/:listingId
// @access  Public
const getListingReviews = asyncHandler(async (req, res) => {
    // ... (This function is unchanged)
    const { listingId } = req.params;
    const reviews = await Review.find({ listing: listingId })
        .populate('user', 'name profilePicture')
        .sort({ createdAt: -1 });
    
    res.json(reviews);
});

module.exports = {
    createListingReview,
    getListingReviews,
};
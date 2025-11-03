const express = require('express');
const router = express.Router();
const { 
    createListingReview, 
    getListingReviews 
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Routes are relative to /api/reviews

router.route('/:listingId')
    .post(protect, createListingReview) // POST /api/reviews/<listingId>
    .get(getListingReviews);            // GET  /api/reviews/<listingId>

module.exports = router;
const express = require('express');
const router = express.Router();
const {
    getListings,
    getListingsNearby,
    reverseGeocode,
    getListingById,
    createListing,
    updateListing,
    deleteListing,
    setListingStatus,
    getRecommendedListings, // <-- 1. IMPORT
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/nearby', getListingsNearby);
router.get('/reverse-geocode', protect, reverseGeocode);

// --- 2. ADD THE NEW RECOMMENDATIONS ROUTE ---
// Must be protected, as it's personalized for the logged-in user
router.get('/recommendations', protect, getRecommendedListings);

router.route('/')
    .get(getListings)
    .post(protect, upload.array('images', 5), createListing);

router.route('/:id/status').put(protect, setListingStatus);

router.route('/:id')
    .get(getListingById)
    .put(protect, upload.array('images', 5), updateListing)
    .delete(protect, deleteListing);

module.exports = router;
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
    getRecommendedListings,
} = require('../controllers/listingController');
// --- 1. IMPORT identifyUser ---
const { protect, identifyUser } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- 2. ADD identifyUser to public routes ---
router.get('/nearby', identifyUser, getListingsNearby);
router.get('/reverse-geocode', protect, reverseGeocode);

router.get('/recommendations', protect, getRecommendedListings);

router.route('/')
    .get(identifyUser, getListings) // <-- 3. ADDED identifyUser
    .post(protect, upload.array('images', 5), createListing);

router.route('/:id/status').put(protect, setListingStatus);

router.route('/:id')
    .get(identifyUser, getListingById) // <-- 4. ADDED identifyUser
    .put(protect, upload.array('images', 5), updateListing)
    .delete(protect, deleteListing);

module.exports = router;
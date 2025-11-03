const express = require('express');
const router = express.Router();
const {
    getListings,
    getListingsNearby,
    reverseGeocode, // <-- 1. IMPORT
    getListingById,
    createListing,
    updateListing,
    deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/nearby', getListingsNearby);

// --- 2. ADD THE NEW ROUTE ---
// This must be protected, only logged-in users (landlords) should use it
router.get('/reverse-geocode', protect, reverseGeocode);

router.route('/')
    .get(getListings)
    .post(protect, upload.array('images', 5), createListing);

router.route('/:id')
    .get(getListingById)
    .put(protect, upload.array('images', 5), updateListing)
    .delete(protect, deleteListing);

module.exports = router;
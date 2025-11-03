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
    setListingStatus, // <-- 1. IMPORT THE NEW FUNCTION
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/nearby', getListingsNearby);
router.get('/reverse-geocode', protect, reverseGeocode);

router.route('/')
    .get(getListings)
    .post(protect, upload.array('images', 5), createListing);

// --- 2. ADD THE NEW STATUS ROUTE ---
// This route must be protected so only the owner can change the status
router.route('/:id/status').put(protect, setListingStatus);

router.route('/:id')
    .get(getListingById)
    .put(protect, upload.array('images', 5), updateListing)
    .delete(protect, deleteListing);

module.exports = router;
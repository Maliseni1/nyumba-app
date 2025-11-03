const express = require('express');
const router = express.Router();
const {
    getListings,
    getListingsNearby, // <-- 1. IMPORT THE NEW FUNCTION
    getListingById,
    createListing,
    updateListing,
    deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- 2. ADD THE NEW ROUTE ---
// NOTE: This must be *before* the '/:id' route
router.get('/nearby', getListingsNearby);

router.route('/')
    .get(getListings)
    .post(protect, upload.array('images', 5), createListing);

router.route('/:id')
    .get(getListingById)
    .put(protect, upload.array('images', 5), updateListing)
    .delete(protect, deleteListing);

module.exports = router;
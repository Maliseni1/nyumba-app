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
    bulkUploadListings // <-- 1. IMPORT
} = require('../controllers/listingController');
const { protect, identifyUser } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const csvUpload = require('../middleware/csvUploadMiddleware'); // <-- 2. IMPORT

router.get('/nearby', identifyUser, getListingsNearby);
router.get('/reverse-geocode', protect, reverseGeocode);
router.get('/recommendations', protect, getRecommendedListings);

// --- 3. ADD NEW BULK UPLOAD ROUTE ---
// This uses 'protect' (must be logged in) and 'csvUpload' middleware
router.route('/bulk-upload')
    .post(protect, csvUpload.single('csvFile'), bulkUploadListings);

router.route('/')
    .get(identifyUser, getListings)
    .post(protect, upload.array('images', 5), createListing);

router.route('/:id/status').put(protect, setListingStatus);

router.route('/:id')
    .get(identifyUser, getListingById)
    .put(protect, upload.array('images', 5), updateListing)
    .delete(protect, deleteListing);

module.exports = router;
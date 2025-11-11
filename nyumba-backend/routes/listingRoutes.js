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
    bulkUploadListings
} = require('../controllers/listingController');
const { protect, identifyUser } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const csvUpload = require('../middleware/csvUploadMiddleware');

router.get('/nearby', identifyUser, getListingsNearby);
router.get('/reverse-geocode', protect, reverseGeocode);
router.get('/recommendations', protect, getRecommendedListings);

router.route('/bulk-upload')
    .post(protect, csvUpload.single('csvFile'), bulkUploadListings);

// --- 1. UPDATED THIS ROUTE ---
router.route('/')
    .get(identifyUser, getListings)
    .post(
        protect, 
        // Use .fields() to accept multiple types
        upload.fields([
            { name: 'images', maxCount: 5 },
            { name: 'video', maxCount: 1 }
        ]), 
        createListing
    );

router.route('/:id/status').put(protect, setListingStatus);

// --- 2. UPDATED THIS ROUTE ---
router.route('/:id')
    .get(identifyUser, getListingById)
    .put(
        protect, 
        // Use .fields() to accept multiple types
        upload.fields([
            { name: 'images', maxCount: 5 },
            { name: 'video', maxCount: 1 }
        ]), 
        updateListing
    )
    .delete(protect, deleteListing);

module.exports = router;
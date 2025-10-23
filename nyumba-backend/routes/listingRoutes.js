const express = require('express');
const router = express.Router();
const {
    getListings,
    getListingById,
    createListing,
    updateListing,
    deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getListings)
    .post(protect, upload.array('images', 5), createListing);

router.route('/:id')
    .get(getListingById)
    .put(protect, upload.array('images', 5), updateListing)
    .delete(protect, deleteListing);

module.exports = router;
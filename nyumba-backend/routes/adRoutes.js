const express = require('express');
const router = express.Router();
const { getAdByLocation, trackAdClick } = require('../controllers/adController');

// @route   GET /api/ads?location=homepage_banner
router.route('/').get(getAdByLocation);

// @route   POST /api/ads/click
router.route('/click').post(trackAdClick);

module.exports = router;
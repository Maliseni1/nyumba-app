const express = require('express');
const router = express.Router();
const { getRewards, redeemReward } = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

// All rewards routes are protected
router.use(protect);

// GET /api/rewards
router.route('/').get(getRewards);

// POST /api/rewards/redeem
router.route('/redeem').post(redeemReward);

module.exports = router;
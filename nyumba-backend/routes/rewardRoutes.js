const express = require('express');
const router = express.Router();
const { 
    getRewards, 
    redeemReward,
    adminGetAllRewards, // <-- 1. Import new functions
    createReward,
    updateReward,
    deleteReward
} = require('../controllers/rewardController');
// --- 2. Import 'admin' middleware ---
const { protect, admin } = require('../middleware/authMiddleware');

// === Public User Routes ===
// All user rewards routes are protected
router.use(protect);

// GET /api/rewards
router.route('/').get(getRewards);

// POST /api/rewards/redeem
router.route('/redeem').post(redeemReward);


// === Admin Routes ===
// These routes are protected by 'protect' AND 'admin'
router.route('/admin/all')
    .get(protect, admin, adminGetAllRewards);

router.route('/admin')
    .post(protect, admin, createReward);

router.route('/admin/:id')
    .put(protect, admin, updateReward)
    .delete(protect, admin, deleteReward);

module.exports = router;
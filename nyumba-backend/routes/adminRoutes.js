const express = require('express');
const router = express.Router();
const { 
    getAppStats, 
    getAllUsers,
    getVerificationRequests,  // <-- 1. Import
    handleVerificationRequest // <-- 1. Import
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// All routes are protected by protect + admin middleware

// GET /api/admin/stats
router.route('/stats').get(protect, admin, getAppStats);

// GET /api/admin/users
router.route('/users').get(protect, admin, getAllUsers);

// --- 2. NEW VERIFICATION ROUTES ---

// GET /api/admin/verification-requests
router.route('/verification-requests').get(protect, admin, getVerificationRequests);

// PUT /api/admin/verify/:id
router.route('/verify/:id').put(protect, admin, handleVerificationRequest);
// --- END OF NEW ROUTES ---

module.exports = router;
const express = require('express');
const router = express.Router();
const { 
    getAppStats, 
    getAllUsers,
    getVerificationRequests,
    handleVerificationRequest,
    banUser,    // <-- 1. Import
    deleteUser  // <-- 1. Import
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware'); // <-- 1. Import admin

// All routes are protected by protect + admin middleware

// GET /api/admin/stats
router.route('/stats').get(protect, admin, getAppStats);

// GET /api/admin/users
router.route('/users').get(protect, admin, getAllUsers);

// GET /api/admin/verification-requests
router.route('/verification-requests').get(protect, admin, getVerificationRequests);

// PUT /api/admin/verify/:id
router.route('/verify/:id').put(protect, admin, handleVerificationRequest);

// --- 2. NEW USER MANAGEMENT ROUTES ---

// PUT /api/admin/ban/:id
router.route('/ban/:id').put(protect, admin, banUser);

// DELETE /api/admin/user/:id
router.route('/user/:id').delete(protect, admin, deleteUser);

// --- END OF NEW ROUTES ---

module.exports = router;
const express = require('express');
const router = express.Router();
const { 
    getAppStats, 
    getAllUsers,
    getVerificationRequests,
    handleVerificationRequest,
    banUser,
    deleteUser
} = require('../controllers/adminController');

// --- THIS IS THE FIX ---
// The 'admin' function is in 'authMiddleware.js', not 'adminMiddleware.js'
const { protect, admin } = require('../middleware/authMiddleware'); 
// --- END OF FIX ---

// All routes are protected by protect + admin middleware
router.route('/stats').get(protect, admin, getAppStats);
router.route('/users').get(protect, admin, getAllUsers);
router.route('/verification-requests').get(protect, admin, getVerificationRequests);
router.route('/verify/:id').put(protect, admin, handleVerificationRequest);
router.route('/ban/:id').put(protect, admin, banUser);
router.route('/user/:id').delete(protect, admin, deleteUser);

module.exports = router;
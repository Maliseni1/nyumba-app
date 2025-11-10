const express = require('express');
const router = express.Router();
const { 
    getAppStats, 
    getAllUsers,
    getVerificationRequests,
    handleVerificationRequest,
    banUser,
    deleteUser,
    adminGetAllAds,      // <-- 1. IMPORT
    adminCreateAd,       // <-- 1. IMPORT
    adminUpdateAd,       // <-- 1. IMPORT
    adminDeleteAd        // <-- 1. IMPORT
} = require('../controllers/adminController');

const { protect, admin } = require('../middleware/authMiddleware'); 
// --- 2. IMPORT UPLOAD MIDDLEWARE ---
const upload = require('../middleware/uploadMiddleware');

// === User Management ===
router.route('/stats').get(protect, admin, getAppStats);
router.route('/users').get(protect, admin, getAllUsers);
router.route('/verification-requests').get(protect, admin, getVerificationRequests);
router.route('/verify/:id').put(protect, admin, handleVerificationRequest);
router.route('/ban/:id').put(protect, admin, banUser);
router.route('/user/:id').delete(protect, admin, deleteUser);

// --- 3. NEW AD MANAGEMENT ROUTES ---
router.route('/ads')
    .get(protect, admin, adminGetAllAds)
    .post(protect, admin, upload.single('image'), adminCreateAd);

router.route('/ads/:id')
    .put(protect, admin, upload.single('image'), adminUpdateAd)
    .delete(protect, admin, adminDeleteAd);


module.exports = router;
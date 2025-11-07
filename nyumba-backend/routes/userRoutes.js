const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    googleLogin,
    getUserProfile,
    getPublicUserProfile,
    updateUserProfile,
    getUnreadMessageCount,
    toggleSaveListing,
    forgotPassword,
    resetPassword,
    applyForVerification,
    getMyReferralData,
    changePassword,
    scheduleAccountDeletion // <-- 1. IMPORT
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- Public Auth Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

// --- Public Password Reset Routes ---
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// --- Protected Routes (Login Required) ---
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('profilePicture'), updateUserProfile)
    .delete(protect, scheduleAccountDeletion); // <-- 2. DELETE ROUTE

router.get('/unread-count', protect, getUnreadMessageCount);
router.post('/save/:listingId', protect, toggleSaveListing);
router.post('/apply-verification', protect, applyForVerification);
router.get('/referral-data', protect, getMyReferralData);
router.put('/changepassword', protect, changePassword);

// --- Public Profile Route (Keep this last) ---
router.get('/:id', getPublicUserProfile);

module.exports = router;
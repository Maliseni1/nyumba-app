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
    scheduleAccountDeletion,
    completeProfile,
    verifyEmail,
    resendVerificationEmail,
    sendPremiumSupportTicket,
    getTenantPreferences,
    updateTenantPreferences,
    getTenantMatchAnalytics,
    registerDevice, // <-- 1. IMPORT NEW FUNCTION
    removeDevice // <-- 1. IMPORT NEW FUNCTION
} = require('../controllers/userController');
const { protect, premiumUser } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- Public Auth Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

// --- Email Verification Routes ---
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// --- Public Password Reset Routes ---
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// --- Protected Routes (Login Required) ---
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('profilePicture'), updateUserProfile)
    .delete(protect, scheduleAccountDeletion);

router.put('/complete-profile', protect, completeProfile);
router.get('/unread-count', protect, getUnreadMessageCount);
router.post('/save/:listingId', protect, toggleSaveListing);
router.post('/apply-verification', protect, applyForVerification);
router.get('/referral-data', protect, getMyReferralData);
router.put('/changepassword', protect, changePassword);

// --- 2. NEW PUSH NOTIFICATION ROUTES ---
router.post('/register-device', protect, registerDevice);
router.post('/remove-device', protect, removeDevice);

// --- Premium Support Route ---
router.post('/premium-support', protect, premiumUser, sendPremiumSupportTicket);

// --- Tenant Preference Routes ---
router.route('/preferences')
    .get(protect, getTenantPreferences)
    .put(protect, updateTenantPreferences);
    
router.route('/match-analytics')
    .get(protect, getTenantMatchAnalytics);

// --- Public Profile Route (Keep this last) ---
router.get('/:id', getPublicUserProfile);

module.exports = router;
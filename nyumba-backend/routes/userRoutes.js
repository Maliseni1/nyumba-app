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
    forgotPassword, // <-- 1. IMPORT
    resetPassword, // <-- 2. IMPORT
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- Public Auth Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

// --- 3. NEW PUBLIC PASSWORD RESET ROUTES ---
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// --- Protected Routes (Login Required) ---
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('profilePicture'), updateUserProfile);

router.get('/unread-count', protect, getUnreadMessageCount);
router.post('/save/:listingId', protect, toggleSaveListing);

// --- Public Profile Route (Keep this last) ---
router.get('/:id', getPublicUserProfile);

module.exports = router;
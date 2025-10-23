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
    toggleSaveListing // <-- Import the new function
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('profilePicture'), updateUserProfile);

router.get('/unread-count', protect, getUnreadMessageCount);

// --- NEW ROUTE ---
router.post('/save/:listingId', protect, toggleSaveListing);

router.get('/:id', getPublicUserProfile);

module.exports = router;
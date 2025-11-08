const express = require('express');
const router = express.Router();
const {
    getCategories,
    createCategory,
    getPostsByCategory,
    getPostById,
    createPost,
    deletePost,
    getRepliesByPost,
    createReply,
    deleteReply
} = require('../controllers/forumController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- Category Routes ---
router.route('/categories')
    .get(getCategories) // Public
    .post(protect, admin, createCategory); // Admin only

// --- Post Routes ---
router.route('/posts/category/:categoryId')
    .get(getPostsByCategory); // Public

router.route('/posts/:postId')
    .get(getPostById) // Public
    .delete(protect, deletePost); // Owner or Admin

router.route('/posts')
    .post(protect, createPost); // Logged-in users

// --- Reply Routes ---
router.route('/replies/:postId')
    .get(getRepliesByPost); // Public

router.route('/replies')
    .post(protect, createReply); // Logged-in users

router.route('/replies/:replyId')
    .delete(protect, deleteReply); // Owner or Admin

module.exports = router;
const asyncHandler = require('express-async-handler');
const ForumCategory = require('../models/forumCategoryModel');
const ForumPost = require('../models/forumPostModel');
const ForumReply = require('../models/forumReplyModel');
const User = require('../models/userModel');

// --- Category Functions ---

// @desc    Get all forum categories
// @route   GET /api/forum/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await ForumCategory.find({}).sort({ title: 1 });
    res.json(categories);
});

// @desc    Create a new forum category (Admin Only)
// @route   POST /api/forum/categories
// @access  Admin
const createCategory = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        res.status(400);
        throw new Error('Please provide a title and description');
    }

    const categoryExists = await ForumCategory.findOne({ title });
    if (categoryExists) {
        res.status(400);
        throw new Error('A category with this title already exists');
    }

    const category = await ForumCategory.create({
        title,
        description,
    });

    res.status(201).json(category);
});

// --- Post Functions ---

// @desc    Get all posts in a specific category
// @route   GET /api/forum/posts/category/:categoryId
// @access  Public
const getPostsByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const posts = await ForumPost.find({ category: categoryId })
        .populate('user', 'name profilePicture isVerified isPremiumTenant')
        .sort({ createdAt: -1 });
        
    res.json(posts);
});

// @desc    Get a single post by its ID
// @route   GET /api/forum/posts/:postId
// @access  Public
const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await ForumPost.findById(postId)
        .populate('user', 'name profilePicture isVerified isPremiumTenant');
        
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    
    res.json(post);
});

// @desc    Create a new post
// @route   POST /api/forum/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const { categoryId, title, content } = req.body;

    if (!categoryId || !title || !content) {
        res.status(400);
        throw new Error('Please provide a category, title, and content');
    }

    const post = await ForumPost.create({
        user: req.user._id,
        category: categoryId,
        title,
        content,
    });
    
    // Repopulate to send back full user info
    const populatedPost = await ForumPost.findById(post._id)
        .populate('user', 'name profilePicture isVerified isPremiumTenant');

    res.status(201).json(populatedPost);
});

// @desc    Delete a post
// @route   DELETE /api/forum/posts/:postId
// @access  Private (Owner or Admin)
const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await ForumPost.findById(postId);

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    // Check if user is the owner or an admin
    if (post.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized to delete this post');
    }

    // Delete all replies associated with the post first
    await ForumReply.deleteMany({ post: postId });
    
    // Use .remove() to trigger the post-remove hook
    await post.remove(); 

    res.json({ message: 'Post and all replies removed' });
});

// --- Reply Functions ---

// @desc    Get all replies for a specific post
// @route   GET /api/forum/replies/:postId
// @access  Public
const getRepliesByPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const replies = await ForumReply.find({ post: postId })
        .populate('user', 'name profilePicture isVerified isPremiumTenant')
        .sort({ createdAt: 1 });
        
    res.json(replies);
});

// @desc    Create a new reply
// @route   POST /api/forum/replies
// @access  Private
const createReply = asyncHandler(async (req, res) => {
    const { postId, content } = req.body;

    if (!postId || !content) {
        res.status(400);
        throw new Error('Please provide a post ID and content');
    }

    const reply = await ForumReply.create({
        user: req.user._id,
        post: postId,
        content,
    });
    
    // Repopulate to send back full user info
    const populatedReply = await ForumReply.findById(reply._id)
        .populate('user', 'name profilePicture isVerified isPremiumTenant');

    res.status(201).json(populatedReply);
});

// @desc    Delete a reply
// @route   DELETE /api/forum/replies/:replyId
// @access  Private (Owner or Admin)
const deleteReply = asyncHandler(async (req, res) => {
    const { replyId } = req.params;
    const reply = await ForumReply.findById(replyId);

    if (!reply) {
        res.status(404);
        throw new Error('Reply not found');
    }

    // Check if user is the owner or an admin
    if (reply.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized to delete this reply');
    }

    // Use .remove() to trigger the post-remove hook
    await reply.remove();

    res.json({ message: 'Reply removed' });
});


module.exports = {
    getCategories,
    createCategory,
    getPostsByCategory,
    getPostById,
    createPost,
    deletePost,
    getRepliesByPost,
    createReply,
    deleteReply
};
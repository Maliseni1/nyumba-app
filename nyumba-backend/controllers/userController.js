const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Listing = require('../models/listingModel');
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const user = await User.create({ name, email, password });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

const googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();
    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            name,
            email,
            password: Math.random().toString(36).slice(-8),
            profilePicture: picture,
        });
    }
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
    });
});

// @desc    Get user profile with their listings
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    // Find the user and populate their savedListings field
    const user = await User.findById(req.user._id)
        .select('-password')
        .populate({
            path: 'savedListings',
            populate: { path: 'owner', select: 'name profilePicture' } // Also populate the owner of the saved listing
        });

    if (user) {
        // Separately find the listings this user owns
        const ownedListings = await Listing.find({ owner: req.user._id })
            .populate('owner', 'name profilePicture') // Populate the owner here too
            .sort({ createdAt: -1 });

        // Combine the data into one response object
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            listings: ownedListings, // The listings they own
            savedListings: user.savedListings, // The listings they have saved
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const getPublicUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.bio = req.body.bio || user.bio;
        if (req.body.password) {
            user.password = req.body.password;
        }
        if (req.file) {
            user.profilePicture = req.file.path;
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const getUnreadMessageCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const conversations = await Conversation.find({ participants: userId });
    const conversationIds = conversations.map(c => c._id);
    const unreadCount = await Message.countDocuments({
        conversationId: { $in: conversationIds },
        sender: { $ne: userId },
        readBy: { $nin: [userId] }
    });
    res.status(200).json({ unreadCount });
});

// @desc    Save or unsave a listing
// @route   POST /api/users/save/:listingId
// @access  Private
const toggleSaveListing = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { listingId } = req.params;

    const user = await User.findById(userId);
    const listing = await Listing.findById(listingId);

    if (!user || !listing) {
        res.status(404);
        throw new Error('User or Listing not found');
    }

    const isSaved = user.savedListings.includes(listingId);

    if (isSaved) {
        // Remove from savedListings
        user.savedListings.pull(listingId);
        await user.save();
        res.json({ message: 'Listing removed from saved', savedListings: user.savedListings });
    } else {
        // Add to savedListings
        user.savedListings.push(listingId);
        await user.save();
        res.json({ message: 'Listing added to saved', savedListings: user.savedListings });
    }
});

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    getUserProfile,
    getPublicUserProfile,
    updateUserProfile,
    getUnreadMessageCount,
    toggleSaveListing,
};
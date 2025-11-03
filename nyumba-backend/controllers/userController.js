const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Listing = require('../models/listingModel');
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- registerUser ---
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, whatsappNumber, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const user = await User.create({ name, email, password, whatsappNumber, role });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            savedListings: user.savedListings,
            role: user.role,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            subscriptionStatus: user.subscriptionStatus,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// --- loginUser ---
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            savedListings: user.savedListings,
            role: user.role,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            subscriptionStatus: user.subscriptionStatus,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// --- googleLogin ---
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
            role: 'tenant', 
        });
    }
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        savedListings: user.savedListings,
        role: user.role,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        subscriptionStatus: user.subscriptionStatus,
        token: generateToken(user._id),
    });
});

// --- forgotPassword ---
const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        res.status(404);
        throw new Error('There is no user with that email');
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    const message = `
        <h1>You have requested a password reset</h1>
        <p>Please go to this link to reset your password:</p>
        <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
        <p>This link will expire in 10 minutes.</p>
    `;
    try {
        await sendEmail({ email: user.email, subject: 'Password Reset Token', html: message });
        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new Error('Email could not be sent');
    }
});

// --- resetPassword ---
const resetPassword = asyncHandler(async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        savedListings: user.savedListings,
        role: user.role,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        subscriptionStatus: user.subscriptionStatus,
        token: generateToken(user._id),
    });
});

// --- getUserProfile ---
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('-password')
        .populate({
            path: 'savedListings',
            populate: { path: 'owner', select: 'name profilePicture' }
        });

    if (user) {
        const ownedListings = await Listing.find({ owner: req.user._id })
            .populate('owner', 'name profilePicture')
            .sort({ createdAt: -1 });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            listings: ownedListings,
            savedListings: user.savedListings, // This is now populated
            role: user.role,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            subscriptionStatus: user.subscriptionStatus,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// --- getPublicUserProfile ---
const getPublicUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        const ownedListings = await Listing.find({ owner: user._id })
            .populate('owner', 'name profilePicture')
            .sort({ createdAt: -1 });
            
        res.json({
            _id: user._id,
            name: user.name,
            bio: user.bio,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            listings: ownedListings,
            role: user.role,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
        });
    } else {
        // --- ERROR 1 FIX ---
        res.status(404);
        throw new Error('User not found');
        // --- END OF FIX ---
    }
});

// --- updateUserProfile ---
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
            bio: updatedUser.bio,
            savedListings: updatedUser.savedListings,
            role: updatedUser.role,
            isAdmin: updatedUser.isAdmin,
            isVerified: updatedUser.isVerified,
            verificationStatus: updatedUser.verificationStatus,
            subscriptionStatus: updatedUser.subscriptionStatus,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// --- getUnreadMessageCount ---
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

// --- toggleSaveListing ---
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
        user.savedListings.pull(listingId);
        await user.save();
        res.json({ message: 'Listing removed from saved', savedListings: user.savedListings });
    } else {
        user.savedListings.push(listingId);
        await user.save();
        res.json({ message: 'Listing added to saved', savedListings: user.savedListings });
    }
});

// --- applyForVerification ---
const applyForVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    // --- THIS IS A PLACEHOLDER ---
    // In a real app, your "base pay" webhook would update this.
    // For testing, let's temporarily force the user's subscription to be 'active'.
    // user.subscriptionStatus = 'active';
    // await user.save();
    // --- END OF PLACEHOLDER ---

    if (user.subscriptionStatus !== 'active') {
        res.status(403); // Forbidden
        throw new Error('You must have an active subscription to apply for verification. Please pay first.');
    }
    if (user.verificationStatus === 'pending' || user.verificationStatus === 'approved') {
        res.status(400); // Bad Request
        throw new Error('You have already submitted a verification application.');
    }

    user.verificationStatus = 'pending';
    await user.save();

    // --- ERROR 2 FIX ---
    // Re-fetch the user WITH populated savedListings, just like in getUserProfile
    const updatedUserProfile = await User.findById(req.user._id)
        .select('-password')
        .populate({
            path: 'savedListings',
            populate: { path: 'owner', select: 'name profilePicture' }
        });
    // --- END OF FIX ---
    
    const ownedListings = await Listing.find({ owner: req.user._id })
        .populate('owner', 'name profilePicture')
        .sort({ createdAt: -1 });

    res.status(200).json({
        _id: updatedUserProfile._id,
        name: updatedUserProfile.name,
        email: updatedUserProfile.email,
        bio: updatedUserProfile.bio,
        profilePicture: updatedUserProfile.profilePicture,
        createdAt: updatedUserProfile.createdAt,
        listings: ownedListings,
        savedListings: updatedUserProfile.savedListings, // This is now correct
        role: updatedUserProfile.role,
        isAdmin: updatedUserProfile.isAdmin,
        isVerified: updatedUserProfile.isVerified,
        verificationStatus: updatedUserProfile.verificationStatus,
        subscriptionStatus: updatedUserProfile.subscriptionStatus,
    });
});

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    forgotPassword,
    resetPassword,
    getUserProfile,
    getPublicUserProfile,
    updateUserProfile,
    getUnreadMessageCount,
    toggleSaveListing,
    applyForVerification,
};
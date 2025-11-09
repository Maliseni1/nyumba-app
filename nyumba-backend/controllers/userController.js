const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Listing = require('../models/listingModel');
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { handlePointsTransaction, POINTS_REASONS } = require('../utils/pointsManager');
const PointsHistory = require('../models/pointsHistoryModel');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- registerUser (UPDATED) ---
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, whatsappNumber, role, referralCode } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    let referredByUserId = null;
    if (referralCode) {
        const referrer = await User.findOne({ 
            referralCode: referralCode.toUpperCase() 
        });
        if (referrer) {
            referredByUserId = referrer._id;
        } else {
            console.warn(`Invalid referral code used during registration: ${referralCode}`);
        }
    }

    const user = await User.create({ 
        name, 
        email, 
        password, 
        whatsappNumber, 
        role,
        referredBy: referredByUserId,
        isProfileComplete: true // Regular registration completes the profile
    });
    
    if (user) {
        if (referredByUserId) {
            await handlePointsTransaction(
                referredByUserId, 
                'REFERRAL_SIGNUP', 
                user._id
            );
        }

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
            subscriptionType: user.subscriptionType,
            points: user.points,
            isProfileComplete: user.isProfileComplete,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// --- loginUser (UPDATED) ---
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // --- 1. ADD BANNED USER CHECK ---
    if (user && user.isBanned) {
        res.status(403); // Forbidden
        throw new Error('Your account has been suspended by an administrator.');
    }

    if (user && (await user.matchPassword(password))) {
        
        let welcomeBack = false;
        if (user.isScheduledForDeletion) {
            user.isScheduledForDeletion = false;
            user.deletionScheduledAt = null;
            await user.save();
            welcomeBack = true; 
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
            subscriptionType: user.subscriptionType,
            points: user.points,
            isProfileComplete: user.isProfileComplete, // <-- 2. SEND THIS FLAG
            token: generateToken(user._id),
            welcomeBack: welcomeBack
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// --- googleLogin (UPDATED) ---
const googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();
    let user = await User.findOne({ email });
    
    // --- 3. ADD BANNED USER CHECK ---
    if (user && user.isBanned) {
        res.status(403);
        throw new Error('Your account has been suspended by an administrator.');
    }
    
    let welcomeBack = false;
    if (user && user.isScheduledForDeletion) {
        user.isScheduledForDeletion = false;
        user.deletionScheduledAt = null;
        await user.save();
        welcomeBack = true;
    }

    let isNewUser = false;
    if (!user) {
        isNewUser = true;
        user = await User.create({
            name,
            email,
            password: Math.random().toString(36).slice(-8), // Create a random password
            profilePicture: picture,
            // DO NOT set a role
            isProfileComplete: false, // <-- 4. SET PROFILE AS INCOMPLETE
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
        subscriptionType: user.subscriptionType,
        points: user.points,
        isProfileComplete: user.isProfileComplete, // <-- 5. SEND THIS FLAG
        token: generateToken(user._id),
        welcomeBack: welcomeBack
    });
});

// --- forgotPassword (unchanged) ---
const forgotPassword = asyncHandler(async (req, res) => {
    // ... (full function)
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        res.status(404);
        throw new Error('There is no user with that email');
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please go to this URL to reset your password: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email.`;
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

// --- resetPassword (unchanged) ---
const resetPassword = asyncHandler(async (req, res) => {
    // ... (full function)
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
        subscriptionType: user.subscriptionType,
        points: user.points,
        isProfileComplete: user.isProfileComplete,
        token: generateToken(user._id),
    });
});

// --- getUserProfile (unchanged) ---
const getUserProfile = asyncHandler(async (req, res) => {
    // ... (full function)
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
            whatsappNumber: user.whatsappNumber,
            createdAt: user.createdAt,
            listings: ownedListings,
            savedListings: user.savedListings,
            role: user.role,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionType: user.subscriptionType,
            points: user.points,
            isProfileComplete: user.isProfileComplete,
            isScheduledForDeletion: user.isScheduledForDeletion,
            deletionScheduledAt: user.deletionScheduledAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// --- getPublicUserProfile (unchanged) ---
const getPublicUserProfile = asyncHandler(async (req, res) => {
    // ... (full function)
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
            averageRating: user.averageRating,
            numReviews: user.numReviews,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// --- updateUserProfile (unchanged) ---
const updateUserProfile = asyncHandler(async (req, res) => {
    // ... (full function)
    const user = await User.findById(req.user._id);
    if (user) {
        const isProfileNowComplete = !!(req.body.bio || user.bio) && !!(req.body.whatsappNumber || user.whatsappNumber);
        let hasAlreadyEarned = true; 
        if (isProfileNowComplete) {
            hasAlreadyEarned = await PointsHistory.findOne({
                user: user._id,
                description: POINTS_REASONS.COMPLETE_PROFILE.description
            });
        }
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.bio = req.body.bio || user.bio;
        user.whatsappNumber = req.body.whatsappNumber || user.whatsappNumber;
        if (req.body.password) {
            user.password = req.body.password;
        }
        if (req.file) {
            user.profilePicture = req.file.path;
        }
        const updatedUser = await user.save();
        let newPointsTotal = updatedUser.points;
        if (isProfileNowComplete && !hasAlreadyEarned) {
            newPointsTotal = await handlePointsTransaction(updatedUser._id, 'COMPLETE_PROFILE');
        }
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
            subscriptionType: updatedUser.subscriptionType,
            points: newPointsTotal, 
            isProfileComplete: updatedUser.isProfileComplete,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// --- changePassword (unchanged) ---
const changePassword = asyncHandler(async (req, res) => {
    // ... (full function)
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide both old and new passwords');
    }
    const user = await User.findById(req.user._id);
    if (user && (await user.matchPassword(oldPassword))) {
        user.password = newPassword; 
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(401);
        throw new Error('Invalid old password');
    }
});

// --- getUnreadMessageCount (unchanged) ---
const getUnreadMessageCount = asyncHandler(async (req, res) => {
    // ... (full function)
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

// --- toggleSaveListing (unchanged) ---
const toggleSaveListing = asyncHandler(async (req, res) => {
    // ... (full function)
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

// --- applyForVerification (unchanged) ---
const applyForVerification = asyncHandler(async (req, res) => {
    // ... (full function)
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.subscriptionStatus !== 'active') {
        res.status(403);
        throw new Error('You must have an active subscription to apply for verification. Please pay first.');
    }
    if (user.verificationStatus === 'pending' || user.verificationStatus === 'approved') {
        res.status(400);
        throw new Error('You have already submitted a verification application.');
    }
    user.verificationStatus = 'pending';
    await user.save();
    const updatedUserProfile = await User.findById(req.user._id)
        .select('-password')
        .populate({
            path: 'savedListings',
            populate: { path: 'owner', select: 'name profilePicture' }
        });
    const ownedListings = await Listing.find({ owner: req.user._id })
        .populate('owner', 'name profilePicture')
        .sort({ createdAt: -1 });
    res.status(200).json({
        _id: updatedUserProfile._id,
        name: updatedUserProfile.name,
        email: updatedUserProfile.email,
        bio: updatedUserProfile.bio,
        profilePicture: updatedUserProfile.profilePicture,
        whatsappNumber: updatedUserProfile.whatsappNumber,
        createdAt: updatedUserProfile.createdAt,
        listings: ownedListings,
        savedListings: updatedUserProfile.savedListings,
        role: updatedUserProfile.role,
        isAdmin: updatedUserProfile.isAdmin,
        isVerified: updatedUserProfile.isVerified,
        verificationStatus: updatedUserProfile.verificationStatus,
        subscriptionStatus: updatedUserProfile.subscriptionStatus,
        subscriptionType: updatedUserProfile.subscriptionType,
        points: updatedUserProfile.points,
        isProfileComplete: updatedUserProfile.isProfileComplete,
    });
});

// --- getMyReferralData (unchanged) ---
const getMyReferralData = asyncHandler(async (req, res) => {
    // ... (full function)
    const user = await User.findById(req.user._id).select('referralCode points');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json({
        referralCode: user.referralCode,
        points: user.points,
    });
});

// --- scheduleAccountDeletion (unchanged) ---
const scheduleAccountDeletion = asyncHandler(async (req, res) => {
    // ... (full function)
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    user.isScheduledForDeletion = true;
    user.deletionScheduledAt = deletionDate;
    await user.save();
    res.json({ 
        message: 'Account scheduled for deletion successfully.',
        deletionDate: deletionDate
    });
});

// --- 6. NEW: completeProfile ---
const completeProfile = asyncHandler(async (req, res) => {
    const { role, whatsappNumber } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.isProfileComplete) {
        res.status(400);
        throw new Error('Profile is already complete.');
    }
    if (!role || !whatsappNumber) {
        res.status(400);
        throw new Error('Please provide both a role and a WhatsApp number.');
    }

    user.role = role;
    user.whatsappNumber = whatsappNumber;
    user.isProfileComplete = true;
    await user.save();

    // Give points for completing profile
    await handlePointsTransaction(user._id, 'COMPLETE_PROFILE');

    // Return the full, updated user object
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
        subscriptionType: user.subscriptionType,
        points: user.points,
        isProfileComplete: user.isProfileComplete,
        token: generateToken(user._id),
        welcomeBack: false
    });
});

// --- 7. EXPORT THE NEW FUNCTION ---
module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    forgotPassword,
    resetPassword,
    getUserProfile,
    getPublicUserProfile,
    updateUserProfile,
    changePassword,
    getUnreadMessageCount,
    toggleSaveListing,
    applyForVerification,
    getMyReferralData,
    scheduleAccountDeletion,
    completeProfile // <-- ADDED
};
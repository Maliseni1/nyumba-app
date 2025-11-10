const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
// --- FIX THE LISTING IMPORT ---
const { Listing } = require('../models/listingModel');
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
// --- 1. IMPORT NEW PREFERENCE MODEL ---
const TenantPreference = require('../models/tenantPreferenceModel');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { handlePointsTransaction, POINTS_REASONS } = require('../utils/pointsManager');
const PointsHistory = require('../models/pointsHistoryModel');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendVerificationEmail = async (user, res) => {
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false }); 

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const message = `
        <h1>Welcome to Nyumba!</h1>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Your Email
        </a>
        <p>If you did not create this account, please ignore this email.</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Nyumba - Email Verification',
            html: message,
        });
    } catch (err) {
        console.error(err);
        console.error(`Failed to send verification email to ${user.email}`);
        user.emailVerificationToken = undefined;
        await user.save({ validateBeforeSave: false });
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, whatsappNumber, role, referralCode } = req.body;
    
    let userExists = await User.findOne({ email });

    if (userExists && !userExists.isEmailVerified) {
        await sendVerificationEmail(userExists, res);
        res.status(400); 
        throw new Error('User already exists but is not verified. A new verification email has been sent.');
    }
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
        isProfileComplete: true,
        isEmailVerified: false 
    });
    
    if (user) {
        if (referredByUserId) {
            await handlePointsTransaction(
                referredByUserId, 
                'REFERRAL_SIGNUP', 
                user._id
            );
        }

        try {
            await sendVerificationEmail(user, res);
        } catch (emailError) {
            console.error(`Failed to send initial verification email: ${emailError.message}`);
        }
        
        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.'
        });

    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.isBanned) {
        res.status(403); 
        throw new Error('Your account has been suspended by an administrator.');
    }

    if (user && !(await user.matchPassword(password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }
    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }
    
    if (!user.isEmailVerified) {
        res.status(401); 
        throw new Error('Please verify your email to log in. You can request a new verification link.');
    }

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
        isProfileComplete: user.isProfileComplete,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
        welcomeBack: welcomeBack
    });
});

const googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();
    let user = await User.findOne({ email });
    
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

    if (!user) {
        user = await User.create({
            name,
            email,
            password: Math.random().toString(36).slice(-8),
            profilePicture: picture,
            isProfileComplete: false, 
            isEmailVerified: true 
        });
    }

    if (user && !user.isEmailVerified) {
        user.isEmailVerified = true;
        await user.save();
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
        isProfileComplete: user.isProfileComplete,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
        welcomeBack: welcomeBack
    });
});

const forgotPassword = asyncHandler(async (req, res) => {
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
        subscriptionType: user.subscriptionType,
        points: user.points,
        isProfileComplete: user.isProfileComplete,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
    });
});

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
            isEmailVerified: user.isEmailVerified,
            isScheduledForDeletion: user.isScheduledForDeletion,
            deletionScheduledAt: user.deletionScheduledAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

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
            averageRating: user.averageRating,
            numReviews: user.numReviews,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updateUserProfile = asyncHandler(async (req, res) => {
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
            isEmailVerified: updatedUser.isEmailVerified,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const changePassword = asyncHandler(async (req, res) => {
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

const applyForVerification = asyncHandler(async (req, res) => {
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
        isEmailVerified: updatedUserProfile.isEmailVerified,
    });
});

const getMyReferralData = asyncHandler(async (req, res) => {
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

const scheduleAccountDeletion = asyncHandler(async (req, res) => {
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

    await handlePointsTransaction(user._id, 'COMPLETE_PROFILE');

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
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
        welcomeBack: false
    });
});

const verifyEmail = asyncHandler(async (req, res) => {
    const verificationToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
        
    const user = await User.findOne({ 
        emailVerificationToken: verificationToken
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired verification token.');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    
    res.status(200).json({
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
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
    });
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error('Please provide an email address.');
    }
    
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }
    if (user.isEmailVerified) {
        res.status(400);
        throw new Error('This email is already verified.');
    }

    try {
        await sendVerificationEmail(user, res);
        res.status(200).json({ message: 'A new verification email has been sent.' });
    } catch (error) {
        res.status(500);
        throw new Error('Email could not be sent. Please try again.');
    }
});

const sendPremiumSupportTicket = asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    const user = req.user; 

    if (!subject || !message) {
        res.status(400);
        throw new Error('Please provide a subject and a message.');
    }

    const supportEmail = process.env.SUPPORT_EMAIL;
    if (!supportEmail) {
        console.error('SUPPORT_EMAIL is not set in .env file.');
        res.status(500);
        throw new Error('Support service is currently unavailable. Please try again later.');
    }

    const userEmail = user.email;
    const userName = user.name;
    const userType = user.subscriptionType; 

    const emailSubject = `[Premium Support Ticket - ${userType}] ${subject}`;
    const emailHtml = `
        <p><strong>From:</strong> ${userName} (${userEmail})</p>
        <p><strong>User ID:</strong> ${user._id}</p>
        <p><strong>Subscription Type:</strong> ${userType}</p>
        <hr>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    try {
        await sendEmail({
            email: supportEmail,
            subject: emailSubject,
            html: emailHtml,
            replyTo: userEmail 
        });
        res.status(200).json({ message: 'Support ticket sent successfully. We will get back to you shortly.' });
    } catch (error) {
        console.error('Failed to send support email:', error);
        res.status(500);
        throw new Error('Could not send support ticket. Please try again later.');
    }
});

// --- 2. NEW PREFERENCE FUNCTIONS ---

// @desc    Get tenant preferences
// @route   GET /api/users/preferences
// @access  Private
const getTenantPreferences = asyncHandler(async (req, res) => {
    if (req.user.role !== 'tenant') {
        res.status(403);
        throw new Error('Only tenants can have preferences.');
    }
    
    const preferences = await TenantPreference.findOne({ user: req.user._id });
    
    if (!preferences) {
        // Return a default, empty preference object if none exists
        return res.json({
            user: req.user._id,
            location: '',
            propertyTypes: [],
            minPrice: '',
            maxPrice: '',
            minBedrooms: 1,
            minBathrooms: 1,
            amenities: [],
            notifyImmediately: true,
        });
    }
    
    res.json(preferences);
});

// @desc    Update tenant preferences
// @route   PUT /api/users/preferences
// @access  Private
const updateTenantPreferences = asyncHandler(async (req, res) => {
    if (req.user.role !== 'tenant') {
        res.status(403);
        throw new Error('Only tenants can have preferences.');
    }

    const {
        location,
        propertyTypes,
        minPrice,
        maxPrice,
        minBedrooms,
        minBathrooms,
        amenities,
        notifyImmediately
    } = req.body;

    // Find existing preferences or create new ones
    let preferences = await TenantPreference.findOne({ user: req.user._id });
    if (!preferences) {
        preferences = new TenantPreference({ user: req.user._id });
    }

    // Update the fields
    preferences.location = location || undefined;
    preferences.propertyTypes = propertyTypes || [];
    preferences.minPrice = minPrice || 0;
    preferences.maxPrice = maxPrice || undefined;
    preferences.minBedrooms = minBedrooms || 1;
    preferences.minBathrooms = minBathrooms || 1;
    preferences.amenities = amenities || [];
    preferences.notifyImmediately = notifyImmediately;

    const updatedPreferences = await preferences.save();
    res.json(updatedPreferences);
});

// --- 3. EXPORT NEW FUNCTIONS ---
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
    completeProfile,
    verifyEmail,
    resendVerificationEmail,
    sendPremiumSupportTicket,
    getTenantPreferences,    // <-- ADDED
    updateTenantPreferences  // <-- ADDED
};
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: {
        type: String,
        default: 'https://res.cloudinary.com/motek-solutions/image/upload/v1726507875/nyumba-app/default-avatar_m2p4vr.png',
    },
    bio: { type: String, default: '' },
    whatsappNumber: { type: String },
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
    listings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
    isAdmin: { type: Boolean, required: true, default: false },
    role: { type: String, enum: ['tenant', 'landlord'], default: 'tenant' },

    // --- LANDLORD REVIEW FIELDS ---
    numReviews: {
        type: Number,
        default: 0,
    },
    averageRating: {
        type: Number,
        default: 0,
    },

    // --- GAMIFICATION FIELD ---
    points: {
        type: Number,
        default: 0,
    },
    
    // --- REFERRAL FIELDS ---
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    // --- VERIFIED PROFILES & SUBSCRIPTIONS ---
    verificationStatus: {
        type: String,
        enum: ['not_applied', 'pending', 'approved', 'rejected'],
        default: 'not_applied',
    },
    subscriptionId: {
        type: String,
        default: '',
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive', 'past_due', 'cancelled'],
        default: 'inactive',
    },

    // --- 1. NEW FIELD FOR PREMIUM TENANTS ---
    // This lets us track what *kind* of subscription is active
    subscriptionType: {
        type: String,
        enum: ['landlord_pro', 'tenant_premium', 'none'],
        default: 'none',
    },
    // --- END OF NEW FIELD ---

    // --- FIELDS FOR PASSWORD RESET ---
    resetPasswordToken: String,
    resetPasswordExpire: Date,

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// --- VIRTUAL FIELD: isVerified ---
// This virtual now correctly represents a *Verified Landlord*
userSchema.virtual('isVerified').get(function() {
  return this.subscriptionStatus === 'active' && 
         this.verificationStatus === 'approved' &&
         this.subscriptionType === 'landlord_pro';
});

// --- 2. NEW VIRTUAL FIELD FOR PREMIUM TENANTS ---
userSchema.virtual('isPremiumTenant').get(function() {
    return this.subscriptionStatus === 'active' &&
           this.subscriptionType === 'tenant_premium';
});
// --- END OF NEW VIRTUAL ---


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
    // ... (function is unchanged)
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

userSchema.pre('save', async function (next) {
    // ... (function is unchanged)
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    if (this.isNew && !this.referralCode) {
        let code;
        let codeExists = true;
        while (codeExists) {
            code = crypto.randomBytes(3).toString('hex').toUpperCase();
            codeExists = await mongoose.model('User').findOne({ referralCode: code });
        }
        this.referralCode = code;
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
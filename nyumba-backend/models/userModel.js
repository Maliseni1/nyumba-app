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
    numReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationStatus: {
        type: String,
        enum: ['not_applied', 'pending', 'approved', 'rejected'],
        default: 'not_applied',
    },
    subscriptionId: { type: String, default: '' },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive', 'past_due', 'cancelled'],
        default: 'inactive',
    },
    subscriptionType: {
        type: String,
        enum: ['landlord_pro', 'tenant_premium', 'none'],
        default: 'none',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // --- 1. NEW FIELDS FOR ACCOUNT DELETION ---
    isScheduledForDeletion: {
        type: Boolean,
        default: false,
        index: true // Add index to quickly find users for the cron job
    },
    deletionScheduledAt: {
        type: Date,
        default: null
    },
    // --- END OF NEW FIELDS ---

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// --- VIRTUALS (unchanged) ---
userSchema.virtual('isVerified').get(function() {
  return this.subscriptionStatus === 'active' && 
         this.verificationStatus === 'approved' &&
         this.subscriptionType === 'landlord_pro';
});
userSchema.virtual('isPremiumTenant').get(function() {
    return this.subscriptionStatus === 'active' &&
           this.subscriptionType === 'tenant_premium';
});

// --- METHODS (unchanged) ---
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

// --- PRE-SAVE HOOK (unchanged) ---
userSchema.pre('save', async function (next) {
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
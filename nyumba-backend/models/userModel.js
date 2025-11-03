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

    // --- 1. NEW REVIEW FIELDS FOR LANDLORD ---
    numReviews: {
        type: Number,
        default: 0,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    // --- END OF NEW FIELDS ---

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

    // --- FIELDS FOR PASSWORD RESET ---
    resetPasswordToken: String,
    resetPasswordExpire: Date,

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// --- VIRTUAL FIELD: isVerified ---
userSchema.virtual('isVerified').get(function() {
  return this.subscriptionStatus === 'active' && this.verificationStatus === 'approved';
});


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- METHOD: getResetPasswordToken ---
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

// --- PRE-SAVE HOOK (for password) ---
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
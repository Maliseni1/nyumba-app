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

    // --- NEW FIELDS FOR VERIFIED PROFILES & SUBSCRIPTIONS ---
    verificationStatus: {
        type: String,
        enum: ['not_applied', 'pending', 'approved', 'rejected'],
        default: 'not_applied',
    },
    subscriptionId: { // The ID from your "base pay" gateway (e.g., a Paystack subscription ID)
        type: String,
        default: '',
    },
    subscriptionStatus: { // The status from your "base pay" gateway
        type: String,
        enum: ['active', 'inactive', 'past_due', 'cancelled'],
        default: 'inactive',
    },

    // --- FIELDS FOR PASSWORD RESET ---
    resetPasswordToken: String,
    resetPasswordExpire: Date,

}, {
    timestamps: true,
    // --- ADD THESE TWO LINES ---
    // This ensures our new 'isVerified' virtual field is included in API responses
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// --- NEW VIRTUAL FIELD ---
// This 'isVerified' field will automatically be true only if:
// 1. The user's subscription is 'active' (they are paying)
// 2. An admin has 'approved' their application
userSchema.virtual('isVerified').get(function() {
  return this.subscriptionStatus === 'active' && this.verificationStatus === 'approved';
});


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
    // ... (rest of the method is unchanged)
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

userSchema.pre('save', async function (next) {
    // ... (rest of the method is unchanged)
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
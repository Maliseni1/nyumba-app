const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // <-- Import crypto

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

    // --- NEW FIELDS FOR PASSWORD RESET ---
    resetPasswordToken: String,
    resetPasswordExpire: Date,

}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- NEW METHOD ---
// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire time (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken; // Return the un-hashed token
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
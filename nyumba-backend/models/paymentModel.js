const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Listing'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentType: {
        type: String,
        required: true,
        enum: ['rental', 'security_deposit', 'booking_fee'],
        default: 'rental'
    },
    status: {
        type: String,
        required: true,
        enum: ['initiated', 'pending', 'completed', 'failed', 'cancelled'],
        default: 'initiated'
    },
    transactionHash: {
        type: String,
        sparse: true, // Allows multiple null values but ensures uniqueness for non-null values
        index: true
    },
    duration: {
        type: Number, // Duration in days
        min: 1
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    failureReason: {
        type: String
    },
    metadata: {
        walletAddress: String,
        networkId: String,
        blockNumber: Number,
        gasUsed: Number,
        gasPrice: String,
        confirmations: {
            type: Number,
            default: 0
        }
    },
    // Additional rental details
    rentalDetails: {
        checkInDate: Date,
        checkOutDate: Date,
        numberOfGuests: {
            type: Number,
            min: 1
        },
        specialRequests: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ listing: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionHash: 1 });

// Virtual for payment duration in a readable format
paymentSchema.virtual('durationText').get(function() {
    if (!this.duration) return null;
    
    if (this.duration === 1) return '1 day';
    if (this.duration < 7) return `${this.duration} days`;
    if (this.duration < 30) {
        const weeks = Math.floor(this.duration / 7);
        const days = this.duration % 7;
        let text = `${weeks} week${weeks > 1 ? 's' : ''}`;
        if (days > 0) text += ` ${days} day${days > 1 ? 's' : ''}`;
        return text;
    }
    
    const months = Math.floor(this.duration / 30);
    const days = this.duration % 30;
    let text = `${months} month${months > 1 ? 's' : ''}`;
    if (days > 0) text += ` ${days} day${days > 1 ? 's' : ''}`;
    return text;
});

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
    return `$${this.amount.toFixed(2)}`;
});

// Method to check if payment is active/valid
paymentSchema.methods.isActive = function() {
    return this.status === 'completed' && 
           (!this.endDate || new Date() <= this.endDate);
};

// Method to check if payment is expired
paymentSchema.methods.isExpired = function() {
    return this.endDate && new Date() > this.endDate;
};

// Static method to get user's active rentals
paymentSchema.statics.getActiveRentals = function(userId) {
    return this.find({
        user: userId,
        paymentType: 'rental',
        status: 'completed',
        $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: new Date() } }
        ]
    }).populate('listing', 'title location images');
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = function(userId) {
    return this.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);
};

// Pre-save middleware to validate dates
paymentSchema.pre('save', function(next) {
    // Validate that end date is after start date
    if (this.startDate && this.endDate && this.startDate >= this.endDate) {
        next(new Error('End date must be after start date'));
        return;
    }
    
    // Calculate duration if start and end dates are provided
    if (this.startDate && this.endDate && !this.duration) {
        const diffTime = Math.abs(this.endDate - this.startDate);
        this.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    next();
});

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema);
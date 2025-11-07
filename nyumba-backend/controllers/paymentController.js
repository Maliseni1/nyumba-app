const asyncHandler = require('express-async-handler');
const Payment = require('../models/paymentModel');
const Listing = require('../models/listingModel');
const User = require('../models/userModel');

// @desc    Create a payment record
// @route   POST /api/payments
// @access  Private
const createPaymentRecord = asyncHandler(async (req, res) => {
    const {
        listingId,
        amount,
        paymentType,
        duration,
        startDate,
        endDate,
        transactionHash,
        // --- 1. NEW: Get metadata to identify subscription payments ---
        metadata 
    } = req.body;

    // --- 2. Handle Subscription Payments (which don't have a listingId) ---
    if (paymentType === 'subscription' && metadata?.userId) {
        const payment = await Payment.create({
            user: metadata.userId,
            listing: null, // No listing for subscriptions
            amount,
            paymentType,
            duration: metadata.duration || null,
            transactionHash,
            status: transactionHash ? 'pending' : 'initiated',
            metadata: {
                subscriptionType: metadata.subscriptionType // e.g., 'tenant_premium'
            }
        });
        return res.status(201).json(payment);
    }

    // --- (Existing logic for Rental Payments) ---
    if (!listingId || !amount || !paymentType) {
        res.status(400);
        throw new Error('Listing ID, amount, and payment type are required');
    }
    const listing = await Listing.findById(listingId);
    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }
    const payment = await Payment.create({
        user: req.user._id,
        listing: listingId,
        amount,
        paymentType,
        duration,
        startDate,
        endDate,
        transactionHash,
        status: transactionHash ? 'pending' : 'initiated'
    });
    const populatedPayment = await Payment.findById(payment._id)
        .populate('user', 'name email')
        .populate('listing', 'title location price');

    res.status(201).json(populatedPayment);
});

// @desc    Validate a payment transaction
// @route   POST /api/payments/validate
// @access  Private
const validatePayment = asyncHandler(async (req, res) => {
    // ... (function is unchanged)
    const { transactionHash, paymentId } = req.body;
    if (!transactionHash) { /* ... */ }
    let payment;
    if (paymentId) { payment = await Payment.findById(paymentId); }
    else { payment = await Payment.findOne({ transactionHash }); }
    if (!payment) { /* ... */ }
    if (payment.user.toString() !== req.user._id.toString()) { /* ... */ }
    if (!payment.transactionHash && transactionHash) { /* ... */ }
    
    const isValid = await validateTransactionOnBlockchain(transactionHash);

    if (isValid) {
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();

        // --- 3. NEW: Activate subscription if this was a subscription payment ---
        if (payment.paymentType === 'subscription') {
            await activateSubscription(payment.user, payment.metadata?.subscriptionType);
        }
        // --- END OF NEW LOGIC ---

        res.json({
            success: true,
            message: 'Payment validated successfully',
            payment: { /* ... */ }
        });
    } else {
        payment.status = 'failed';
        await payment.save();
        res.status(400).json({
            success: false,
            message: 'Payment validation failed',
            payment: { /* ... */ }
        });
    }
});

// @desc    Get payment status by transaction hash
// @route   GET /api/payments/status/:transactionHash
// @access  Private
const getPaymentStatus = asyncHandler(async (req, res) => {
    // ... (function is unchanged)
    const { transactionHash } = req.params;
    const payment = await Payment.findOne({ transactionHash })
        .populate('user', 'name email')
        .populate('listing', 'title location price owner');
    if (!payment) { /* ... */ }
    if (payment.user._id.toString() !== req.user._id.toString() && 
        payment.listing.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this payment');
    }
    res.json({ /* ... */ });
});

// @desc    Update payment status
// @route   PUT /api/payments/:paymentId/status
// @access  Private
const updatePaymentStatus = asyncHandler(async (req, res) => {
    // ... (function is unchanged)
    const { paymentId } = req.params;
    const { status, transactionHash } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) { /* ... */ }
    if (payment.user.toString() !== req.user._id.toString()) { /* ... */ }
    if (status) { /* ... */ }
    if (transactionHash) { /* ... */ }
    await payment.save();
    res.json({ /* ... */ });
});

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = asyncHandler(async (req, res) => {
    // ... (function is unchanged)
    const { page = 1, limit = 10, status, paymentType } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (paymentType) filter.paymentType = paymentType;
    const skip = (page - 1) * limit;
    const payments = await Payment.find(filter)
        .populate('listing', 'title location price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    const total = await Payment.countDocuments(filter);
    res.json({
        payments,
        pagination: { /* ... */ }
    });
});

// @desc    Handle Base Pay webhooks
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = asyncHandler(async (req, res) => {
    // ... (function is unchanged)
    const { event, data } = req.body;
    console.log('Received webhook:', { event, data });
    try {
        switch (event) {
            case 'payment.completed':
                await handlePaymentCompleted(data);
                break;
            case 'payment.failed':
                await handlePaymentFailed(data);
                break;
            case 'payment.pending':
                await handlePaymentPending(data);
                break;
            default:
                console.log('Unhandled webhook event:', event);
        }
        res.status(200).json({ success: true, message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
});

// Helper function to simulate blockchain transaction validation
const validateTransactionOnBlockchain = async (transactionHash) => {
    // ... (function is unchanged)
    console.log(`Validating transaction: ${transactionHash}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
};

// --- 4. THIS FUNCTION IS UPDATED ---
const handlePaymentCompleted = async (data) => {
    const { transactionHash, metadata } = data; // Get metadata from webhook
    
    const payment = await Payment.findOne({ transactionHash });
    if (payment && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();
        
        console.log(`Payment completed: ${payment._id}`);

        // --- NEW: Activate subscription ---
        // We use the metadata from the webhook OR the payment record
        const subType = metadata?.subscriptionType || payment.metadata?.subscriptionType;
        if (payment.paymentType === 'subscription' && subType) {
            await activateSubscription(payment.user, subType);
        }
    }
};

// --- 5. NEW HELPER FUNCTION ---
const activateSubscription = async (userId, subscriptionType) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User not found for subscription activation: ${userId}`);
            return;
        }

        user.subscriptionStatus = 'active';
        user.subscriptionType = subscriptionType; // 'landlord_pro' or 'tenant_premium'
        
        // If it's a landlord_pro, also set their verification to pending
        if (subscriptionType === 'landlord_pro') {
            user.verificationStatus = 'pending';
        }
        
        await user.save();
        console.log(`Subscription activated for user ${userId}: ${subscriptionType}`);

    } catch (error) {
        console.error(`Failed to activate subscription for user ${userId}:`, error);
    }
};

// Helper function to handle failed payments
const handlePaymentFailed = async (data) => {
    // ... (function is unchanged)
    const { transactionHash, reason } = data;
    const payment = await Payment.findOne({ transactionHash });
    if (payment) {
        payment.status = 'failed';
        payment.failureReason = reason;
        await payment.save();
        console.log(`Payment failed: ${payment._id}, Reason: ${reason}`);
    }
};

// Helper function to handle pending payments
const handlePaymentPending = async (data) => {
    // ... (function is unchanged)
    const { transactionHash } = data;
    const payment = await Payment.findOne({ transactionHash });
    if (payment) {
        payment.status = 'pending';
        await payment.save();
        console.log(`Payment pending: ${payment._id}`);
    }
};

module.exports = {
    createPaymentRecord,
    validatePayment,
    getPaymentStatus,
    updatePaymentStatus,
    getPaymentHistory,
    handleWebhook
};
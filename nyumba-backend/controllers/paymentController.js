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
        transactionHash
    } = req.body;

    // Validate required fields
    if (!listingId || !amount || !paymentType) {
        res.status(400);
        throw new Error('Listing ID, amount, and payment type are required');
    }

    // Verify listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    // Create payment record
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
    const { transactionHash, paymentId } = req.body;

    if (!transactionHash) {
        res.status(400);
        throw new Error('Transaction hash is required');
    }

    // Find payment record
    let payment;
    if (paymentId) {
        payment = await Payment.findById(paymentId);
    } else {
        payment = await Payment.findOne({ transactionHash });
    }

    if (!payment) {
        res.status(404);
        throw new Error('Payment record not found');
    }

    // Verify the payment belongs to the requesting user
    if (payment.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to validate this payment');
    }

    // Update payment with transaction hash if not already set
    if (!payment.transactionHash && transactionHash) {
        payment.transactionHash = transactionHash;
        payment.status = 'pending';
        await payment.save();
    }

    // In a real implementation, you would validate the transaction on the blockchain
    // For now, we'll simulate validation
    const isValid = await validateTransactionOnBlockchain(transactionHash);

    if (isValid) {
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();

        res.json({
            success: true,
            message: 'Payment validated successfully',
            payment: {
                id: payment._id,
                status: payment.status,
                transactionHash: payment.transactionHash,
                amount: payment.amount,
                completedAt: payment.completedAt
            }
        });
    } else {
        payment.status = 'failed';
        await payment.save();

        res.status(400).json({
            success: false,
            message: 'Payment validation failed',
            payment: {
                id: payment._id,
                status: payment.status,
                transactionHash: payment.transactionHash
            }
        });
    }
});

// @desc    Get payment status by transaction hash
// @route   GET /api/payments/status/:transactionHash
// @access  Private
const getPaymentStatus = asyncHandler(async (req, res) => {
    const { transactionHash } = req.params;

    const payment = await Payment.findOne({ transactionHash })
        .populate('user', 'name email')
        .populate('listing', 'title location price owner');

    if (!payment) {
        res.status(404);
        throw new Error('Payment not found');
    }

    // Check if user is authorized to view this payment
    if (payment.user._id.toString() !== req.user._id.toString() && 
        payment.listing.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this payment');
    }

    res.json({
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        paymentType: payment.paymentType,
        transactionHash: payment.transactionHash,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
        user: payment.user,
        listing: payment.listing
    });
});

// @desc    Update payment status
// @route   PUT /api/payments/:paymentId/status
// @access  Private
const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const { status, transactionHash } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
        res.status(404);
        throw new Error('Payment not found');
    }

    // Verify the payment belongs to the requesting user
    if (payment.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this payment');
    }

    // Update payment status
    if (status) {
        payment.status = status;
        if (status === 'completed') {
            payment.completedAt = new Date();
        }
    }

    if (transactionHash) {
        payment.transactionHash = transactionHash;
    }

    await payment.save();

    res.json({
        success: true,
        message: 'Payment status updated successfully',
        payment: {
            id: payment._id,
            status: payment.status,
            transactionHash: payment.transactionHash,
            completedAt: payment.completedAt
        }
    });
});

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, paymentType } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (paymentType) filter.paymentType = paymentType;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get payments with pagination
    const payments = await Payment.find(filter)
        .populate('listing', 'title location price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Payment.countDocuments(filter);

    res.json({
        payments,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalPayments: total,
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    });
});

// @desc    Handle Base Pay webhooks
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = asyncHandler(async (req, res) => {
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
    // In a real implementation, you would:
    // 1. Connect to the Base network
    // 2. Fetch the transaction details
    // 3. Verify the transaction exists and is confirmed
    // 4. Check the transaction amount and recipient
    
    // For now, we'll simulate validation (always return true for demo)
    console.log(`Validating transaction: ${transactionHash}`);
    
    // Simulate async blockchain call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, replace this with actual blockchain validation
    return true;
};

// Helper function to handle completed payments
const handlePaymentCompleted = async (data) => {
    const { transactionHash, amount } = data;
    
    const payment = await Payment.findOne({ transactionHash });
    if (payment) {
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();
        
        console.log(`Payment completed: ${payment._id}`);
    }
};

// Helper function to handle failed payments
const handlePaymentFailed = async (data) => {
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
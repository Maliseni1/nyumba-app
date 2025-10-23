const express = require('express');
const router = express.Router();
const {
    validatePayment,
    getPaymentStatus,
    handleWebhook,
    getPaymentHistory,
    createPaymentRecord,
    updatePaymentStatus
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create a payment record
// @route   POST /api/payments
// @access  Private
router.post('/', protect, createPaymentRecord);

// @desc    Validate a payment transaction
// @route   POST /api/payments/validate
// @access  Private
router.post('/validate', protect, validatePayment);

// @desc    Get payment status by transaction hash
// @route   GET /api/payments/status/:transactionHash
// @access  Private
router.get('/status/:transactionHash', protect, getPaymentStatus);

// @desc    Update payment status
// @route   PUT /api/payments/:paymentId/status
// @access  Private
router.put('/:paymentId/status', protect, updatePaymentStatus);

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
router.get('/history', protect, getPaymentHistory);

// @desc    Handle Base Pay webhooks
// @route   POST /api/payments/webhook
// @access  Public (webhooks don't use auth tokens)
router.post('/webhook', handleWebhook);

module.exports = router;
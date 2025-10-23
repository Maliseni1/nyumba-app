import { pay, getPaymentStatus } from '@base-org/account';

/**
 * Payment service for handling Base Pay transactions
 */
class PaymentService {
  constructor() {
    // Use Base mainnet for production
    this.testnet = false;
  }

  /**
   * Process a payment using Base Pay
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.amount - Amount in USD (e.g., "25.00")
   * @param {string} paymentData.to - Recipient wallet address
   * @param {Object} paymentData.payerInfo - Optional payer information collection
   * @returns {Promise<Object>} Payment result with transaction ID
   */
  async processPayment({ amount, to, payerInfo = null }) {
    try {
      const paymentConfig = {
        amount,
        to,
        testnet: this.testnet
      };

      // Add payer info collection if specified
      if (payerInfo) {
        paymentConfig.payerInfo = payerInfo;
      }

      const payment = await pay(paymentConfig);
      
      return {
        success: true,
        transactionId: payment.id,
        payerInfo: payment.payerInfoResponses || null,
        message: 'Payment initiated successfully'
      };
    } catch (error) {
      console.error('Payment failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Payment failed. Please try again.'
      };
    }
  }

  /**
   * Check the status of a payment
   * @param {string} transactionId - Transaction ID from processPayment
   * @returns {Promise<Object>} Payment status information
   */
  async checkPaymentStatus(transactionId) {
    try {
      const status = await getPaymentStatus({
        id: transactionId,
        testnet: this.testnet
      });

      return {
        success: true,
        status: status.status,
        transactionHash: status.transactionHash || null,
        message: this.getStatusMessage(status.status)
      };
    } catch (error) {
      console.error('Failed to check payment status:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to check payment status'
      };
    }
  }

  /**
   * Poll payment status until completion or timeout
   * @param {string} transactionId - Transaction ID to monitor
   * @param {number} maxAttempts - Maximum polling attempts (default: 30)
   * @param {number} interval - Polling interval in ms (default: 2000)
   * @returns {Promise<Object>} Final payment status
   */
  async pollPaymentStatus(transactionId, maxAttempts = 30, interval = 2000) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const statusResult = await this.checkPaymentStatus(transactionId);
      
      if (!statusResult.success) {
        return statusResult;
      }

      if (statusResult.status === 'completed') {
        return {
          success: true,
          status: 'completed',
          transactionHash: statusResult.transactionHash,
          message: 'Payment completed successfully'
        };
      }

      if (statusResult.status === 'failed') {
        return {
          success: false,
          status: 'failed',
          message: 'Payment failed'
        };
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    return {
      success: false,
      status: 'timeout',
      message: 'Payment status check timed out'
    };
  }

  /**
   * Process rental payment with property details
   * @param {Object} rentalData - Rental payment information
   * @param {string} rentalData.propertyId - Property ID
   * @param {string} rentalData.amount - Rental amount
   * @param {string} rentalData.recipientAddress - Property owner's wallet address
   * @param {string} rentalData.userEmail - Renter's email
   * @param {Object} rentalData.rentalPeriod - Rental period details
   * @returns {Promise<Object>} Payment result
   */
  async processRentalPayment({ propertyId, amount, recipientAddress, userEmail, rentalPeriod }) {
    const payerInfo = {
      requests: [
        { type: 'email' },
        { type: 'name' },
        { type: 'phoneNumber', optional: true }
      ],
      callbackURL: `${window.location.origin}/api/payments/validate`
    };

    return await this.processPayment({
      amount,
      to: recipientAddress,
      payerInfo
    });
  }

  /**
   * Process security deposit payment
   * @param {Object} depositData - Security deposit information
   * @returns {Promise<Object>} Payment result
   */
  async processSecurityDeposit({ propertyId, amount, recipientAddress }) {
    return await this.processPayment({
      amount,
      to: recipientAddress
    });
  }

  /**
   * Get user-friendly status message
   * @param {string} status - Payment status
   * @returns {string} User-friendly message
   */
  getStatusMessage(status) {
    const messages = {
      'pending': 'Payment is being processed...',
      'completed': 'Payment completed successfully!',
      'failed': 'Payment failed. Please try again.',
      'cancelled': 'Payment was cancelled.',
      'timeout': 'Payment verification timed out.'
    };

    return messages[status] || 'Unknown payment status';
  }

  /**
   * Format amount for display
   * @param {string} amount - Amount string
   * @returns {string} Formatted amount
   */
  formatAmount(amount) {
    return `$${parseFloat(amount).toFixed(2)} USDC`;
  }

  /**
   * Validate wallet address
   * @param {string} address - Wallet address to validate
   * @returns {boolean} Whether address is valid
   */
  isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}

// Export singleton instance
export default new PaymentService();

// Export individual functions for named imports
export const downloadReceipt = (receiptData) => {
  const receiptText = `
NYUMBA RENTAL RECEIPT
=====================

Transaction ID: ${receiptData.transactionId}
Date: ${new Date().toLocaleDateString()}
Amount: ${receiptData.amount}
Property: ${receiptData.listing?.title || 'N/A'}
Location: ${receiptData.listing?.location || 'N/A'}

Payer Information:
Name: ${receiptData.payerInfo?.name || 'N/A'}
Email: ${receiptData.payerInfo?.email || 'N/A'}
Phone: ${receiptData.payerInfo?.phoneNumber || 'N/A'}

Payment Method: USDC on Base Network
Status: Completed

Thank you for using Nyumba!
  `;

  const blob = new Blob([receiptText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nyumba-receipt-${receiptData.transactionId.slice(0, 8)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export { getPaymentStatus } from '@base-org/account';
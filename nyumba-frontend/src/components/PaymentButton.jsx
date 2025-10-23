import React, { useState } from 'react';
import { BasePayButton } from '@base-org/account-ui/react';
import paymentService from '../services/paymentService';
import { toast } from 'react-toastify';

const PaymentButton = ({ 
  amount, 
  recipientAddress, 
  onPaymentSuccess, 
  onPaymentError,
  disabled = false,
  className = '',
  colorScheme = 'light',
  children,
  payerInfo = null,
  customText = null
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!amount || !recipientAddress) {
      toast.error('Payment information is incomplete');
      return;
    }

    if (!paymentService.isValidAddress(recipientAddress)) {
      toast.error('Invalid recipient address');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Show processing toast
      const processingToast = toast.loading('Processing payment...');

      // Process the payment
      const paymentResult = await paymentService.processPayment({
        amount,
        to: recipientAddress,
        payerInfo
      });

      if (!paymentResult.success) {
        toast.dismiss(processingToast);
        toast.error(paymentResult.message);
        onPaymentError?.(paymentResult);
        return;
      }

      // Update toast to show polling status
      toast.update(processingToast, {
        render: 'Confirming payment on blockchain...',
        type: 'info',
        isLoading: true
      });

      // Poll for payment status
      const statusResult = await paymentService.pollPaymentStatus(paymentResult.transactionId);

      toast.dismiss(processingToast);

      if (statusResult.success && statusResult.status === 'completed') {
        toast.success('Payment completed successfully! 🎉');
        onPaymentSuccess?.({
          ...paymentResult,
          ...statusResult,
          payerInfo: paymentResult.payerInfo
        });
      } else {
        toast.error(statusResult.message);
        onPaymentError?.(statusResult);
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      onPaymentError?.({ error: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // If custom children are provided, render custom button
  if (children) {
    return (
      <button
        onClick={handlePayment}
        disabled={disabled || isProcessing}
        className={`
          relative overflow-hidden transition-all duration-200 
          ${disabled || isProcessing 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:scale-105 active:scale-95 cursor-pointer'
          }
          ${className}
        `}
      >
        {isProcessing && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {children}
      </button>
    );
  }

  // Use the official BasePayButton with custom wrapper
  return (
    <div className={`relative ${className}`}>
      {isProcessing && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg z-10">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <BasePayButton
        colorScheme={colorScheme}
        onClick={handlePayment}
        disabled={disabled || isProcessing}
        style={{
          opacity: disabled || isProcessing ? 0.5 : 1,
          cursor: disabled || isProcessing ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease'
        }}
      />
      
      {customText && (
        <div className="text-center mt-2 text-sm text-gray-600">
          {customText}
        </div>
      )}
    </div>
  );
};

export default PaymentButton;
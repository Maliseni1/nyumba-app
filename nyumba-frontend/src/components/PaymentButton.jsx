import React, { useState } from 'react';
import { BasePayButton } from '@base-org/account-ui/react';
import { pay, getPaymentStatus } from '@base-org/account'; // <--- ADD THIS
import { toast } from 'react-toastify';

// Make sure your paymentService has this helper, or just use a simple regex
const isValidAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

const PaymentButton = ({ 
  amount, 
  recipientAddress, 
  onPaymentSuccess, 
  onPaymentError,
  disabled = false,
  className = '',
  colorScheme = 'light',
  children,
  customText = null
  // The 'payerInfo' prop is handled by the Base Pay popup, so we don't need it
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // This is the new payment handler using the official SDK
  const handlePayment = async () => {
    if (!amount || !recipientAddress) {
      toast.error('Payment information is incomplete');
      return;
    }

    if (!isValidAddress(recipientAddress)) {
      toast.error(`Invalid recipient address: ${recipientAddress}`);
      return;
    }

    setIsProcessing(true);
    const processingToast = toast.loading('Waiting for wallet confirmation...');
    
    // --- START: NEW BASE PAY SDK LOGIC ---
    try {
      // Set to false for your live app
      const IS_TESTNET = import.meta.env.VITE_APP_ENV !== 'production'; 

      // 1. Trigger the payment
      const payment = await pay({
        amount: amount.toString(),
        to: recipientAddress,
        testnet: IS_TESTNET 
      });

      // 2. Poll for status
      toast.update(processingToast, {
        render: 'Confirming payment on blockchain...',
        isLoading: true
      });
      
      const { status, L2TransactionHash } = await getPaymentStatus({ 
        id: payment.id,
        testnet: IS_TESTNET
      });

      if (status === 'completed') {
        toast.dismiss(processingToast);
        toast.success('Payment completed! 🎉');
        
        // Send the transaction hash and status back to the modal
        onPaymentSuccess?.({ 
          transactionId: payment.id, 
          L2TransactionHash: L2TransactionHash,
          status: status 
        });
      } else {
        toast.dismiss(processingToast);
        toast.error(`Payment status: ${status}`);
        onPaymentError?.({ message: `Payment status: ${status}` });
      }

    } catch (error) {
      console.error('Payment failed:', error);
      toast.dismiss(processingToast);
      toast.error(`Payment failed: ${error.message}`);
      onPaymentError?.({ error: error.message });
    } finally {
      setIsProcessing(false);
    }
    // --- END: NEW BASE PAY SDK LOGIC ---
  };

  // If custom children are provided (like for the subscription button)
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

  // Use the official BasePayButton (for rental payments)
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
          transition: 'all 0.2s ease',
          width: '100%' // Ensure it fills the container
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
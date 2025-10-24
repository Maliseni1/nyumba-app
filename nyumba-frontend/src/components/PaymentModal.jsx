import React, { useState, useEffect } from 'react';
import { FaTimes, FaHome, FaCalendarAlt, FaDollarSign, FaLock, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import PaymentButton from './PaymentButton';
import paymentService from '../services/paymentService';
import { toast } from 'react-toastify';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  listing, 
  rentalDetails, 
  onPaymentSuccess,
  onPaymentError,
  paymentType: initialPaymentType = 'rental',
  customAmount = null,
  subscriptionData = null
}) => {
  const [paymentType, setPaymentType] = useState(initialPaymentType);
  const RECIPIENT_ADDRESS = import.meta.env.VITE_RECIPIENT_WALLET_ADDRESS;
  const [userInfo, setUserInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  useEffect(() => {
    // Pre-fill user info from localStorage if available
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      setUserInfo(prev => ({
        ...prev,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }));
    }
  }, []);

  if (!isOpen) return null;

  // Handle subscription payments
  if (subscriptionData) {
    const currentAmount = customAmount || subscriptionData.amount;
    
    const payerInfo = {
      requests: [
        { type: 'email' },
        { type: 'name' },
        { type: 'phoneNumber', optional: true }
      ]
    };

    const handlePaymentSuccess = (paymentResult) => {
      const paymentData = {
        ...paymentResult,
        paymentType: 'subscription',
        subscriptionType: subscriptionData.type,
        amount: currentAmount,
        userInfo: paymentResult.payerInfo
      };
      
      onPaymentSuccess?.(paymentData);
      onClose();
    };

    const handlePaymentError = (error) => {
      onPaymentError?.(error);
    };

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FaDollarSign className="w-6 h-6 text-blue-400" />
              Complete Subscription Payment
            </h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* Subscription Details */}
          <div className="p-6 space-y-6">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">Subscription Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Plan:</span>
                  <span className="text-white font-medium">{subscriptionData.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Duration:</span>
                  <span className="text-white font-medium">{subscriptionData.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Amount:</span>
                  <span className="text-white font-bold text-xl">${currentAmount} USDC</span>
                </div>
                {subscriptionData.discount && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Discount:</span>
                    <span className="text-green-400 font-medium">{subscriptionData.discount}% off</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Button */}
            <div className="space-y-4">
              <PaymentButton
                amount={currentAmount}
                recipientAddress={RECIPIENT_ADDRESS}
                currency="USDC"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                payerInfo={payerInfo}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle rental payments (existing logic)
  if (!listing) return null;

  const rentalAmount = rentalDetails?.totalAmount || listing.price;
  const depositAmount = (parseFloat(rentalAmount) * 0.2).toFixed(2); // 20% security deposit
  const currentAmount = paymentType === 'rental' ? rentalAmount : depositAmount;

  const payerInfo = {
    requests: [
      { type: 'email' },
      { type: 'name' },
      { type: 'phoneNumber', optional: true }
    ]
  };

  const handlePaymentSuccess = (paymentResult) => {
    const paymentData = {
      ...paymentResult,
      paymentType,
      listingId: listing._id,
      amount: currentAmount,
      rentalDetails,
      userInfo: paymentResult.payerInfo
    };
    
    onPaymentSuccess?.(paymentData);
    onClose();
  };

  const handlePaymentError = (error) => {
    onPaymentError?.(error);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaDollarSign className="w-6 h-6 text-blue-400" />
          Complete Payment
        </h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <FaTimes className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Property Info */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800">
              {listing.images?.[0] ? (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
              <FaHome className="w-8 h-8 text-gray-500" />
            </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">{listing.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{listing.location}</p>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="w-4 h-4" />
                  {rentalDetails?.duration || 'Monthly'}
                </span>
                <span className="flex items-center gap-1">
                  <FaUser className="w-4 h-4" />
                  {listing.bedrooms} bed, {listing.bathrooms} bath
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Type Selection */}
        <div className="p-6 border-b border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4">Payment Type</h4>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentType('rental')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentType === 'rental'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-slate-600 bg-slate-800 text-gray-300 hover:border-slate-500'
              }`}
            >
              <div className="text-center">
            <FaHome className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold">Monthly Rent</div>
            <div className="text-sm opacity-75">{paymentService.formatAmount(rentalAmount)}</div>
          </div>
            </button>
            
            <button
              onClick={() => setPaymentType('deposit')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentType === 'deposit'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-slate-600 bg-slate-800 text-gray-300 hover:border-slate-500'
              }`}
            >
              <div className="text-center">
            <FaLock className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold">Security Deposit</div>
            <div className="text-sm opacity-75">{paymentService.formatAmount(depositAmount)}</div>
          </div>
            </button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-6 border-b border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4">Payment Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">
                {paymentType === 'rental' ? 'Rental Amount' : 'Security Deposit'}
              </span>
              <span className="text-white font-semibold">
                {paymentService.formatAmount(currentAmount)}
              </span>
            </div>
            
            {rentalDetails?.startDate && rentalDetails?.endDate && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Period</span>
                <span className="text-gray-300">
                  {new Date(rentalDetails.startDate).toLocaleDateString()} - {new Date(rentalDetails.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Payment Method</span>
              <span className="text-gray-300">USDC on Base</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Network Fees</span>
              <span className="text-green-400">Free (Sponsored)</span>
            </div>
            
            <div className="border-t border-slate-600 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-xl font-bold text-blue-400">
                  {paymentService.formatAmount(currentAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="p-6 border-b border-slate-700">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h5 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              <FaLock className="w-4 h-4" />
              Secure Payment with Base Pay
            </h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Payments are processed instantly on Base network</li>
              <li>• Your payment information will be collected securely</li>
              <li>• Gas fees are sponsored - you only pay the rental amount</li>
              <li>• Funds are held in escrow until rental confirmation</li>
            </ul>
          </div>
        </div>

        {/* Payment Button */}
        <div className="p-6">
          <PaymentButton
            amount={currentAmount}
            recipientAddress={listing.ownerWallet || "0x742d35Cc6634C0532925a3b8D0C9e3e0C0c0c0c0"} // Placeholder address
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            payerInfo={payerInfo}
            className="w-full"
            colorScheme="light"
            customText={`Pay ${paymentService.formatAmount(currentAmount)} with Base Pay`}
          />
          
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
import React from 'react';
import { FaCheckCircle, FaDownload, FaCalendarAlt, FaHome, FaUser, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PaymentStatusTracker from './PaymentStatusTracker';
import { downloadReceipt } from '../services/paymentService';

const PaymentConfirmation = ({ 
  paymentData, 
  listing, 
  onClose,
  showStatusTracker = true 
}) => {
  if (!paymentData || !listing) return null;

  const handleDownloadReceipt = () => {
    // Generate and download payment receipt
    const receiptData = {
      transactionId: paymentData.transactionId,
      amount: paymentData.amount,
      property: listing.title,
      location: listing.location,
      paymentType: paymentData.paymentType,
      date: new Date().toISOString(),
      payerInfo: paymentData.payerInfo
    };

    const receiptText = `
NYUMBA RENTAL PAYMENT RECEIPT
============================

Transaction ID: ${receiptData.transactionId}
Date: ${new Date(receiptData.date).toLocaleString()}
Amount: ${paymentService.formatAmount(receiptData.amount)}
Payment Type: ${receiptData.paymentType === 'rental' ? 'Rental Payment' : 'Security Deposit'}

PROPERTY DETAILS
================
Property: ${receiptData.property}
Location: ${receiptData.location}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}

PAYER INFORMATION
=================
Name: ${receiptData.payerInfo?.name || 'N/A'}
Email: ${receiptData.payerInfo?.email || 'N/A'}
Phone: ${receiptData.payerInfo?.phoneNumber || 'N/A'}

PAYMENT METHOD
==============
Network: Base
Currency: USDC
Status: Confirmed

Thank you for using Nyumba!
Visit us at: https://nyumba.app
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyumba-receipt-${paymentData.transactionId.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getBlockExplorerUrl = (txHash) => {
    // Always use Base mainnet explorer
    return `https://basescan.org/tx/${txHash}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-400">Your booking has been confirmed</p>
        </div>

        {/* Payment Details */}
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount Paid</span>
              <span className="text-white font-semibold text-lg">
                {paymentService.formatAmount(paymentData.amount)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Payment Type</span>
              <span className="text-white">
                {paymentData.paymentType === 'rental' ? 'Rental Payment' : 'Security Deposit'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Transaction ID</span>
              <span className="text-white font-mono text-sm">
                {paymentData.transactionId?.slice(0, 16)}...
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Payment Method</span>
              <span className="text-white">USDC on Base</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Date</span>
              <span className="text-white">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Property Details</h3>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800">
              {listing.images?.[0] ? (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaHome className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold">{listing.title}</h4>
              <p className="text-gray-400 text-sm">{listing.location}</p>
              <div className="flex items-center gap-4 text-sm text-gray-300 mt-2">
                <span>{listing.bedrooms} bed</span>
                <span>{listing.bathrooms} bath</span>
                <span>{listing.propertyType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payer Information */}
        {paymentData.payerInfo && (
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="space-y-2">
              {paymentData.payerInfo.name && (
                <div className="flex items-center gap-3">
                  <FaUser className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{paymentData.payerInfo.name}</span>
                </div>
              )}
              {paymentData.payerInfo.email && (
                <div className="flex items-center gap-3">
                  <FaEnvelope className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{paymentData.payerInfo.email}</span>
                </div>
              )}
              {paymentData.payerInfo.phoneNumber && (
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{paymentData.payerInfo.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Tracker */}
        {showStatusTracker && paymentData.transactionId && (
          <div className="p-6 border-b border-slate-700">
            <PaymentStatusTracker
              transactionId={paymentData.transactionId}
              onStatusChange={(status) => console.log('Payment status updated:', status)}
            />
          </div>
        )}

        {/* Next Steps */}
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">What's Next?</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-white">Confirmation Email</p>
                <p>You'll receive a booking confirmation email within 5 minutes.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-white">Property Owner Contact</p>
                <p>The property owner will contact you within 24 hours to arrange viewing and key handover.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-white">Move-in Process</p>
                <p>Complete the rental agreement and move into your new home!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaDownload className="w-4 h-4" />
              Download Receipt
            </button>
            
            {paymentData.transactionHash && (
              <button
                onClick={() => window.open(getBlockExplorerUrl(paymentData.transactionHash), '_blank')}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-700 text-white px-4 py-3 rounded-lg hover:bg-slate-600 transition-colors"
              >
                <FaExternalLinkAlt className="w-4 h-4" />
                View on Blockchain
              </button>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-4 text-gray-400 hover:text-white transition-colors py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
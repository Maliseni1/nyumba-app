import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle, FaSpinner, FaExternalLinkAlt, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getPaymentStatus } from '../services/paymentService';

const PaymentStatusTracker = ({ 
  transactionId, 
  onStatusChange, 
  autoRefresh = true,
  refreshInterval = 5000 
}) => {
  const [status, setStatus] = useState('pending');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    if (!transactionId) return;

    const checkPaymentStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await paymentService.checkPaymentStatus(transactionId);
        setStatus(result.status);
        setPaymentData(result);
        setLastChecked(new Date());
        
        onStatusChange?.(result);
        
        // Stop polling if payment is completed or failed
        if (result.status === 'completed' || result.status === 'failed') {
          return false; // Stop interval
        }
        
        return true; // Continue interval
      } catch (err) {
        setError(err.message);
        console.error('Payment status check failed:', err);
        return true; // Continue trying
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    checkPaymentStatus();

    // Set up polling if autoRefresh is enabled
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(async () => {
        const shouldContinue = await checkPaymentStatus();
        if (!shouldContinue) {
          clearInterval(intervalId);
        }
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [transactionId, autoRefresh, refreshInterval, onStatusChange]);

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="w-6 h-6 text-green-400" />;
      case 'failed':
        return <FaTimesCircle className="w-6 h-6 text-red-400" />;
      case 'pending':
        return loading ? 
          <FaSpinner className="w-6 h-6 text-blue-400 animate-spin" /> :
          <FaClock className="w-6 h-6 text-yellow-400" />;
      default:
        return <FaClock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'failed':
        return 'border-red-500 bg-red-500/10';
      case 'pending':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'completed':
        return 'Payment completed successfully!';
      case 'failed':
        return 'Payment failed. Please try again.';
      case 'pending':
        return 'Payment is being processed...';
      default:
        return 'Checking payment status...';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  const getBlockExplorerUrl = (txHash) => {
    // Always use Base mainnet explorer
    return `https://basescan.org/tx/${txHash}`;
  };

  if (!transactionId) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
        <FaExclamationTriangle className="w-6 h-6 text-gray-400" />
        <span className="text-gray-300">No transaction ID provided</span>
      </div>
      </div>
    );
  }

  return (
    <div className={`border-2 rounded-lg p-6 transition-all ${getStatusColor()}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">
              Payment Status
            </h3>
            {status === 'pending' && (
              <span className="text-sm text-gray-400">
                Auto-refreshing...
              </span>
            )}
          </div>
          
          <p className="text-gray-300 mb-4">
            {getStatusMessage()}
          </p>
          
          {/* Transaction Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Transaction ID:</span>
              <span className="text-gray-300 font-mono text-xs break-all">
                {transactionId}
              </span>
            </div>
            
            {paymentData?.amount && (
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-gray-300 font-semibold">
                  {paymentService.formatAmount(paymentData.amount)}
                </span>
              </div>
            )}
            
            {paymentData?.transactionHash && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Blockchain TX:</span>
                <a
                  href={getBlockExplorerUrl(paymentData.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs"
                >
                  View on Explorer
                  <FaExternalLinkAlt className="w-3 h-3" />
                </a>
              </div>
            )}
            
            {paymentData?.createdAt && (
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="text-gray-300 text-xs">
                  {formatTimestamp(paymentData.createdAt)}
                </span>
              </div>
            )}
            
            {paymentData?.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-400">Completed:</span>
                <span className="text-gray-300 text-xs">
                  {formatTimestamp(paymentData.completedAt)}
                </span>
              </div>
            )}
            
            {lastChecked && (
              <div className="flex justify-between">
                <span className="text-gray-400">Last checked:</span>
                <span className="text-gray-300 text-xs">
                  {formatTimestamp(lastChecked)}
                </span>
              </div>
            )}
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2">
        <FaTimesCircle className="w-4 h-4 text-red-400" />
        <span className="text-red-300 text-sm">Error: {error}</span>
      </div>
            </div>
          )}
          
          {/* Additional Info for Pending Payments */}
          {status === 'pending' && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
          <FaExclamationTriangle className="w-4 h-4 text-blue-400 mt-0.5" />
          <div className="text-blue-300 text-sm">
            <p className="font-medium">Payment Processing</p>
            <p>Your payment is being processed on the blockchain. This usually takes 1-2 minutes.</p>
          </div>
        </div>
      </div>
    )}
    
    {/* Success Message */}
    {status === 'completed' && (
      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <FaCheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
          <div className="text-green-300 text-sm">
            <p className="font-medium mb-1">Payment Successful!</p>
            <p>Your rental booking has been confirmed. You should receive a confirmation email shortly.</p>
          </div>
        </div>
      </div>
    )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusTracker;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <-- Import Link
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getPaymentHistory } from '../services/api';
import { 
    FaCreditCard, 
    FaCalendarAlt, 
    FaHome, 
    FaFilter, 
    FaSearch,
    FaExternalLinkAlt,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaSpinner
} from 'react-icons/fa';

const PaymentHistoryPage = () => {
    const { authUser } = useAuth(); // <-- Correctly uses authUser
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        paymentType: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalPayments: 0
    });

    useEffect(() => {
        if (authUser) {
            fetchPaymentHistory();
        }
    }, [authUser, filters, pagination.currentPage]);

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true);
            
            const params = {
                page: pagination.currentPage,
                limit: 10,
                ...(filters.status && { status: filters.status }),
                ...(filters.paymentType && { paymentType: filters.paymentType })
            };

            const { data } = await getPaymentHistory(params); // <-- Uses our clean api.js

            setPayments(data.payments);
            setPagination(data.pagination);

        } catch (error) {
            console.error('Error fetching payment history:', error);
            toast.error('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    // Helper function for status icon classes
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <FaCheckCircle className="text-green-500" />;
            case 'pending':
                return <FaClock className="text-yellow-500" />;
            case 'failed':
                return <FaTimesCircle className="text-red-500" />;
            case 'initiated':
                return <FaSpinner className="text-blue-500 animate-spin" />;
            default:
                return <FaClock className="text-slate-500" />;
        }
    };

    const getStatusText = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const getPaymentTypeText = (type) => {
        switch (type) {
            case 'rental':
                return 'Rental Payment';
            case 'security_deposit':
                return 'Security Deposit';
            case 'booking_fee':
                return 'Booking Fee';
            default:
                return type;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const openBlockchainExplorer = (transactionHash) => {
        const explorerUrl = `https://sepolia.basescan.org/tx/${transactionHash}`;
        window.open(explorerUrl, '_blank');
    };

    const filteredPayments = payments.filter(payment => {
        if (!filters.search) return true;
        const searchTerm = filters.search.toLowerCase();
        return (
            payment.listing.title.toLowerCase().includes(searchTerm) ||
            payment.listing.location.toLowerCase().includes(searchTerm) ||
            payment.transactionHash?.toLowerCase().includes(searchTerm)
        );
    });

    if (!authUser) { // <-- This is the critical fix
        return (
            // Auth required state
            <div className="max-w-7xl mx-auto py-12 px-4">
                <div className="text-center py-20 bg-slate-900/50 rounded-lg border border-slate-800">
                    <FaCreditCard className="mx-auto text-6xl text-blue-500 mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">Authentication Required</h2>
                    <p className="text-slate-400">Please log in to view your payment history.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            {/* Page Header with Button */}
            <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <FaCreditCard className="text-5xl text-blue-500" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">Payment History</h1>
                        <p className="text-slate-400 mt-1">Track all your Base Pay transactions</p>
                    </div>
                </div>
                
                {/* --- HERE IS THE NEW BUTTON --- */}
                <Link 
                    to="/subscribe" 
                    className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all duration-150 text-center"
                >
                    Make a New Payment
                </Link>
                {/* ----------------------------- */}
            </div>

            {/* Filters Section */}
            <div className="mb-8 p-6 bg-slate-900/50 rounded-lg border border-slate-800 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by property, location, or tx hash..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="relative pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="initiated">Initiated</option>
                        </select>
                    </div>
                    <div className="relative">
                        <select
                            value={filters.paymentType}
                            onChange={(e) => handleFilterChange('paymentType', e.targe.value)}
                            className="relative pl-4 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
                        >
                            <option value="">All Types</option>
                            <option value="rental">Rental Payment</option>
                            <option value="security_deposit">Security Deposit</option>
                            <option value="booking_fee">Booking Fee</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <FaSpinner className="text-6xl text-blue-500 animate-spin" />
                    <p className="text-slate-400 mt-4">Loading payment history...</p>
                </div>
            ) : (
                <>
                    {/* Payment Cards List */}
                    <div className="space-y-6">
                        {filteredPayments.length === 0 ? (
                            <div className="text-center py-20 bg-slate-900/50 rounded-lg border border-slate-800">
                                <FaCreditCard className="mx-auto text-6xl text-slate-700 mb-4" />
                                <h3 className="text-2xl font-bold text-white">No payments found</h3>
                                <p className="text-slate-400 mt-2">
                                    {filters.search || filters.status || filters.paymentType
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'You haven\'t made any payments yet.'}
                                </p>
                            </div>
                        ) : (
                            filteredPayments.map((payment) => (
                                <div key={payment._id} className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden shadow-lg">
                                    {/* Card Header */}
                                    <div className="flex justify-between items-center p-4 bg-slate-800/50 border-b border-slate-700">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(payment.status)}
                                            <span className="font-semibold text-white capitalize">
                                                {getStatusText(payment.status)}
                                            </span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            ${payment.amount.toFixed(2)} USDC
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <FaHome className="text-3xl text-slate-400" />
                                            <div>
                                                <h4 className="text-lg font-semibold text-white">{payment.listing.title}</h4>
                                                <p className="text-sm text-slate-400">{payment.listing.location}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-400">Type:</span>
                                                <span className="text-white">{getPaymentTypeText(payment.paymentType)}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-slate-500" />
                                                <span className="font-semibold text-slate-400">Date:</span>
                                                <span className="text-white">{formatDate(payment.createdAt)}</span>
                                            </div>

                                            {payment.duration && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-400">Duration:</span>
                                                    <span className="text-white">{payment.durationText || `${payment.duration} days`}</span>
                                                </div>
                                            )} 
                                            {/* ^^^ THE ERROR WAS HERE ^^^ */}

                                            {payment.transactionHash && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-400">Transaction:</span>
                                                    <button
                                                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline"
                                                        onClick={() => openBlockchainExplorer(payment.transactionHash)}
                                                        title="View on blockchain explorer"
                                                    >
                                                        {payment.transactionHash.slice(0, 10)}...
                                                        <FaExternalLinkAlt className="w-3 h-3 ml-1" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    {payment.completedAt && (
                                        <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-700">
                                            <small className="text-xs text-slate-500">Completed on {formatDate(payment.completedAt)}</small>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-800">
                            <button
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed"
                                disabled={!pagination.hasPrev}
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                            >
                                Previous
                            </button>
                            
                            <div className="text-slate-400">
                                Page {pagination.currentPage} of {pagination.totalPages}
                                <span className="ml-2 text-sm text-slate-500">
                                    ({pagination.totalPayments} total payments)
                                </span>
                            </div>
                            
                            <button
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed"
                                disabled={!pagination.hasNext}
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PaymentHistoryPage;
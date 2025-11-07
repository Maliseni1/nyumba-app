import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    const { authUser } = useAuth();
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
        // ... (fetch logic is unchanged)
        try {
            setLoading(true);
            const params = {
                page: pagination.currentPage,
                limit: 10,
                ...(filters.status && { status: filters.status }),
                ...(filters.paymentType && { paymentType: filters.paymentType })
            };
            const { data } = await getPaymentHistory(params);
            setPayments(data.payments);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching payment history:', error);
            toast.error('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };
    
    // --- (Helper functions are unchanged, but I'll fix the typo in handleFilterChange) ---
    const handleFilterChange = (filterType, value) => {
         setFilters(prev => ({ ...prev, [filterType]: value }));
         setPagination(prev => ({ ...prev, currentPage: 1 }));
    };
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <FaCheckCircle className="text-green-500" />;
            case 'pending': return <FaClock className="text-yellow-500" />;
            case 'failed': return <FaTimesCircle className="text-red-500" />;
            case 'initiated': return <FaSpinner className="text-blue-500 animate-spin" />;
            default: return <FaClock className="text-subtle-text-color" />;
        }
    };
    const getStatusText = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };
    const getPaymentTypeText = (type) => { /* ... */ };
    const formatDate = (dateString) => { /* ... */ };
    const openBlockchainExplorer = (transactionHash) => { /* ... */ };
    const filteredPayments = payments.filter(payment => { /* ... */ });


    if (!authUser) {
        return (
            // --- 1. UPDATED AUTH REQUIRED BOX ---
            <div className="pt-24 max-w-7xl mx-auto py-12 px-4">
                <div className="text-center py-20 bg-card-color rounded-lg border border-border-color">
                    <FaCreditCard className="mx-auto text-6xl text-accent-color mb-4" />
                    <h2 className="text-3xl font-bold text-text-color mb-2">Authentication Required</h2>
                    <p className="text-subtle-text-color">Please log in to view your payment history.</p>
                </div>
            </div>
        );
    }

    return (
        // --- 2. ADDED PT-24 ---
        <div className="pt-24 max-w-7xl mx-auto py-12 px-4">
            {/* Page Header with Button */}
            <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {/* --- 3. UPDATED HEADER --- */}
                    <FaCreditCard className="text-5xl text-accent-color" />
                    <div>
                        <h1 className="text-4xl font-bold text-text-color">Payment History</h1>
                        <p className="text-subtle-text-color mt-1">Track all your Base Pay transactions</p>
                    </div>
                </div>
                
                {/* --- 4. UPDATED BUTTON --- */}
                <Link 
                    to="/subscription" 
                    className="px-6 py-3 rounded-lg bg-accent-color text-white font-semibold hover:bg-accent-hover-color transition-all duration-150 text-center"
                >
                    Make a New Payment
                </Link>
            </div>

            {/* --- 5. UPDATED FILTERS SECTION --- */}
            <div className="mb-8 p-6 bg-card-color rounded-lg border border-border-color flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-text-color" />
                    <input
                        type="text"
                        placeholder="Search by property, location, or tx hash..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg-color border border-border-color text-text-color placeholder-subtle-text-color focus:outline-none focus:ring-2 focus:ring-accent-color"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-text-color z-10" />
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="relative pl-10 pr-4 py-2 rounded-lg bg-bg-color border border-border-color text-text-color appearance-none focus:outline-none focus:ring-2 focus:ring-accent-color hover:cursor-pointer"
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
                            // --- THIS IS THE BUG FIX ---
                            onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                            // --- END OF BUG FIX ---
                            className="relative pl-4 pr-4 py-2 rounded-lg bg-bg-color border border-border-color text-text-color appearance-none focus:outline-none focus:ring-2 focus:ring-accent-color hover:cursor-pointer"
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
                    <FaSpinner className="text-6xl text-accent-color animate-spin" />
                    <p className="text-subtle-text-color mt-4">Loading payment history...</p>
                </div>
            ) : (
                <>
                    {/* --- 6. UPDATED PAYMENT CARDS LIST --- */}
                    <div className="space-y-6">
                        {filteredPayments.length === 0 ? (
                            <div className="text-center py-20 bg-card-color rounded-lg border border-border-color">
                                <FaCreditCard className="mx-auto text-6xl text-border-color mb-4" />
                                <h3 className="text-2xl font-bold text-text-color">No payments found</h3>
                                <p className="text-subtle-text-color mt-2">
                                    {filters.search || filters.status || filters.paymentType
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'You haven\'t made any payments yet.'}
                                </p>
                            </div>
                        ) : (
                            filteredPayments.map((payment) => (
                                <div key={payment._id} className="bg-card-color rounded-lg border border-border-color overflow-hidden shadow-sm dark:shadow-lg">
                                    {/* Card Header */}
                                    <div className="flex justify-between items-center p-4 bg-bg-color border-b border-border-color">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(payment.status)}
                                            <span className="font-semibold text-text-color capitalize">
                                                {getStatusText(payment.status)}
                                            </span>
                                        </div>
                                        <div className="text-2xl font-bold text-text-color">
                                            ${payment.amount.toFixed(2)} USDC
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <FaHome className="text-3xl text-subtle-text-color" />
                                            <div>
                                                <h4 className="text-lg font-semibold text-text-color">{payment.listing.title}</h4>
                                                <p className="text-sm text-subtle-text-color">{payment.listing.location}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-subtle-text-color">Type:</span>
                                                <span className="text-text-color">{getPaymentTypeText(payment.paymentType)}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-subtle-text-color" />
                                                <span className="font-semibold text-subtle-text-color">Date:</span>
                                                <span className="text-text-color">{formatDate(payment.createdAt)}</span>
                                            </div>

                                            {payment.duration && ('')} 

                                            {payment.transactionHash && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-subtle-text-color">Transaction:</span>
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
                                        <div className="px-4 py-2 bg-bg-color border-t border-border-color">
                                            <small className="text-xs text-subtle-text-color">Completed on {formatDate(payment.completedAt)}</small>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* --- 7. UPDATED PAGINATION --- */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border-color">
                            <button
                                className="px-4 py-2 rounded-lg bg-accent-color text-white font-semibold hover:bg-accent-hover-color disabled:bg-subtle-text-color disabled:cursor-not-allowed"
                                disabled={!pagination.hasPrev}
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                            >
                                Previous
                            </button>
                            
                            <div className="text-subtle-text-color">
                                Page {pagination.currentPage} of {pagination.totalPages}
                                <span className="ml-2 text-sm text-subtle-text-color/70">
                                    ({pagination.totalPayments} total payments)
                                </span>
                            </div>
                            
                            <button
                                className="px-4 py-2 rounded-lg bg-accent-color text-white font-semibold hover:bg-accent-hover-color disabled:bg-subtle-text-color disabled:cursor-not-allowed"
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
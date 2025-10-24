import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
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
import './PaymentHistoryPage.css';

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
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: pagination.currentPage,
                limit: 10,
                ...(filters.status && { status: filters.status }),
                ...(filters.paymentType && { paymentType: filters.paymentType })
            });

            const response = await fetch(`/api/payments/history?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${authUser.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPayments(data.payments);
                setPagination(data.pagination);
            } else {
                throw new Error('Failed to fetch payment history');
            }
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <FaCheckCircle className="status-icon completed" />;
            case 'pending':
                return <FaClock className="status-icon pending" />;
            case 'failed':
                return <FaTimesCircle className="status-icon failed" />;
            case 'initiated':
                return <FaSpinner className="status-icon initiated" />;
            default:
                return <FaClock className="status-icon" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'pending':
                return 'Pending';
            case 'failed':
                return 'Failed';
            case 'initiated':
                return 'Initiated';
            default:
                return status;
        }
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
        // Base Sepolia testnet explorer
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

    if (!authUser) {
        return (
            <div className="payment-history-page">
                <div className="auth-required">
                    <FaCreditCard className="auth-icon" />
                    <h2>Authentication Required</h2>
                    <p>Please log in to view your payment history.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-history-page">
            <div className="page-header">
                <div className="header-content">
                    <FaCreditCard className="page-icon" />
                    <div>
                        <h1>Payment History</h1>
                        <p>Track all your Base Pay transactions</p>
                    </div>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by property name, location, or transaction hash..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                <div className="filter-controls">
                    <div className="filter-group">
                        <FaFilter className="filter-icon" />
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="initiated">Initiated</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            value={filters.paymentType}
                            onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="rental">Rental Payment</option>
                            <option value="security_deposit">Security Deposit</option>
                            <option value="booking_fee">Booking Fee</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <FaSpinner className="loading-spinner" />
                    <p>Loading payment history...</p>
                </div>
            ) : (
                <>
                    <div className="payments-list">
                        {filteredPayments.length === 0 ? (
                            <div className="no-payments">
                                <FaCreditCard className="no-payments-icon" />
                                <h3>No payments found</h3>
                                <p>
                                    {filters.search || filters.status || filters.paymentType
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'You haven\'t made any payments yet. Start by booking a property!'}
                                </p>
                            </div>
                        ) : (
                            filteredPayments.map((payment) => (
                                <div key={payment._id} className="payment-card">
                                    <div className="payment-header">
                                        <div className="payment-status">
                                            {getStatusIcon(payment.status)}
                                            <span className={`status-text ${payment.status}`}>
                                                {getStatusText(payment.status)}
                                            </span>
                                        </div>
                                        <div className="payment-amount">
                                            ${payment.amount.toFixed(2)} USDC
                                        </div>
                                    </div>

                                    <div className="payment-body">
                                        <div className="property-info">
                                            <FaHome className="property-icon" />
                                            <div>
                                                <h4>{payment.listing.title}</h4>
                                                <p>{payment.listing.location}</p>
                                            </div>
                                        </div>

                                        <div className="payment-details">
                                            <div className="detail-item">
                                                <span className="label">Type:</span>
                                                <span className="value">{getPaymentTypeText(payment.paymentType)}</span>
                                            </div>
                                            
                                            <div className="detail-item">
                                                <FaCalendarAlt className="detail-icon" />
                                                <span className="label">Date:</span>
                                                <span className="value">{formatDate(payment.createdAt)}</span>
                                            </div>

                                            {payment.duration && (
                                                <div className="detail-item">
                                                    <span className="label">Duration:</span>
                                                    <span className="value">{payment.durationText || `${payment.duration} days`}</span>
                                                </div>
                                            )}

                                            {payment.transactionHash && (
                                                <div className="detail-item">
                                                    <span className="label">Transaction:</span>
                                                    <button
                                                        className="transaction-link"
                                                        onClick={() => openBlockchainExplorer(payment.transactionHash)}
                                                        title="View on blockchain explorer"
                                                    >
                                                        {payment.transactionHash.slice(0, 10)}...
                                                        <FaExternalLinkAlt className="external-icon" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {payment.completedAt && (
                                        <div className="payment-footer">
                                            <small>Completed on {formatDate(payment.completedAt)}</small>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                disabled={!pagination.hasPrev}
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                            >
                                Previous
                            </button>
                            
                            <div className="pagination-info">
                                Page {pagination.currentPage} of {pagination.totalPages}
                                <span className="total-count">
                                    ({pagination.totalPayments} total payments)
                                </span>
                            </div>
                            
                            <button
                                className="pagination-btn"
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
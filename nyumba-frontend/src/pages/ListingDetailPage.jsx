import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getListingById, getOrCreateConversation, deleteListing } from '../services/api';
import ImageSlider from '../components/ImageSlider';
import PaymentModal from '../components/PaymentModal';
import PaymentConfirmation from '../components/PaymentConfirmation';
import { toast } from 'react-toastify';
import { FaBed, FaBath, FaHome, FaCommentDots, FaEdit, FaTrash, FaCreditCard } from 'react-icons/fa';

const ListingDetailPage = () => {
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            try {
                const { data } = await getListingById(id);
                setListing(data);
            } catch (error) {
                toast.error("Could not fetch listing details.");
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    const handleStartChat = async () => {
        if (!currentUser) {
            toast.info("Please log in to contact the landlord.");
            navigate('/login');
            return;
        }
        if (!listing?.owner?._id) {
            toast.error("Cannot start chat. Landlord information is missing.");
            return;
        }
        try {
            await getOrCreateConversation(listing.owner._id);
            toast.success("Conversation started!");
            navigate('/messages');
        } catch (error) {
            toast.error("Could not start conversation.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
            try {
                await deleteListing(id);
                toast.success("Listing deleted successfully.");
                sessionStorage.setItem('profileDataStale', 'true');
                navigate('/profile');
            } catch (error) {
                toast.error("Failed to delete listing.");
            }
        }
    };

    const handlePaymentSuccess = (paymentData) => {
        toast.success(`Payment successful! Transaction ID: ${paymentData.transactionId}`);
        setPaymentResult(paymentData);
        setShowPaymentModal(false);
        setShowPaymentConfirmation(true);
        // Here you could save payment data to backend, update booking status, etc.
        console.log('Payment successful:', paymentData);
    };

    const handlePaymentError = (error) => {
        toast.error(`Payment failed: ${error.message}`);
        console.error('Payment error:', error);
    };

    const handleBookNow = () => {
        if (!currentUser) {
            toast.info("Please log in to book this property.");
            navigate('/login');
            return;
        }
        setShowPaymentModal(true);
    };

    if (loading) return <div className="pt-24 text-center text-slate-400">Loading Listing...</div>;
    if (!listing) return <div className="pt-24 text-center text-slate-400">Listing not found.</div>;

    const isOwnListing = currentUser && currentUser._id === listing?.owner?._id;

    return (
        <div className="pt-16 pb-12">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {listing.images && listing.images.length > 0 && <ImageSlider images={listing.images} />}

                <div className="p-8 bg-slate-900/50 mt-8 rounded-lg border border-slate-800 backdrop-blur-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-white">{listing.title}</h1>
                            <p className="text-slate-400 mt-2 text-lg">{listing.location}</p>
                        </div>
                        <span className="text-3xl font-bold text-sky-400">K{listing.price.toLocaleString()}/month</span>
                    </div>

                    <div className="flex items-center space-x-6 text-slate-300 my-6 border-y border-slate-800 py-4">
                        <div className="flex items-center gap-2"><FaBed /> {listing.bedrooms} Bedrooms</div>
                        <div className="flex items-center gap-2"><FaBath /> {listing.bathrooms} Bathrooms</div>
                        <div className="flex items-center gap-2"><FaHome /> Type: {listing.propertyType}</div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Description</h2>
                        <p className="text-slate-300 whitespace-pre-wrap">{listing.description}</p>
                    </div>

                    {isOwnListing ? (
                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <h2 className="text-2xl font-bold text-white mb-4">Manage Your Listing</h2>
                            <div className="flex items-center gap-4">
                                <Link to={`/listing/edit/${id}`} className="inline-flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-md hover:bg-sky-600 transition-colors">
                                    <FaEdit /> Edit
                                </Link>
                                <button onClick={handleDelete} className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        listing.owner ? (
                            <div className="mt-8 pt-6 border-t border-slate-800">
                                <h2 className="text-2xl font-bold text-white mb-4">Book This Property</h2>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                                    <img src={listing.owner.profilePicture} alt={listing.owner.name} className="w-16 h-16 rounded-full object-cover" />
                                    <div className="flex-1">
                                        <p className="font-bold text-white text-lg">{listing.owner.name}</p>
                                        <p className="text-slate-400 text-sm">Property Owner</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button 
                                        onClick={handleBookNow}
                                        className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                    >
                                        <FaCreditCard /> Book Now with Base Pay
                                    </button>
                                    
                                    {currentUser ? (
                                        <button 
                                            onClick={handleStartChat} 
                                            className="inline-flex items-center justify-center gap-2 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors"
                                        >
                                            <FaCommentDots /> Chat with Owner
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleStartChat} 
                                            className="inline-flex items-center justify-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors"
                                        >
                                            <FaCommentDots /> Log in to Chat
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                           <div className="mt-8 pt-6 border-t border-slate-800">
                                <h2 className="text-2xl font-bold text-white mb-4">Contact Landlord</h2>
                                <p className="text-slate-400">Landlord information is not available for this listing.</p>
                           </div>
                        )
                    )}
                </div>
            </div>
            
            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                listing={listing}
                rentalDetails={{
                    totalAmount: listing?.price,
                    duration: 'Monthly',
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
                }}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
            />
            
            {/* Payment Confirmation */}
            {showPaymentConfirmation && (
                <PaymentConfirmation
                    paymentData={paymentResult}
                    listing={listing}
                    onClose={() => {
                        setShowPaymentConfirmation(false);
                        setPaymentResult(null);
                    }}
                    showStatusTracker={true}
                />
            )}
        </div>
    );
};

export default ListingDetailPage;
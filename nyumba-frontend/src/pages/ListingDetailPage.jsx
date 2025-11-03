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
            // --- THIS IS THE UPDATE ---
            // We now pass an object to track the inquiry
            await getOrCreateConversation({ 
                receiverId: listing.owner._id, 
                listingId: listing._id 
            });
            // --- END OF UPDATE ---
            
            toast.success("Conversation started!");
            navigate('/messages');
        } catch (error) {
            toast.error("Could not start conversation.");
        }
    };

    const handleDelete = async () => {
        // ... (function is unchanged)
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
        // ... (function is unchanged)
        toast.success(`Payment successful! Transaction ID: ${paymentData.transactionId}`);
        setPaymentResult(paymentData);
        setShowPaymentModal(false);
        setShowPaymentConfirmation(true);
    };

    const handlePaymentError = (error) => {
        // ... (function is unchanged)
        toast.error(`Payment failed: ${error.message}`);
    };

    const handleBookNow = () => {
        // ... (function is unchanged)
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
    const displayAddress = listing.location?.address || listing.location || "Location not specified";

    return (
        <div className="pt-16 pb-12">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {listing.images && listing.images.length > 0 && <ImageSlider images={listing.images} />}

                <div className="p-8 bg-slate-900/50 mt-8 rounded-lg border border-slate-800 backdrop-blur-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-white">{listing.title}</h1>
                            <p className="text-slate-400 mt-2 text-lg">{displayAddress}</p>
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
                            {/* ... (rest of the JSX is unchanged) ... */}
                        </div>
                    ) : (
                        listing.owner ? (
                            <div className="mt-8 pt-6 border-t border-slate-800">
                                {/* ... (rest of the JSX is unchanged) ... */}
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
            
            {/* Payment Modal (unchanged) */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                listing={listing}
                rentalDetails={{ totalAmount: listing?.price, duration: 'Monthly' /* ... */ }}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
            />
            
            {/* Payment Confirmation (unchanged) */}
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
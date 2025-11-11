import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getListingById, getOrCreateConversation, deleteListing } from '../services/api';
import ImageSlider from '../components/ImageSlider';
import PaymentModal from '../components/PaymentModal';
import PaymentConfirmation from '../components/PaymentConfirmation';
import { toast } from 'react-toastify';
import { 
    FaBed, FaBath, FaHome, FaCommentDots, FaEdit, FaTrash, FaCreditCard, 
    FaStar, FaRocket, FaLock, FaShareAlt, FaLink,
    FaWhatsapp, FaFacebook, FaTwitter, 
    FaVideo
} from 'react-icons/fa';
import {
    WhatsappShareButton,
    FacebookShareButton,
    TwitterShareButton,
} from 'react-share';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import StarRating from '../components/StarRating';
import ListingReviews from '../components/ListingReviews';
import AdSlot from '../components/AdSlot'; // --- 1. IMPORT THE ADSLOT ---

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
        // ... (fetchListing function is unchanged)
        const fetchListing = async () => {
            setLoading(true);
            try {
                const { data } = await getListingById(id);
                setListing(data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                
                if (error.response && error.response.status === 403) {
                    confirmAlert({
                        customUI: ({ onClose }) => (
                            <div className="react-confirm-alert-body">
                                <h1 className="flex items-center gap-3">
                                    <FaRocket />
                                    Early Access Listing
                                </h1>
                                <p>This listing is available 24 hours early for Premium Tenants. Subscribe to view it instantly!</p>
                                <div className="react-confirm-alert-button-group">
                                    <button
                                        onClick={() => {
                                            navigate('/subscription/tenant');
                                            onClose();
                                        }}
                                    >
                                        Upgrade to Premium
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/');
                                            onClose();
                                        }}
                                    >
                                        Back to Listings
                                    </button>
                                </div>
                            </div>
                        )
                    });
                } else {
                    toast.error(error.response?.data?.message || "Could not fetch listing details.");
                    navigate('/');
                }
            }
        };
        fetchListing();
    }, [id, navigate]);


    const handleStartChat = async () => {
        if (!currentUser) {
            toast.error('You must be logged in to start a chat.');
            return navigate('/login', { state: { redirectTo: `/listing/${id}` } });
        }
        try {
            const { data } = await getOrCreateConversation({ recipientId: listing.owner._id, listingId: id });
            navigate('/messages', { state: { conversationId: data.conversation._id } });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not start chat.');
        }
    };
    
    const handleDelete = async () => {
        confirmAlert({
            title: 'Confirm Deletion',
            message: 'Are you sure you want to delete this listing?',
            buttons: [
                {
                    label: 'Yes, Delete',
                    onClick: async () => {
                        try {
                            await deleteListing(id);
                            toast.success('Listing deleted successfully');
                            navigate('/profile');
                        } catch (error) {
                            toast.error(error.response?.data?.message || 'Failed to delete listing.');
                        }
                    }
                },
                {
                    label: 'No, Cancel'
                }
            ]
        });
    };

    const handlePaymentSuccess = (paymentData) => {
        setPaymentResult(paymentData);
        setShowPaymentModal(false);
        setShowPaymentConfirmation(true);
    };

    const handlePaymentError = (error) => {
        toast.error(error.message || 'Payment failed. Please try again.');
    };
    
    const handleBookNow = () => {
        if (!currentUser) {
            toast.error('You must be logged in to book a property.');
            return navigate('/login', { state: { redirectTo: `/listing/${id}` } });
        }
        setShowPaymentModal(true);
    };

    const shareUrl = window.location.href;
    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
    };

    if (loading) return <div className="pt-24 text-center text-subtle-text-color">Loading Listing...</div>;
    if (!listing) return null;

    const isOwnListing = currentUser && currentUser._id === listing?.owner?._id;
    const displayAddress = listing.location?.address || listing.location || "Location not specified";
    const isEarlyAccess = new Date(listing.publicReleaseAt) > new Date();
    const isPriority = listing.isPriority;
    const shareTitle = `Check out this listing on Nyumba: ${listing.title}`;

    return (
        <div className="pt-16 pb-12">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* 1. Image Slider */}
                {listing.images && listing.images.length > 0 && <ImageSlider images={listing.images} />}

                {/* 2. Video Player Section */}
                {listing.videoUrl && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-text-color mb-4 flex items-center gap-2">
                            <FaVideo /> Video Tour
                        </h2>
                        <div className="bg-card-color p-4 rounded-lg border border-border-color">
                            <video
                                key={listing.videoUrl}
                                className="w-full h-auto rounded-md"
                                controls
                                playsInline
                                preload="metadata"
                            >
                                <source src={listing.videoUrl} type="video/mp4" />
                                <source src={listing.videoUrl} type="video/webm" />
                                <source src={listing.videoUrl} type="video/quicktime" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                )}

                {/* 3. Main Details Card */}
                <div className="p-8 bg-card-color mt-8 rounded-lg border border-border-color backdrop-blur-sm">
                    <div className="flex justify-between items-start">
                        {/* ... (Title, Badges, Price) ... */}
                        <div>
                            <h1 className="text-4xl font-bold text-text-color">{listing.title}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                {isEarlyAccess && (
                                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        <FaRocket /> Early Access
                                    </span>
                                )}
                                {isPriority && (
                                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        <FaStar /> Priority Listing
                                    </span>
                                )}
                            </div>
                            <p className="text-subtle-text-color mt-2 text-lg">{displayAddress}</p>
                        </div>
                        <span className="text-3xl font-bold text-accent-color">K{listing.price.toLocaleString()}/month</span>
                    </div>

                    <div className="flex items-center flex-wrap space-x-6 text-subtle-text-color my-6 border-y border-border-color py-4">
                        {/* ... (Beds, Baths, etc) ... */}
                        <div className="flex items-center gap-2"><FaBed /> {listing.bedrooms} Bedrooms</div>
                        <div className="flex items-center gap-2"><FaBath /> {listing.bathrooms} Bathrooms</div>
                        <div className="flex items-center gap-2"><FaHome /> Type: {listing.propertyType}</div>
                        <div className="flex items-center gap-2">
                            <StarRating 
                                rating={listing.analytics?.averageRating} 
                                numReviews={listing.analytics?.numReviews}
                            />
                        </div>
                    </div>

                    {/* 4. Share Buttons */}
                    <div className="mb-6">
                        {/* ... (Share buttons) ... */}
                        <h3 className="text-lg font-semibold text-text-color mb-3 flex items-center gap-2">
                            <FaShareAlt /> Share this Listing
                        </h3>
                        <div className="flex items-center gap-3">
                            <WhatsappShareButton url={shareUrl} title={shareTitle} separator=":: ">
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-80 transition-opacity">
                                    <FaWhatsapp size={20} />
                                </div>
                            </WhatsappShareButton>
                            <FacebookShareButton url={shareUrl} quote={shareTitle}>
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-80 transition-opacity">
                                    <FaFacebook size={20} />
                                </div>
                            </FacebookShareButton>
                            <TwitterShareButton url={shareUrl} title={shareTitle}>
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-black text-white hover:opacity-80 transition-opacity border border-border-color">
                                    <FaTwitter size={20} />
                                </div>
                            </TwitterShareButton>
                            <button 
                                onClick={handleCopyLink}
                                title="Copy Link"
                                className="h-10 w-10 flex items-center justify-center rounded-full bg-bg-color text-subtle-text-color hover:bg-border-color hover:text-text-color transition-colors border border-border-color"
                            >
                                <FaLink size={18} />
                            </button>
                        </div>
                    </div>

                    {/* 5. Description */}
                    <div>
                        <h2 className="text-2xl font-bold text-text-color mb-2">Description</h2>
                        <p className="text-text-color whitespace-pre-wrap">{listing.description}</p>
                    </div>

                    {/* --- 2. NEW: Listing Sidebar Ad Slot --- */}
                    {/* This ad will show between the description and the CTA */}
                    <div className="my-6">
                        <AdSlot location="listing_sidebar" />
                    </div>
                    {/* --- END OF NEW AD --- */}


                    {/* 6. Owner/CTA section */}
                    {isOwnListing ? (
                        <div className="mt-8 pt-6 border-t border-border-color">
                             <h2 className="text-2xl font-bold text-text-color mb-4">Manage Your Listing</h2>
                             <div className="flex items-center gap-4">
                                 <Link to={`/listing/edit/${id}`} className="inline-flex items-center gap-2 bg-accent-color text-white px-4 py-2 rounded-md hover:bg-accent-hover-color transition-colors">
                                     <FaEdit /> Edit
                                 </Link>
                                 <button onClick={handleDelete} className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                                     <FaTrash /> Delete
                                 </button>
                             </div>
                        </div>
                    ) : (
                        listing.owner ? (
                            <div className="mt-8 pt-6 border-t border-border-color">
                                <h2 className="text-2xl font-bold text-text-color mb-4">Book This Property</h2>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                                    <img src={listing.owner.profilePicture} alt={listing.owner.name} className="w-16 h-16 rounded-full object-cover" />
                                    <div className="flex-1">
                                        <p className="font-bold text-text-color text-lg">{listing.owner.name}</p>
                                        <p className="text-subtle-text-color text-sm">Property Owner</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button 
                                        onClick={handleBookNow}
                                        className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                    >
                                        <FaCreditCard /> Book Now with Base Pay
                                    </button>
                                    <button 
                                        onClick={handleStartChat} 
                                        className="inline-flex items-center justify-center gap-2 bg-accent-color text-white px-6 py-3 rounded-lg hover:bg-accent-hover-color transition-colors"
                                    >
                                        <FaCommentDots /> Chat with Owner
                                    </button>
                                </div>
                            </div>
                        ) : (
                           <div className="mt-8 pt-6 border-t border-border-color">
                                <h2 className="text-2xl font-bold text-text-color mb-4">Contact Landlord</h2>
                                <p className="text-subtle-text-color">Landlord information is not available for this listing.</p>
                           </div>
                        )
                    )}

                    {/* 7. Reviews */}
                    <ListingReviews listingId={listing._id} ownerId={listing.owner?._id} />
                </div>
            </div>
            
            {/* 8. Modals (unchanged) */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                listing={listing}
                rentalDetails={{ totalAmount: listing?.price, duration: 'Monthly' }}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
            />
            
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
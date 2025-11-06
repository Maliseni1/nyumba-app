import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBed, FaBath, FaMapMarkerAlt, FaMapPin } from 'react-icons/fa';
import SaveButton from './SaveButton';
import { toast } from 'react-toastify';

// Formats distance from meters to a readable string (e.g., "1.5 km")
const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)} m away`;
    }
    const km = (meters / 1000).toFixed(1);
    return `${km} km away`;
};

const ListingCard = ({ listing, onDelete }) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    if (!listing || !listing.owner) {
        return null; 
    }

    const isOwner = currentUser && currentUser._id === listing.owner._id;

    let displayAddress = "Location not specified";
    if (listing.location) {
        if (typeof listing.location === 'string') {
            displayAddress = listing.location;
        } else if (listing.location.address) {
            displayAddress = listing.location.address;
        }
    }

    const handleDelete = async (e) => {
        // ... (function is unchanged)
        e.preventDefault(); 
        e.stopPropagation(); 
        if (window.confirm("Are you sure you want to delete this listing?")) {
            try {
                if(onDelete) {
                    onDelete(listing._id);
                }
            } catch (error) {
                console.error("Failed to delete the listing.", error);
            }
        }
    };

    const handleViewOnMap = (e) => {
        // ... (function is unchanged)
        e.preventDefault();
        e.stopPropagation();
        if (listing.location?.coordinates) {
            const coords = [listing.location.coordinates[1], listing.location.coordinates[0]]; 
            navigate('/map', { state: { coordinates: coords } });
        } else {
            toast.error("Location not available for map view.");
        }
    };

    return (
        // --- 1. UPDATED THEME CLASSES ---
        <Link 
            to={`/listing/${listing._id}`} 
            className="block bg-card-color rounded-lg overflow-hidden border border-border-color hover:border-accent-color transition-all duration-300 group flex flex-col shadow-sm dark:shadow-none"
        >
            <div className="relative">
                <img src={listing.images[0] || 'https://via.placeholder.com/400x300'} alt={listing.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                
                {/* --- 2. UPDATED PRICE TAG --- */}
                <div className="absolute top-2 left-2 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-lg font-bold px-3 py-1 rounded-md backdrop-blur-sm">
                    K{listing.price.toLocaleString()}
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                {/* --- 3. UPDATED TEXT COLORS --- */}
                <h3 className="text-xl font-bold text-text-color truncate">{listing.title}</h3>
                
                <div className="text-sm text-subtle-text-color flex items-center justify-between gap-2 mt-1">
                    <span className="flex items-center gap-2 truncate">
                        <FaMapMarkerAlt />
                        {listing.distance ? (
                            // --- 4. UPDATED ACCENT COLOR ---
                            <span className="font-semibold text-accent-color">{formatDistance(listing.distance)}</span>
                        ) : (
                            <span className="truncate">{displayAddress}</span>
                        )}
                    </span>
                    
                    {listing.location?.coordinates && (
                        <button
                            onClick={handleViewOnMap}
                            title="View on Map"
                            // --- 5. UPDATED MAP PIN BUTTON ---
                            className="flex-shrink-0 text-accent-color hover:text-accent-hover-color transition-colors z-10 p-1 rounded-full hover:bg-border-color"
                        >
                            <FaMapPin />
                        </button>
                    )}
                </div>

                <div className="flex-grow"></div>

                {/* --- 6. UPDATED BED/BATH INFO --- */}
                <div className="flex items-center justify-between text-subtle-text-color mt-4 border-t border-border-color pt-3">
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center gap-2"><FaBed /> {listing.bedrooms}</span>
                        <span className="flex items-center gap-2"><FaBath /> {listing.bathrooms}</span>
                    </div>
                    <div>
                        {!isOwner && <SaveButton listingId={listing._id} />}
                    </div>
                </div>

                {isOwner && onDelete && (
                    // --- 7. UPDATED DELETE BORDER ---
                    <div className="mt-4 pt-3 border-t border-border-color">
                         {/* Delete button color (red) is theme-agnostic, so it's fine */}
                        <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-400">Delete Listing</button>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ListingCard;
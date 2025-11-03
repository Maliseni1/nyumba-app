import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- 1. Import useNavigate
import { FaBed, FaBath, FaMapMarkerAlt, FaMapPin } from 'react-icons/fa'; // <-- 2. Import FaMapPin
import SaveButton from './SaveButton';
import { toast } from 'react-toastify'; // <-- 3. Import toast

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
    const navigate = useNavigate(); // <-- 4. Initialize navigate

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

    // --- 5. NEW FUNCTION TO HANDLE MAP CLICK ---
    const handleViewOnMap = (e) => {
        e.preventDefault(); // Stop the card's main link from firing
        e.stopPropagation(); // Stop the event from bubbling

        if (listing.location?.coordinates) {
            // Leaflet uses [lat, lng], but GeoJSON is [lng, lat]
            const coords = [listing.location.coordinates[1], listing.location.coordinates[0]]; 
            // Navigate to /map and pass the coordinates in the state
            navigate('/map', { state: { coordinates: coords } });
        } else {
            toast.error("Location not available for map view.");
        }
    };

    return (
        <Link to={`/listing/${listing._id}`} className="block bg-slate-900/50 rounded-lg overflow-hidden border border-slate-800 hover:border-sky-500 transition-all duration-300 group flex flex-col">
            <div className="relative">
                <img src={listing.images[0] || 'https://via.placeholder.com/400x300'} alt={listing.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-lg font-bold px-3 py-1 rounded-md">
                    K{listing.price.toLocaleString()}
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white truncate">{listing.title}</h3>
                
                {/* --- 6. UPDATED LOCATION/MAP BUTTON DISPLAY --- */}
                <div className="text-sm text-slate-400 flex items-center justify-between gap-2 mt-1">
                    <span className="flex items-center gap-2 truncate">
                        <FaMapMarkerAlt />
                        {listing.distance ? (
                            <span className="font-semibold text-sky-400">{formatDistance(listing.distance)}</span>
                        ) : (
                            <span className="truncate">{displayAddress}</span>
                        )}
                    </span>
                    
                    {/* Show map pin button only if coordinates exist */}
                    {listing.location?.coordinates && (
                        <button
                            onClick={handleViewOnMap}
                            title="View on Map"
                            className="flex-shrink-0 text-sky-400 hover:text-sky-300 transition-colors z-10 p-1 rounded-full hover:bg-slate-700"
                        >
                            <FaMapPin />
                        </button>
                    )}
                </div>

                <div className="flex-grow"></div>

                <div className="flex items-center justify-between text-slate-300 mt-4 border-t border-slate-800 pt-3">
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center gap-2"><FaBed /> {listing.bedrooms}</span>
                        <span className="flex items-center gap-2"><FaBath /> {listing.bathrooms}</span>
                    </div>
                    <div>
                        {!isOwner && <SaveButton listingId={listing._id} />}
                    </div>
                </div>

                {isOwner && onDelete && (
                    <div className="mt-4 pt-3 border-t border-slate-800">
                         <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-400">Delete Listing</button>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ListingCard;
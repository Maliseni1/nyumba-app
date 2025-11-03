import React from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaMapMarkerAlt } from 'react-icons/fa';
import SaveButton from './SaveButton';

// --- NEW HELPER FUNCTION ---
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

    // Safety check: If listing or its owner is missing, render nothing.
    if (!listing || !listing.owner) {
        return null; 
    }

    const isOwner = currentUser && currentUser._id === listing.owner._id;

    // --- UPDATED: Get the address string safely ---
    // Handles both new (object) and old (string) location data
    let displayAddress = "Location not specified";
    if (listing.location) {
        if (typeof listing.location === 'string') {
            displayAddress = listing.location; // Handle old data
        } else if (listing.location.address) {
            displayAddress = listing.location.address; // Handle new data
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
                
                {/* --- THIS IS THE UPDATED LOCATION/DISTANCE DISPLAY --- */}
                <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                    <FaMapMarkerAlt />
                    {/* If listing.distance exists, show it. Otherwise, show the address. */}
                    {listing.distance ? (
                        <span className="font-semibold text-sky-400">{formatDistance(listing.distance)}</span>
                    ) : (
                        <span className="truncate">{displayAddress}</span>
                    )}
                </p>
                {/* --- END OF UPDATE --- */}


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
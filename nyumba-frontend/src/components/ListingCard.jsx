import React from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaMapMarkerAlt } from 'react-icons/fa';
import SaveButton from './SaveButton';

const ListingCard = ({ listing, onDelete }) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Safety check: If listing or its owner is missing, render nothing.
    if (!listing || !listing.owner) {
        return null; 
    }

    const isOwner = currentUser && currentUser._id === listing.owner._id;

    const handleDelete = async (e) => {
        e.preventDefault(); // Prevent navigating to the detail page
        e.stopPropagation(); // Stop the event from bubbling up
        if (window.confirm("Are you sure you want to delete this listing?")) {
            try {
                // We need to import and call an API function here
                // For now, we pass the call up to the parent component
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
                {/* SaveButton is NO LONGER HERE */}
                <img src={listing.images[0] || 'https://via.placeholder.com/400x300'} alt={listing.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-lg font-bold px-3 py-1 rounded-md">
                    K{listing.price.toLocaleString()}
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white truncate">{listing.title}</h3>
                <p className="text-sm text-slate-400 flex items-center gap-2 mt-1"><FaMapMarkerAlt /> {listing.location}</p>

                {/* Spacer to push content to the bottom */}
                <div className="flex-grow"></div>

                {/* --- THE MODIFICATION IS HERE --- */}
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
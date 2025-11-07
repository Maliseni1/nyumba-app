import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { setListingStatus } from '../../services/api';
import { toast } from 'react-toastify';
import { Switch } from '@headlessui/react';
import { FaEye, FaQuestionCircle } from 'react-icons/fa';

const LandlordListingTable = ({ listings, setListings }) => {
    const [loadingId, setLoadingId] = useState(null); // Tracks which toggle is loading

    const handleStatusChange = async (listingId, newStatus) => {
        // ... (function is unchanged)
        setLoadingId(listingId);
        try {
            const { data: updatedListing } = await setListingStatus(listingId, newStatus);
            setListings(prevListings => 
                prevListings.map(l => l._id === updatedListing._id ? updatedListing : l)
            );
            toast.success(`Listing status updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status. Please try again.");
        } finally {
            setLoadingId(null);
        }
    };

    if (listings.length === 0) {
        return (
            // --- 1. UPDATED "NO LISTINGS" BOX ---
            <div className="text-center p-8 bg-card-color border border-border-color rounded-lg">
                <p className="text-subtle-text-color">You haven't created any listings yet.</p>
                <Link to="/add-listing" className="mt-4 inline-block bg-accent-color text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover-color transition-colors">
                    Create Your First Listing
                </Link>
            </div>
        );
    }

    return (
        // --- 2. UPDATED TABLE CONTAINER ---
        <div className="bg-card-color rounded-lg border border-border-color overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
                {/* --- 3. UPDATED TABLE HEAD --- */}
                <thead className="bg-bg-color">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-subtle-text-color uppercase tracking-wider">Listing</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-subtle-text-color uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-subtle-text-color uppercase tracking-wider">Analytics</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-subtle-text-color uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                {/* --- 4. UPDATED TABLE BODY --- */}
                <tbody className="divide-y divide-border-color">
                    {listings.map((listing) => {
                        const isAvailable = listing.status === 'available';
                        const isLoading = loadingId === listing._id;
                        return (
                            <tr key={listing._id} className="hover:bg-bg-color">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-md object-cover" src={listing.images[0]} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            {/* --- 5. UPDATED TEXT --- */}
                                            <div className="text-sm font-medium text-text-color truncate max-w-xs">{listing.title}</div>
                                            <div className="text-sm text-subtle-text-color">K{listing.price.toLocaleString()}/month</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Switch
                                        checked={isAvailable}
                                        onChange={() => handleStatusChange(listing._id, isAvailable ? 'occupied' : 'available')}
                                        disabled={isLoading}
                                        // --- 6. UPDATED SWITCH ---
                                        className={`${isAvailable ? 'bg-green-600' : 'bg-subtle-text-color'}
                                          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
                                          disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <span className="sr-only">Toggle vacancy status</span>
                                        <span
                                            aria-hidden="true"
                                            className={`${isAvailable ? 'translate-x-5' : 'translate-x-0'}
                                            ${isLoading ? 'animate-pulse' : ''}
                                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </Switch>
                                </td>
                                {/* --- 7. UPDATED TEXT --- */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text-color">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5" title="Total Views">
                                            <FaEye /> {listing.analytics?.views || 0}
                                        </span>
                                        <span className="flex items-center gap-1.5" title="Total Inquiries">
                                            <FaQuestionCircle /> {listing.analytics?.inquiries || 0}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {/* --- 8. UPDATED LINK --- */}
                                    <Link to={`/listing/edit/${listing._id}`} className="text-accent-color hover:text-accent-hover-color">Edit</Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default LandlordListingTable;
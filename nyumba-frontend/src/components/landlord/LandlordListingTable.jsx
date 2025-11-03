import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { setListingStatus } from '../../services/api';
import { toast } from 'react-toastify';
import { Switch } from '@headlessui/react';
import { FaEye, FaQuestionCircle } from 'react-icons/fa';

const LandlordListingTable = ({ listings, setListings }) => {
    const [loadingId, setLoadingId] = useState(null); // Tracks which toggle is loading

    const handleStatusChange = async (listingId, newStatus) => {
        setLoadingId(listingId);
        try {
            const { data: updatedListing } = await setListingStatus(listingId, newStatus);
            // Update the main list in the parent component
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
            <div className="text-center p-8 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-slate-400">You haven't created any listings yet.</p>
                <Link to="/add-listing" className="mt-4 inline-block bg-sky-500 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors">
                    Create Your First Listing
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-800/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Listing</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Analytics</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {listings.map((listing) => {
                        const isAvailable = listing.status === 'available';
                        const isLoading = loadingId === listing._id;
                        return (
                            <tr key={listing._id} className="hover:bg-slate-800/40">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-md object-cover" src={listing.images[0]} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-white truncate max-w-xs">{listing.title}</div>
                                            <div className="text-sm text-slate-400">K{listing.price.toLocaleString()}/month</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Switch
                                        checked={isAvailable}
                                        onChange={() => handleStatusChange(listing._id, isAvailable ? 'occupied' : 'available')}
                                        disabled={isLoading}
                                        className={`${isAvailable ? 'bg-green-600' : 'bg-slate-700'}
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
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
                                    <Link to={`/listing/edit/${listing._id}`} className="text-sky-400 hover:text-sky-300">Edit</Link>
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
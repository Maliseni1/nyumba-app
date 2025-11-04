import React, { useState } from 'react';
import { redeemReward } from '../services/api';
import { toast } from 'react-toastify';
import { FaTimes, FaSpinner } from 'react-icons/fa';

const RedeemRewardModal = ({ isOpen, onClose, reward, listings = [], onRedemptionSuccess }) => {
    const [selectedListingId, setSelectedListingId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (reward.type === 'LISTING_PRIORITY' && !selectedListingId) {
            toast.error('Please select a listing to apply this reward to.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await redeemReward({
                rewardId: reward._id,
                listingId: selectedListingId || null,
            });
            toast.success(data.message || 'Reward redeemed successfully!');
            onRedemptionSuccess(data.newPointsTotal); // Pass new points total to parent
            onClose(); // Close the modal
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to redeem reward.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1002] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="flex justify-between items-center p-4 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white">Redeem: {reward.title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <p className="text-slate-300">
                            This will cost <strong className="text-sky-400">{reward.pointsCost} points</strong>. This action is irreversible.
                        </p>
                        {reward.type === 'LISTING_PRIORITY' && (
                            <div>
                                <label htmlFor="listing" className="block text-sm font-medium text-slate-300 mb-2">
                                    Which listing do you want to make a "Priority Listing"?
                                </label>
                                <select
                                    id="listing"
                                    value={selectedListingId}
                                    onChange={(e) => setSelectedListingId(e.target.value)}
                                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="">-- Select a listing --</option>
                                    {listings.map(listing => (
                                        <option key={listing._id} value={listing._id} disabled={listing.isPriority}>
                                            {listing.title} {listing.isPriority ? '(Already Priority)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-sky-500 text-white font-bold rounded-md hover:bg-sky-600 disabled:bg-slate-600 flex items-center gap-2"
                        >
                            {loading && <FaSpinner className="animate-spin" />}
                            Confirm Redeem
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RedeemRewardModal;
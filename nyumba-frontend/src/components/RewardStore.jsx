import React, { useState, useEffect } from 'react';
import { getRewards } from '../services/api';
import { toast } from 'react-toastify';
import { FaSpinner, FaGift } from 'react-icons/fa';
import RedeemRewardModal from './RedeemRewardModal';

const RewardStore = ({ userPoints, userListings = [], onRedemptionSuccess }) => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReward, setSelectedReward] = useState(null); // For the modal

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const { data } = await getRewards();
                setRewards(data);
            } catch (error) {
                toast.error("Could not load the rewards store.");
            } finally {
                setLoading(false);
            }
        };
        fetchRewards();
    }, []);

    const handleRedeemClick = (reward) => {
        if (userPoints < reward.pointsCost) {
            toast.error("You don't have enough points for this reward.");
            return;
        }
        setSelectedReward(reward);
    };

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaGift className="text-sky-400" />
                Rewards Store
            </h2>

            {loading && <div className="text-slate-400 text-center py-8"><FaSpinner className="animate-spin h-6 w-6 mx-auto" /></div>}

            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rewards.map(reward => {
                        const canAfford = userPoints >= reward.pointsCost;
                        return (
                            <div key={reward._id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{reward.title}</h3>
                                    <p className="text-slate-300 mt-2 text-sm">{reward.description}</p>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => handleRedeemClick(reward)}
                                        disabled={!canAfford}
                                        className="w-full bg-sky-500 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                                    >
                                        Redeem for {reward.pointsCost} Points
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* The Modal */}
            <RedeemRewardModal
                isOpen={!!selectedReward}
                onClose={() => setSelectedReward(null)}
                reward={selectedReward}
                listings={userListings}
                onRedemptionSuccess={onRedemptionSuccess}
            />
        </div>
    );
};

export default RewardStore;
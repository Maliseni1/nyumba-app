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
            <h2 className="text-2xl font-bold text-text-color mb-6 flex items-center gap-3">
                <FaGift className="text-accent-color" />
                Rewards Store
            </h2>

            {loading && <div className="text-subtle-text-color text-center py-8"><FaSpinner className="animate-spin h-6 w-6 mx-auto" /></div>}

            {/* --- 1. NEW: Add check for empty rewards --- */}
            {!loading && rewards.length === 0 && (
                <div className="text-center py-8 bg-bg-color border border-border-color rounded-lg">
                    <p className="text-subtle-text-color">There are no rewards available for your account type right now.</p>
                </div>
            )}
            
            {!loading && rewards.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rewards.map(reward => {
                        const canAfford = userPoints >= reward.pointsCost;
                        return (
                            <div key={reward._id} className="bg-bg-color border border-border-color rounded-lg p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-text-color">{reward.title}</h3>
                                    <p className="text-subtle-text-color mt-2 text-sm">{reward.description}</p>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => handleRedeemClick(reward)}
                                        disabled={!canAfford}
                                        className="w-full bg-accent-color text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color disabled:cursor-not-allowed"
                                    >
                                        Redeem for {reward.pointsCost} Points
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* This component will also need to be updated */}
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
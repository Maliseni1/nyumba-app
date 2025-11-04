import React, { useState, useEffect } from 'react';
import { getMyReferralData, getUserProfile } from '../services/api';
import { toast } from 'react-toastify';
import { FaGift, FaCopy, FaSpinner } from 'react-icons/fa';
import RewardStore from '../components/RewardStore';
import { useAuth } from '../context/AuthContext';

const RewardsPage = () => {
    const { authUser, updateAuthUser } = useAuth(); // Use auth context
    const [referralData, setReferralData] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch referral data and user profile data (for listings)
                const [refData, profileData] = await Promise.all([
                    getMyReferralData(),
                    getUserProfile()
                ]);
                
                setReferralData(refData.data);
                setListings(profileData.data.listings || []);
            } catch (error) {
                toast.error("Could not load your rewards data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCopy = () => {
        if (referralData?.referralCode) {
            navigator.clipboard.writeText(referralData.referralCode);
            toast.success("Referral code copied to clipboard!");
        }
    };

    // This function will be passed down to the modal
    const handleRedemptionSuccess = (newPointsTotal) => {
        // Update the points total in the auth context
        updateAuthUser({ ...authUser, points: newPointsTotal });
        
        // Update the points total in this page's state
        setReferralData(prev => ({ ...prev, points: newPointsTotal }));
    };

    // Get current points from authUser (which is the single source of truth)
    const currentPoints = authUser?.points || 0;

    return (
        <div className="pt-24 max-w-4xl mx-auto pb-12">
            <div className="bg-slate-900/50 p-8 rounded-lg border border-slate-800 backdrop-blur-sm space-y-8">
                <h1 className="text-3xl font-bold text-white text-center mb-6 flex items-center justify-center gap-3">
                    <FaGift className="text-amber-400" />
                    My Rewards & Referrals
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <FaSpinner className="animate-spin text-sky-500 h-8 w-8" />
                    </div>
                ) : referralData ? (
                    <>
                        {/* Points & Referral Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Points Display */}
                            <div className="text-center p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                                <p className="text-sm font-medium text-slate-400">YOUR TOTAL POINTS</p>
                                {/* Use currentPoints from authUser state */}
                                <p className="text-6xl font-bold text-sky-400 my-2">{currentPoints}</p>
                                <p className="text-slate-400">Keep earning to redeem rewards!</p>
                            </div>

                            {/* Referral Code Display */}
                            <div className="text-center p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                                <h2 className="text-xl font-bold text-white mb-3">Refer & Earn 25 Points!</h2>
                                <p className="text-slate-300 mb-4 text-sm">
                                    Share your code. When a friend signs up, you'll earn 25 points.
                                </p>
                                <p className="text-slate-400 text-sm">YOUR CODE</p>
                                <div className="relative my-2 w-full max-w-xs mx-auto">
                                    <input
                                        type="text"
                                        value={referralData.referralCode}
                                        readOnly
                                        className="w-full text-center p-3 pr-12 bg-slate-900 border border-slate-600 rounded-md text-white text-lg font-bold tracking-widest"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        title="Copy to Clipboard"
                                        className="absolute right-0 top-0 h-full px-4 text-slate-400 hover:text-sky-400 transition-colors"
                                    >
                                        <FaCopy />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* --- REWARD STORE --- */}
                        <RewardStore 
                            userPoints={currentPoints}
                            userListings={listings}
                            onRedemptionSuccess={handleRedemptionSuccess}
                        />
                    </>
                ) : (
                    <p className="text-center text-slate-400">Could not load rewards data.</p>
                )}
            </div>
        </div>
    );
};

export default RewardsPage;
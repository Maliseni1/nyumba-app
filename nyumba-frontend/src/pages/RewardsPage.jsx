import React, { useState, useEffect } from 'react';
import { getMyReferralData, getUserProfile } from '../services/api';
import { toast } from 'react-toastify';
import { FaGift, FaCopy, FaSpinner } from 'react-icons/fa';
import RewardStore from '../components/RewardStore';
import { useAuth } from '../context/AuthContext';

const RewardsPage = () => {
    const { authUser, updateAuthUser } = useAuth();
    const [referralData, setReferralData] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // ... (function is unchanged)
            try {
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
        // ... (function is unchanged)
        if (referralData?.referralCode) {
            navigator.clipboard.writeText(referralData.referralCode);
            toast.success("Referral code copied to clipboard!");
        }
    };

    const handleRedemptionSuccess = (newPointsTotal) => {
        // ... (function is unchanged)
        updateAuthUser({ ...authUser, points: newPointsTotal });
        setReferralData(prev => ({ ...prev, points: newPointsTotal }));
    };

    const currentPoints = authUser?.points || 0;

    return (
        <div className="pt-24 max-w-4xl mx-auto pb-12">
            {/* --- 1. UPDATED CARD --- */}
            <div className="bg-card-color p-8 rounded-lg border border-border-color backdrop-blur-sm space-y-8">
                <h1 className="text-3xl font-bold text-text-color text-center mb-6 flex items-center justify-center gap-3">
                    {/* Semantic amber color is fine */}
                    <FaGift className="text-amber-400" />
                    My Rewards & Referrals
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        {/* --- 2. UPDATED SPINNER --- */}
                        <FaSpinner className="animate-spin text-accent-color h-8 w-8" />
                    </div>
                ) : referralData ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* --- 3. UPDATED POINTS BOX --- */}
                            <div className="text-center p-6 bg-bg-color border border-border-color rounded-lg">
                                <p className="text-sm font-medium text-subtle-text-color">YOUR TOTAL POINTS</p>
                                <p className="text-6xl font-bold text-accent-color my-2">{currentPoints}</p>
                                <p className="text-subtle-text-color">Keep earning to redeem rewards!</p>
                            </div>

                            {/* --- 4. UPDATED REFERRAL BOX --- */}
                            <div className="text-center p-6 bg-bg-color border border-border-color rounded-lg">
                                <h2 className="text-xl font-bold text-text-color mb-3">Refer & Earn 25 Points!</h2>
                                <p className="text-subtle-text-color mb-4 text-sm">
                                    Share your code. When a friend signs up, you'll earn 25 points.
                                </p>
                                <p className="text-subtle-text-color text-sm">YOUR CODE</p>
                                <div className="relative my-2 w-full max-w-xs mx-auto">
                                    <input
                                        type="text"
                                        value={referralData.referralCode}
                                        readOnly
                                        className="w-full text-center p-3 pr-12 bg-bg-color border border-border-color rounded-md text-text-color text-lg font-bold tracking-widest"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        title="Copy to Clipboard"
                                        className="absolute right-0 top-0 h-full px-4 text-subtle-text-color hover:text-accent-color transition-colors"
                                    >
                                        <FaCopy />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <RewardStore 
                            userPoints={currentPoints}
                            userListings={listings}
                            onRedemptionSuccess={handleRedemptionSuccess}
                        />
                    </>
                ) : (
                    // --- 5. UPDATED ERROR TEXT ---
                    <p className="text-center text-subtle-text-color">Could not load rewards data.</p>
                )}
            </div>
        </div>
    );
};

export default RewardsPage;
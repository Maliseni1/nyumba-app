import React, { useState, useEffect } from 'react';
import { getMyReferralData } from '../services/api';
import { toast } from 'react-toastify';
import { FaGift, FaCopy, FaSpinner } from 'react-icons/fa';

const RewardsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await getMyReferralData();
                setData(data);
            } catch (error) {
                toast.error("Could not load your rewards data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCopy = () => {
        if (data?.referralCode) {
            navigator.clipboard.writeText(data.referralCode);
            toast.success("Referral code copied to clipboard!");
        }
    };

    return (
        <div className="pt-24 max-w-2xl mx-auto pb-12">
            <div className="bg-slate-900/50 p-8 rounded-lg border border-slate-800 backdrop-blur-sm space-y-6">
                <h1 className="text-3xl font-bold text-white text-center mb-6 flex items-center justify-center gap-3">
                    <FaGift className="text-amber-400" />
                    My Rewards & Referrals
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <FaSpinner className="animate-spin text-sky-500 h-8 w-8" />
                    </div>
                ) : data ? (
                    <>
                        {/* Points Display */}
                        <div className="text-center p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                            <p className="text-sm font-medium text-slate-400">YOUR TOTAL POINTS</p>
                            <p className="text-6xl font-bold text-sky-400 my-2">{data.points}</p>
                            <p className="text-slate-400">Keep writing reviews and completing your profile!</p>
                        </div>

                        {/* Referral Code Display */}
                        <div className="text-center p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                            <h2 className="text-xl font-bold text-white mb-3">Refer a Friend & Earn 25 Points!</h2>
                            <p className="text-slate-300 mb-4">
                                Share your unique code with a friend. When they sign up, you'll earn 25 points.
                            </p>
                            <p className="text-slate-400 text-sm">YOUR CODE</p>
                            <div className="relative my-2 w-full max-w-xs mx-auto">
                                <input
                                    type="text"
                                    value={data.referralCode}
                                    readOnly
                                    className="w-full text-center p-3 pr-12 bg-slate-900 border border-slate-600 rounded-md text-white text-2xl font-bold tracking-widest"
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
                    </>
                ) : (
                    <p className="text-center text-slate-400">Could not load rewards data.</p>
                )}
            </div>
        </div>
    );
};

export default RewardsPage;
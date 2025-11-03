import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { applyForVerification } from '../services/api'; // <-- 1. Import the new function
import { toast } from 'react-toastify';

const VerificationPage = () => {
    // --- 2. UPDATE useAuth TO GET THE REFRESH FUNCTION ---
    const { authUser, fetchAuthUser, updateAuthUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        setLoading(true);
        try {
            // --- 3. MAKE THE REAL API CALL ---
            const { data } = await applyForVerification();
            
            // The API returns the updated user object.
            // We update the global authUser state so the page re-renders.
            updateAuthUser(data); 

            toast.success("Your application has been submitted for review!");
            
        } catch (error) {
            // The backend sends a specific error message (e.g., "no active subscription")
            toast.error(error.response?.data?.message || "Application failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderStatus = () => {
        // --- 4. READ STATUS FROM AUTHUSER ---
        // This is now always up-to-date thanks to updateAuthUser()
        switch (authUser?.verificationStatus) {
            case 'approved':
                return (
                    <div className="flex flex-col items-center text-center p-8 bg-green-500/10 rounded-lg border border-green-500">
                        <FaCheckCircle className="text-5xl text-green-400 mb-4" />
                        <h2 className="text-2xl font-bold text-white">You are Verified!</h2>
                        <p className="text-slate-300 mt-2">
                            The verified badge is now active on your profile.
                        </p>
                    </div>
                );
            case 'pending':
                return (
                    <div className="flex flex-col items-center text-center p-8 bg-yellow-500/10 rounded-lg border border-yellow-500">
                        <FaHourglassHalf className="text-5xl text-yellow-400 mb-4" />
                        <h2 className="text-2xl font-bold text-white">Application Pending</h2>
                        <p className="text-slate-300 mt-2">
                            Your application is under review by our team. This usually takes 24-48 hours.
                        </p>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex flex-col items-center text-center p-8 bg-red-500/10 rounded-lg border border-red-500">
                        <FaTimesCircle className="text-5xl text-red-400 mb-4" />
                        <h2 className="text-2xl font-bold text-white">Application Rejected</h2>
                        <p className="text-slate-300 mt-2">
                            Your application was not approved. Please contact support for more information.
                        </p>
                    </div>
                );
            case 'not_applied':
            default:
                return (
                    <div className="p-8 bg-slate-800/50 rounded-lg border border-slate-700">
                        <h2 className="text-2xl font-bold text-white mb-4">Why Get Verified?</h2>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 mb-6">
                            <li>Gain a badge of trust on your profile.</li>
                            <li>Increase visibility for your listings (for landlords).</li>
                            <li>Build credibility with landlords (for tenants).</li>
                            <li>Show you are a serious member of the community.</li>
                        </ul>
                        <p className="text-lg text-white mb-4">
                            Verification requires an active monthly subscription.
                        </p>
                        
                        <Link 
                            to="/subscription" 
                            className="w-full text-center block bg-sky-500 text-white font-bold py-3 rounded-md hover:bg-sky-600 transition-colors"
                        >
                            Step 1: Start Your Subscription
                        </Link>

                        <p className="text-center text-slate-400 my-4">--- THEN ---</p>
                        
                        <button
                            onClick={handleApply}
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-slate-600"
                        >
                            {loading ? 'Submitting...' : 'Step 2: Apply for Verification'}
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="pt-24 max-w-2xl mx-auto pb-12">
            <div className="bg-slate-900/50 p-8 rounded-lg border border-slate-800 backdrop-blur-sm space-y-6">
                <h1 className="text-3xl font-bold text-white text-center mb-6">Profile Verification</h1>
                {/* We add a check for authUser to prevent a crash on load */}
                {authUser ? renderStatus() : <p className="text-slate-400 text-center">Loading user data...</p>}
            </div>
        </div>
    );
};

export default VerificationPage;
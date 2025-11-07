import React from 'react';
import { Link, Navigate } from 'react-router-dom'; // 1. Import Navigate
import { FaUser, FaCrown, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const SubscriptionPage = () => {
    // 2. Get the user and loading state
    const { authUser, isAuthLoading } = useAuth();

    // 3. Show a loader while we check who the user is
    if (isAuthLoading) {
        return (
            <div className="pt-48 flex justify-center items-center">
                <FaSpinner className="animate-spin text-accent-color h-12 w-12" />
            </div>
        );
    }

    // 4. If the user is logged in, redirect them to the correct page
    if (authUser) {
        if (authUser.role === 'tenant') {
            return <Navigate to="/subscription/tenant" replace />;
        }
        if (authUser.role === 'landlord') {
            return <Navigate to="/subscription/landlord" replace />;
        }
    }

    // 5. If user is LOGGED OUT, show the "chooser" page
    return (
        <div className="pt-24 max-w-4xl mx-auto pb-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-text-color mb-4">
                    Choose Your Plan
                </h1>
                <p className="text-xl text-subtle-text-color max-w-2xl mx-auto">
                    Whether you're looking for a home or listing one, our premium plans give you the edge.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* --- Tenant Plan Card --- */}
                <div className="bg-card-color border border-border-color rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl dark:hover:shadow-blue-500/20">
                    <div className="w-16 h-16 bg-accent-color/20 rounded-full flex items-center justify-center mb-6">
                        <FaUser className="w-8 h-8 text-accent-color" />
                    </div>
                    <h2 className="text-3xl font-bold text-text-color mb-3">For Tenants</h2>
                    <p className="text-subtle-text-color mb-6 flex-1">
                        Get early access to new listings and stand out from the crowd with a verified profile.
                    </p>
                    <Link 
                        to="/subscription/tenant"
                        className="w-full text-center bg-accent-color text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-hover-color transition-colors"
                    >
                        View Tenant Plan
                    </Link>
                </div>

                {/* --- Landlord Plan Card --- */}
                <div className="bg-card-color border border-border-color rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl dark:hover:shadow-yellow-500/20">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
                        <FaCrown className="w-8 h-8 text-amber-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-text-color mb-3">For Landlords</h2>
                    <p className="text-subtle-text-color mb-6 flex-1">
                        Verify your profile, unlock your dashboard, and get your listings seen by more tenants.
                    </p>
                    <Link 
                        to="/subscription/landlord"
                        className="w-full text-center bg-amber-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        View Landlord Plan
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default SubscriptionPage;
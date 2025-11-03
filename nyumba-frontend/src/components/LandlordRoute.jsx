import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const LandlordRoute = () => {
    const { authUser, loading } = useAuth();
    const location = useLocation();

    // We use a one-time toast effect when redirecting
    useEffect(() => {
        if (!loading && authUser) {
            if (authUser.role !== 'landlord') {
                toast.error("You must be a landlord to access this page.");
            } else if (!authUser.isVerified) {
                toast.info("This is a premium feature. Please get verified to access your dashboard.");
            }
        }
    }, [loading, authUser, location]);

    if (loading) {
        // Show a loading spinner or skeleton while checking auth
        return <div className="pt-24 text-center text-slate-400">Loading...</div>;
    }

    if (!authUser) {
        // Not logged in, redirect to login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (authUser.role !== 'landlord') {
        // Logged in, but not a landlord
        return <Navigate to="/profile" replace />;
    }

    if (!authUser.isVerified) {
        // Logged in, is a landlord, but NOT verified
        // Redirect them to the verification page
        return <Navigate to="/verification" replace />;
    }

    // If all checks pass, show the child route (the dashboard)
    return <Outlet />;
};

export default LandlordRoute;
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

const VerifiedLandlordRoute = () => {
    const { authUser, isAuthLoading } = useAuth();

    if (isAuthLoading) {
        return (
            <div className="pt-48 flex justify-center items-center">
                <FaSpinner className="animate-spin text-accent-color h-12 w-12" />
            </div>
        );
    }

    // This route component will be nested inside <LandlordRoute>,
    // so we can assume authUser and authUser.role === 'landlord' already exist.

    // This is the check that was causing the bug:
    if (authUser && authUser.role === 'landlord' && !authUser.isVerified) {
        // Logged in, is a landlord, but NOT verified
        toast.info("This is a premium feature. Please get verified to access your dashboard.");
        return <Navigate to="/verification" replace />;
    }

    // If all checks pass, show the child route (the dashboard)
    return <Outlet />;
};

export default VerifiedLandlordRoute;
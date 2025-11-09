import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa'; // Import spinner

const LandlordRoute = () => {
    // --- 1. GET 'isAuthLoading' INSTEAD OF 'loading' ---
    const { authUser, isAuthLoading } = useAuth();
    const location = useLocation();

    // Remove the useEffect toast logic, it's not needed here.

    if (isAuthLoading) {
        return (
            <div className="pt-48 flex justify-center items-center">
                <FaSpinner className="animate-spin text-accent-color h-12 w-12" />
            </div>
        );
    }

    if (!authUser) {
        // Not logged in, redirect to login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // --- 2. THIS IS THE FIX ---
    // We only check if they are a landlord.
    // We will protect *specific* sub-pages (like the dashboard) with a different route.
    if (authUser.role !== 'landlord') {
        // Logged in, but not a landlord
        toast.error("You must be a landlord to access this page.");
        return <Navigate to="/profile" replace />;
    }
    // --- END OF FIX ---

    // If all checks pass, show the child route (e.g., Bulk Upload, Dashboard)
    return <Outlet />;
};

export default LandlordRoute;
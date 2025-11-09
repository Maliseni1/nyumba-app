import React from 'react';
// --- 1. IMPORT Navigate, Outlet, and useLocation ---
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

const PrivateRoute = () => {
    const { authUser, isAuthLoading } = useAuth();
    const location = useLocation(); // 2. Get current location

    // 3. If auth is still loading, show a spinner
    if (isAuthLoading) {
        return (
            <div className="pt-48 flex justify-center items-center">
                <FaSpinner className="animate-spin text-accent-color h-12 w-12" />
            </div>
        ); 
    }

    // 4. If auth is loaded and there is NO user, redirect to login
    if (!authUser) {
        return <Navigate to="/login" replace />;
    }

    // 5. If user IS logged in, but profile is INCOMPLETE
    if (authUser && !authUser.isProfileComplete) {
        // And they are NOT already on the complete-profile page
        if (location.pathname !== '/complete-profile') {
            // Force them to complete their profile
            return <Navigate to="/complete-profile" replace />;
        }
    }
    
    // 6. If user is logged in AND profile is complete (or they are on the completion page)
    // allow them to see the page
    return <Outlet />;
};

export default PrivateRoute;
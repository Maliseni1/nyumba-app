import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

const PrivateRoute = () => {
    // 1. Get the loading state and user from the CONTEXT
    const { authUser, isAuthLoading } = useAuth();

    // 2. If auth is still loading, show nothing.
    // The splash screen will be covering this, so it's a seamless wait.
    if (isAuthLoading) {
        return (
            <div className="pt-48 flex justify-center items-center">
                <FaSpinner className="animate-spin text-accent-color h-12 w-12" />
            </div>
        ); 
    }

    // 3. After loading, check if user exists.
    // We check authUser (from context), NOT localStorage.
    return authUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
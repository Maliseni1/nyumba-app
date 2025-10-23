import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Get user information from local storage
    const userInfo = localStorage.getItem('user');

    if (!userInfo) {
        // If no user info is found in local storage, redirect to the login page
        return <Navigate to="/login" replace />;
    }

    // If user info exists, render the component that was passed as a child (e.g., the ProfilePage)
    return children;
};

export default ProtectedRoute;
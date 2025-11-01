import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // We get the user from our context

const AdminRoute = () => {
    const { authUser } = useAuth();

    // Check if user is logged in AND is an admin
    if (authUser && authUser.isAdmin) {
        return <Outlet />; // If yes, show the child page (e.g., dashboard)
    } else {
        return <Navigate to="/" replace />; // If no, redirect to homepage
    }
};

export default AdminRoute;
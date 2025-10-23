import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    // Check if user info exists in localStorage
    const userInfo = localStorage.getItem('user');

    // If user is logged in, render the child routes (e.g., ProfilePage, ChatPage)
    // If not, redirect to the login page
    return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
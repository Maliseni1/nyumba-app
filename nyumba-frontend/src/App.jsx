import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen'; // Splash screen
import { useTheme } from './context/ThemeContext'; // For toast theme

// --- Page Imports ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ListingDetailPage from './pages/ListingDetailPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ListingFormPage from './pages/ListingFormPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import PublicProfilePage from './pages/PublicProfilePage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import SubscriptionPage from './pages/SubscriptionPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MapPage from './pages/MapPage';
import VerificationPage from './pages/VerificationPage';
import LandlordRoute from './components/LandlordRoute';
import LandlordDashboardPage from './pages/LandlordDashboardPage';
import RewardsPage from './pages/RewardsPage';

// --- AuthContextProvider is REMOVED from this file ---

function App() {
  // 1. Add loading state for splash screen
  const [isAppLoading, setIsAppLoading] = useState(true);
  // 2. Get theme for ToastContainer
  const { theme } = useTheme();

  useEffect(() => {
    // 3. Set timer to hide splash screen
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000); // 2 seconds
    
    return () => clearTimeout(timer);
  }, []); // Empty array ensures this runs only once on mount

  return (
    // 4. We use a Fragment <_> here, NOT <AuthContextProvider>
    <>
      <SplashScreen isLoading={isAppLoading} />

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-4 flex-grow md:px-6 lg:px-8">
          <Routes>
            {/* All your routes are correct */}
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/user/:id" element={<PublicProfilePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/map" element={<MapPage />} />

            {/* Password Routes */}
            <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
            <Route path="/resetpassword/:resettoken" element={<ResetPasswordPage />} />

            {/* Private Routes (All logged-in users) */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/add-listing" element={<ListingFormPage />} />
              <Route path="/listing/edit/:id" element={<ListingFormPage />} />
              <Route path="/messages" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/payments" element={<PaymentHistoryPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
            </Route>
            
            {/* Routes for verified landlords only */}
            <Route path="/landlord" element={<LandlordRoute />}>
              <Route path="dashboard" element={<LandlordDashboardPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
            </Route>

          </Routes>
        </main>
        <Footer />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        // 5. Set theme dynamically
        theme={theme} 
      />
    </>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import GlobalLoader from './components/GlobalLoader';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext'; 

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

// --- 1. IMPORT THE NEW SUBSCRIPTION PAGES ---
import SubscriptionPage from './pages/SubscriptionPage'; // This is now the hub
import LandlordSubscriptionPage from './pages/LandlordSubscriptionPage';
import TenantSubscriptionPage from './pages/TenantSubscriptionPage';


function App() {
  const { isAuthLoading } = useAuth();
  const { theme } = useTheme();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    // ... (Splash screen logic is unchanged)
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2500); // 2.5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  const showSplash = isAuthLoading || isSplashVisible;

  return (
    <>
      <SplashScreen isLoading={showSplash} />
      <GlobalLoader />

      {!showSplash && (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="container mx-auto px-4 py-4 flex-grow md:px-6 lg:px-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/listing/:id" element={<ListingDetailPage />} />
              <Route path="/user/:id" element={<PublicProfilePage />} />
              <Route path="/map" element={<MapPage />} />

              {/* --- 2. UPDATE SUBSCRIPTION ROUTES --- */}
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/subscription/landlord" element={<LandlordSubscriptionPage />} />
              <Route path="/subscription/tenant" element={<TenantSubscriptionPage />} />

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
      )}
      
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
        theme={theme} 
      />
    </>
  );
}

export default App;
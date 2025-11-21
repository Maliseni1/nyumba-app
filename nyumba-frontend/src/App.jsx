import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import GlobalLoader from './components/GlobalLoader';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext'; // Removed AuthContextProvider import as it's not used here

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
import SubscriptionPage from './pages/SubscriptionPage';
import LandlordSubscriptionPage from './pages/LandlordSubscriptionPage';
import TenantSubscriptionPage from './pages/TenantSubscriptionPage';
import ForumHomePage from './pages/ForumHomePage'; 
import PostListPage from './pages/PostListPage'; 
import PostDetailPage from './pages/PostDetailPage'; 
import CompleteProfilePage from './pages/CompleteProfilePage'; 
import EmailVerificationPage from './pages/EmailVerificationPage';
import BulkUploadPage from './pages/BulkUploadPage'; 
import VerifiedLandlordRoute from './components/VerifiedLandlordRoute';
import PremiumSupportPage from './pages/PremiumSupportPage';
import TenantPreferencesPage from './pages/TenantPreferencesPage';
import BudgetCalculatorPage from './pages/BudgetCalculatorPage';
import PageLoader from './components/PageLoader';

// Wrapper component to use hooks inside Router
const AppContent = () => {
  const { isAuthLoading } = useAuth();
  const { theme } = useTheme();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2500); 
    return () => clearTimeout(timer);
  }, []);

  const showSplash = isAuthLoading || isSplashVisible;

  return (
    <>
      <SplashScreen isLoading={showSplash} /> 

      {!showSplash && (
        <div className="flex flex-col min-h-screen bg-bg-color transition-colors duration-300">
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
              <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/budget-calculator" element={<BudgetCalculatorPage />} />

              {/* Subscription Routes */}
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/subscription/landlord" element={<LandlordSubscriptionPage />} />
              <Route path="/subscription/tenant" element={<TenantSubscriptionPage />} />

              {/* Password Routes */}
              <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
              <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />

              {/* Forum Routes */}
              <Route path="/forum" element={<PrivateRoute><ForumHomePage /></PrivateRoute>} />
              <Route path="/forum/category/:categoryId" element={<PrivateRoute><PostListPage /></PrivateRoute>} />
              <Route path="/forum/post/:postId" element={<PrivateRoute><PostDetailPage /></PrivateRoute>} />

              {/* Private Routes (All logged-in users) */}
              <Route path="/complete-profile" element={<PrivateRoute><CompleteProfilePage /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/profile/edit" element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
              <Route path="/add-listing" element={<PrivateRoute><ListingFormPage /></PrivateRoute>} />
              <Route path="/listing/edit/:id" element={<PrivateRoute><ListingFormPage /></PrivateRoute>} />
              <Route path="/messages" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
              <Route path="/payments" element={<PrivateRoute><PaymentHistoryPage /></PrivateRoute>} />
              <Route path="/verification" element={<PrivateRoute><VerificationPage /></PrivateRoute>} />
              <Route path="/rewards" element={<PrivateRoute><RewardsPage /></PrivateRoute>} />
              <Route path="/support" element={<PrivateRoute><PremiumSupportPage /></PrivateRoute>} />
              <Route path="/preferences" element={<PrivateRoute><TenantPreferencesPage /></PrivateRoute>} />
              
              {/* Landlord Routes */}
              <Route path="/landlord" element={<LandlordRoute />}>
                <Route path="bulk-upload" element={<ListingFormPage />} /> 
                <Route path="dashboard" element={<LandlordDashboardPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      )}
      
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" 
      />
    </>
  );
};

function App() {
  // Ensure we are inside BrowserRouter (Done in main.jsx)
  return (
    <AppContent />
  );
}

export default App;
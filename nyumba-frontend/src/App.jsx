import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import { AuthContextProvider } from './context/AuthContext';

// --- NEW IMPORTS ---
import AdminRoute from './components/AdminRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';


function App() {
  return (
    <AuthContextProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-4 flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/user/:id" element={<PublicProfilePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />

            {/* Private Routes */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/add-listing" element={<ListingFormPage />} />
              <Route path="/listing/edit/:id" element={<ListingFormPage />} />
              <Route path="/messages" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/payments" element={<PaymentHistoryPage />} />
            </Route>

            {/* --- NEW: Admin Routes --- */}
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
        theme="dark"
      />
    </AuthContextProvider>
  );
}

export default App;
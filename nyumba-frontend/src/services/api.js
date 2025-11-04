import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

API.interceptors.request.use((req) => {
    if (localStorage.getItem('user')) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('user')).token}`;
    }
    return req;
});

// User Routes
export const loginUser = (formData) => API.post('/users/login', formData);
export const registerUser = (formData) => API.post('/users/register', formData);
export const googleLogin = (token) => API.post('/users/google', { token });
export const getUserProfile = () => API.get('/users/profile');
export const getPublicUserProfile = (id) => API.get(`/users/${id}`);
export const updateUserProfile = (formData) => API.put('/users/profile', formData);
export const toggleSaveListing = (listingId) => API.post(`/users/save/${listingId}`);
export const getUnreadMessageCount = () => API.get('/users/unread-count');
export const forgotPassword = (email) => API.post('/users/forgotpassword', email);
export const resetPassword = (token, password) => API.put(`/users/resetpassword/${token}`, password);
export const applyForVerification = () => API.post('/users/apply-verification');
// --- 1. ADD NEW REFERRAL FUNCTION ---
export const getMyReferralData = () => API.get('/users/referral-data');

// Listing Routes
export const getListings = (params) => API.get('/listings', { params });
export const getListingById = (id) => API.get(`/listings/${id}`);
export const createListing = (listingData) => API.post('/listings', listingData);
export const updateListing = (id, listingData) => API.put(`/listings/${id}`, listingData);
export const deleteListing = (id) => API.delete(`/listings/${id}`);
export const getListingsNearby = (params) => API.get('/listings/nearby', { params });
export const reverseGeocode = (params) => API.get('/listings/reverse-geocode', { params });
export const setListingStatus = (id, status) => API.put(`/listings/${id}/status`, { status });
export const getRecommendedListings = () => API.get('/listings/recommendations');


// Message Routes
export const getConversations = () => API.get('/messages/conversations');
export const getMessages = (conversationId) => API.get(`/messages/${conversationId}`);
export const sendMessage = (conversationId, message) => API.post(`/messages/send/${conversationId}`, message);
export const getOrCreateConversation = (data) => API.post('/messages/conversations', data);
export const markConversationAsRead = (conversationId) => API.put(`/messages/conversations/read/${conversationId}`);

// Payment Routes
export const getPaymentHistory = (params) => API.get('/payments/history', { params });

// Admin Routes
export const getAdminStats = () => API.get('/admin/stats');
export const getAllUsers = () => API.get('/admin/users');
export const getVerificationRequests = () => API.get('/admin/verification-requests');
export const approveVerification = (id) => API.put(`/admin/verify/${id}`, { action: 'approve' });
export const rejectVerification = (id) => API.put(`/admin/verify/${id}`, { action: 'reject' });

// Review Routes
export const getListingReviews = (listingId) => API.get(`/reviews/${listingId}`);
export const createListingReview = (listingId, reviewData) => API.post(`/reviews/${listingId}`, reviewData);
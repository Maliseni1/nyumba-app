import * as axios from 'axios';
// --- CRASH TEST: ENSURE BASE URL IS PRESENT ---
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
    // If the app is crashing before the AppContent logs, this should show up
    console.error("FATAL ERROR: VITE_API_BASE_URL is missing. Check Vercel Environment Variables.");
    throw new Error("Missing VITE_API_BASE_URL environment variable.");
}

const API = axios.create({ baseURL: BASE_URL });
//const API = (axios.default || axios).create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// --- LOADER LOGIC (UPDATED) ---
const silentGetRoutes = [
    '/users/profile',
    '/users/unread-count',
    '/forum/categories',
    '/users/preferences',
    '/users/match-analytics',
    '/admin/ads',
    '/ads', 
];
API.interceptors.request.use((req) => {
    const isSilent = silentGetRoutes.some(route => req.url.includes(route));
    if (!isSilent) {
        window.dispatchEvent(new CustomEvent('api-request-start'));
    }
    if (localStorage.getItem('user')) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('user')).token}`;
    }
    return req;
});
API.interceptors.response.use(
    (res) => {
        const isSilent = silentGetRoutes.some(route => res.config.url.includes(route));
        if (!isSilent) {
            window.dispatchEvent(new CustomEvent('api-request-end'));
        }
        return res;
    },
    (err) => {
        window.dispatchEvent(new CustomEvent('api-request-end'));
        return Promise.reject(err);
    }
);
// --- END OF LOADER LOGIC ---


// User Routes
export const loginUser = (formData) => API.post('/users/login', formData);
export const registerUser = (formData) => API.post('/users/register', formData);
export const googleLogin = (token) => API.post('/users/google', { token });
export const getUserProfile = () => API.get('/users/profile');
export const getPublicUserProfile = (id) => API.get(`/users/${id}`);
export const updateUserProfile = (formData) => API.put('/users/profile', formData);
export const toggleSaveListing = (listingId) => API.post(`/users/save/${listingId}`);
export const getUnreadMessageCount = () => API.get('/users/unread-count');
export const forgotPassword = (email) => API.post('/users/forgotpassword', { email });
export const resetPassword = (token, password) => API.put(`/users/resetpassword/${token}`, { password });
export const applyForVerification = () => API.post('/users/apply-verification');
export const getMyReferralData = () => API.get('/users/referral-data');
export const changePassword = (formData) => API.put('/users/changepassword', formData);
export const deleteAccount = () => API.delete('/users/profile');
export const completeProfile = (data) => API.put('/users/complete-profile', data);
export const verifyEmail = (token) => API.get(`/users/verify-email/${token}`);
export const resendVerificationEmail = (email) => API.post('/users/resend-verification', email);
export const sendPremiumSupportTicket = (data) => API.post('/users/premium-support', data);
export const getTenantPreferences = () => API.get('/users/preferences');
export const updateTenantPreferences = (data) => API.put('/users/preferences', data);
export const getTenantMatchAnalytics = () => API.get('/users/match-analytics');

// --- 1. NEW PUSH NOTIFICATION API CALLS ---
export const registerDevice = (fcmToken) => API.post('/users/register-device', { fcmToken });
export const removeDevice = (fcmToken) => API.post('/users/remove-device', { fcmToken });


// Listing Routes
export const getListings = (params) => API.get('/listings', { params });
export const getListingById = (id) => API.get(`/listings/${id}`);
export const createListing = (listingData) => API.post('/listings', listingData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateListing = (id, listingData) => API.put(`/listings/${id}`, listingData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteListing = (id) => API.delete(`/listings/${id}`);
export const getListingsNearby = (params) => API.get('/listings/nearby', { params });
export const reverseGeocode = (params) => API.get('/listings/reverse-geocode', { params });
export const setListingStatus = (id, status) => API.put(`/listings/${id}/status`, { status });
export const getRecommendedListings = () => API.get('/listings/recommendations');
export const bulkUploadListings = (formData) => API.post('/listings/bulk-upload', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

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
export const adminBanUser = (id) => API.put(`/admin/ban/${id}`);
export const adminDeleteUser = (id) => API.delete(`/admin/user/${id}`);
export const adminGetAllAds = () => API.get('/admin/ads');
export const adminCreateAd = (formData) => API.post('/admin/ads', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});
export const adminUpdateAd = (id, formData) => API.put(`/admin/ads/${id}`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});
export const adminDeleteAd = (id) => API.delete(`/admin/ads/${id}`);


// Review Routes
export const getListingReviews = (listingId) => API.get(`/reviews/${listingId}`);
export const createListingReview = (listingId, reviewData) => API.post(`/reviews/${listingId}`, reviewData);

// Reward Routes
export const getRewards = () => API.get('/rewards');
export const redeemReward = (data) => API.post('/rewards/redeem', data);
export const adminGetAllRewards = () => API.get('/rewards/admin/all');
export const adminCreateReward = (data) => API.post('/rewards/admin', data);
export const adminUpdateReward = (id, data) => API.put(`/rewards/admin/${id}`, data);
export const adminDeleteReward = (id) => API.delete(`/rewards/admin/${id}`);

// Forum Routes
export const getForumCategories = () => API.get('/forum/categories');
export const createForumCategory = (data) => API.post('/forum/categories', data);
export const getForumPosts = (categoryId) => API.get(`/forum/posts/category/${categoryId}`);
export const getForumPostById = (postId) => API.get(`/forum/posts/${postId}`);
export const createForumPost = (data) => API.post('/forum/posts', data);
export const deleteForumPost = (postId) => API.delete(`/forum/posts/${postId}`);
export const getForumReplies = (postId) => API.get(`/forum/replies/${postId}`);
export const createForumReply = (data) => API.post('/forum/replies', data);
export const deleteForumReply = (replyId) => API.delete(`/forum/replies/${replyId}`);

// Public Ad Routes
export const getPublicAd = (location) => API.get(`/ads?location=${location}`);
export const trackAdClick = (adId) => API.post('/ads/click', { adId });
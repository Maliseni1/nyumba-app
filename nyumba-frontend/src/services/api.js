import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// --- THIS IS THE NEW LOADER LOGIC ---

// 1. Create lists of "silent" routes that shouldn't trigger the global loader
const silentGetRoutes = [
    '/users/profile',
    '/users/unread-count',
    '/forum/categories', // Don't show loader for just fetching categories
];

// 2. Add interceptor to SHOW loader
API.interceptors.request.use((req) => {
    // Check if the URL *ends with* a silent route, for routes with params
    const isSilent = silentGetRoutes.some(route => req.url.endsWith(route));
    
    if (!isSilent) {
        window.dispatchEvent(new CustomEvent('api-request-start'));
    }
    
    // Add auth token (your existing logic)
    if (localStorage.getItem('user')) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('user')).token}`;
    }
    return req;
});

// 3. Add interceptor to HIDE loader
API.interceptors.response.use(
    (res) => {
        // Check if the URL *ends with* a silent route, for routes with params
        const isSilent = silentGetRoutes.some(route => res.config.url.endsWith(route));
        
        if (!isSilent) {
            window.dispatchEvent(new CustomEvent('api-request-end'));
        }
        return res;
    },
    (err) => {
        // Always hide loader on error to prevent it from getting stuck
        window.dispatchEvent(new CustomEvent('api-request-end'));
        return Promise.reject(err);
    }
);

// --- END OF NEW LOADER LOGIC ---


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
export const getMyReferralData = () => API.get('/users/referral-data');
export const changePassword = (formData) => API.put('/users/changepassword', formData);
export const deleteAccount = () => API.delete('/users/profile');

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

// Reward Routes
export const getRewards = () => API.get('/rewards');
export const redeemReward = (data) => API.post('/rewards/redeem', data);

// --- NEW FORUM ROUTES ---
export const getForumCategories = () => API.get('/forum/categories');
export const createForumCategory = (data) => API.post('/forum/categories', data);
export const getForumPosts = (categoryId) => API.get(`/forum/posts/category/${categoryId}`);
export const getForumPostById = (postId) => API.get(`/forum/posts/${postId}`);
export const createForumPost = (data) => API.post('/forum/posts', data);
export const deleteForumPost = (postId) => API.delete(`/forum/posts/${postId}`);
export const getForumReplies = (postId) => API.get(`/forum/replies/${postId}`);
export const createForumReply = (data) => API.post('/forum/replies', data);
export const deleteForumReply = (replyId) => API.delete(`/forum/replies/${replyId}`);
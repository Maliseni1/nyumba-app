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

// Listing Routes
export const getListings = (params) => API.get('/listings', { params });
export const getListingById = (id) => API.get(`/listings/${id}`);
export const createListing = (listingData) => API.post('/listings', listingData);
export const updateListing = (id, listingData) => API.put(`/listings/${id}`, listingData);
export const deleteListing = (id) => API.delete(`/listings/${id}`);

// Message Routes
export const getConversations = () => API.get('/messages/conversations');
export const getMessages = (conversationId) => API.get(`/messages/${conversationId}`);
export const sendMessage = (conversationId, message) => API.post(`/messages/send/${conversationId}`, message);
export const getOrCreateConversation = (receiverId) => API.post('/messages/conversations', { receiverId });
export const markConversationAsRead = (conversationId) => API.put(`/messages/conversations/read/${conversationId}`);

// --- THIS IS THE MISSING FUNCTION ---
export const getUnreadMessageCount = () => API.get('/users/unread-count');
export const getPaymentHistory = (params) => API.get('/payments/history', { params });
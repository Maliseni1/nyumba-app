import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import io from 'socket.io-client';
import { getUnreadMessageCount, getUserProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true); 
    
    // --- 1. NEW STATE FOR GLOBAL LOADER ---
    const [isPageLoading, setIsPageLoading] = useState(false);
    
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const verifyUser = async () => {
            // ... (verifyUser function is unchanged) ...
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
                try {
                    const { data } = await getUserProfile(); 
                    setAuthUser(data);
                } catch (error) {
                    console.error("Auth verification failed, logging out.", error);
                    localStorage.removeItem("user");
                    setAuthUser(null);
                }
            }
            setIsAuthLoading(false);
        };
        verifyUser();
    }, []);

    useEffect(() => {
        // ... (socket connection logic is unchanged) ...
        if (authUser) {
            const newSocket = io("http://localhost:5000", {
                query: { userId: authUser._id },
                transports: ['websocket']
            });
            setSocket(newSocket);
            newSocket.on("getOnlineUsers", (users) => setOnlineUsers(users));
            
            const fetchInitialData = async () => {
                try {
                    const { data } = await getUnreadMessageCount();
                    setUnreadCount(data.unreadCount);
                } catch (error) { console.error("Could not fetch unread count", error); }
            };
            fetchInitialData();
            
            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [authUser]);

    // --- 2. NEW FUNCTIONS TO CONTROL THE LOADER ---
    const showPageLoader = useCallback(() => setIsPageLoading(true), []);
    const hidePageLoader = useCallback(() => setIsPageLoading(false), []);

    // --- 3. NEW: Listen for global API events ---
    // This connects our loader to the api.js file automatically
    useEffect(() => {
        window.addEventListener('api-request-start', showPageLoader);
        window.addEventListener('api-request-end', hidePageLoader);

        return () => {
            window.removeEventListener('api-request-start', showPageLoader);
            window.removeEventListener('api-request-end', hidePageLoader);
        };
    }, [showPageLoader, hidePageLoader]);


    const login = (userData) => {
        // ... (function is unchanged) ...
        localStorage.setItem("user", JSON.stringify(userData));
        setAuthUser(userData);
    };

    const logout = () => {
        // ... (function is unchanged) ...
        localStorage.removeItem("user");
        setAuthUser(null);
        setSelectedConversation(null);
    };
    
    const updateAuthUser = (updatedData) => {
        // ... (function is unchanged) ...
        const newUser = { ...authUser, ...updatedData };
        setAuthUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{
            authUser, setAuthUser,
            isAuthLoading,
            login, logout, updateAuthUser,
            socket,
            onlineUsers,
            unreadCount, setUnreadCount,
            selectedConversation, setSelectedConversation,
            messages, setMessages,
            
            // --- 4. PASS THE NEW STATE & FUNCTIONS ---
            isPageLoading,
            showPageLoader,
            hidePageLoader
        }}>
            {children}
        </AuthContext.Provider>
    );
};
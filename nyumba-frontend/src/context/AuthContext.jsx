import { createContext, useState, useEffect, useContext, useCallback } from 'react';
// --- 1. REMOVE useNavigate and toast ---
import io from 'socket.io-client';
import { getUnreadMessageCount, getUserProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true); 
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    
    // We no longer need useNavigate here

    useEffect(() => {
        const verifyUser = async () => {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
                try {
                    const { data } = await getUserProfile(); 
                    setAuthUser(data);
                    
                    // --- 2. REMOVE THE BUGGY REDIRECT LOGIC ---
                    // This logic was causing the toast spam.
                    // The PrivateRoute.jsx component correctly handles this.
                    // if (data && !data.isProfileComplete) {
                    //     toast.info('Please complete your profile to continue.');
                    //     navigate('/complete-profile');
                    // }
                    // --- END OF REMOVAL ---

                } catch (error) {
                    console.error("Auth verification failed, logging out.", error);
                    localStorage.removeItem("user");
                    setAuthUser(null);
                }
            }
            setIsAuthLoading(false);
        };
        verifyUser();
    }, []); // <-- 3. REMOVED navigate dependency

    useEffect(() => {
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

    const showPageLoader = useCallback(() => setIsPageLoading(true), []);
    const hidePageLoader = useCallback(() => setIsPageLoading(false), []);

    useEffect(() => {
        window.addEventListener('api-request-start', showPageLoader);
        window.addEventListener('api-request-end', hidePageLoader);
        return () => {
            window.removeEventListener('api-request-start', showPageLoader);
            window.removeEventListener('api-request-end', hidePageLoader);
        };
    }, [showPageLoader, hidePageLoader]);


    // This 'login' function is now responsible for the redirect.
    // This is correct.
    const login = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setAuthUser(userData);

        if (userData.welcomeBack) {
            toast.success('Welcome back! Your account deletion has been cancelled.');
        }

        // This check is correct and will only run ONCE on login
        if (!userData.isProfileComplete) {
            toast.info('Welcome! Please complete your profile to continue.');
            // We can't use useNavigate() here, so we'll do a full redirect
            window.location.href = '/complete-profile';
        } else {
            window.location.href = '/';
        }
    };

    const logout = () => {
        localStorage.removeItem("user");
        setAuthUser(null);
        setSelectedConversation(null);
        window.location.href = '/login'; // Full redirect on logout
    };
    
    const updateAuthUser = (updatedData) => {
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
            isPageLoading,
            showPageLoader,
            hidePageLoader
        }}>
            {children}
        </AuthContext.Provider>
    );
};
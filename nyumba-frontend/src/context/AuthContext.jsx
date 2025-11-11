import { createContext, useState, useEffect, useContext, useCallback } from 'react';
// --- 1. RE-IMPORT useNavigate AND toast ---
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
    
    // --- 2. INITIALIZE useNavigate ---
    const navigate = useNavigate();

    useEffect(() => {
        const verifyUser = async () => {
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
    }, []); // <-- Dependency array is correct, no navigate needed here

    // ... (socket useEffect is unchanged) ...
    useEffect(() => {
        if (authUser) {
            // Use environment variable for Socket.IO connection
            const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
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

    // ... (loader useEffect is unchanged) ...
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


    // --- 3. UPDATED login FUNCTION ---
    const login = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setAuthUser(userData);

        let welcomeToastShown = false;

        if (userData.welcomeBack) {
            toast.success('Welcome back! Your account deletion has been cancelled.');
            welcomeToastShown = true;
        }

        if (!userData.isProfileComplete) {
            toast.info('Welcome! Please complete your profile to continue.');
            welcomeToastShown = true; // This counts as a welcome
            navigate('/complete-profile'); // Use navigate
        } else {
            if (!welcomeToastShown) { // Only show generic if no other toast was shown
                toast.success(`Welcome back, ${userData.name}!`);
            }
            navigate('/'); // Use navigate
        }
    };

    // --- 4. UPDATED logout FUNCTION ---
    const logout = () => {
        localStorage.removeItem("user");
        setAuthUser(null);
        setSelectedConversation(null);
        navigate('/login'); // Use navigate
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
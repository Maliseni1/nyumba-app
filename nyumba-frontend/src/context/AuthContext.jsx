import { createContext, useState, useEffect, useContext, useCallback } from 'react';
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
    
    const navigate = useNavigate();

    // 1. Verify User on Mount
    useEffect(() => {
        const verifyUser = async () => {
            // --- SAFELY PARSE LOCAL STORAGE ---
            let storedUser = null;
            try {
                const rawUser = localStorage.getItem("user");
                if (rawUser && rawUser !== "undefined") {
                    storedUser = JSON.parse(rawUser);
                }
            } catch (parseError) {
                console.error("Corrupt user data in local storage, clearing.", parseError);
                localStorage.removeItem("user");
            }
            // ----------------------------------
            
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

    // 2. Socket.io Connection (WITH CRASH FIX)
    useEffect(() => {
        if (authUser) {
            // --- CRITICAL FIX: Prevent crash if Env Var is missing ---
            const socketUrl = import.meta.env.VITE_API_BASE_URL;
            
            if (!socketUrl) {
                console.error("SOCKET ERROR: VITE_API_BASE_URL is missing! Real-time features will not work.");
                return; // Stop here to prevent crash
            }

            const newSocket = io(socketUrl, {
                query: { userId: authUser._id },
                transports: ['websocket']
            });
            setSocket(newSocket);

            newSocket.on("getOnlineUsers", (users) => setOnlineUsers(users));
            
            const fetchInitialData = async () => {
                try {
                    const { data } = await getUnreadMessageCount();
                    setUnreadCount(data.unreadCount);
                } catch (error) { 
                    console.error("Could not fetch unread count", error); 
                }
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

    // 3. Page Loader Logic
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


    // 4. Login Function
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
            welcomeToastShown = true;
            navigate('/complete-profile');
        } else {
            if (!welcomeToastShown) {
                toast.success(`Welcome back, ${userData.name}!`);
            }
            navigate('/');
        }
    };

    // 5. Logout Function
    const logout = () => {
        localStorage.removeItem("user");
        setAuthUser(null);
        setSelectedConversation(null);
        navigate('/login');
    };
    
    // 6. Update User Function
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
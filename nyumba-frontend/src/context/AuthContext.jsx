import { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { getUnreadMessageCount } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);

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

    return (
        <AuthContext.Provider value={{
            authUser, setAuthUser,
            socket,
            onlineUsers,
            unreadCount, setUnreadCount,
            selectedConversation, setSelectedConversation,
            messages, setMessages
        }}>
            {children}
        </AuthContext.Provider>
    );
};
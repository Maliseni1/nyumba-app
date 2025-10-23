import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const useListenMessages = () => {
    const { socket, messages, setMessages } = useAuth();

    useEffect(() => {
        socket?.on("newMessage", (newMessage) => {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        });

        return () => socket?.off("newMessage");
    }, [socket, setMessages, messages]);
};
export default useListenMessages;
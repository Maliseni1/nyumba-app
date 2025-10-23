import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { sendMessage as sendMessageApi } from '../services/api';
import { toast } from "react-toastify";

const useSendMessage = () => {
    const [loading, setLoading] = useState(false);
    const { messages, setMessages, selectedConversation } = useAuth();

    const sendMessage = async (message) => {
        if (!selectedConversation) return;
        setLoading(true);
        try {
            const { data: newMessage } = await sendMessageApi(selectedConversation.conversationId, { message });
            setMessages([...messages, newMessage]);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { sendMessage, loading };
};
export default useSendMessage;
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getMessages } from "../services/api";

const useGetMessages = (conversationId) => {
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversationId) return;
            setLoading(true);
            try {
                const { data } = await getMessages(conversationId);
                setMessages(data);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to load messages");
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [conversationId]);

    return { loading, messages, setMessages };
};
export default useGetMessages;
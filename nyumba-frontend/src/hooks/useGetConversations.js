import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getConversations } from "../services/api";

const useGetConversations = () => {
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            try {
                const { data } = await getConversations();
                setConversations(data);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to fetch conversations");
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    return { loading, conversations };
};

export default useGetConversations;
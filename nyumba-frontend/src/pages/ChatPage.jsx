import React, { useState, useEffect } from 'react';
import { getConversations, markConversationAsRead, getUnreadMessageCount } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Conversation from '../components/chat/Conversation';
import MessageContainer from '../components/chat/MessageContainer';
import { toast } from 'react-toastify';
import ConversationSkeleton from '../components/chat/ConversationSkeleton';

const ChatPage = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const { selectedConversation, setSelectedConversation, setMessages, setUnreadCount } = useAuth();

    useEffect(() => {
        // ... (fetch logic is unchanged)
        const fetchConversations = async () => {
            setLoading(true);
            try {
                const { data } = await getConversations();
                setConversations(data);
            } catch (error) {
                toast.error("Could not fetch conversations.");
            } finally { setLoading(false); }
        };
        fetchConversations();
    }, []);

    const handleSelectConversation = async (conversation) => {
        // ... (function is unchanged)
        setSelectedConversation(conversation);
        setMessages([]);
        try {
            await markConversationAsRead(conversation.conversationId);
            const { data } = await getConversations();
            setConversations(data);
            const { data: unreadData } = await getUnreadMessageCount();
            setUnreadCount(unreadData.unreadCount);
        } catch (error) { console.error("Failed to mark conversation as read", error); }
    };

    return (
        <div className="pt-20 flex h-[calc(100vh-80px)]">
            {/* --- 1. UPDATED CONVERSATION LIST --- */}
            <div className="w-1/3 bg-card-color border-r border-border-color overflow-y-auto">
                <div className="p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-color">Conversations</h2>
                </div>
                <div className="py-2">
                    {loading ? (
                        <div className="px-2">
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                        </div>
                    
                    ) : (
                        (conversations.length === 0 ? 
                            <p className='text-center text-subtle-text-color mt-4'>No conversations yet.</p> 
                        : 
                            conversations.map((conversation) => (
                                <Conversation
                                    key={conversation.conversationId}
                                    conversation={conversation}
                                    onSelect={() => handleSelectConversation(conversation)}
                                    isSelected={selectedConversation && selectedConversation.conversationId === conversation.conversationId}
                                />
                            ))
                        )
                    )}
                </div>
            </div>
            {/* --- 2. UPDATED MESSAGE CONTAINER --- */}
            <div className="w-2/3 flex flex-col bg-bg-color">
                {selectedConversation ? <MessageContainer /> : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-subtle-text-color">
                            <p className="text-2xl">Welcome to your Inbox</p>
                            <p>Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ChatPage;
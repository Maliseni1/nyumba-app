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
            <div className="w-1/3 bg-slate-900/50 border-r border-slate-800 overflow-y-auto">
                <div className="p-4 border-b border-slate-800"><h2 className="text-xl font-bold text-white">Conversations</h2></div>
                <div className="py-2">
                    {loading ? (
                        <div className="px-2">
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                        </div>
                    
                    ) : (
                        (conversations.length === 0 ? <p className='text-center text-slate-400 mt-4'>No conversations yet. Start a chat from a listing page!</p> : 
                        conversations.map((conversation) => (
                            <Conversation
                                key={conversation.conversationId}
                                conversation={conversation}
                                onSelect={() => handleSelectConversation(conversation)}
                                selected={selectedConversation && selectedConversation.conversationId === conversation.conversationId}
                            />
                        )))
                    )}
                </div>
            </div>
            <div className="w-2/3 flex flex-col">
                {selectedConversation ? <MessageContainer /> : (
                    <div className="flex items-center justify-center h-full"><div className="text-center text-slate-500"><p className="text-2xl">Welcome to your Inbox</p><p>Select a conversation to start messaging</p></div></div>
                )}
            </div>
        </div>
    );
};
export default ChatPage;
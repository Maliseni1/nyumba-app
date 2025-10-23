import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMessages } from '../../services/api';
import { toast } from 'react-toastify';
import Message from './Message';
import MessageInput from './MessageInput';

const MessageContainer = () => {
    const { selectedConversation, messages, setMessages } = useAuth();
    const lastMessageRef = useRef();

    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedConversation?.conversationId) {
                try {
                    const { data } = await getMessages(selectedConversation.conversationId);
                    setMessages(data);
                } catch (error) {
                    toast.error("Could not load messages.");
                }
            }
        };
        fetchMessages();
    }, [selectedConversation, setMessages]);

    useEffect(() => {
        setTimeout(() => {
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, [messages]);

    return (
        <div className='flex flex-col h-full'>
            <div className='bg-slate-800 px-4 py-2 mb-2'>
                <span className='text-slate-300'>To:</span> <span className='text-white font-bold'>{selectedConversation.name}</span>
            </div>
            <div className='px-4 flex-1 overflow-auto'>
                {messages.map((message) => (
                    <div key={message._id} ref={lastMessageRef}>
                        <Message message={message} />
                    </div>
                ))}
                 {messages.length === 0 && (
                    <p className='text-center text-slate-500'>No messages yet. Say hi!</p>
                )}
            </div>
            <MessageInput />
        </div>
    );
};
export default MessageContainer;
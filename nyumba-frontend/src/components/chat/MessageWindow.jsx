import React, { useEffect, useRef } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';
import useSendMessage from '../../hooks/useSendMessage';
import useListenMessages from '../../hooks/useListenMessages';
import useGetMessages from '../../hooks/useGetMessages';

const MessageWindow = ({ selectedConversation }) => {
    const { loading: loadingMessages, messages, setMessages } = useGetMessages(selectedConversation._id);
    const { loading: sendingMessage, sendMessage } = useSendMessage();
    useListenMessages(setMessages);

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const otherParticipant = selectedConversation.participants.find(p => p._id !== currentUser._id);
    const lastMessageRef = useRef();

    useEffect(() => {
        setTimeout(() => {
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, [messages]);

    const handleSendMessage = (text) => {
        sendMessage(text, selectedConversation._id, setMessages);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-4">
                <div className="avatar"><div className="w-10 rounded-full"><img src={otherParticipant.profilePicture} alt="avatar" /></div></div>
                <div><span className="text-slate-400 text-sm">Conversation with</span><br /><span className="text-white font-bold text-lg">{otherParticipant.name}</span></div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {loadingMessages && <p className="text-center text-slate-400">Loading...</p>}
                {!loadingMessages && messages.map(message => (<div key={message._id} ref={lastMessageRef}><Message message={message} /></div>))}
            </div>

            <div className="mt-auto border-t border-slate-800 bg-slate-900/50">
                <MessageInput onSendMessage={handleSendMessage} loading={sendingMessage} />
            </div>
        </div>
    );
};
export default MessageWindow;
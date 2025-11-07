import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Message = ({ message }) => {
    const { authUser } = useAuth();
    const fromMe = message.sender._id === authUser._id;
    const chatClassName = fromMe ? 'chat-end' : 'chat-start';
    
    // Gradient classes are semantic and look good on both themes. We'll keep them.
    const bubbleGradientClasses = fromMe
        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
        : 'bg-gradient-to-r from-sky-400 to-blue-500'; 
    
    const bubbleShapeClasses = 'relative rounded-xl py-2 px-4';
    const sentTime = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`chat ${chatClassName}`}>
            <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                    <img alt="User avatar" src={message.sender.profilePicture} />
                </div>
            </div>
            {/* Text inside bubble is white, which is good for contrast */}
            <div className={`chat-bubble text-white ${bubbleGradientClasses} ${bubbleShapeClasses}`}>
                {message.message}
            </div>
            {/* --- 1. UPDATED FOOTER TEXT --- */}
            <div className="chat-footer text-subtle-text-color opacity-70 text-xs flex gap-1 items-center">{sentTime}</div>
        </div>
    );
};
export default Message;
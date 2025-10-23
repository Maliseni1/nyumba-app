import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Message = ({ message }) => {
    const { authUser } = useAuth();
    const fromMe = message.sender._id === authUser._id;
    const chatClassName = fromMe ? 'chat-end' : 'chat-start';
    
    // --- MODIFICATION START ---
    // New gradient and shape classes for the bubble
    const bubbleGradientClasses = fromMe
        ? 'bg-gradient-to-r from-purple-500 to-pink-500' // Example gradient for "from me"
        : 'bg-gradient-to-r from-sky-400 to-blue-500';  // Example gradient for "to me"
    
    // We'll add custom CSS for the tail, so no specific tail class needed here.
    // The "relative" class is important for positioning the pseudo-element tail.
    const bubbleShapeClasses = 'relative rounded-xl py-2 px-4';
    // --- MODIFICATION END ---

    const sentTime = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`chat ${chatClassName}`}>
            <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                    <img alt="User avatar" src={message.sender.profilePicture} />
                </div>
            </div>
            {/* Apply new gradient and shape classes */}
            <div className={`chat-bubble text-white ${bubbleGradientClasses} ${bubbleShapeClasses}`}>
                {message.message}
            </div>
            <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">{sentTime}</div>
        </div>
    );
};
export default Message;
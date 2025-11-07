import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Conversation = ({ conversation, lastIdx, isSelected, onSelect }) => {
    const { onlineUsers } = useAuth();
    const isOnline = onlineUsers.includes(conversation._id);
    return (
        <>
            {/* --- 1. UPDATED CLASSES --- */}
            <div 
                className={`flex gap-2 items-center rounded p-2 py-1 cursor-pointer
                    ${isSelected 
                        ? "bg-accent-color" 
                        : "hover:bg-bg-color"
                    }
                `}
                onClick={() => onSelect(conversation)}
            >
                <div className={`avatar ${isOnline ? "online" : ""}`}>
                    <div className='w-12 rounded-full'>
                        <img src={conversation.profilePicture} alt='user avatar' />
                    </div>
                </div>
                <div className='flex flex-col flex-1'>
                    {/* --- 2. UPDATED TEXT --- */}
                    <p className={`font-bold ${isSelected ? 'text-white' : 'text-text-color'}`}>
                        {conversation.name}
                    </p>
                </div>
            </div>
            {/* --- 3. UPDATED DIVIDER --- */}
            {!lastIdx && <div className='border-b border-border-color my-0 mx-2' />}
        </>
    );
};
export default Conversation;
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaCrown } from 'react-icons/fa'; // 1. Import the icon

const Conversation = ({ conversation, lastIdx, isSelected, onSelect }) => {
    const { onlineUsers } = useAuth();
    const isOnline = onlineUsers.includes(conversation._id);
    
    // 2. The 'isPremiumTenant' field now comes from the API
    const isPremium = conversation.isPremiumTenant; 

    return (
        <>
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
                    <div className="flex items-center gap-2">
                        <p className={`font-bold ${isSelected ? 'text-white' : 'text-text-color'}`}>
                            {conversation.name}
                        </p>
                        {/* 3. Add the Premium Badge */}
                        {isPremium && (
                            <span 
                                className="text-xs text-black bg-gradient-to-r from-yellow-400 to-orange-500 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1"
                                title="Premium Tenant"
                            >
                                <FaCrown />
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {!lastIdx && <div className='border-b border-border-color my-0 mx-2' />}
        </>
    );
};
export default Conversation;
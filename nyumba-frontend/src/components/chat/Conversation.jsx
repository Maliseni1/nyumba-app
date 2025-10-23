import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Conversation = ({ conversation, lastIdx, isSelected, onSelect }) => {
    const { onlineUsers } = useAuth();
    const isOnline = onlineUsers.includes(conversation._id);
    return (
        <>
            <div className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer ${isSelected ? "bg-sky-500" : ""}`} onClick={() => onSelect(conversation)}>
                <div className={`avatar ${isOnline ? "online" : ""}`}>
                    <div className='w-12 rounded-full'><img src={conversation.profilePicture} alt='user avatar' /></div>
                </div>
                <div className='flex flex-col flex-1'><p className='font-bold text-gray-200'>{conversation.name}</p></div>
            </div>
            {!lastIdx && <div className='divider my-0 py-0 h-1' />}
        </>
    );
};
export default Conversation;
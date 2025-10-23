import React from 'react';
import useGetConversations from '../../hooks/useGetConversations';
import Conversation from './Conversation';

const ConversationList = ({ onSelectConversation, selectedConversation }) => {
    const { loading, conversations } = useGetConversations();
    return (
        <div className='py-2 flex flex-col overflow-auto'>
            {loading && <span className='loading loading-spinner mx-auto'></span>}
            {!loading && conversations.length === 0 && (
                <p className="text-center text-slate-500">No conversations found.</p>
            )}
            {conversations.map((conversation, idx) => (
                <Conversation
                    key={conversation._id}
                    conversation={conversation}
                    lastIdx={idx === conversations.length - 1}
                    onSelect={onSelectConversation}
                    isSelected={selectedConversation?._id === conversation._id}
                />
            ))}
        </div>
    );
};
export default ConversationList;
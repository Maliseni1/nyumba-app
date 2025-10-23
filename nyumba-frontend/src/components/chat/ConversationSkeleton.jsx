import React from 'react';

const ConversationSkeleton = () => {
    return (
        <div className="flex gap-2 items-center p-2 py-1">
            <div className="avatar">
                <div className="w-12 h-12 rounded-full bg-slate-700 animate-pulse"></div>
            </div>
            <div className="flex flex-col flex-1 gap-2">
                <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
            </div>
        </div>
    );
};

export default ConversationSkeleton;
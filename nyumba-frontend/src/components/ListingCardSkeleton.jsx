import React from 'react';

const ListingCardSkeleton = () => {
    return (
        <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-800 animate-pulse">
            <div className="w-full h-48 bg-slate-700"></div>
            <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                <div className="h-6 bg-slate-700 rounded w-1/3"></div>
            </div>
        </div>
    );
};

export default ListingCardSkeleton;
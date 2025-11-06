import React from 'react';

const ListingCardSkeleton = () => {
    return (
        // --- 1. Use theme-aware card and border colors ---
        <div className="bg-card-color rounded-lg overflow-hidden border border-border-color animate-pulse">
            {/* --- 2. Use a theme-aware pulse color (border-color is a good, neutral pulse) --- */}
            <div className="w-full h-48 bg-border-color"></div>
            <div className="p-4 space-y-3">
                <div className="h-4 bg-border-color rounded w-3/4"></div>
                <div className="h-3 bg-border-color rounded w-1/2"></div>
                <div className="h-6 bg-border-color rounded w-1/3"></div>
            </div>
        </div>
    );
};

export default ListingCardSkeleton;
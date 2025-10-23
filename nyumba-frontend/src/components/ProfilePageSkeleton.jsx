import React from 'react';
import ListingCardSkeleton from './ListingCardSkeleton';

const ProfilePageSkeleton = () => {
    return (
        <div className="pt-24 min-h-screen pb-12">
            <div className="max-w-4xl mx-auto px-4 animate-pulse">
                {/* Profile Header Skeleton */}
                <div className="bg-slate-900/50 p-8 rounded-lg border border-slate-800 flex items-center space-x-6 mb-8">
                    <div className="w-32 h-32 rounded-full bg-slate-700"></div>
                    <div className="flex-grow space-y-4">
                        <div className="h-8 bg-slate-700 rounded w-1/2"></div>
                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                    </div>
                </div>

                {/* Listings Section Skeleton */}
                <h2 className="text-3xl font-bold text-white mb-6">My Listings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <ListingCardSkeleton />
                    <ListingCardSkeleton />
                    <ListingCardSkeleton />
                </div>
            </div>
        </div>
    );
};

export default ProfilePageSkeleton;
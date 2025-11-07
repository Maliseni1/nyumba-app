import React, { useMemo } from 'react';
import { FaEye, FaQuestionCircle, FaHome } from 'react-icons/fa';

// A single Stat Card component
const StatCard = ({ icon, title, value, color }) => {
    return (
        // --- 1. UPDATED CARD ---
        <div className="bg-card-color border border-border-color p-6 rounded-lg flex items-center space-x-4">
            {/* Semantic icon colors are fine */}
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                {/* --- 2. UPDATED TEXT --- */}
                <p className="text-sm text-subtle-text-color">{title}</p>
                <p className="text-3xl font-bold text-text-color">{value}</p>
            </div>
        </div>
    );
};

// The main component that calculates and displays all cards
const LandlordStats = ({ listings = [] }) => {
    // useMemo ensures these calculations only run when 'listings' data changes
    const stats = useMemo(() => {
        const totalViews = listings.reduce((sum, listing) => sum + (listing.analytics?.views || 0), 0);
        const totalInquiries = listings.reduce((sum, listing) => sum + (listing.analytics?.inquiries || 0), 0);
        return {
            totalListings: listings.length,
            totalViews,
            totalInquiries,
        };
    }, [listings]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                icon={<FaHome className="h-6 w-6" />}
                title="Total Listings"
                value={stats.totalListings}
                color="bg-sky-500/20 text-sky-400"
            />
            <StatCard 
                icon={<FaEye className="h-6 w-6" />}
                title="Total Views"
                value={stats.totalViews.toLocaleString()}
                color="bg-emerald-500/20 text-emerald-400"
            />
            <StatCard 
                icon={<FaQuestionCircle className="h-6 w-6" />}
                title="Total Inquiries"
                value={stats.totalInquiries.toLocaleString()}
                color="bg-amber-500/20 text-amber-400"
            />
        </div>
    );
};

export default LandlordStats;
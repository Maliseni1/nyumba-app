import React from 'react';
import { FaUsers, FaBuilding } from 'react-icons/fa';

const StatsCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* --- 1. UPDATED CARD --- */}
            <div className="bg-card-color p-6 rounded-lg flex items-center border border-border-color">
                {/* Semantic color is fine */}
                <div className="p-4 bg-sky-500/20 rounded-full mr-4">
                    <FaUsers className="text-3xl text-sky-400" />
                </div>
                <div>
                    {/* --- 2. UPDATED TEXT --- */}
                    <p className="text-subtle-text-color text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-text-color">{stats.users}</p>
                </div>
            </div>
            {/* --- 3. UPDATED CARD --- */}
            <div className="bg-card-color p-6 rounded-lg flex items-center border border-border-color">
                {/* Semantic color is fine */}
                <div className="p-4 bg-emerald-500/20 rounded-full mr-4">
                    <FaBuilding className="text-3xl text-emerald-400" />
                </div>
                <div>
                    {/* --- 4. UPDATED TEXT --- */}
                    <p className="text-subtle-text-color text-sm">Total Listings</p>
                    <p className="text-3xl font-bold text-text-color">{stats.listings}</p>
                </div>
            </div>
        </div>
    );
};

export default StatsCards;
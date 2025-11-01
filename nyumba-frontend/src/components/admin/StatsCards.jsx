import React from 'react';
import { FaUsers, FaBuilding } from 'react-icons/fa';

const StatsCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800 p-6 rounded-lg flex items-center">
                <div className="p-4 bg-sky-500/20 rounded-full mr-4">
                    <FaUsers className="text-3xl text-sky-400" />
                </div>
                <div>
                    <p className="text-slate-400 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-white">{stats.users}</p>
                </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg flex items-center">
                <div className="p-4 bg-emerald-500/20 rounded-full mr-4">
                    <FaBuilding className="text-3xl text-emerald-400" />
                </div>
                <div>
                    <p className="text-slate-400 text-sm">Total Listings</p>
                    <p className="text-3xl font-bold text-white">{stats.listings}</p>
                </div>
            </div>
        </div>
    );
};

export default StatsCards;
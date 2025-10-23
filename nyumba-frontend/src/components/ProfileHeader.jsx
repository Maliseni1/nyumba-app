import React from 'react';
import { Link } from 'react-router-dom';
import { FaPen } from 'react-icons/fa';

const ProfileHeader = ({ profile }) => {
    const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A';

    return (
        <div className="bg-slate-900/50 p-8 rounded-lg border border-slate-800 backdrop-blur-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <img
                src={profile.profilePicture}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-slate-700"
            />
            <div className="flex-grow text-center sm:text-left">
                <h1 className="text-4xl font-bold text-white">{profile.name}</h1>
                <p className="text-slate-400 mt-2">{profile.bio || 'No bio provided.'}</p>
                <p className="text-xs text-slate-500 mt-2">Member since {memberSince}</p>
            </div>
            <div>
                <Link
                    to="/profile/edit"
                    className="inline-flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-md hover:bg-slate-600 transition-colors"
                >
                    <FaPen /> Edit Profile
                </Link>
            </div>
        </div>
    );
};

export default ProfileHeader;
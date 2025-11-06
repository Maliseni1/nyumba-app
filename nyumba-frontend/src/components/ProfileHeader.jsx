import React from 'react';
import { Link } from 'react-router-dom';
import { FaPen } from 'react-icons/fa';

const ProfileHeader = ({ profile }) => {
    const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A';

    return (
        // 1. Use theme-aware card and border colors
        <div className="bg-card-color p-8 rounded-lg border border-border-color backdrop-blur-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <img
                src={profile.profilePicture}
                alt={profile.name}
                // 2. Use theme-aware border color
                className="w-32 h-32 rounded-full object-cover border-4 border-border-color"
            />
            <div className="flex-grow text-center sm:text-left">
                {/* 3. Use theme-aware text colors */}
                <h1 className="text-4xl font-bold text-text-color">{profile.name}</h1>
                <p className="text-subtle-text-color mt-2">{profile.bio || 'No bio provided.'}</p>
                <p className="text-xs text-subtle-text-color mt-2">Member since {memberSince}</p>
            </div>
            <div>
                <Link
                    to="/profile/edit"
                    // 4. Update button to be theme-aware (secondary button style)
                    className="inline-flex items-center gap-2 bg-bg-color border border-border-color text-text-color px-4 py-2 rounded-md hover:bg-border-color transition-colors"
                >
                    <FaPen /> Edit Profile
                </Link>
            </div>
        </div>
    );
};

export default ProfileHeader;
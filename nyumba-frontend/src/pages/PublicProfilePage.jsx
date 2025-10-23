import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicUserProfile, getOrCreateConversation } from '../services/api';
import { toast } from 'react-toastify';
import ListingCard from '../components/ListingCard';
import { FaCommentDots } from 'react-icons/fa';

const PublicProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data } = await getPublicUserProfile(id);
                setProfile(data);
            } catch (error) {
                toast.error("Could not load user's profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleStartChat = async () => {
        try {
            // This will either get the existing conversation or create a new one
            await getOrCreateConversation(id);
            toast.success("Conversation started!");
            navigate('/messages'); // Navigate to the messages page
        } catch (error) {
            toast.error("Could not start conversation.");
        }
    };

    if (loading) return <div className="pt-24 text-center text-slate-400">Loading profile...</div>;
    if (!profile) return <div className="pt-24 text-center text-slate-400">User not found.</div>;

    const isOwnProfile = currentUser && currentUser._id === profile._id;

    return (
        <div className="pt-24 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-900/50 p-8 rounded-lg border border-slate-800 backdrop-blur-sm flex items-center space-x-6 mb-8">
                    <img src={profile.profilePicture} alt={profile.name} className="w-32 h-32 rounded-full object-cover border-4 border-sky-500" />
                    <div className="flex-grow">
                        <h1 className="text-4xl font-bold text-white">{profile.name}</h1>
                        <p className="text-slate-300 mt-2">{profile.bio}</p>
                        <p className="text-xs text-slate-500 mt-4">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                    {/* Show Start Chat button if it's not your own profile */}
                    {currentUser && !isOwnProfile && (
                         <button onClick={handleStartChat} className="flex-shrink-0 flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-md hover:bg-sky-600 transition-colors">
                            <FaCommentDots />
                            Start Chat
                        </button>
                    )}
                </div>

                <h2 className="text-3xl font-bold text-white mb-6">Listings by {profile.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {profile.listings && profile.listings.length > 0 ? (
                        profile.listings.map(listing => (
                            <ListingCard key={listing._id} listing={listing} />
                        ))
                    ) : (
                        <p className="text-slate-400 col-span-full">This user has no active listings.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicProfilePage;
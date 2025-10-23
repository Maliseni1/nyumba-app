import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile } from '../services/api';
import { toast } from 'react-toastify';
import ListingCard from '../components/ListingCard';
import ProfilePageSkeleton from '../components/ProfilePageSkeleton';
import ProfileHeader from '../components/ProfileHeader';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getUserProfile();
            setProfile(data);
        } catch (error) {
            toast.error("Could not load your profile.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initialFetch = () => {
            if (!profile || sessionStorage.getItem('profileDataStale') === 'true') {
                fetchProfile();
                sessionStorage.removeItem('profileDataStale');
            }
        };
        initialFetch();

        window.addEventListener('focus', initialFetch);
        return () => window.removeEventListener('focus', initialFetch);
    }, [fetchProfile, profile]);

    const handleDeleteListing = (deletedListingId) => {
        setProfile(prevProfile => ({
            ...prevProfile,
            listings: prevProfile.listings.filter(listing => listing._id !== deletedListingId)
        }));
    };

    if (loading) return <ProfilePageSkeleton />;
    if (!profile) return <div className="pt-24 text-center text-slate-400">Could not find profile.</div>;

    return (
        <div className="pt-24 min-h-screen pb-12">
            <div className="max-w-4xl mx-auto px-4">
                <ProfileHeader profile={profile} />

                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-white mb-6">My Listings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {profile.listings && profile.listings.length > 0 ? (
                            profile.listings.map(listing => (
                                <ListingCard key={listing._id} listing={listing} onDelete={handleDeleteListing} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 bg-slate-900/50 rounded-lg border border-slate-800">
                                <p className="text-slate-400">You haven't posted any listings yet.</p>
                                <Link to="/add-listing" className="mt-4 inline-block bg-sky-500 text-white px-6 py-2 rounded-md hover:bg-sky-600 transition-colors">
                                    Create Your First Listing
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl font-bold text-white mb-6">My Saved Listings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {profile.savedListings && profile.savedListings.length > 0 ? (
                            profile.savedListings.map(listing => (
                                <ListingCard key={listing._id} listing={listing} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 bg-slate-900/50 rounded-lg border border-slate-800">
                                <p className="text-slate-400">You haven't saved any listings yet.</p>
                                <Link to="/" className="mt-4 inline-block bg-sky-500 text-white px-6 py-2 rounded-md hover:bg-sky-600 transition-colors">
                                    Browse Listings
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
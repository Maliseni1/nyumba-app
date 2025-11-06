import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile } from '../services/api';
import { toast } from 'react-toastify';
import ListingCard from '../components/ListingCard';
import ProfilePageSkeleton from '../components/ProfilePageSkeleton';
import ProfileHeader from '../components/ProfileHeader';
import { FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';

import RecommendedListings from '../components/RecommendedListings';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        // ... (function is unchanged)
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
        // ... (function is unchanged)
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
        // ... (function is unchanged)
        setProfile(prevProfile => ({
            ...prevProfile,
            listings: prevProfile.listings.filter(listing => listing._id !== deletedListingId)
        }));
    };

    if (loading) return <ProfilePageSkeleton />;
    // --- 1. UPDATED ERROR TEXT ---
    if (!profile) return <div className="pt-24 text-center text-subtle-text-color">Could not find profile.</div>;

    return (
        <div className="pt-24 min-h-screen pb-12">
            <div className="max-w-4xl mx-auto px-4">
                <ProfileHeader profile={profile} />

                {/* --- 2. UPDATED "GET VERIFIED" BUTTON --- */}
                <div className="mb-8 px-4 md:px-0">
                    {profile.isVerified ? (
                        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 font-bold py-2 px-4 rounded-md border border-green-500">
                            <FaCheckCircle />
                            Verified Profile
                        </div>
                    ) : profile.verificationStatus === 'pending' ? (
                        <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 font-bold py-2 px-4 rounded-md border border-yellow-500">
                            <FaHourglassHalf />
                            Verification Pending
                        </div>
                    ) : (
                        <Link 
                            to="/verification" 
                            // Use accent colors
                            className="inline-block bg-accent-color text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover-color transition-colors"
                        >
                            Get Verified
                        </Link>
                    )}
                </div>
                
                {/* --- LANDLORD SECTION --- */}
                {profile.role === 'landlord' && (
                    <div className="mb-12">
                        {/* --- 3. UPDATED HEADING --- */}
                        <h2 className="text-3xl font-bold text-text-color mb-6">My Listings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {profile.listings && profile.listings.length > 0 ? (
                                profile.listings.map(listing => (
                                    <ListingCard key={listing._id} listing={listing} onDelete={handleDeleteListing} />
                                ))
                            ) : (
                                // --- 4. UPDATED "NO LISTINGS" BOX ---
                                <div className="col-span-full text-center py-12 bg-card-color rounded-lg border border-border-color">
                                    <p className="text-subtle-text-color">You haven't posted any listings yet.</p>
                                    <Link to="/add-listing" className="mt-4 inline-block bg-accent-color text-white px-6 py-2 rounded-md hover:bg-accent-hover-color transition-colors">
                                        Create Your First Listing
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TENANT SECTION --- */}
                {profile.role === 'tenant' && (
                    <div className="mb-12">
                        <RecommendedListings />
                    </div>
                )}

                {/* --- SAVED LISTINGS (For both roles) --- */}
                <div>
                    {/* --- 5. UPDATED HEADING --- */}
                    <h2 className="text-3xl font-bold text-text-color mb-6">My Saved Listings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {profile.savedListings && profile.savedListings.length > 0 ? (
                            profile.savedListings.map(listing => (
                                <ListingCard key={listing._id} listing={listing} />
                            ))
                        ) : (
                            // --- 6. UPDATED "NO SAVED" BOX ---
                            <div className="col-span-full text-center py-12 bg-card-color rounded-lg border border-border-color">
                                <p className="text-subtle-text-color">You haven't saved any listings yet.</p>
                                <Link to="/" className="mt-4 inline-block bg-accent-color text-white px-6 py-2 rounded-md hover:bg-accent-hover-color transition-colors">
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
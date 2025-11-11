import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// --- 1. IMPORT API FUNCTIONS ---
import { getPublicAd, trackAdClick } from '../services/api';

// --- 2. ACCEPT 'location' PROP ---
const AdSlot = ({ location }) => {
    const { authUser } = useAuth();
    // --- 3. NEW STATE for the live ad ---
    const [ad, setAd] = useState(null);
    
    const isPremium = authUser && authUser.subscriptionStatus === 'active';

    useEffect(() => {
        // If the user is premium, don't bother fetching an ad
        if (isPremium) return;

        const fetchAd = async () => {
            try {
                // Fetch a random, active ad for the specified location
                const { data } = await getPublicAd(location);
                if (data) {
                    setAd(data);
                }
            } catch (error) {
                console.error("Failed to fetch ad:", error);
            }
        };

        fetchAd();
    }, [isPremium, location]); // Re-run if location or premium status changes

    // --- 4. NEW Click Handler ---
    const handleAdClick = () => {
        if (ad && ad._id) {
            // Track the click in the background. Don't wait for it.
            trackAdClick(ad._id).catch(err => console.error("Failed to track ad click:", err));
        }
    };

    // 1. If the user is premium, show nothing.
    if (isPremium) {
        return null;
    }

    // 2. If user is free AND no ad was found (or is still loading), show nothing.
    if (!ad) {
        return null; // Don't show an empty box
    }

    // 3. If user is free AND we have an ad, show it.
    return (
        <div className="w-full p-4 bg-card-color border border-border-color rounded-lg text-center my-8">
            <a 
                href={ad.linkUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                title={ad.companyName} // <-- THIS REPLACES "Your Ad Here"
                onClick={handleAdClick} // <-- 5. Track click
            >
                <img 
                    src={ad.imageUrl} 
                    alt={ad.companyName} // Alt text for accessibility
                    className="w-full h-auto object-cover rounded-md"
                />
            </a>
            <p className="text-xs text-subtle-text-color mt-2">Advertisement</p>
        </div>
    );
};

export default AdSlot;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// This is a simple, local ad component.
// We will also need to add functions to the 'api.js' to fetch and track ads.
const AdSlot = ({ adData }) => {
    const { authUser } = useAuth();
    
    // Check if the user is a premium member
    const isPremium = authUser && authUser.subscriptionStatus === 'active';

    // 1. If the user is premium, show nothing (this is the "Ad-Free Experience").
    if (isPremium) {
        return null;
    }

    // 2. If the user is on the FREE tier, show the ad.
    // We will build the logic to fetch a real ad from your admin panel next.
    // For now, we will use a placeholder.
    
    // --- THIS IS A PLACEHOLDER ---
    // In the next step, we will replace this with a real ad
    // fetched from your `adModel` database.
    const placeholderAd = {
        linkUrl: '/subscription', // Links to the subscription page
        imageUrl: '/ad-placeholder.png', // You'll need to add a placeholder image
        companyName: 'Your Ad Here'
    };
    
    // Replace `placeholderAd` with `adData` once we fetch it.
    const ad = placeholderAd; 

    return (
        <div className="w-full p-4 bg-card-color border border-border-color rounded-lg text-center my-8">
            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" title={ad.companyName}>
                <img 
                    src={ad.imageUrl} 
                    alt="Advertisement" 
                    className="w-full h-auto object-cover rounded-md"
                />
            </a>
            <p className="text-xs text-subtle-text-color mt-2">Advertisement</p>
        </div>
    );
};

export default AdSlot;
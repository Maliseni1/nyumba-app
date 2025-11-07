import React, { useState, useEffect, useCallback } from 'react';
import { getUserProfile } from '../services/api';
import { toast } from 'react-toastify';
import LandlordStats from '../components/landlord/LandlordStats';
import LandlordListingTable from '../components/landlord/LandlordListingTable';
import BestPerformingListing from '../components/landlord/BestPerformingListing';
import LandlordAdvice from '../components/landlord/LandlordAdvice';
import { FaSpinner } from 'react-icons/fa'; // Import spinner

const LandlordDashboardPage = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLandlordData = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await getUserProfile();
            setListings(data.listings || []);
        } catch (error) {
            toast.error("Could not fetch your dashboard data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLandlordData();
    }, [fetchLandlordData]);

    if (loading) {
        return (
            <div className="pt-24 max-w-7xl mx-auto pb-12 px-4">
                {/* --- 1. UPDATED TEXT --- */}
                <h1 className="text-4xl font-bold text-text-color mb-8">Landlord Dashboard</h1>
                <div className="text-center text-subtle-text-color flex items-center justify-center gap-3 py-10">
                    <FaSpinner className="animate-spin text-accent-color" />
                    <p className="text-subtle-text-color">Loading your data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 max-w-7xl mx-auto pb-12 px-4 space-y-8">
            {/* --- 2. UPDATED TEXT --- */}
            <h1 className="text-4xl font-bold text-text-color mb-8">Landlord Dashboard</h1>
            
            {/* These child components will need to be updated */}
            <LandlordStats listings={listings} />

            {listings.length > 0 && <BestPerformingListing listings={listings} />}
            
            <div>
                {/* --- 3. UPDATED TEXT --- */}
                <h2 className="text-2xl font-bold text-text-color mb-4">My Listings</h2>
                <LandlordListingTable listings={listings} setListings={setListings} />
            </div>

            <LandlordAdvice />
        </div>
    );
};

export default LandlordDashboardPage;
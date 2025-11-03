import React, { useState, useEffect, useCallback } from 'react';
import { getUserProfile } from '../services/api';
import { toast } from 'react-toastify';
import LandlordStats from '../components/landlord/LandlordStats';
import LandlordListingTable from '../components/landlord/LandlordListingTable';
import BestPerformingListing from '../components/landlord/BestPerformingListing'; // <-- 1. Import
import LandlordAdvice from '../components/landlord/LandlordAdvice'; // <-- 1. Import

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
                <h1 className="text-4xl font-bold text-white mb-8">Landlord Dashboard</h1>
                <p className="text-slate-400">Loading your data...</p>
            </div>
        );
    }

    return (
        <div className="pt-24 max-w-7xl mx-auto pb-12 px-4 space-y-8">
            <h1 className="text-4xl font-bold text-white mb-8">Landlord Dashboard</h1>
            
            <LandlordStats listings={listings} />

            {/* --- 2. ADD BEST PERFORMING LISTING --- */}
            {listings.length > 0 && <BestPerformingListing listings={listings} />}
            
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">My Listings</h2>
                <LandlordListingTable listings={listings} setListings={setListings} />
            </div>

            {/* --- 3. ADD ADVICE SECTION --- */}
            <LandlordAdvice />
        </div>
    );
};

export default LandlordDashboardPage;
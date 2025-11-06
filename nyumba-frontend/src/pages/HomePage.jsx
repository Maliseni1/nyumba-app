import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getListings, getListingsNearby } from '../services/api';
import ListingCard from '../components/ListingCard';
import SearchBar from '../components/SearchBar';
import ListingCardSkeleton from '../components/ListingCardSkeleton';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

const HomePage = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const [isNearbySearch, setIsNearbySearch] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    const fetchListings = useCallback(async (query) => {
        // ... (function is unchanged)
        setLoading(true);
        setIsNearbySearch(false);
        try {
            const { data } = await getListings({ searchTerm: query });
            setListings(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Could not fetch listings.");
            setListings([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchListings(searchTerm);
    }, [searchTerm, fetchListings]);

    const handleSearch = (query) => {
        // ... (function is unchanged)
        if (!user) {
            toast.info('Please log in or register to search for listings.');
            navigate('/login');
            return;
        }
        setSearchTerm(query);
    };

    const handleNearbySearch = () => {
        // ... (function is unchanged)
        if (!user) {
            toast.info('Please log in to use this feature.');
            navigate('/login');
            return;
        }
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }
        setIsLocating(true);
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const { data } = await getListingsNearby({ lat: latitude, lng: longitude });
                    setListings(Array.isArray(data) ? data : []);
                    setIsNearbySearch(true);
                    toast.success(`Found ${data.length} listings near you!`);
                } catch (error) {
                    toast.error('Could not find listings near you.');
                    setListings([]);
                } finally {
                    setIsLocating(false);
                    setLoading(false);
                }
            },
            (error) => {
                toast.error('Unable to retrieve your location. Please check browser permissions.');
                setIsLocating(false);
                setLoading(false);
            }
        );
    };

    const clearNearbySearch = () => {
        // ... (function is unchanged)
        fetchListings(searchTerm);
    };

    const placeholderText = user ? "Search by location or keyword..." : "Log in to search for listings";

    return (
        <div>
            {/* --- HERO SECTION --- */}
            <div className="relative h-[50vh] flex items-center justify-center text-center px-4">
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-image.jpg')" }}></div>
                {/* 1. Updated overlay for light/dark mode */}
                <div className="absolute inset-0 bg-slate-900/30 dark:bg-black/60 backdrop-blur-sm"></div>
                <div className="relative z-10 w-full">
                    {/* Hero text should remain white/light for contrast */}
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight hero-text-glow">
                        Find Your Dream Home
                    </h1>
                    {/* 2. Updated hero subtext color */}
                    <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
                        The premier rental listings on the digital frontier.
                    </p>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                        <SearchBar onSearch={handleSearch} placeholder={placeholderText} initialQuery={searchTerm} />
                        <button
                            onClick={handleNearbySearch}
                            disabled={isLocating || !user}
                            // 3. Updated button to use accent colors
                            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-accent-color text-white font-semibold rounded-lg shadow-md hover:bg-accent-hover-color transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaMapMarkerAlt />
                            {isLocating ? 'Locating...' : 'Find Near Me'}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- LISTINGS SECTION --- */}
            <div className="max-w-7xl mx-auto py-12 px-4">
                <div className="flex justify-between items-center mb-8">
                    {/* 4. Updated heading to use text-color */}
                    <h2 className="text-3xl font-bold text-text-color">
                        {isNearbySearch ? 'Listings Near You' : 'Available Listings'}
                    </h2>
                    {isNearbySearch && (
                        <button
                            onClick={clearNearbySearch}
                            // 5. Updated "Clear" button to be theme-aware
                            className="flex items-center gap-2 px-4 py-2 bg-card-color border border-border-color text-text-color rounded-lg hover:bg-border-color transition-colors"
                        >
                            <FaTimes />
                            Clear Nearby Search
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => <ListingCardSkeleton key={i} />)}
                    </div>
                ) : (
                    listings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {listings
                                .filter(Boolean) 
                                .map(listing => (
                                    <ListingCard key={listing._id} listing={listing} />
                                ))
                            }
                        </div>
                    ) : (
                        // 6. Updated "No listings" box to be theme-aware
                        <div className="text-center py-12 bg-card-color rounded-lg border border-border-color">
                            <h3 className="text-2xl font-bold text-text-color">System Clear</h3>
                            <p className="text-subtle-text-color mt-2">No listings found.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default HomePage;
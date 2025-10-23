import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getListings } from '../services/api';
import ListingCard from '../components/ListingCard';
import SearchBar from '../components/SearchBar';
import ListingCardSkeleton from '../components/ListingCardSkeleton';
import { toast } from 'react-toastify';

const HomePage = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    const fetchListings = useCallback(async (query) => {
        setLoading(true);
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
        if (!user) {
            toast.info('Please log in or register to search for listings.');
            navigate('/login');
            return;
        }
        setSearchTerm(query);
    };

    const placeholderText = user ? "Search by location or keyword..." : "Log in to search for listings";

    return (
        <div>
            <div className="relative h-[50vh] flex items-center justify-center text-center px-4">
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-image.jpg')" }}></div>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                <div className="relative z-10 w-full">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight hero-text-glow">
                        Find Your Dream Home
                    </h1>
                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                        The premier rental listings on the digital frontier.
                    </p>
                    {/* --- THIS IS THE LINE THAT WAS MISSING --- */}
                    <SearchBar onSearch={handleSearch} placeholder={placeholderText} initialQuery={searchTerm} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-12 px-4">
                <h2 className="text-3xl font-bold text-white mb-8">Available Listings</h2>
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
                        <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-800">
                            <h3 className="text-2xl font-bold text-white">System Clear</h3>
                            <p className="text-slate-400 mt-2">No listings found that match your query.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default HomePage;
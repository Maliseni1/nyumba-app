import React, { useState, useEffect } from 'react';
import { getRecommendedListings } from '../services/api';
import ListingCard from './ListingCard';
import { toast } from 'react-toastify';
import { FaMagic } from 'react-icons/fa';

const RecommendedListings = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                const { data } = await getRecommendedListings();
                setRecommendations(data);
            } catch (error) {
                toast.error("Could not fetch recommendations.");
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    if (loading) {
        return (
            <div>
                {/* --- 1. UPDATED CLASSES --- */}
                <h2 className="text-3xl font-bold text-text-color mb-6 flex items-center gap-3">
                    <FaMagic className="text-accent-color" />
                    Just For You
                </h2>
                <p className="text-subtle-text-color">Finding recommendations...</p>
            </div>
        );
    }

    if (recommendations.length === 0) {
        // Don't show anything if there are no recommendations
        return null; 
    }

    return (
        <div>
             {/* --- 2. UPDATED CLASSES --- */}
            <h2 className="text-3xl font-bold text-text-color mb-6 flex items-center gap-3">
                <FaMagic className="text-accent-color" />
                Just For You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map(listing => (
                    <ListingCard key={listing._id} listing={listing} />
                ))}
            </div>
        </div>
    );
};

export default RecommendedListings;
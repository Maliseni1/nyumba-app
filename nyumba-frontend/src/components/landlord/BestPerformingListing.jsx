import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaQuestionCircle, FaTrophy } from 'react-icons/fa';

const BestPerformingListing = ({ listings = [] }) => {
    const bestListing = useMemo(() => {
        // ... (calculation logic is unchanged)
        if (!listings || listings.length === 0) {
            return null;
        }
        return listings.reduce((best, current) => {
            const currentScore = (current.analytics?.views || 0) + (current.analytics?.inquiries || 0) * 5;
            const bestScore = (best.analytics?.views || 0) + (best.analytics?.inquiries || 0) * 5;
            return currentScore > bestScore ? current : best;
        });
    }, [listings]);

    if (!bestListing) {
        return null;
    }

    return (
        // --- 1. UPDATED CARD ---
        <div className="bg-card-color border border-border-color rounded-lg overflow-hidden">
            {/* --- 2. UPDATED HEADER --- */}
            <div className="p-4 bg-bg-color border-b border-border-color">
                <h3 className="text-xl font-bold text-text-color flex items-center gap-2">
                    <FaTrophy className="text-yellow-400" /> {/* Semantic color is fine */}
                    Best Performing Listing
                </h3>
            </div>
            <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                    <img 
                        src={bestListing.images[0]} 
                        alt={bestListing.title}
                        className="w-full sm:w-48 h-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                        {/* --- 3. UPDATED TEXT --- */}
                        <h4 className="text-2xl font-bold text-text-color">{bestListing.title}</h4>
                        <p className="text-lg text-accent-color font-semibold mt-1">
                            K{bestListing.price.toLocaleString()}/month
                        </p>
                        <div className="flex items-center gap-6 text-subtle-text-color mt-4">
                            <span className="flex items-center gap-2 text-lg" title="Total Views">
                                <FaEye /> {bestListing.analytics?.views || 0}
                            </span>
                            <span className="flex items-center gap-2 text-lg" title="Total Inquiries">
                                <FaQuestionCircle /> {bestListing.analytics?.inquiries || 0}
                            </span>
                        </div>
                        <Link 
                            to={`/listing/${bestListing._id}`} 
                            // --- 4. UPDATED LINK ---
                            className="mt-4 inline-block text-accent-color hover:text-accent-hover-color font-semibold"
                        >
                            View Listing &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BestPerformingListing;
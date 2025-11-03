import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaQuestionCircle, FaTrophy } from 'react-icons/fa';

const BestPerformingListing = ({ listings = [] }) => {
    // useMemo will find the best listing only when the listings data changes
    const bestListing = useMemo(() => {
        if (!listings || listings.length === 0) {
            return null;
        }

        // We score each listing by views (x1) and inquiries (x5)
        // You can change these weights (e.g., inquiries * 10)
        return listings.reduce((best, current) => {
            const currentScore = (current.analytics?.views || 0) + (current.analytics?.inquiries || 0) * 5;
            const bestScore = (best.analytics?.views || 0) + (best.analytics?.inquiries || 0) * 5;

            return currentScore > bestScore ? current : best;
        });
    }, [listings]);

    if (!bestListing) {
        return null; // Don't render anything if there are no listings
    }

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <div className="p-4 bg-slate-800/50 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaTrophy className="text-yellow-400" />
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
                        <h4 className="text-2xl font-bold text-white">{bestListing.title}</h4>
                        <p className="text-lg text-sky-400 font-semibold mt-1">
                            K{bestListing.price.toLocaleString()}/month
                        </p>
                        <div className="flex items-center gap-6 text-slate-300 mt-4">
                            <span className="flex items-center gap-2 text-lg" title="Total Views">
                                <FaEye /> {bestListing.analytics?.views || 0}
                            </span>
                            <span className="flex items-center gap-2 text-lg" title="Total Inquiries">
                                <FaQuestionCircle /> {bestListing.analytics?.inquiries || 0}
                            </span>
                        </div>
                        <Link 
                            to={`/listing/${bestListing._id}`} 
                            className="mt-4 inline-block text-sky-400 hover:text-sky-300 font-semibold"
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
import React, { useState, useEffect, useCallback } from 'react';
import { getListingReviews } from '../services/api';
import { toast } from 'react-toastify';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';

const ListingReviews = ({ listingId, ownerId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await getListingReviews(listingId);
            setReviews(data);
        } catch (error) {
            toast.error('Could not load reviews.');
        } finally {
            setLoading(false);
        }
    }, [listingId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const isOwner = currentUser && currentUser._id === ownerId;
    const hasReviewed = reviews.some(r => r.user?._id === currentUser?._id);
    const canReview = currentUser && !isOwner && !hasReviewed;

    return (
        <div className="mt-12 pt-8 border-t border-slate-800">
            <h2 className="text-3xl font-bold text-white mb-6">Reviews</h2>
            {loading && <p className="text-slate-400">Loading reviews...</p>}

            {/* --- Review List --- */}
            {!loading && reviews.length === 0 && (
                <p className="text-slate-400">This listing has no reviews yet.</p>
            )}
            {!loading && reviews.length > 0 && (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="flex gap-4">
                            <img 
                                src={review.user.profilePicture} 
                                alt={review.user.name} 
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-white">{review.user.name}</h4>
                                    <span className="text-xs text-slate-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <StarRating rating={review.rating} />
                                <p className="text-slate-300 mt-2">{review.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- Review Form --- */}
            {canReview && (
                <ReviewForm listingId={listingId} onReviewSubmitted={fetchReviews} />
            )}
            {currentUser && isOwner && (
                <p className="text-slate-400 mt-8">You cannot review your own listing.</p>
            )}
            {currentUser && !isOwner && hasReviewed && (
                <p className="text-slate-400 mt-8">You have already reviewed this listing.</p>
            )}
        </div>
    );
};

export default ListingReviews;
import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { createListingReview } from '../services/api';
import { toast } from 'react-toastify';

const ReviewForm = ({ listingId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        // ... (function is unchanged)
        e.preventDefault();
        if (rating === 0 || comment.trim() === '') {
            toast.error('Please provide a rating and a comment.');
            return;
        }
        setLoading(true);
        try {
            await createListingReview(listingId, { rating, comment });
            toast.success('Review submitted successfully!');
            setRating(0);
            setComment('');
            onReviewSubmitted();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8">
            {/* --- 1. UPDATED TEXT --- */}
            <h3 className="text-2xl font-bold text-text-color mb-4">Leave a Review</h3>
            <div className="mb-4">
                {/* --- 2. UPDATED TEXT --- */}
                <p className="text-subtle-text-color mb-2">Your Rating:</p>
                <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            // --- 3. UPDATED EMPTY STAR COLOR ---
                            className={`cursor-pointer h-6 w-6 ${
                                (hoverRating || rating) >= star 
                                ? 'text-yellow-400' // Filled star (semantic yellow)
                                : 'text-slate-300 dark:text-slate-600' // Empty star (theme-aware)
                            }`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        />
                    ))}
                </div>
            </div>
            <div className="mb-4">
                {/* --- 4. UPDATED TEXT --- */}
                <label htmlFor="comment" className="block text-subtle-text-color mb-2">Your Comment:</label>
                <textarea
                    id="comment"
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    // --- 5. UPDATED INPUT ---
                    className="w-full p-3 bg-bg-color border border-border-color rounded-md text-text-color focus:outline-none focus:ring-2 focus:ring-accent-color"
                    placeholder="Share your experience with this property and landlord..."
                ></textarea>
            </div>
            <button
                type="submit"
                disabled={loading}
                // --- 6. UPDATED BUTTON ---
                className="bg-accent-color text-white px-6 py-2 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color"
            >
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm;
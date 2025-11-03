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
            onReviewSubmitted(); // This tells the parent to refresh the review list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Leave a Review</h3>
            <div className="mb-4">
                <p className="text-slate-300 mb-2">Your Rating:</p>
                <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            className={`cursor-pointer h-6 w-6 ${
                                (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-slate-600'
                            }`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        />
                    ))}
                </div>
            </div>
            <div className="mb-4">
                <label htmlFor="comment" className="block text-slate-300 mb-2">Your Comment:</label>
                <textarea
                    id="comment"
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Share your experience with this property and landlord..."
                ></textarea>
            </div>
            <button
                type="submit"
                disabled={loading}
                className="bg-sky-500 text-white px-6 py-2 rounded-md hover:bg-sky-600 transition-colors disabled:bg-slate-600"
            >
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm;
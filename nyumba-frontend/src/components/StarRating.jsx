import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, numReviews }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push(<FaStar key={i} className="text-yellow-400" />);
        } else if (i - 0.5 <= rating) {
            stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
        } else {
            stars.push(<FaRegStar key={i} className="text-yellow-400" />);
        }
    }

    return (
        <div className="flex items-center gap-1">
            {stars}
            {numReviews !== undefined && (
                <span className="text-slate-400 text-sm ml-1">({numReviews})</span>
            )}
        </div>
    );
};

export default StarRating;
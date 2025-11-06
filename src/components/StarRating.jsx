import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 20, interactive = false, onRatingChange = null }) {
    const [hoverRating, setHoverRating] = React.useState(0);

    const handleMouseEnter = (index) => {
        if (interactive) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const handleClick = (index) => {
        if (interactive && onRatingChange) {
            onRatingChange(index);
        }
    };

    const getStarColor = (index) => {
        const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;
        
        if (currentRating >= index) {
            return 'fill-yellow-400 text-yellow-400';
        } else if (currentRating > index - 1) {
            // Partial star
            return 'fill-yellow-200 text-yellow-200';
        } else {
            return 'fill-gray-200 text-gray-200';
        }
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((index) => (
                <Star
                    key={index}
                    size={size}
                    className={`${getStarColor(index)} ${
                        interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
                    }`}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(index)}
                />
            ))}
        </div>
    );
}
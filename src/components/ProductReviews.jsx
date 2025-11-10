import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import StarRating from './StarRating';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ProductReviews({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('recent');
    const [expandedImages, setExpandedImages] = useState({});
    const [currentPage, setCurrentPage] = useState(0);

    const REVIEWS_PER_PAGE = 4;

    useEffect(() => {
        loadReviews();
    }, [productId, sortBy]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/reviews/product/${productId}?sortBy=${sortBy}`
            );

            if (response.data.success) {
                setReviews(response.data.reviews);
                setStatistics(response.data.statistics);
                setCurrentPage(0); // Reset to first page when sorting changes
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (reviewId, isHelpful) => {
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
            toast.error('Please login to vote on reviews');
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${reviewId}/vote`,
                { isHelpful: isHelpful },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Vote recorded!');
                loadReviews();
            }
        } catch (error) {
            console.error('Error voting:', error);
            toast.error(error.response?.data?.message || 'Failed to record vote');
        }
    };

    const toggleImageExpand = (reviewId, imageIndex) => {
        setExpandedImages(prev => ({
            ...prev,
            [`${reviewId}-${imageIndex}`]: !prev[`${reviewId}-${imageIndex}`]
        }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return date.toLocaleDateString();
    };

    const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
    
    const nextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    const prevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    const currentReviews = reviews.slice(
        currentPage * REVIEWS_PER_PAGE,
        (currentPage + 1) * REVIEWS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="w-full p-8 text-center">
                <p className="text-gray-600">Loading reviews...</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-lg shadow-md p-6">
            {/* Statistics Section */}
            {statistics && (
                <div className="mb-8 pb-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-[#645430] mb-6">
                        Customer Reviews
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Average Rating */}
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-[#645430]">
                                    {statistics.averageRating}
                                </div>
                                <StarRating rating={statistics.averageRating} size={24} />
                                <p className="text-sm text-[#c9a961] mt-2">
                                    {statistics.totalReviews} {statistics.totalReviews === 1 ? 'review' : 'reviews'}
                                </p>
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = statistics.ratingDistribution[rating];
                                const percentage = statistics.totalReviews > 0
                                    ? (count / statistics.totalReviews * 100).toFixed(0)
                                    : 0;

                                return (
                                    <div key={rating} className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600 w-12">
                                            {rating} ⭐
                                        </span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-yellow-400 h-2.5 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600 w-8 text-right">
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Sort Controls */}
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#645430]">
                    {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </h3>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#c9a961] focus:border-transparent"
                >
                    <option value="recent">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="rating-high">Highest Rating</option>
                    <option value="rating-low">Lowest Rating</option>
                </select>
            </div>

            {/* Reviews Grid or Empty State */}
            {reviews.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                </div>
            ) : (
                <>
                    {/* Reviews Grid Section */}
                    <div className="relative mb-6">
                        {/* Navigation Buttons */}
                        {totalPages > 1 && (
                            <>
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 0}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white shadow-lg rounded-full p-3 hover:bg-orange-50 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Previous reviews"
                                >
                                    <ChevronLeft size={24} className="text-[#c9a961]" />
                                </button>
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages - 1}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white shadow-lg rounded-full p-3 hover:bg-orange-50 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Next reviews"
                                >
                                    <ChevronRight size={24} className="text-[#c9a961]" />
                                </button>
                            </>
                        )}

                        {/* Reviews Grid - 4 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {currentReviews.map((review) => (
                                <div
                                    key={review.reviewId}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow flex flex-col h-full"
                                >
                                    {/* Review Header */}
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-gray-800 text-sm">
                                                {review.customerName}
                                            </span>
                                            {review.isVerifiedPurchase && (
                                                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                    <Shield size={10} />
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <StarRating rating={review.rating} size={16} />
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(review.createdAt)}
                                        </span>
                                        {review.adminLiked && (
                                            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                                ❤️ Staff Pick
                                            </span>
                                        )}
                                    </div>

                                    {/* Review Comment */}
                                    <p className="text-gray-700 text-sm mb-3 flex-grow line-clamp-4">
                                        {review.comment}
                                    </p>

                                    {/* Review Images */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            {review.images.slice(0, 2).map((image, index) => {
                                                const isExpanded = expandedImages[`${review.reviewId}-${index}`];
                                                
                                                return (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={image}
                                                            alt={`Review image ${index + 1}`}
                                                            className={`rounded-lg cursor-pointer transition-all ${
                                                                isExpanded ? 'fixed inset-0 z-50 w-auto h-auto max-w-4xl max-h-screen m-auto' : 'w-16 h-16 object-cover'
                                                            }`}
                                                            onClick={() => toggleImageExpand(review.reviewId, index)}
                                                        />
                                                        {isExpanded && (
                                                            <div 
                                                                className="fixed inset-0 bg-black bg-opacity-75 z-40"
                                                                onClick={() => toggleImageExpand(review.reviewId, index)}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {review.images.length > 2 && (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-600">
                                                    +{review.images.length - 2}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Helpful Votes */}
                                    <div className="flex items-center gap-3 text-xs pt-3 border-t border-gray-200 mt-auto">
                                        <span className="text-gray-600">Helpful?</span>
                                        <button
                                            onClick={() => handleVote(review.reviewId, true)}
                                            className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
                                        >
                                            <ThumbsUp size={14} />
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => handleVote(review.reviewId, false)}
                                            className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                                        >
                                            <ThumbsDown size={14} />
                                            No
                                        </button>
                                        {review.helpfulCount > 0 && (
                                            <span className="text-gray-600 ml-auto">
                                                ({review.helpfulCount})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination Info & Dots */}
                    {totalPages > 1 && (
                        <div className="flex flex-col items-center gap-4 mt-6">
                            {/* Page Info */}
                            <p className="text-sm text-gray-600">
                                Showing {currentPage * REVIEWS_PER_PAGE + 1} - {Math.min((currentPage + 1) * REVIEWS_PER_PAGE, reviews.length)} of {reviews.length} reviews
                            </p>
                            
                            {/* Pagination Dots */}
                            <div className="flex justify-center gap-2">
                                {Array.from({ length: totalPages }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPage(index)}
                                        className={`w-3 h-3 rounded-full transition-all ${
                                            index === currentPage
                                                ? 'bg-[#c9a961] w-8'
                                                : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                        aria-label={`Go to page ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
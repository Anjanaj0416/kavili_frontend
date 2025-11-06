import React, { useState, useEffect } from 'react';
import { Star, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import axios from 'axios';

export default function FeaturedReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const navigate = useNavigate();

    const REVIEWS_PER_PAGE = 4;

    useEffect(() => {
        loadFeaturedReviews();
    }, []);

    const loadFeaturedReviews = async () => {
        try {
            setLoading(true);
            
            const productsResponse = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/products`
            );
            const products = productsResponse.data;

            const allReviews = [];
            
            for (const product of products.slice(0, 10)) {
                try {
                    const reviewsResponse = await axios.get(
                        `${import.meta.env.VITE_BACKEND_URL}/api/reviews/product/${product.productId}`
                    );
                    
                    if (reviewsResponse.data.success && reviewsResponse.data.reviews.length > 0) {
                        const topReviews = reviewsResponse.data.reviews
                            .filter(review => review.rating === 5 || review.adminLiked)
                            .map(review => ({
                                ...review,
                                productName: product.productName,
                                productImage: product.images[0],
                                productCategory: product.category,
                                productId: product.productId
                            }));
                        
                        allReviews.push(...topReviews);
                    }
                } catch (error) {
                    console.error(`Error loading reviews for product ${product.productId}:`, error);
                }
            }

            const sortedReviews = allReviews
                .sort((a, b) => {
                    if (b.rating !== a.rating) return b.rating - a.rating;
                    return b.helpfulCount - a.helpfulCount;
                })
                .slice(0, 20);

            setReviews(sortedReviews);
        } catch (error) {
            console.error('Error loading featured reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
    
    const nextPage = () => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
    };

    const prevPage = () => {
        setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const goToProduct = (category, productId) => {
        navigate(`/category/${category}/productInfo/${productId}`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="w-full py-12 bg-gradient-to-r from-orange-50 to-yellow-50">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-600">Loading reviews...</p>
                </div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return null;
    }

    const currentReviews = reviews.slice(
        currentPage * REVIEWS_PER_PAGE,
        (currentPage + 1) * REVIEWS_PER_PAGE
    );

    return (
        <div className="w-full py-16 bg-gradient-to-r from-orange-50 to-yellow-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                        What Our Customers Say
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Real reviews from verified purchases
                    </p>
                </div>

                {/* Reviews Grid */}
                <div className="relative">
                    {/* Navigation Buttons */}
                    {totalPages > 1 && (
                        <>
                            <button
                                onClick={prevPage}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white shadow-lg rounded-full p-3 hover:bg-orange-50 transition-colors z-10"
                                aria-label="Previous reviews"
                            >
                                <ChevronLeft size={24} className="text-orange-600" />
                            </button>
                            <button
                                onClick={nextPage}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white shadow-lg rounded-full p-3 hover:bg-orange-50 transition-colors z-10"
                                aria-label="Next reviews"
                            >
                                <ChevronRight size={24} className="text-orange-600" />
                            </button>
                        </>
                    )}

                    {/* Reviews Grid - 4 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {currentReviews.map((review, index) => (
                            <div
                                key={`${review.reviewId}-${index}`}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow flex flex-col h-full"
                            >
                                {/* Rating */}
                                <div className="mb-3">
                                    <StarRating rating={review.rating} size={20} />
                                </div>

                                {/* Review Text */}
                                <p className="text-gray-700 text-sm mb-4 flex-grow line-clamp-4 italic">
                                    "{review.comment}"
                                </p>

                                {/* Review Images */}
                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {review.images.slice(0, 2).map((image, imgIndex) => (
                                            <img
                                                key={imgIndex}
                                                src={image}
                                                alt={`Review image ${imgIndex + 1}`}
                                                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                            />
                                        ))}
                                        {review.images.length > 2 && (
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-600">
                                                +{review.images.length - 2}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reviewer Info */}
                                <div className="border-t border-gray-200 pt-3 mt-auto">
                                    <p className="font-semibold text-gray-800 text-sm mb-1">
                                        {review.customerName}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1">
                                            {review.isVerifiedPurchase && (
                                                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                    <Shield size={10} />
                                                    Verified
                                                </span>
                                            )}
                                            {review.adminLiked && (
                                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                                    ❤️ Staff Pick
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(review.createdAt)}
                                    </p>
                                </div>

                                {/* Product Info */}
                                <button
                                    onClick={() => goToProduct(review.productCategory, review.productId)}
                                    className="mt-3 flex items-center gap-2 p-2 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors w-full"
                                >
                                    {review.productImage && (
                                        <img
                                            src={review.productImage}
                                            alt={review.productName}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                    )}
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-xs text-gray-600">Reviewed Product</p>
                                        <p className="font-semibold text-sm text-gray-800 truncate">
                                            {review.productName}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination Dots */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentPage(index)}
                                className={`w-3 h-3 rounded-full transition-all ${
                                    index === currentPage
                                        ? 'bg-orange-600 w-8'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label={`Go to page ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="text-center mt-12">
                    <p className="text-gray-700 mb-4">
                        Join thousands of happy customers!
                    </p>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                    >
                        Shop Now
                    </button>
                </div>
            </div>
        </div>
    );
}
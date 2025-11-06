import React, { useState, useEffect } from 'react';
import { Trash2, Heart, Star, Shield, Eye } from 'lucide-react';
import StarRating from '../components/StarRating';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminReviewManagement() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [likeLoading, setLikeLoading] = useState(null);
    const [statusFilter, setStatusFilter] = useState('active');
    const [expandedImages, setExpandedImages] = useState({});
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        // Verify admin is logged in on component mount
        const adminToken = localStorage.getItem('adminToken');
        console.log('Admin token check:', adminToken ? 'Token exists' : 'No token');
        
        if (!adminToken) {
            setAuthError(true);
            setLoading(false);
            toast.error('Please login as admin first');
        } else {
            loadReviews();
        }
    }, [statusFilter]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            setAuthError(false);
            const adminToken = localStorage.getItem('adminToken');

            console.log('Loading reviews with token:', adminToken?.substring(0, 20) + '...');

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/reviews?status=${statusFilter}`,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                }
            );

            console.log('Reviews loaded successfully:', response.data);

            if (response.data.success) {
                setReviews(response.data.reviews);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            console.error('Error response:', error.response?.data);
            
            if (error.response && error.response.status === 401) {
                setAuthError(true);
                toast.error('Authentication failed. Please logout and login again.');
            } else {
                toast.error('Failed to load reviews: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            setDeleteLoading(reviewId);
            const adminToken = localStorage.getItem('adminToken');

            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${reviewId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Review deleted successfully');
                loadReviews();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error(error.response?.data?.message || 'Failed to delete review');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleToggleLike = async (reviewId) => {
        try {
            setLikeLoading(reviewId);
            const adminToken = localStorage.getItem('adminToken');

            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${reviewId}/admin-like`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                loadReviews();
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            toast.error(error.response?.data?.message || 'Failed to update review');
        } finally {
            setLikeLoading(null);
        }
    };

    const toggleImageExpand = (reviewId, imageIndex) => {
        setExpandedImages(prev => ({
            ...prev,
            [`${reviewId}-${imageIndex}`]: !prev[`${reviewId}-${imageIndex}`]
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl">Loading reviews...</div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full h-full overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Review Management</h1>
                <p className="text-gray-600 mt-2">Manage customer reviews and ratings</p>
            </div>

            {/* Filter */}
            <div className="mb-6 flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                    <option value="active">Active Reviews</option>
                    <option value="deleted">Deleted Reviews</option>
                </select>
                <span className="text-gray-600 ml-auto">
                    Total: {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-600">No {statusFilter} reviews found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div
                            key={review.reviewId}
                            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                        >
                            {/* Review Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    {/* Product Info */}
                                    <div className="flex items-center gap-3 mb-3">
                                        {review.productImage && (
                                            <img
                                                src={review.productImage}
                                                alt={review.productName}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {review.productName}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Product ID: {review.productId}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-medium text-gray-700">
                                            {review.customerName}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            📞 {review.customerPhone}
                                        </span>
                                        {review.isVerifiedPurchase && (
                                            <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                <Shield size={12} />
                                                Verified Purchase
                                            </span>
                                        )}
                                        {review.adminLiked && (
                                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                                ❤️ Admin Loved
                                            </span>
                                        )}
                                    </div>

                                    {/* Rating and Date */}
                                    <div className="flex items-center gap-3">
                                        <StarRating rating={review.rating} size={16} />
                                        <span className="text-sm text-gray-600">
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleLike(review.reviewId)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            review.adminLiked
                                                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                        disabled={likeLoading === review.reviewId}
                                        title={review.adminLiked ? 'Unlike review' : 'Like review'}
                                    >
                                        <Heart
                                            size={20}
                                            className={review.adminLiked ? 'fill-current' : ''}
                                        />
                                    </button>

                                    {statusFilter === 'active' && (
                                        <button
                                            onClick={() => handleDeleteReview(review.reviewId)}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                            disabled={deleteLoading === review.reviewId}
                                            title="Delete review"
                                        >
                                            {deleteLoading === review.reviewId ? (
                                                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 size={20} />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Review Content */}
                            <div className="mb-4">
                                <p className="text-gray-700">{review.comment}</p>
                            </div>

                            {/* Review Images */}
                            {review.images && review.images.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex gap-2 flex-wrap">
                                        {review.images.map((image, index) => {
                                            const isExpanded = expandedImages[`${review.reviewId}-${index}`];
                                            
                                            return (
                                                <div key={index}>
                                                    <img
                                                        src={image}
                                                        alt={`Review image ${index + 1}`}
                                                        className={`rounded-lg cursor-pointer transition-all ${
                                                            isExpanded ? 'w-full max-w-2xl' : 'w-24 h-24 object-cover'
                                                        }`}
                                                        onClick={() => toggleImageExpand(review.reviewId, index)}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Review Stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
                                <span>
                                    Helpful Votes: {review.helpfulCount}
                                </span>
                                <span>
                                    Order ID: {review.orderId}
                                </span>
                                <span>
                                    Review ID: {review.reviewId}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
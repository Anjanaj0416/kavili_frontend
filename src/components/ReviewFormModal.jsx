import React, { useState } from 'react';
import { X, Upload, Star, Trash2 } from 'lucide-react';
import StarRating from './StarRating';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ReviewFormModal({ isOpen, onClose, productId, productName, orderId, onReviewSubmitted }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        
        if (images.length + files.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error(`${file.name} is too large. Maximum size is 5MB`);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (comment.trim().length < 10) {
            toast.error('Review must be at least 10 characters long');
            return;
        }

        setIsSubmitting(true);

        try {
            const authToken = localStorage.getItem('authToken');
            
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/reviews`,
                {
                    productId: productId,
                    orderId: orderId,
                    rating: rating,
                    comment: comment.trim(),
                    images: images
                },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                toast.success('Review submitted successfully!');
                
                // Reset form
                setRating(0);
                setComment('');
                setImages([]);
                
                // Notify parent component
                if (onReviewSubmitted) {
                    onReviewSubmitted();
                }
                
                onClose();
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[#4a3728]">Write a Review</h2>
                        <p className="text-sm text-[#c9a961]">{productName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isSubmitting}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-[#645430] mb-2">
                            Your Rating *
                        </label>
                        <div className="flex items-center gap-2">
                            <StarRating
                                rating={rating}
                                size={32}
                                interactive={true}
                                onRatingChange={setRating}
                            />
                            {rating > 0 && (
                                <span className="text-sm text-gray-600">
                                    {rating} {rating === 1 ? 'star' : 'stars'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-[#645430] mb-2">
                            Your Review * (minimum 10 characters)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={5}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#c9a961] focus:border-transparent"
                            placeholder="Share your experience with this product..."
                            disabled={isSubmitting}
                            required
                        />
                        <p className="text-xs text-[#c9a961] mt-1">
                            {comment.length} characters
                        </p>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-[#645430] mb-2">
                            Add Photos (Optional - Max 5, 5MB each)
                        </label>
                        
                        {images.length < 5 && (
                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#c9a961] transition-colors">
                                <div className="text-center">
                                    <Upload className="mx-auto text-[#c9a961] mb-2" size={32} />
                                    <p className="text-sm text-[#c9a961]">
                                        Click to upload images
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={isSubmitting}
                                />
                            </label>
                        )}

                        {/* Image Preview */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-5 gap-2 mt-3">
                                {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={image}
                                            alt={`Review image ${index + 1}`}
                                            className="w-full h-20 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            disabled={isSubmitting}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#c9a961] text-white rounded-lg hover:bg-[#645430] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
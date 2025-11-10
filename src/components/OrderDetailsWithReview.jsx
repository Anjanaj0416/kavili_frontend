// src/components/orderDetails.jsx - ADD REVIEW BUTTON FOR DELIVERED ORDERS

import React, { useState } from 'react';
import { Package, MapPin, Calendar, Phone, MessageSquare, Star } from 'lucide-react';
import ReviewFormModal from './ReviewFormModal';

export default function OrderDetailsWithReview({ order, userDetails }) {
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleWriteReview = (product) => {
        setSelectedProduct(product);
        setShowReviewModal(true);
    };

    const handleReviewSubmitted = () => {
        // Optionally refresh order details or show success message
        console.log('Review submitted successfully');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const calculateTotal = () => {
        return order.orderedItems.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "bg-orange-100 text-orange-800";
            case "accepted": return "bg-green-100 text-green-800";
            case "preparing": return "bg-yellow-100 text-yellow-800";
            case "shipped": return "bg-blue-100 text-blue-800";
            case "delivered": return "bg-green-100 text-green-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Order Header */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Order #{order.orderId}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Placed on {formatDate(order.date)}
                        </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>
            </div>

            {/* Customer Details */}
            {userDetails && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Name</p>
                            <p className="font-medium">{userDetails.firstName} {userDetails.lastName || ''}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Phone</p>
                            <p className="font-medium">{userDetails.phonenumber}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Address</p>
                            <p className="font-medium">{userDetails.homeaddress}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Information */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Delivery Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600">Delivery Method</p>
                        <p className="font-medium">
                            {order.deliveryOption === 'delivery' ? 'Home Delivery' : 'Pickup'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600">WhatsApp</p>
                        <p className="font-medium">{order.whatsappNumber}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Preferred Day</p>
                        <p className="font-medium">{order.preferredDay}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Preferred Time</p>
                        <p className="font-medium">{order.preferredTime}</p>
                    </div>
                    {order.deliveryOption === 'delivery' && order.nearestTownOrCity && (
                        <div>
                            <p className="text-gray-600">Nearest City</p>
                            <p className="font-medium">{order.nearestTownOrCity}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Ordered Items */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Order Items
                </h3>
                <div className="space-y-4">
                    {order.orderedItems.map((item, index) => (
                        <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            {item.image && (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded"
                                />
                            )}
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-800">{item.name}</h4>
                                <p className="text-sm text-gray-600">
                                    Quantity: {item.quantity} × Rs. {item.price.toFixed(2)}
                                </p>
                                <p className="text-sm font-semibold text-gray-800 mt-1">
                                    Subtotal: Rs. {(item.quantity * item.price).toFixed(2)}
                                </p>
                                
                                {/* Write Review Button - Only show for delivered orders */}
                                {order.status === 'delivered' && (
                                    <button
                                        onClick={() => handleWriteReview(item)}
                                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#c9a961] text-white rounded-lg hover:bg-[#645430] transition-colors text-sm"
                                    >
                                        <Star size={16} />
                                        Write Review
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Total */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Order Total:</span>
                    <span className="text-2xl font-bold text-[#c9a961]">
                        Rs. {calculateTotal().toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Review Modal */}
            {selectedProduct && (
                <ReviewFormModal
                    isOpen={showReviewModal}
                    onClose={() => {
                        setShowReviewModal(false);
                        setSelectedProduct(null);
                    }}
                    productId={selectedProduct.productId}
                    productName={selectedProduct.name}
                    orderId={order.orderId}
                    onReviewSubmitted={handleReviewSubmitted}
                />
            )}
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Phone, LogOut, Calendar, RefreshCw, ShoppingBag, User, Home, Edit2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReviewFormModal from '../components/ReviewFormModal';

export default function MyOrders() {
    const navigate = useNavigate();
    
    // States
    const [orders, setOrders] = useState([]);
    const [userDetails, setUserDetails] = useState(null);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [currentView, setCurrentView] = useState('checking'); // checking, no-auth, orders, order-details
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [expandedOrders, setExpandedOrders] = useState({});
    
    // Review states
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        checkAuthAndLoadOrders();
    }, []);

    const checkAuthAndLoadOrders = async () => {
        const authToken = localStorage.getItem('authToken');
        const userDetailsString = localStorage.getItem('userDetails');

        if (!authToken || !userDetailsString) {
            setCurrentView('no-auth');
            setOrdersLoading(false);
            return;
        }

        try {
            // Verify token and load orders
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/my-orders`,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );

            if (response.data.success) {
                setOrders(response.data.orders);
                setUserDetails(JSON.parse(userDetailsString));
                setCurrentView('orders');
            } else {
                handleAuthError();
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                handleAuthError();
            } else {
                toast.error('Failed to load orders');
                setCurrentView('no-auth');
            }
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleAuthError = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userDetails');
        setCurrentView('no-auth');
        toast.error('Session expired. Please login again.');
    };

    const handleRefreshOrders = () => {
        setOrdersLoading(true);
        checkAuthAndLoadOrders();
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userDetails');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    const handleBackToShopping = () => {
        navigate('/products');
    };

    const toggleOrderExpand = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const handleWriteReview = (product, orderId) => {
        setSelectedProduct(product);
        setSelectedOrderId(orderId);
        setShowReviewModal(true);
    };

    const handleReviewSubmitted = () => {
        toast.success('Thank you for your review!');
        // Optionally refresh orders to update review status
        handleRefreshOrders();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateOrderTotal = (items) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "bg-orange-100 text-orange-800 border-orange-300";
            case "accepted": return "bg-green-100 text-green-800 border-green-300";
            case "preparing": return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "shipped": return "bg-blue-100 text-blue-800 border-blue-300";
            case "delivered": return "bg-green-100 text-green-800 border-green-300";
            case "cancelled": return "bg-red-100 text-red-800 border-red-300";
            default: return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getDeliveryBadge = (deliveryOption) => {
        return deliveryOption === "pickup" 
            ? "bg-[#c9a961] bg-opacity-20 text-[#4a3728]" 
            : "bg-purple-100 text-purple-800";
    };

    // Loading state
    if (ordersLoading) {
        return (
            <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center pt-24">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-[#c9a961]  mx-auto mb-4" />
                    <p className="text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    // Not authenticated view
    if (currentView === 'no-auth') {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center pt-24 px-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <Package className="w-16 h-16 text-[#c9a961] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Login Required
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Please login to view your orders and order history.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={handleGoToLogin}
                            className="w-full bg-[#c9a961] text-white py-2 px-4 rounded-md hover:bg-[#b8915a] transition-colors duration-200"
                        >
                            Login to View Orders
                        </button>

                        <button
                            onClick={handleBackToShopping}
                            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Orders view
    return (
        <div className="min-h-screen bg-[#f5f1e8] pt-24">
            {/* Header with user info and sign out */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                <Package className="w-8 h-8 mr-3 text-[#c9a961]" />
                                My Orders
                            </h1>
                            {userDetails && (
                                <p className="text-gray-600 mt-1">
                                    Welcome back, {userDetails.firstName} {userDetails.lastName}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleRefreshOrders}
                                className="px-4 py-2 bg-[#c9a961] bg-opacity-20 text-[#c9a961] rounded-md hover:bg-opacity-30 transition-colors"
                                disabled={ordersLoading}
                            >
                                {ordersLoading ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Details Card */}
            {userDetails && (
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Account Information</h2>
                            <button
                                onClick={() => navigate('/profile')}
                                className="bg-[#c9a961] text-white px-8 py-3 rounded-lg hover:bg-[#b8915a] transition-colors flex flex-row items-center"
                            >
                                <Edit2 className="w-4 h-4 mr-2 " />
                                Edit Details
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center">
                                <User className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{userDetails.firstName} {userDetails.lastName}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{userDetails.phonenumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Home className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="font-medium">{userDetails.homeaddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Section */}
            <div className="max-w-6xl mx-auto px-4 py-6 pb-12">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
                        <p className="text-gray-500 mb-6">
                            You haven't placed any orders yet. Start shopping to see your orders here!
                        </p>
                        <button
                            onClick={handleBackToShopping}
                            className="bg-[#c9a961] text-white px-6 py-3 rounded-lg hover:bg-[#b8915a] transition-colors"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">Your Orders ({orders.length})</h2>
                        </div>

                        {orders.map((order) => {
                            const isExpanded = expandedOrders[order.orderId];
                            
                            return (
                                <div key={order.orderId || order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    {/* Order Header */}
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-semibold text-gray-800">
                                                        Order #{order.orderId || 'N/A'}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                        {(order.status || 'preparing').charAt(0).toUpperCase() + (order.status || 'preparing').slice(1)}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDeliveryBadge(order.deliveryOption)}`}>
                                                        {order.deliveryOption === 'pickup' ? '📦 Pickup' : '🚚 Delivery'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {formatDate(order.date)}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Package className="w-4 h-4 mr-1" />
                                                        {order.orderedItems.length} {order.orderedItems.length === 1 ? 'item' : 'items'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleOrderExpand(order.orderId)}
                                                className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Order Details */}
                                    {isExpanded && (
                                        <div className="p-6">
                                            {/* Order Items */}
                                            <div className="mb-6">
                                                <h4 className="font-semibold text-gray-800 mb-4">Order Items:</h4>
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
                                                                <h5 className="font-medium text-gray-800">{item.name}</h5>
                                                                <p className="text-sm text-gray-600">
                                                                    Quantity: {item.quantity} × Rs. {item.price.toFixed(2)}
                                                                </p>
                                                                <p className="text-sm font-semibold text-gray-800 mt-1">
                                                                    Subtotal: Rs. {(item.quantity * item.price).toFixed(2)}
                                                                </p>
                                                                
                                                                {/* Write Review Button - Only for delivered orders */}
                                                                {order.status === 'delivered' && (
                                                                    <button
                                                                        onClick={() => handleWriteReview(item, order.orderId)}
                                                                        className="mt-2 flex items-center gap-1 text-xs text-[#c9a961] hover:text-[#b8915a] transition-colors"
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

                                            {/* Delivery Information */}
                                            <div className="border-t border-gray-200 pt-4">
                                                <h4 className="font-semibold text-gray-800 mb-3">Delivery Information:</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Delivery Address</p>
                                                        <p className="font-medium">{order.address}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">WhatsApp Number</p>
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

                                            {/* Order Total */}
                                            <div className="border-t border-gray-200 mt-4 pt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-semibold text-gray-800">Order Total:</span>
                                                    <span className="text-2xl font-bold text-[#c9a961]">
                                                        Rs. {calculateOrderTotal(order.orderedItems).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {selectedProduct && (
                <ReviewFormModal
                    isOpen={showReviewModal}
                    onClose={() => {
                        setShowReviewModal(false);
                        setSelectedProduct(null);
                        setSelectedOrderId(null);
                    }}
                    productId={selectedProduct.productId}
                    productName={selectedProduct.name}
                    orderId={selectedOrderId}
                    onReviewSubmitted={handleReviewSubmitted}
                />
            )}
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Phone, Home, Package, Calendar, Clock, MapPin, LogOut } from 'lucide-react';

export default function MyOrders() {
    const [currentView, setCurrentView] = useState('loading'); // 'loading', 'prompt', 'login', 'orders'
    const [authToken, setAuthToken] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Authentication data management
    const storeAuthData = (token, userData) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userDetails', JSON.stringify(userData));
    };

    const getAuthData = () => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userDetails');
        return {
            token,
            userData: userData ? JSON.parse(userData) : null
        };
    };

    const clearAuthData = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userDetails');
    };

    // Check authentication on component mount
    useEffect(() => {
        const checkAuth = async () => {
            const { token, userData } = getAuthData();
            
            if (token && userData) {
                try {
                    // Verify token is still valid by making a test request
                    const response = await axios.get('http://localhost:3000/api/users/my-orders', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    // Token is valid
                    setAuthToken(token);
                    setUserDetails(userData);
                    setCurrentView('orders');
                } catch (error) {
                    // Token is invalid or expired
                    clearAuthData();
                    setCurrentView('prompt');
                }
            } else {
                // No token found
                setCurrentView('prompt');
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Fetch orders when authenticated
    useEffect(() => {
        if (currentView === 'orders' && authToken) {
            fetchOrders();
        }
    }, [currentView, authToken]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/users/my-orders', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (response.data.success) {
                setOrders(response.data.orders);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                // Token expired, redirect to login
                handleLogout();
            } else {
                setError('Failed to fetch orders');
            }
        }
    };

    const handleLoginSuccess = (token, userData) => {
        setAuthToken(token);
        setUserDetails(userData);
        storeAuthData(token, userData);
        setCurrentView('orders');
        setError(null);
    };

    const handleLogout = () => {
        setAuthToken(null);
        setUserDetails(null);
        setOrders([]);
        clearAuthData();
        setCurrentView('prompt');
        setError(null);
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    const handleBackToShopping = () => {
        navigate('/');
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'preparing':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'shipped':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    // Loading screen
    if (loading) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Prompt to login (when not authenticated)
    if (currentView === 'prompt') {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <Package className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">My Orders</h2>
                    <p className="text-gray-600 mb-6">
                        Please log in to view your order history and track your purchases.
                    </p>
                    
                    <div className="space-y-3">
                        <button
                            onClick={handleGoToLogin}
                            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors duration-200"
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
                    
                    <div className="mt-4 p-4 bg-blue-50 rounded-md">
                        <p className="text-xs text-blue-700">
                            <strong>New customer?</strong> Your account will be created automatically when you make your first order.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Orders view (when authenticated)
    if (currentView === 'orders') {
        return (
            <div className="min-h-screen bg-orange-50 pt-24">
                {/* Header with user info and sign out */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                    <Package className="w-8 h-8 mr-3 text-orange-500" />
                                    My Orders
                                </h1>
                                {userDetails && (
                                    <p className="text-gray-600 mt-2">
                                        Welcome back, {userDetails.firstName} {userDetails.lastName}
                                    </p>
                                )}
                            </div>
                            
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors duration-200"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Customer Details Card */}
                    {userDetails && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2 text-orange-500" />
                                Account Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-gray-700">
                                        <strong>Name:</strong> {userDetails.firstName} {userDetails.lastName || ''}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-gray-700">
                                        <strong>Phone:</strong> {userDetails.phonenumber}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Home className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-gray-700">
                                        <strong>Address:</strong> {userDetails.homeaddress}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Orders List */}
                    {orders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
                            <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                            <button
                                onClick={handleBackToShopping}
                                className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors duration-200"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Orders ({orders.length})</h2>
                            
                            {orders.map((order) => (
                                <div key={order.orderId} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    Order #{order.orderId}
                                                </h3>
                                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {new Date(order.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${order.deliveryOption === 'delivery' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-green-100 text-green-800 border-green-300'}`}>
                                                    {order.deliveryOption === 'delivery' ? 'Delivery Order' : 'Pickup Order'}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Order Items */}
                                            <div>
                                                <h4 className="text-md font-semibold text-gray-800 mb-3">Items Ordered</h4>
                                                <div className="space-y-3">
                                                    {order.orderedItems.map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                                            <div className="flex-1">
                                                                <h5 className="font-medium text-gray-800">{item.name}</h5>
                                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-gray-800">Rs. {item.price}</p>
                                                                <p className="text-xs text-gray-500">each</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Order Details */}
                                            <div>
                                                <h4 className="text-md font-semibold text-gray-800 mb-3">Order Details</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center text-sm">
                                                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                                        <span className="text-gray-700">
                                                            <strong>Contact:</strong> {order.phone}
                                                        </span>
                                                    </div>
                                                    {order.whatsappNumber && (
                                                        <div className="flex items-center text-sm">
                                                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                                            <span className="text-gray-700">
                                                                <strong>WhatsApp:</strong> {order.whatsappNumber}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center text-sm">
                                                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                                        <span className="text-gray-700">
                                                            <strong>Preferred Time:</strong> {order.preferredTime}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                                        <span className="text-gray-700">
                                                            <strong>Preferred Day:</strong> {order.preferredDay}
                                                        </span>
                                                    </div>
                                                    {order.deliveryOption === 'delivery' && order.nearestTownOrCity && (
                                                        <div className="flex items-center text-sm">
                                                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                                            <span className="text-gray-700">
                                                                <strong>Delivery Area:</strong> {order.nearestTownOrCity}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center text-sm">
                                                        <Home className="w-4 h-4 mr-2 text-gray-500" />
                                                        <span className="text-gray-700">
                                                            <strong>Address:</strong> {order.address}
                                                        </span>
                                                    </div>
                                                    {order.notes && (
                                                        <div className="text-sm">
                                                            <strong>Notes:</strong> {order.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleBackToShopping}
                            className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors duration-200"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
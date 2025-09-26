import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { User, Phone, Home, Package, Calendar, Clock, MapPin, LogOut, ShoppingBag, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyOrders() {
    const [currentView, setCurrentView] = useState('loading'); // 'loading', 'prompt', 'orders'
    const [authToken, setAuthToken] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const location = useLocation();

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
            // Check if coming from successful login
            if (location.state?.loginSuccess) {
                toast.success(`Welcome back, ${location.state.user?.firstName || 'User'}!`);
            }

            const { token, userData } = getAuthData();
            
            if (token && userData) {
                try {
                    // Verify token is still valid by making a test request
                    const response = await axios.get(
                        import.meta.env.VITE_BACKEND_URL + '/api/users/my-orders', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    // Token is valid
                    setAuthToken(token);
                    setUserDetails(userData);
                    setCurrentView('orders');
                    
                    // Set orders if response contains them
                    if (response.data.success && response.data.orders) {
                        setOrders(response.data.orders);
                    }
                } catch (error) {
                    console.error('Token validation error:', error);
                    // Token is invalid or expired
                    clearAuthData();
                    setCurrentView('prompt');
                    toast.error('Your session has expired. Please log in again.');
                }
            } else {
                // No token found
                setCurrentView('prompt');
            }
            setLoading(false);
        };

        checkAuth();
    }, [location]);

    // Fetch orders when authenticated
    useEffect(() => {
        if (currentView === 'orders' && authToken && orders.length === 0) {
            fetchOrders();
        }
    }, [currentView, authToken]);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(
                import.meta.env.VITE_BACKEND_URL + '/api/users/my-orders', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (response.data.success) {
                setOrders(response.data.orders || []);
                if (response.data.orders?.length === 0) {
                    toast.info('No orders found. Start shopping to see your orders here!');
                }
            } else {
                setError(response.data.message || 'Failed to fetch orders');
                toast.error(response.data.message || 'Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                // Token expired, redirect to login
                handleLogout();
                toast.error('Your session has expired. Please log in again.');
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to fetch orders';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleLoginSuccess = (token, userData) => {
        setAuthToken(token);
        setUserDetails(userData);
        storeAuthData(token, userData);
        setCurrentView('orders');
        setError(null);
        setOrders([]); // Reset orders to trigger fetch
        toast.success(`Welcome back, ${userData.firstName}!`);
    };

    const handleLogout = () => {
        setAuthToken(null);
        setUserDetails(null);
        setOrders([]);
        clearAuthData();
        setCurrentView('prompt');
        setError(null);
        toast.success('Logged out successfully');
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    const handleBackToShopping = () => {
        navigate('/products');
    };

    const handleRefreshOrders = () => {
        setOrders([]);
        fetchOrders();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
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

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Date not available';
        }
    };

    const calculateOrderTotal = (orderedItems) => {
        if (!orderedItems || !Array.isArray(orderedItems)) return 0;
        return orderedItems.reduce((total, item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return total + (price * quantity);
        }, 0);
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
                                    <p className="text-gray-600 mt-1">
                                        Welcome back, {userDetails.firstName} {userDetails.lastName}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleRefreshOrders}
                                    className="px-4 py-2 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition-colors"
                                    disabled={ordersLoading}
                                >
                                    {ordersLoading ? 'Refreshing...' : 'Refresh'}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
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
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
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

                {/* Error display */}
                {error && (
                    <div className="max-w-6xl mx-auto px-4 mb-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {/* Orders Loading */}
                {ordersLoading && (
                    <div className="max-w-6xl mx-auto px-4 text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your orders...</p>
                    </div>
                )}

                {/* Orders List */}
                {!ordersLoading && (
                    <div className="max-w-6xl mx-auto px-4 pb-8">
                        {orders.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
                                <p className="text-gray-500 mb-6">
                                    You haven't placed any orders yet. Start shopping to see your orders here!
                                </p>
                                <button
                                    onClick={handleBackToShopping}
                                    className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">Your Orders ({orders.length})</h2>
                                </div>
                                
                                {orders.map((order) => (
                                    <div key={order.orderId || order._id} className="bg-white rounded-lg shadow-md p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    Order #{order.orderId || 'N/A'}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Placed on {formatDate(order.date)}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                                {order.status || 'Preparing'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Delivery</p>
                                                    <p className="font-medium capitalize">{order.deliveryOption || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Preferred Date & Time</p>
                                                    <p className="font-medium">
                                                        {order.preferredDay || 'N/A'} at {order.preferredTime || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <h4 className="font-medium text-gray-800 mb-2">Order Items:</h4>
                                            {order.orderedItems && order.orderedItems.length > 0 ? (
                                                <div className="space-y-2">
                                                    {order.orderedItems.map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <span className="text-gray-600">
                                                                {item.name} x {item.quantity}
                                                            </span>
                                                            <span className="font-medium">
                                                                Rs. {((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="border-t pt-2 mt-2">
                                                        <div className="flex justify-between items-center font-semibold">
                                                            <span>Total:</span>
                                                            <span className="text-orange-600">
                                                                Rs. {calculateOrderTotal(order.orderedItems).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">No items found</p>
                                            )}
                                        </div>

                                        {order.notes && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600">
                                                    <strong>Notes:</strong> {order.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return null;
}
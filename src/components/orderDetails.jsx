import React, { useState, useEffect } from 'react';
import { Package, User, Phone, MapPin, Calendar, Eye, Home, LogOut, XCircle } from 'lucide-react';
import {
    fetchUserOrders,
    fetchOrderDetails,
    getStatusIconConfig, // Changed from getStatusIcon
    getStatusColor,
    calculateOrderTotal,
    formatDate,
    clearAuthData
} from '../utils/myOrdersFunction';

const OrderDetails = ({ authToken, userDetails, onLogout }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);

    // Helper function to render status icon
    const renderStatusIcon = (status) => {
        const { Icon, className } = getStatusIconConfig(status);
        return <Icon className={className} />;
    };

    // Fetch user orders
    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            setLoading(true);
            const result = await fetchUserOrders(authToken);

            if (result.success) {
                setOrders(result.data.orders || []);
            } else {
                setError(result.error || 'Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOrderDetails = async (orderId) => {
        try {
            const result = await fetchOrderDetails(orderId, authToken);

            if (result.success) {
                setSelectedOrder(result.data.order);
                setShowOrderDetails(true);
            } else {
                setError(result.error || 'Failed to fetch order details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            setError('Network error. Please try again.');
        }
    };

    const handleLogout = () => {
        clearAuthData();
        onLogout();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-orange-100">
            <div className="w-full h-[300px]  bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        {/* Main spice pile */}
                        <div className="absolute right-50 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                        <div className="absolute right-48 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-80"></div>


                        {/* Additional spice piles */}
                        <div className="absolute left-50 top-1/3 w-48 h-48 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full opacity-60"></div>
                        <div className="absolute left-70 top-2/3 w-40 h-40 bg-gradient-to-br from-red-500 to-orange-600 rounded-full opacity-50"></div>
                        <div className="absolute left-[300px] top-1/2 w-56 h-56 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-40"></div>
                    </div>
                </div>
                <div className="w-full h-full flex items-center justify-center my-9">
                    <span className="text-6xl font-bold text-white flex text-center  "> My Orders</span>
                </div>

            </div>

            {/* Header */}
            <div className="bg-orange-500 text-white py-4">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2"></h1>

                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
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
                            Customer Details
                        </h2>
                        <div className="flex flex-col gap-4">
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
                                    <strong>Address:</strong> {userDetails.homeaddress || 'Not provided'}
                                </span>
                            </div>

                        </div>
                        <div className="flex justify-end mt-4">
                        <button
                            onClick={handleLogout}
                            className="bg-orange-600 bg-opacity-20 hover:bg-opacity-30 text-orange-600 px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </button>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Orders List */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-orange-500" />
                            Order History ({orders.length})
                        </h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                            <p>Start exploring our delicious spices and place your first order!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {orders.map((order) => (
                                <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-2">
                                                <span className="text-lg font-semibold text-gray-800 mr-4">
                                                    Order #{order.orderId}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} flex items-center`}>
                                                    {renderStatusIcon(order.status)}
                                                    <span className="ml-2 capitalize">{order.status}</span>
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    {formatDate(order.date)}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    {order.deliveryOption === 'pickup' ? 'Store Pickup' : 'Delivery'}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Package className="w-4 h-4 mr-2" />
                                                    {order.orderedItems.length} item(s)
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <span className="font-medium">
                                                        Total: LKR {calculateOrderTotal(order.orderedItems).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Order Items Preview */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {order.orderedItems.slice(0, 3).map((item, index) => (
                                                    <div key={index} className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-6 h-6 rounded mr-2 object-cover"
                                                            />
                                                        )}
                                                        <span className="text-sm text-gray-700">
                                                            {item.name} x{item.quantity}
                                                        </span>
                                                    </div>
                                                ))}
                                                {order.orderedItems.length > 3 && (
                                                    <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
                                                        <span className="text-sm text-gray-700">
                                                            +{order.orderedItems.length - 3} more
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 lg:mt-0 lg:ml-6">
                                            <button
                                                onClick={() => handleOrderDetails(order._id)}
                                                className="w-full lg:w-auto bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Order Details - #{selectedOrder.orderId}
                                </h2>
                                <button
                                    onClick={() => setShowOrderDetails(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Order Status and Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)} flex items-center`}>
                                                {renderStatusIcon(selectedOrder.status)}
                                                <span className="ml-2 capitalize">{selectedOrder.status}</span>
                                            </span>
                                        </div>
                                        <p><strong>Order Date:</strong> {formatDate(selectedOrder.date)}</p>
                                        <p><strong>Delivery:</strong> {selectedOrder.deliveryOption === 'pickup' ? 'Store Pickup' : 'Delivery'}</p>
                                        <p><strong>Preferred Day:</strong> {selectedOrder.preferredDay}</p>
                                        <p><strong>Preferred Time:</strong> {selectedOrder.preferredTime}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                                    <div className="space-y-2">
                                        <p><strong>Name:</strong> {selectedOrder.name}</p>
                                        <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                                        <p><strong>WhatsApp:</strong> {selectedOrder.whatsappNumber}</p>
                                        {selectedOrder.deliveryOption === 'delivery' && (
                                            <>
                                                <p><strong>Address:</strong> {selectedOrder.address}</p>
                                                <p><strong>City:</strong> {selectedOrder.nearestTownOrCity}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.orderedItems.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-12 h-12 rounded-lg mr-4 object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                                                    <p className="text-sm text-gray-600">LKR {item.price} each</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">Qty: {item.quantity}</p>
                                                <p className="text-sm text-gray-600">
                                                    LKR {(item.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Total */}
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total Amount:</span>
                                        <span className="text-orange-600">
                                            LKR {calculateOrderTotal(selectedOrder.orderedItems).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;
import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null); // Track which order is being deleted

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/orders");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setOrders(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to fetch orders. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Refresh orders after status update
            fetchOrders();
        } catch (err) {
            console.error("Error updating order status:", err);
            alert("Failed to update order status");
        }
    };

    const deleteOrder = async (orderId, orderNumber) => {
        // Show confirmation dialog
        const confirmed = window.confirm(
            `Are you sure you want to delete Order #${orderNumber}? This action cannot be undone.`
        );
        
        if (!confirmed) return;

        try {
            setDeleteLoading(orderId);
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Remove the order from the local state instead of refetching all orders
            setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
            
            // Show success message
            alert("Order deleted successfully!");
        } catch (err) {
            console.error("Error deleting order:", err);
            alert("Failed to delete order. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    const calculateOrderTotal = (orderedItems) => {
        return orderedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "preparing":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "shipped":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "delivered":
                return "bg-green-100 text-green-800 border-green-300";
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getDeliveryOptionBadge = (deliveryOption) => {
        if (deliveryOption === "pickup") {
            return "bg-orange-100 text-orange-800 border-orange-300";
        } else {
            return "bg-purple-100 text-purple-800 border-purple-300";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl">Loading orders...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full h-full overflow-y-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
                <p className="text-gray-600 mt-2">Total Orders: {orders.length}</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No orders found</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            {/* Order Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-blue-600">
                                        Order #{order.orderId}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(order.date)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDeliveryOptionBadge(order.deliveryOption)}`}>
                                        {order.deliveryOption === "pickup" ? "Pickup Order" : "Delivery Order"}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Customer Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                        Customer Details
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-20">Name:</span>
                                            <span className="text-gray-900">{order.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-20">Phone:</span>
                                            <span className="text-gray-900">📞 {order.phone}</span>
                                        </div>
                                        {order.whatsappNumber && (
                                            <div className="flex items-center">
                                                <span className="font-medium text-gray-700 w-20">WhatsApp:</span>
                                                <span className="text-gray-900">💬 {order.whatsappNumber}</span>
                                            </div>
                                        )}
                                        {order.email && (
                                            <div className="flex items-center">
                                                <span className="font-medium text-gray-700 w-20">Email:</span>
                                                <span className="text-gray-900">📧 {order.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Delivery/Pickup Specific Details */}
                                    {order.deliveryOption === "delivery" ? (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-800">Delivery Information</h4>
                                            <div className="pl-4 space-y-1">
                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700 w-20">Address:</span>
                                                    <span className="text-gray-900">📍 {order.address}</span>
                                                </div>
                                                {order.nearestTownOrCity && (
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 w-20">City:</span>
                                                        <span className="text-gray-900">🏙️ {order.nearestTownOrCity}</span>
                                                    </div>
                                                )}
                                                {order.preferredTime && (
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 w-20">Time:</span>
                                                        <span className="text-gray-900">⏰ {order.preferredTime}</span>
                                                    </div>
                                                )}
                                                {order.preferredDay && (
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 w-20">Date:</span>
                                                        <span className="text-gray-900">📅 {new Date(order.preferredDay).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-800">Pickup Information</h4>
                                            <div className="pl-4 space-y-1">
                                                {order.preferredTime && (
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 w-20">Time:</span>
                                                        <span className="text-gray-900">⏰ {order.preferredTime}</span>
                                                    </div>
                                                )}
                                                {order.preferredDay && (
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 w-20">Date:</span>
                                                        <span className="text-gray-900">📅 {new Date(order.preferredDay).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Order Items */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                        Order Items
                                    </h3>
                                    <div className="space-y-2">
                                        {order.orderedItems.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <span className="font-medium text-gray-900">{item.name}</span>
                                                    <p className="text-sm text-gray-600">
                                                        Quantity: {item.quantity} × LKR {item.price.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="font-semibold text-gray-900">
                                                    LKR {(item.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Order Total */}
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                                            <span className="text-xl font-bold text-green-600">
                                                LKR {calculateOrderTotal(order.orderedItems).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Update and Delete */}
                            <div className="mt-6 flex justify-between items-center border-t pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700">Update Status:</span>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="preparing">Preparing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => deleteOrder(order._id, order.orderId)}
                                        disabled={deleteLoading === order._id}
                                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                            deleteLoading === order._id
                                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                                : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
                                        }`}
                                    >
                                        {deleteLoading === order._id ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                                Deleting...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                🗑️ Delete Order
                                            </span>
                                        )}
                                    </button>
                                </div>
                                
                                <div className="text-sm text-gray-500">
                                    Last updated: {formatDate(order.date)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
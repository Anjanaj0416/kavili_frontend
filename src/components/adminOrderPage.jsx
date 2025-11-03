import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [acceptLoading, setAcceptLoading] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // Try both token storage keys for compatibility
            let token = localStorage.getItem("token") || localStorage.getItem("authToken");
            
            if (!token) {
                setError("No authentication token found. Please login again.");
                setLoading(false);
                return;
            }

            const response = await axios.get(
                import.meta.env.VITE_BACKEND_URL + "/api/orders",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setOrders(response.data.orders);
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching orders:", err);
            if (err.response?.status === 401) {
                setError("Authentication failed. Please login again.");
            } else {
                setError("Failed to fetch orders. Please try again.");
            }
            setLoading(false);
        }
    };

    const acceptOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to accept this order?")) {
            return;
        }

        setAcceptLoading(orderId);
        try {
            // Try both token storage keys for compatibility
            let token = localStorage.getItem("token") || localStorage.getItem("authToken");
            
            if (!token) {
                alert("No authentication token found. Please login again.");
                setAcceptLoading(null);
                return;
            }

            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/accept`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                // Update the local state to reflect the change
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId
                            ? { ...order, status: "accepted" }
                            : order
                    )
                );
                alert("Order accepted successfully!");
            }
        } catch (err) {
            console.error("Error accepting order:", err);
            if (err.response?.status === 401) {
                alert("Authentication failed. Please login again.");
            } else {
                alert(err.response?.data?.message || "Failed to accept order. Please try again.");
            }
        } finally {
            setAcceptLoading(null);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // Try both token storage keys for compatibility
            let token = localStorage.getItem("token") || localStorage.getItem("authToken");
            
            if (!token) {
                alert("No authentication token found. Please login again.");
                return;
            }

            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.order) {
                // Update the local state to reflect the change
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId
                            ? { ...order, status: newStatus }
                            : order
                    )
                );
                alert("Order status updated successfully!");
            }
        } catch (err) {
            console.error("Error updating order status:", err);
            if (err.response?.status === 401) {
                alert("Authentication failed. Please login again.");
            } else {
                alert("Failed to update order status. Please try again.");
            }
        }
    };

    const deleteOrder = async (orderId, orderIdDisplay) => {
        if (!window.confirm(`Are you sure you want to delete order ${orderIdDisplay}?`)) {
            return;
        }

        setDeleteLoading(orderId);
        try {
            // Try both token storage keys for compatibility
            let token = localStorage.getItem("token") || localStorage.getItem("authToken");
            
            if (!token) {
                alert("No authentication token found. Please login again.");
                setDeleteLoading(null);
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Authentication failed. Please login again.");
                }
                throw new Error(`Failed to delete order. Status: ${response.status}`);
            }
            
            // Remove the order from the local state instead of refetching all orders
            setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
            
            // Show success message
            alert("Order deleted successfully!");
        } catch (err) {
            console.error("Error deleting order:", err);
            alert(err.message || "Failed to delete order. Please try again.");
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
            case "pending":
                return "bg-orange-100 text-orange-800 border-orange-300";
            case "accepted":
                return "bg-green-100 text-green-800 border-green-300";
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
                <div className="text-center py-8 text-gray-500">
                    No orders found.
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                        >
                            {/* Order Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        Order #{order.orderId}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(order.date)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getDeliveryOptionBadge(
                                            order.deliveryOption
                                        )}`}
                                    >
                                        {order.deliveryOption === "pickup" ? "Pickup" : "Delivery"}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="border-t pt-4 mb-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Customer Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Name:</p>
                                        <p className="font-medium">{order.firstName} {order.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Phone:</p>
                                        <p className="font-medium">{order.phonenumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">WhatsApp:</p>
                                        <p className="font-medium">{order.whatsappNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Preferred Time:</p>
                                        <p className="font-medium">{order.preferredTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Preferred Day:</p>
                                        <p className="font-medium">{order.preferredDay}</p>
                                    </div>
                                    {order.deliveryOption === "delivery" && order.nearestTownOrCity && (
                                        <div>
                                            <p className="text-gray-600">Nearest Town/City:</p>
                                            <p className="font-medium">{order.nearestTownOrCity}</p>
                                        </div>
                                    )}
                                    {order.deliveryOption === "delivery" && (
                                        <div className="col-span-2">
                                            <p className="text-gray-600">Address:</p>
                                            <p className="font-medium">{order.address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="border-t pt-4 mb-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Order Items</h4>
                                <div className="space-y-2">
                                    {order.orderedItems.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                            <div className="flex items-center gap-3">
                                                {item.image && (
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name} 
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Qty: {item.quantity} × Rs.{item.price.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-semibold">
                                                Rs.{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Total */}
                            <div className="border-t pt-4 mb-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total:</span>
                                    <span>Rs.{calculateOrderTotal(order.orderedItems).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Order Notes */}
                            {order.notes && (
                                <div className="border-t pt-4 mb-4">
                                    <h4 className="font-semibold text-gray-700 mb-2">Order Notes</h4>
                                    <p className="text-sm text-gray-600">{order.notes}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="border-t pt-4 flex gap-2 flex-wrap">
                                {/* Accept Button - Only show for pending orders */}
                                {order.status === "pending" && (
                                    <button
                                        onClick={() => acceptOrder(order._id)}
                                        disabled={acceptLoading === order._id}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {acceptLoading === order._id ? (
                                            <>
                                                <span className="animate-spin">⏳</span>
                                                Accepting...
                                            </>
                                        ) : (
                                            <>
                                                ✓ Accept Order
                                            </>
                                        )}
                                    </button>
                                )}
                                
                                {/* Status Dropdown */}
                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                
                                {/* Delete Button */}
                                <button
                                    onClick={() => deleteOrder(order._id, order.orderId)}
                                    disabled={deleteLoading === order._id}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {deleteLoading === order._id ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
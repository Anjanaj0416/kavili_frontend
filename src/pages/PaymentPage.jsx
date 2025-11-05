import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Package, 
    Calendar, 
    MapPin, 
    Phone, 
    CreditCard, 
    CheckCircle,
    AlertCircle,
    Loader,
    ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/orders/payment/${orderId}`
            );

            if (response.data.success) {
                setOrder(response.data.order);
            } else {
                setError(response.data.message || 'Order not found');
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            setError(err.response?.data?.message || 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!order) return 0;
        return order.orderedItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    const handlePaymentDemo = async () => {
        setPaying(true);
        
        // Simulate payment process (2 seconds delay)
        setTimeout(() => {
            toast.success('🎉 Payment demo completed! In production, this will integrate with PayHere.');
            setPaying(false);
            
            // Show success message and redirect
            setTimeout(() => {
                toast.success('Redirecting to home page...');
                navigate('/');
            }, 2000);
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    const total = calculateTotal();

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-t-xl shadow-lg p-6 border-b-4 border-orange-500">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Payment Invoice</h1>
                            <p className="text-gray-600 mt-1">Order ID: {order.orderId}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Invoice Date</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {new Date(order.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex gap-3">
                        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            Order {order.status}
                        </span>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            order.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            Payment {order.paymentStatus}
                        </span>
                    </div>
                </div>

                {/* Customer & Delivery Info */}
                <div className="bg-white shadow-lg p-6 grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Package className="text-orange-500" size={20} />
                            Customer Details
                        </h3>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Name:</strong> {order.name}</p>
                            <p><strong>Phone:</strong> {order.phone}</p>
                            <p><strong>WhatsApp:</strong> {order.whatsappNumber}</p>
                            {order.email && <p><strong>Email:</strong> {order.email}</p>}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <MapPin className="text-orange-500" size={20} />
                            Delivery Information
                        </h3>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Method:</strong> {order.deliveryOption === 'delivery' ? 'Home Delivery' : 'Pickup'}</p>
                            <p><strong>Address:</strong> {order.address}</p>
                            {order.nearestTownOrCity && <p><strong>City:</strong> {order.nearestTownOrCity}</p>}
                            <p><strong>Preferred Day:</strong> {order.preferredDay}</p>
                            <p><strong>Preferred Time:</strong> {order.preferredTime}</p>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Quantity</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {order.orderedItems.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.image && (
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded-lg"
                                                    />
                                                )}
                                                <span className="font-medium text-gray-800">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-gray-700">{item.quantity}</td>
                                        <td className="px-4 py-4 text-right text-gray-700">
                                            Rs. {item.price.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-800">
                                            Rs. {(item.price * item.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total */}
                    <div className="mt-6 border-t-2 border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-800">Total Amount:</span>
                            <span className="text-3xl font-bold text-orange-600">
                                Rs. {total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="bg-white rounded-b-xl shadow-lg p-6">
                    {order.paymentStatus === 'paid' ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Completed!</h3>
                            <p className="text-gray-600 mb-6">Thank you for your payment. Your order is being processed.</p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="text-yellow-600" size={20} />
                                    <p className="text-yellow-800 font-medium">
                                        This is a demo payment page. In production, clicking "Pay Now" will redirect to PayHere payment gateway.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handlePaymentDemo}
                                    disabled={paying}
                                    className={`w-full flex items-center justify-center gap-3 px-8 py-4 text-white text-lg font-bold rounded-lg transition-all ${
                                        paying
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                                    }`}
                                >
                                    {paying ? (
                                        <>
                                            <Loader className="animate-spin" size={24} />
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={24} />
                                            Pay Now - Rs. {total.toFixed(2)}
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    <ArrowLeft className="inline mr-2" size={20} />
                                    Back to Home
                                </button>
                            </div>

                            <div className="mt-6 text-center text-sm text-gray-500">
                                <p>🔒 Secure payment powered by PayHere (Demo Mode)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
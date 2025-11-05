import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { loadCart, clearCart } from "../utils/cartFunction";
import CartCard from "../components/cartCard";
import OrderConfirmationModal from "../components/OrderConfirmationModal";
import toast from "react-hot-toast";

export default function Cart() {
    const navigate = useNavigate();

    // Cart state
    const [cart, setCart] = useState([]);
    const [cartWithDetails, setCartWithDetails] = useState([]); // New state for cart with product details
    const [total, setTotal] = useState(0);
    const [labelTotal, setLabelTotal] = useState(0);
    const [cartLoading, setCartLoading] = useState(true); // New loading state for cart details

    // Delivery option state
    const [deliveryOption, setDeliveryOption] = useState("pickup");

    // Customer details state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [preferredTime, setPreferredTime] = useState("");
    const [preferredDay, setPreferredDay] = useState("");
    const [nearestCity, setNearestCity] = useState("");
    const [notes, setNotes] = useState("");

    // Loading and status states
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [accountStatus, setAccountStatus] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // NEW: Modal state
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userDetailsString = localStorage.getItem('userDetails');

        if (authToken && userDetailsString) {
            try {
                const userDetails = JSON.parse(userDetailsString);
                
                // Auto-fill form fields with stored user data
                setFirstName(userDetails.firstName || "");
                setLastName(userDetails.lastName || "");
                setPhoneNumber(userDetails.phonenumber || "");
                setWhatsappNumber(userDetails.phonenumber || ""); // Default to same as phone
                setAddress(userDetails.homeaddress || "");
                
                console.log("Auto-filled customer details from logged-in user:", userDetails);
                toast.success(`Welcome back, ${userDetails.firstName}! Your details have been auto-filled.`);
            } catch (error) {
                console.error("Error parsing user details:", error);
            }
        }
    }, []); // Run once on component mount

    // Function to fetch product details for cart items
    const fetchCartDetails = async (cartItems) => {
        if (cartItems.length === 0) {
            setCartWithDetails([]);
            setCartLoading(false);
            return;
        }

        try {
            const detailedCart = [];

            for (const item of cartItems) {
                try {
                    const response = await axios.get(
                        import.meta.env.VITE_BACKEND_URL + `/api/products/${item.productId}`
                    );

                    if (response.data) {
                        detailedCart.push({
                            ...item, // Keep original productId and qty
                            ...response.data, // Add all product details
                            quantity: item.qty, // Ensure quantity is available
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching product ${item.productId}:`, error);
                    // If product doesn't exist, skip it (it will be handled by CartCard component)
                }
            }

            setCartWithDetails(detailedCart);
            setCartLoading(false);
        } catch (error) {
            console.error("Error fetching cart details:", error);
            setCartLoading(false);
        }
    };

    // Load cart on component mount
    useEffect(() => {
        const currentCart = loadCart();
        setCart(currentCart);
        console.log("Loaded cart:", currentCart);

        // Fetch product details for cart items
        fetchCartDetails(currentCart);

        if (currentCart.length > 0) {
            // Get quote for cart items
            axios.post(import.meta.env.VITE_BACKEND_URL + "/api/orders/quote", {
                orderedItems: currentCart
            }).then((res) => {
                console.log("Quote response:", res.data);
                if (res.data.total != null) {
                    setTotal(res.data.total);
                    setLabelTotal(res.data.labelTotal);
                }
            }).catch((err) => {
                console.error("Error getting quote:", err);
            });
        }
    }, []);

    // Handle cart refresh
    const handleCartUpdate = () => {
        const updatedCart = loadCart();
        setCart(updatedCart);

        // Fetch product details for updated cart
        fetchCartDetails(updatedCart);

        if (updatedCart.length > 0) {
            axios.post(import.meta.env.VITE_BACKEND_URL + "/api/orders/quote", {
                orderedItems: updatedCart
            }).then((res) => {
                if (res.data.total != null) {
                    setTotal(res.data.total);
                    setLabelTotal(res.data.labelTotal);
                }
            }).catch((err) => {
                console.error("Error updating quote:", err);
            });
        } else {
            setTotal(0);
            setLabelTotal(0);
        }
    };

    const handleDeliveryOptionChange = (option) => {
        setDeliveryOption(option);
    };

    const onGoBackClick = () => {
        navigate("/products");
    };

    const onCloseOrdersClick = () => {
        if (window.confirm("Are you sure you want to clear your cart?")) {
            clearCart();
            setCart([]);
            setCartWithDetails([]);
            setTotal(0);
            setLabelTotal(0);
            toast.success("Cart cleared successfully");
        }
    };

    // Handle account checking when user types phone number
    const handlePhoneNumberChange = async (e) => {
        const phone = e.target.value;
        setPhoneNumber(phone);

        if (phone.length === 10 && /^\d{10}$/.test(phone)) {
            try {
                const response = await axios.post(
                    import.meta.env.VITE_BACKEND_URL + '/api/users/check-account',
                    { phonenumber: phone }
                );

                if (response.data.exists) {
                    setAccountStatus('existing');
                } else {
                    setAccountStatus('new');
                }
            } catch (error) {
                console.error("Error checking account:", error);
                setAccountStatus(null);
            }
        } else {
            setAccountStatus(null);
        }
    };

    // Validate cart items
    const validateCartItems = (items) => {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            // Check price
            const itemPrice = item.lastPrice || item.price;
            if (!itemPrice || typeof itemPrice !== 'number' || itemPrice <= 0) {
                throw new Error(`Item "${item.productName || item.name || 'Unknown'}" has invalid price. Please refresh the page and try again.`);
            }

            const quantity = Number(item.qty || item.quantity);
            if (!quantity || quantity <= 0) {
                throw new Error(`Item "${item.productName || item.name || 'Unknown'}" has invalid quantity.`);
            }

            if (!item.productId && !item.id) {
                throw new Error(`Item "${item.productName || item.name || 'Unknown'}" is missing product ID.`);
            }
        }
    };

    // Function to handle automatic login/registration during checkout
    const handleAutomaticAuth = async (customerData) => {
        try {
            console.log("Starting automatic authentication with data:", customerData);

            const response = await axios.post(
                import.meta.env.VITE_BACKEND_URL + '/api/users/login-or-register',
                {
                    firstName: customerData.firstName,
                    lastName: customerData.lastName,
                    phonenumber: customerData.phoneNumber,
                    homeaddress: customerData.address
                },
                {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Authentication response:", response.data);

            if (response.data.success && response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userDetails', JSON.stringify(response.data.user));

                if (response.data.isNewUser) {
                    toast.success('🎉 Account created successfully! You are now logged in.');
                } else {
                    toast.success('✅ Welcome back! You have been automatically logged in.');
                }

                return { success: true, token: response.data.token, user: response.data.user, userId: response.data.user.userId };

            } else {
                console.error("Authentication failed:", response.data);
                toast.error(response.data.message || 'Authentication failed');
                return { success: false, error: response.data.message };
            }

        } catch (error) {
            console.error("Authentication error:", error);

            let errorMessage = 'Authentication failed. Please try again.';

            if (error.response) {
                console.error("Server error:", error.response.data);
                errorMessage = error.response.data.message || `Server error (${error.response.status})`;
            } else if (error.request) {
                console.error("Network error:", error.request);
                errorMessage = 'Network error. Please check your connection.';
            } else {
                console.error("Request error:", error.message);
                errorMessage = error.message;
            }

            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // NEW: Function to handle "Place Order" button click (shows modal)
    const handlePlaceOrderClick = async () => {
        // Wait for cart details to load
        if (cartLoading) {
            toast.error("Please wait for cart details to load...");
            return;
        }

        // Validate required fields
        if (!firstName.trim() || !phoneNumber.trim() || !address.trim() ||
            !whatsappNumber.trim() || !preferredTime || !preferredDay) {
            setError("Please fill in all required fields");
            toast.error("Please fill in all required fields");
            return;
        }

        if (deliveryOption === "delivery" && !nearestCity.trim()) {
            setError("Please specify your nearest city for delivery");
            toast.error("Please specify your nearest city for delivery");
            return;
        }

        if (cartWithDetails.length === 0) {
            setError("Your cart is empty");
            toast.error("Your cart is empty");
            return;
        }

        // Validate cart items before proceeding
        try {
            validateCartItems(cartWithDetails);
        } catch (validationError) {
            setError(validationError.message);
            toast.error(validationError.message);
            return;
        }

        // Show confirmation modal
        setShowConfirmationModal(true);
    };

    // NEW: Function to handle order confirmation (called when user clicks "Confirm" in modal)
    const handleOrderConfirmation = async () => {
        console.log("=== CART DEBUGGING ===");
        console.log("Cart with details:", JSON.stringify(cartWithDetails, null, 2));

        try {
            setLoading(true);
            setError("");

            // Prepare customer data
            const customerData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber: phoneNumber.trim(),
                address: `${address.trim()}${nearestCity.trim() ? `, ${nearestCity.trim()}` : ''}`
            };

            console.log("Starting authentication process...");

            // Authenticate or register user first
            const authResult = await handleAutomaticAuth(customerData);

            if (!authResult.success) {
                setError('Failed to authenticate. Please try again.');
                toast.error('Failed to authenticate. Please try again.');
                return;
            }

            console.log("Authentication successful, proceeding with order...");

            // Prepare order data
            const orderData = {
                name: `${firstName.trim()} ${lastName.trim()}`.trim(),
                phone: phoneNumber.trim(),
                address: `${address.trim()}${nearestCity.trim() ? `, ${nearestCity.trim()}` : ''}`,
                deliveryOption: deliveryOption,
                whatsappNumber: whatsappNumber.trim(),
                preferredTime: preferredTime,
                preferredDay: preferredDay,
                nearestTownOrCity: nearestCity.trim() || undefined,
                notes: notes.trim() || undefined,
                orderedItems: cartWithDetails.map((item, index) => {
                    const itemPrice = item.lastPrice || item.price;

                    if (!itemPrice || typeof itemPrice !== 'number') {
                        throw new Error(`Item ${index + 1} has invalid price. Please refresh the page and try again.`);
                    }

                    const quantity = Number(item.qty || item.quantity) || 1;
                    if (quantity <= 0) {
                        throw new Error(`Item ${index + 1} has invalid quantity`);
                    }

                    return {
                        name: item.productName || item.name || 'Unknown Product',
                        price: Number(itemPrice),
                        quantity: quantity,
                        image: item.images?.[0] || item.image || "",
                        productId: item.productId || item.id
                    };
                })
            };

            console.log("Order data before submission:", JSON.stringify(orderData, null, 2));

            if (!orderData.orderedItems || orderData.orderedItems.length === 0) {
                throw new Error("No items in cart");
            }

            // Create the order with authentication token
            const orderResponse = await axios.post(import.meta.env.VITE_BACKEND_URL + '/api/orders/', orderData, {
                headers: {
                    'Authorization': `Bearer ${authResult.token}`
                }
            });

            if (orderResponse.data.success) {
                clearCart();
                setCart([]);
                setCartWithDetails([]);
                setTotal(0);
                setLabelTotal(0);
                setShowConfirmationModal(false);

                toast.success('🎉 Order placed successfully! Redirecting to your orders page...');

                setTimeout(() => {
                    navigate('/myOrders');
                }, 2000);
            } else {
                setError('Order creation failed: ' + orderResponse.data.message);
                toast.error('Order creation failed: ' + orderResponse.data.message);
            }

        } catch (error) {
            console.error('Order submission error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to place order. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* NEW: Order Confirmation Modal */}
            <OrderConfirmationModal
                isOpen={showConfirmationModal}
                onClose={() => setShowConfirmationModal(false)}
                onConfirm={handleOrderConfirmation}
                loading={loading}
            />

            <div className="pt-24 min-h-screen bg-orange-100 flex flex-col">
                <div className="w-[90%] max-w-7xl h-full mx-auto flex flex-col py-8">

                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Cart Loading State */}
                    {cartLoading && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-600">Loading cart details...</p>
                        </div>
                    )}

                    {/* Cart Items Table */}
                    <div className="flex-grow mb-8">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="p-3 text-left">Product</th>
                                        <th className="p-3 text-left">Name</th>
                                        <th className="p-3 text-left">Quantity</th>
                                        <th className="p-3 text-left">Price</th>
                                        <th className="p-3 text-left">Total Price</th>
                                        <th className="p-3 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.length > 0 ? (
                                        cart.map((item) => (
                                            <CartCard
                                                key={item.productId}
                                                productId={item.productId}
                                                qty={item.qty}
                                                onCartUpdate={handleCartUpdate}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center p-8 text-gray-500">
                                                Your cart is empty. <span className="text-orange-600 hover:underline cursor-pointer" onClick={onGoBackClick}>Start shopping!</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Checkout Section */}
                    {cart.length > 0 && (
                        <>
                            {/* Delivery Option Selection */}
                            <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800">Delivery Option</h2>
                                <div className="flex flex-col space-y-3">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="deliveryOption"
                                            value="pickup"
                                            checked={deliveryOption === "pickup"}
                                            onChange={() => handleDeliveryOptionChange("pickup")}
                                            className="mr-3 w-4 h-4 text-orange-600"
                                        />
                                        <span className="text-lg font-medium text-gray-700">Pick-up Order</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="deliveryOption"
                                            value="delivery"
                                            checked={deliveryOption === "delivery"}
                                            onChange={() => handleDeliveryOptionChange("delivery")}
                                            className="mr-3 w-4 h-4 text-orange-600"
                                        />
                                        <span className="text-lg font-medium text-gray-700">Delivery Order</span>
                                    </label>
                                </div>
                            </div>

                            {/* Customer Details Form */}
                            <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800">Customer Details</h2>

                                {/* Account Status Indicator */}
                                {accountStatus && (
                                    <div className={`mb-4 p-3 rounded-lg flex items-center ${accountStatus === 'existing'
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-blue-50 border border-blue-200'
                                        }`}>
                                        <span className={`${accountStatus === 'existing' ? 'text-green-600' : 'text-blue-600'}`}>
                                            {accountStatus === 'existing'
                                                ? '✓ Account found! You will be automatically logged in.'
                                                : '✨ New account will be created for you.'
                                            }
                                        </span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Anjana"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Jayasinghe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={handlePhoneNumberChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="0714289356"
                                            maxLength="10"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number *</label>
                                        <input
                                            type="tel"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="0714289356"
                                            maxLength="10"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                                        <textarea
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="369/1"
                                        />
                                    </div>

                                    {deliveryOption === "delivery" && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nearest Town/City *</label>
                                            <input
                                                type="text"
                                                value={nearestCity}
                                                onChange={(e) => setNearestCity(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                placeholder="Colombo"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                                        <select
                                            value={preferredTime}
                                            onChange={(e) => setPreferredTime(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        >
                                            <option value="">Select time</option>
                                            <option value="morning">Morning (8AM - 12PM)</option>
                                            <option value="afternoon">Afternoon (12PM - 4PM)</option>
                                            <option value="evening">Evening (4PM - 8PM)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                                        <input
                                            type="date"
                                            value={preferredDay}
                                            onChange={(e) => setPreferredDay(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Special Notes (Optional)</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Any special instructions or notes for your order"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800">Order Summary</h2>
                                <div className="space-y-2 text-gray-700">
                                    <div className="flex justify-between">
                                        <span>Items: {cart.length}</span>
                                        <span></span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Original Total:</span>
                                        <span>Rs. {labelTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="text-2xl font-bold text-orange-600 mt-2">
                                        Total: Rs. {total.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between gap-4">
                        <button
                            onClick={onGoBackClick}
                            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Go Back
                        </button>

                        {cart.length > 0 && (
                            <button
                                onClick={onCloseOrdersClick}
                                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Clear Cart
                            </button>
                        )}

                        {cart.length > 0 && !cartLoading && (
                            <button
                                onClick={handlePlaceOrderClick}
                                disabled={loading}
                                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                                    }`}
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
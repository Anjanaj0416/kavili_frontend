import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { loadCart, clearCart, saveCart, deleteItem } from "../utils/cartFunction";
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

    // Verify authentication and auto-fill user details only if truly logged in
    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userDetailsString = localStorage.getItem('userDetails');

        if (authToken && userDetailsString) {
            // Verify token is valid by making an authenticated request to my-orders endpoint
            axios.get(import.meta.env.VITE_BACKEND_URL + '/api/users/my-orders', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })
            .then((response) => {
                if (response.data && response.data.success) {
                    // Token is valid, auto-fill details
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
                } else {
                    // Token invalid, clear stale data
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userDetails');
                    console.log("Invalid token detected, cleared auth data");
                }
            })
            .catch((error) => {
                console.error("Error verifying authentication:", error);
                // If verification fails (401/403), clear potentially stale data
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userDetails');
                    console.log("Invalid/expired token, cleared auth data");
                }
            });
        }
    }, []); // Run once on component mount

    // FIXED: Function to fetch product details for cart items
    const fetchCartDetails = async (cartItems) => {
        if (cartItems.length === 0) {
            setCartWithDetails([]);
            setCartLoading(false);
            return;
        }

        try {
            const detailedCart = [];
            const seenProductIds = new Set(); // Track seen IDs to prevent duplicates

            for (const item of cartItems) {
                try {
                    // Validate that productId exists and is a valid value (not an object)
                    if (!item.productId || typeof item.productId === 'object') {
                        console.error("Invalid cart item - productId is missing or is an object:", item);
                        continue; // Skip this invalid item
                    }

                    // Check for duplicates
                    if (seenProductIds.has(item.productId)) {
                        console.warn(`Duplicate productId found: ${item.productId}, skipping...`);
                        continue;
                    }
                    
                    seenProductIds.add(item.productId);

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
                    // If product doesn't exist, remove it from cart
                    if (error.response && error.response.status === 404) {
                        console.log(`Product ${item.productId} not found, removing from cart`);
                        deleteItem(item.productId);
                    }
                }
            }

            setCartWithDetails(detailedCart);
            setCartLoading(false);
        } catch (error) {
            console.error("Error fetching cart details:", error);
            setCartLoading(false);
        }
    };

    // FIXED: Load cart on component mount with validation
    useEffect(() => {
        const currentCart = loadCart();
        
        // Validate and clean the cart data
        const cleanedCart = currentCart.filter((item) => {
            // Remove items with invalid productId
            if (!item.productId || typeof item.productId === 'object') {
                console.error("Removing invalid cart item:", item);
                return false;
            }
            // Remove items with invalid quantity
            if (!item.qty || typeof item.qty !== 'number' || item.qty <= 0) {
                console.error("Removing cart item with invalid quantity:", item);
                return false;
            }
            return true;
        });
        
        // Remove duplicates based on productId
        const uniqueCart = [];
        const seenIds = new Set();
        
        for (const item of cleanedCart) {
            if (!seenIds.has(item.productId)) {
                seenIds.add(item.productId);
                uniqueCart.push(item);
            } else {
                console.warn("Removing duplicate cart item:", item);
            }
        }
        
        // If cart was cleaned, save the cleaned version
        if (uniqueCart.length !== currentCart.length) {
            saveCart(uniqueCart);
            console.log("Cart was cleaned and saved");
        }
        
        setCart(uniqueCart);
        console.log("Loaded cart:", uniqueCart);

        // Fetch product details for cart items
        fetchCartDetails(uniqueCart);

        if (uniqueCart.length > 0) {
            // Get quote for cart items
            axios.post(import.meta.env.VITE_BACKEND_URL + "/api/orders/quote", {
                orderedItems: uniqueCart
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
                throw new Error(`Item "${item.productName || item.name || 'Unknown'}" has invalid price.`);
            }

            // Check quantity
            const itemQty = item.quantity || item.qty;
            if (!itemQty || typeof itemQty !== 'number' || itemQty <= 0) {
                throw new Error(`Item "${item.productName || item.name || 'Unknown'}" has invalid quantity.`);
            }
        }
    };

    // Function to create order in backend
    const createOrderInBackend = async (orderData) => {
        try {
            const response = await axios.post(
                import.meta.env.VITE_BACKEND_URL + '/api/orders',
                orderData
            );

            if (response.data) {
                return { success: true, data: response.data };
            } else {
                return { success: false, error: 'No data received from server' };
            }
        } catch (error) {
            console.error("Order creation error:", error);

            let errorMessage = 'Failed to place order. Please try again.';

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
                address: `${address.trim()}${nearestCity.trim() ? `, ${nearestCity.trim()}` : ''}`,
                whatsappNumber: whatsappNumber.trim(),
                preferredTime,
                preferredDay,
                notes: notes.trim()
            };

            // Prepare ordered items
            const orderedItems = cartWithDetails.map(item => ({
                productId: item.productId,
                productName: item.productName || item.name,
                qty: item.quantity || item.qty,
                price: item.lastPrice || item.price
            }));

            console.log("Ordered items being sent:", orderedItems);

            // Create order object
            const orderData = {
                orderedItems,
                customerData,
                deliveryOption,
                paymentMethod: 'COD' // Default to Cash on Delivery
            };

            console.log("Complete order data:", JSON.stringify(orderData, null, 2));

            // Create order in backend
            const orderResponse = await createOrderInBackend(orderData);

            if (orderResponse.success) {
                // Clear cart after successful order
                clearCart();
                setCart([]);
                setCartWithDetails([]);
                setTotal(0);
                setLabelTotal(0);

                // Close confirmation modal
                setShowConfirmationModal(false);

                // Show success message
                toast.success('Order placed successfully! Redirecting to your orders page...');

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
                                        cart.map((item, index) => {
                                            // FIXED: Use a combination of productId and index for key to ensure uniqueness
                                            const uniqueKey = `${item.productId}-${index}`;
                                            
                                            return (
                                                <CartCard
                                                    key={uniqueKey}
                                                    productId={item.productId}
                                                    qty={item.qty}
                                                    onCartUpdate={handleCartUpdate}
                                                />
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center p-8">
                                                <div className="flex flex-col items-center gap-4">
                                                    <p className="text-gray-500 text-lg">Your cart is empty. Start shopping to add items!</p>
                                                    <button
                                                        onClick={() => navigate('/products')}
                                                        className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
                                                    >
                                                        Start Shopping
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Only show form if cart has items */}
                    {cart.length > 0 && (
                        <>
                            {/* Delivery Option */}
                            <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-4">Delivery Option</h3>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="delivery"
                                            value="pickup"
                                            checked={deliveryOption === "pickup"}
                                            onChange={() => handleDeliveryOptionChange("pickup")}
                                            className="w-4 h-4"
                                        />
                                        <span>Pickup from Store</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="delivery"
                                            value="delivery"
                                            checked={deliveryOption === "delivery"}
                                            onChange={() => handleDeliveryOptionChange("delivery")}
                                            className="w-4 h-4"
                                        />
                                        <span>Home Delivery</span>
                                    </label>
                                </div>
                            </div>

                            {/* Customer Details Form */}
                            <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-4">Customer Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 font-medium">First Name *</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full p-2 border rounded-lg"
                                            placeholder="Enter your first name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium">Last Name</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full p-2 border rounded-lg"
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium">Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={handlePhoneNumberChange}
                                            className="w-full p-2 border rounded-lg"
                                            placeholder="0771234567"
                                            required
                                        />
                                        {accountStatus === 'existing' && (
                                            <p className="text-sm text-green-600 mt-1">✓ Account found</p>
                                        )}
                                        {accountStatus === 'new' && (
                                            <p className="text-sm text-blue-600 mt-1">New account will be created</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium">WhatsApp Number *</label>
                                        <input
                                            type="tel"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                            className="w-full p-2 border rounded-lg"
                                            placeholder="0771234567"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block mb-2 font-medium">Address *</label>
                                        <textarea
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full p-2 border rounded-lg"
                                            rows="3"
                                            placeholder="Enter your complete address"
                                            required
                                        />
                                    </div>
                                    {deliveryOption === "delivery" && (
                                        <div>
                                            <label className="block mb-2 font-medium">Nearest City *</label>
                                            <input
                                                type="text"
                                                value={nearestCity}
                                                onChange={(e) => setNearestCity(e.target.value)}
                                                className="w-full p-2 border rounded-lg"
                                                placeholder="Enter your nearest city"
                                                required
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block mb-2 font-medium">Preferred Time *</label>
                                        <select
                                            value={preferredTime}
                                            onChange={(e) => setPreferredTime(e.target.value)}
                                            className="w-full p-2 border rounded-lg"
                                            required
                                        >
                                            <option value="">Select time</option>
                                            <option value="morning">Morning (8AM - 12PM)</option>
                                            <option value="afternoon">Afternoon (12PM - 4PM)</option>
                                            <option value="evening">Evening (4PM - 8PM)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium">Preferred Day *</label>
                                        <select
                                            value={preferredDay}
                                            onChange={(e) => setPreferredDay(e.target.value)}
                                            className="w-full p-2 border rounded-lg"
                                            required
                                        >
                                            <option value="">Select day</option>
                                            <option value="weekday">Weekday</option>
                                            <option value="weekend">Weekend</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block mb-2 font-medium">Additional Notes</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full p-2 border rounded-lg"
                                            rows="2"
                                            placeholder="Any special instructions or notes"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
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
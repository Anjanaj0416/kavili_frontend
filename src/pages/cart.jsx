import { useEffect, useState } from "react";

import axios from "axios";
import { loadCart, clearCart, saveCart, deleteItem } from "../utils/cartFunction";
import CartCard from "../components/cartCard";
import OrderConfirmationModal from "../components/OrderConfirmationModal";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from 'react-router-dom';

export default function Cart() {
    const navigate = useNavigate();
    const location = useLocation();

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

    useEffect(() => {
        // Check if user just completed registration and has pending checkout data
        const locationState = location.state;
        const pendingCheckoutData = localStorage.getItem('pendingCheckoutData');

        if (locationState && locationState.fromCheckout && pendingCheckoutData) {
            try {
                const checkoutData = JSON.parse(pendingCheckoutData);

                // Restore checkout form data
                setFirstName(checkoutData.firstName || "");
                setLastName(checkoutData.lastName || "");
                setPhoneNumber(checkoutData.phoneNumber || "");
                setAddress(checkoutData.address || "");
                setWhatsappNumber(checkoutData.whatsappNumber || "");
                setPreferredTime(checkoutData.preferredTime || "");
                setPreferredDay(checkoutData.preferredDay || "");
                setNearestCity(checkoutData.nearestCity || "");
                setNotes(checkoutData.notes || "");
                setDeliveryOption(checkoutData.deliveryOption || "pickup");

                // Clear the pending checkout data
                localStorage.removeItem('pendingCheckoutData');

                // Show success message and prompt to complete order
                toast.success('Welcome! Your checkout details have been restored. Please review and place your order.');

                // Automatically show the confirmation modal after a short delay
                setTimeout(() => {
                    setShowConfirmationModal(true);
                }, 1500);

            } catch (error) {
                console.error('Error restoring checkout data:', error);
                localStorage.removeItem('pendingCheckoutData');
            }
        }
    }, [location]);






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
    }, []);

    // Calculate totals when cartWithDetails changes
    useEffect(() => {
        let tempTotal = 0;
        let tempLabelTotal = 0;

        cartWithDetails.forEach((item) => {
            const itemPrice = item.lastPrice || item.price || 0;
            const itemOriginalPrice = item.price || item.lastPrice || 0;
            const itemQty = item.quantity || item.qty || 0;

            tempTotal += itemPrice * itemQty;
            tempLabelTotal += itemOriginalPrice * itemQty;
        });

        setTotal(tempTotal);
        setLabelTotal(tempLabelTotal);
    }, [cartWithDetails]);

    // Handle cart update (when item is removed)
    const handleCartUpdate = () => {
        const updatedCart = loadCart();
        setCart(updatedCart);
        fetchCartDetails(updatedCart);
    };

    // Navigate to home/products
    const onGoBackClick = () => {
        navigate('/products');
    };

    // Clear the cart
    const onCloseOrdersClick = () => {
        const confirmed = window.confirm("Are you sure you want to clear your cart?");
        if (confirmed) {
            clearCart();
            setCart([]);
            setCartWithDetails([]);
            setTotal(0);
            setLabelTotal(0);
            toast.success("Cart cleared successfully");
        }
    };

    // Handle account checking when user types phone number
    // ✅ CORRECT - Use new endpoint
    const handlePhoneNumberChange = async (e) => {
        const phone = e.target.value;
        setPhoneNumber(phone);

        if (phone.length === 10 && /^\d{10}$/.test(phone)) {
            try {
                const response = await axios.post(
                    import.meta.env.VITE_BACKEND_URL + '/api/users/check-user-by-phone',  // ← FIXED!
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
            // STEP 1: Get the authentication token from localStorage
            const authToken = localStorage.getItem('authToken');

            // STEP 2: Check if user is logged in
            if (!authToken) {
                console.error('No authentication token found');
                toast.error('Please login to place an order');

                // Redirect to login after a short delay
                setTimeout(() => {
                    navigate('/login');
                }, 1500);

                return {
                    success: false,
                    error: 'Authentication required. Please login to place orders.'
                };
            }

            // STEP 3: Prepare headers with authentication
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`  // ← THIS IS CRITICAL
            };

            // Log for debugging
            console.log('Creating order with authentication...');
            console.log('Auth token present:', authToken ? 'Yes' : 'No');
            console.log('Order data:', orderData);

            // STEP 4: Make the API request with headers
            const response = await axios.post(
                import.meta.env.VITE_BACKEND_URL + '/api/orders',
                orderData,
                { headers }  // ← Include headers here
            );

            console.log('Order creation response:', response.data);

            // STEP 5: Handle successful response
            if (response.data) {
                return { success: true, data: response.data };
            } else {
                return { success: false, error: 'No data received from server' };
            }

        } catch (error) {
            console.error("Order creation error:", error);

            let errorMessage = 'Failed to place order. Please try again.';

            // Handle different error types
            if (error.response) {
                // Server responded with an error
                console.error("Server error:", error.response.data);
                console.error("Status code:", error.response.status);

                errorMessage = error.response.data.message || `Server error (${error.response.status})`;

                // Special handling for authentication errors
                if (error.response.status === 401 || error.response.status === 403) {
                    errorMessage = 'Session expired. Please login again.';

                    // Clear invalid token
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userDetails');

                    // Redirect to login
                    toast.error(errorMessage);
                    setTimeout(() => {
                        navigate('/login');
                    }, 1500);

                    return { success: false, error: errorMessage };
                }

            } else if (error.request) {
                // Request was made but no response received
                console.error("Network error:", error.request);
                errorMessage = 'Network error. Please check your internet connection.';

            } else {
                // Something else happened
                console.error("Request error:", error.message);
                errorMessage = error.message;
            }

            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // NEW: Function to handle "Place Order" button click (shows modal)
    // UPDATED: Function to handle "Place Order" button click with AUTO-LOGIN
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

        // NEW CHECKOUT FLOW: Check authentication status
        setIsCheckingOut(true);

        try {
            const authToken = localStorage.getItem('authToken');

            // Case 1: User is already logged in
            if (authToken) {
                console.log("User is already logged in, proceeding with order...");
                setShowConfirmationModal(true);
                setIsCheckingOut(false);
                return;
            }

            // Case 2: User is not logged in - Check if account exists by phone number
            console.log("User not logged in, checking if account exists by phone number...");

            const checkResponse = await axios.post(
                import.meta.env.VITE_BACKEND_URL + '/api/users/check-user-by-phone',
                {
                    phonenumber: phoneNumber.trim()
                }
            );

            if (checkResponse.data.exists) {
                // Case 2a: User exists - Auto-login
                console.log("User exists, attempting auto-login...");
                const userFirstName = checkResponse.data.user.firstName;

                toast.success("Account found! Logging you in...");

                try {
                    // Perform auto-login by calling the login endpoint
                    const loginResponse = await axios.post(
                        import.meta.env.VITE_BACKEND_URL + '/api/users/login',
                        {
                            firstName: userFirstName,
                            phonenumber: phoneNumber.trim()
                        }
                    );

                    if (loginResponse.data.success && loginResponse.data.token) {
                        // Store authentication data
                        localStorage.setItem('authToken', loginResponse.data.token);
                        localStorage.setItem('userDetails', JSON.stringify(loginResponse.data.user));

                        console.log("Auto-login successful!");
                        toast.success(`Welcome back, ${userFirstName}! Proceeding with your order...`);

                        // Show confirmation modal to proceed with order
                        setShowConfirmationModal(true);
                        setIsCheckingOut(false);
                        return;
                    } else {
                        throw new Error("Login failed");
                    }
                } catch (loginError) {
                    console.error("Auto-login error:", loginError);
                    toast.error("Failed to login automatically. Please check your details or login manually.");
                    setIsCheckingOut(false);
                    return;
                }
            } else {
                // Case 2b: User doesn't exist - Navigate to registration
                console.log("User doesn't exist, redirecting to registration...");
                toast.success("Please complete registration to place your order");

                // Store checkout data in localStorage to use after registration
                const checkoutData = {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phoneNumber: phoneNumber.trim(),
                    address: address.trim(),
                    whatsappNumber: whatsappNumber.trim(),
                    preferredTime,
                    preferredDay,
                    nearestCity: nearestCity.trim(),
                    notes: notes.trim(),
                    deliveryOption
                };

                localStorage.setItem('pendingCheckoutData', JSON.stringify(checkoutData));

                // Navigate to registration page with pre-filled data
                navigate('/register', {
                    state: {
                        fromCheckout: true,
                        firstName: firstName.trim(),
                        phonenumber: phoneNumber.trim(),
                        homeaddress: address.trim()
                    }
                });

                setIsCheckingOut(false);
                return;
            }
        } catch (error) {
            console.error("Error during checkout flow:", error);
            if (error.response && error.response.status === 400) {
                toast.error("Please check your phone number and try again.");
            } else {
                toast.error("An error occurred. Please try again.");
            }
            setIsCheckingOut(false);
            return;
        }

        setIsCheckingOut(false);
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
                name: item.productName || item.name,        // ✅ 'name' not 'productName'
                quantity: item.quantity || item.qty,        // ✅ 'quantity' not 'qty'
                price: item.lastPrice || item.price,
                image: item.images && item.images[0] ? item.images[0] : null
            }));

            console.log("Ordered items being sent:", orderedItems);

            const orderData = {
                name: `${firstName.trim()} ${lastName.trim()}`,  // ✅ Combined name
                phone: phoneNumber.trim(),                        // ✅ 'phone' not 'phoneNumber'
                address: `${address.trim()}${nearestCity.trim() ? `, ${nearestCity.trim()}` : ''}`,
                whatsappNumber: whatsappNumber.trim(),
                preferredTime,
                preferredDay,
                nearestTownOrCity: nearestCity.trim() || '',
                notes: notes.trim(),
                deliveryOption,
                paymentMethod: 'COD',
                orderedItems
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
                const errorMsg = orderResponse.error || 'Failed to place order';
                setError('Order creation failed: ' + errorMsg);
                toast.error('Order creation failed: ' + errorMsg);
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
                                                    <p className="text-gray-500 text-lg">Your cart is empty.</p>
                                                    <button
                                                        onClick={onGoBackClick}
                                                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
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

                    {/* Form and Summary Section - Only show when cart has items */}
                    {cart.length > 0 && (
                        <>
                            {/* Delivery Option Section */}
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Delivery Option</h2>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="deliveryOption"
                                            value="pickup"
                                            checked={deliveryOption === "pickup"}
                                            onChange={(e) => setDeliveryOption(e.target.value)}
                                            className="w-4 h-4 text-orange-600"
                                        />
                                        <span>Pickup from Store</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="deliveryOption"
                                            value="delivery"
                                            checked={deliveryOption === "delivery"}
                                            onChange={(e) => setDeliveryOption(e.target.value)}
                                            className="w-4 h-4 text-orange-600"
                                        />
                                        <span>Home Delivery</span>
                                    </label>
                                </div>
                            </div>

                            {/* Customer Details Section */}
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* First Name */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Enter your first name"
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Enter your last name"
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={handlePhoneNumberChange}
                                            placeholder="0771234567"
                                            maxLength="10"
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* WhatsApp Number */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            WhatsApp Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                            placeholder="0771234567"
                                            maxLength="10"
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">
                                            Address <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Enter your complete address"
                                            rows="3"
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    {/* Preferred Time */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Preferred Time <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={preferredTime}
                                            onChange={(e) => setPreferredTime(e.target.value)}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        >
                                            <option value="">Select time</option>
                                            <option value="morning">Morning (8AM - 12PM)</option>
                                            <option value="afternoon">Afternoon (12PM - 4PM)</option>
                                            <option value="evening">Evening (4PM - 8PM)</option>
                                        </select>
                                    </div>

                                    {/* Preferred Delivery Date */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Preferred Delivery Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={preferredDay}
                                            onChange={(e) => setPreferredDay(e.target.value)}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Nearest City (for delivery only) */}
                                    {deliveryOption === "delivery" && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">
                                                Nearest City <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={nearestCity}
                                                onChange={(e) => setNearestCity(e.target.value)}
                                                placeholder="Enter your nearest city"
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}

                                    {/* Additional Notes */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">
                                            Additional Notes
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Any special instructions or notes"
                                            rows="3"
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary Section */}
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">Rs. {labelTotal.toFixed(2)}</span>
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
                                disabled={loading || isCheckingOut}
                                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${loading || isCheckingOut
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                                    }`}
                            >
                                {isCheckingOut ? 'Checking...' : loading ? 'Processing...' : 'Place Order'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
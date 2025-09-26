import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { loadCart, clearCart } from "../utils/cartFunction";
import CartCard from "../components/cartCard";
import toast from "react-hot-toast";

export default function Cart() {
    const navigate = useNavigate();

    // Cart state
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [labelTotal, setLabelTotal] = useState(0);

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
    const [accountStatus, setAccountStatus] = useState(null); // 'existing', 'new', null
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Load cart on component mount
    useEffect(() => {
        const currentCart = loadCart();
        setCart(currentCart);
        console.log("Loaded cart:", currentCart);

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
                toast.error("Failed to calculate total");
            });
        }
    }, []);

    // Function to refresh cart data
    function refreshCart() {
        const updatedCart = loadCart();
        setCart(updatedCart);

        if (updatedCart.length > 0) {
            axios.post(import.meta.env.VITE_BACKEND_URL + "/api/orders/quote", {
                orderedItems: updatedCart
            }).then((res) => {
                if (res.data.total != null) {
                    setTotal(res.data.total);
                    setLabelTotal(res.data.labelTotal);
                }
            }).catch((err) => {
                console.error("Error refreshing quote:", err);
            });
        } else {
            setTotal(0);
            setLabelTotal(0);
        }
    }

    // Function to go back to previous page
    function onGoBackClick() {
        window.history.back();
    }

    // Function to clear all orders
    function onCloseOrdersClick() {
        const confirmClose = window.confirm("Are you sure you want to remove all items from the cart?");
        if (confirmClose) {
            clearCart();
            setCart([]);
            setTotal(0);
            setLabelTotal(0);
            toast.success("Cart cleared successfully");
        }
    }

    // Handle delivery option change
    const handleDeliveryOptionChange = (option) => {
        setDeliveryOption(option);
        if (option === "pickup") {
            setNearestCity(""); // Clear nearest city for pickup orders
        }
    };

    // Function to validate cart items before submission
    const validateCartItems = (cartItems) => {
        for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems[i];
            
            // Check if item has a valid price
            const hasValidPrice = (item.lastPrice && item.lastPrice > 0) || 
                                 (item.price && item.price > 0) || 
                                 (item.originalPrice && item.originalPrice > 0);
            
            if (!hasValidPrice) {
                throw new Error(`Item "${item.productName || item.name || 'Unknown'}" is missing price information. Please remove and re-add this item to your cart.`);
            }
            
            // Check quantity
            const quantity = Number(item.qty || item.quantity);
            if (!quantity || quantity <= 0) {
                throw new Error(`Item "${item.productName || item.name || 'Unknown'}" has invalid quantity.`);
            }
            
            // Check product ID
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
                    phonenumber: customerData.phoneNumber, // Make sure this matches
                    homeaddress: customerData.address
                },
                {
                    timeout: 10000, // 10 second timeout
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Authentication response:", response.data);

            if (response.data.success && response.data.token) {
                // Store authentication data
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userDetails', JSON.stringify(response.data.user));

                // Show appropriate message
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
                // Server responded with error status
                console.error("Server error:", error.response.data);
                errorMessage = error.response.data.message || `Server error (${error.response.status})`;
            } else if (error.request) {
                // Network error
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

    // Updated checkout/order submission function
    const handleOrderSubmission = async () => {
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

        if (cart.length === 0) {
            setError("Your cart is empty");
            toast.error("Your cart is empty");
            return;
        }

        // Validate cart items before proceeding
        try {
            validateCartItems(cart);
        } catch (validationError) {
            setError(validationError.message);
            toast.error(validationError.message);
            return;
        }

        // Add debugging for cart state
        console.log("=== CART DEBUGGING ===");
        console.log("Cart length:", cart.length);
        console.log("Full cart data:", JSON.stringify(cart, null, 2));

        cart.forEach((item, index) => {
            console.log(`\n--- Item ${index + 1} ---`);
            console.log("Product Name:", item.productName || item.name);
            console.log("Product ID:", item.productId || item.id);
            console.log("Price:", item.price);
            console.log("Last Price:", item.lastPrice);
            console.log("Original Price:", item.originalPrice);
            console.log("Quantity:", item.qty || item.quantity);
            console.log("All item keys:", Object.keys(item));
        });
        console.log("=== END CART DEBUG ===\n");

        try {
            setLoading(true);
            setError("");

            // Prepare customer data
            const customerData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber: phoneNumber.trim(),
                address: `${address.trim()}${nearestCity.trim() ? ', ' + nearestCity.trim() : ''}`
            };

            // First, handle authentication (login or register)
            const authResult = await handleAutomaticAuth(customerData);

            if (!authResult.success) {
                setError(authResult.error || authResult.message);
                toast.error(authResult.error || authResult.message);
                setLoading(false);
                return;
            }

            // Now create the order with the authenticated user
            const orderData = {
                userId: authResult.userId,
                phone: phoneNumber.trim(),
                name: `${firstName.trim()} ${lastName.trim()}`.trim(),
                address: customerData.address,
                deliveryOption: deliveryOption,
                whatsappNumber: whatsappNumber.trim(),
                preferredTime: preferredTime,
                preferredDay: preferredDay,
                nearestTownOrCity: deliveryOption === 'delivery' ? nearestCity.trim() : undefined,
                notes: notes.trim() || "",
                orderedItems: cart.map((item, index) => {
                    // Get price with improved fallback logic
                    let itemPrice = 0;
                    
                    // Try different price sources
                    if (item.lastPrice && item.lastPrice > 0) {
                        itemPrice = item.lastPrice;
                    } else if (item.price && item.price > 0) {
                        itemPrice = item.price;
                    } else if (item.originalPrice && item.originalPrice > 0) {
                        itemPrice = item.originalPrice;
                    }
                    
                    // If we still don't have a valid price, this is a problem
                    if (itemPrice <= 0) {
                        console.error(`Item ${index + 1} (${item.productName || item.name}) has no valid price:`, item);
                        throw new Error(`Item ${index + 1} is missing a valid price. Please refresh the page and try again.`);
                    }
                    
                    const quantity = Number(item.qty || item.quantity) || 1;
                    if (quantity <= 0) {
                        throw new Error(`Item ${index + 1} has invalid quantity`);
                    }
                    
                    return {
                        name: item.productName || item.name || 'Unknown Product',
                        price: Number(itemPrice), // Ensure it's a number
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

            // Double-check each item has required fields (this should not fail after our improvements)
            orderData.orderedItems.forEach((item, index) => {
                if (!item.price || item.price <= 0) {
                    throw new Error(`Item ${index + 1} is missing price`);
                }
                if (!item.quantity || item.quantity <= 0) {
                    throw new Error(`Item ${index + 1} is missing quantity`);
                }
                if (!item.productId) {
                    throw new Error(`Item ${index + 1} is missing product ID`);
                }
            });

            // Create the order with authentication token
            const orderResponse = await axios.post(import.meta.env.VITE_BACKEND_URL + '/api/orders/', orderData, {
                headers: {
                    'Authorization': `Bearer ${authResult.token}`
                }
            });

            if (orderResponse.data.success) {
                // Clear cart
                clearCart();
                setCart([]);
                setTotal(0);
                setLabelTotal(0);

                // Show success message
                toast.success('🎉 Order placed successfully! Redirecting to your orders page...');

                // Navigate to My Orders page after a short delay
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

    // Real-time account checking function (optional - for better UX)
    const checkAccountExists = async (firstName, phoneNumber) => {
        if (!firstName.trim() || !phoneNumber.trim()) return;

        try {
            const response = await axios.post(import.meta.env.VITE_BACKEND_URL + '/api/users/check-account', {
                firstName: firstName.trim(),
                phonenumber: phoneNumber.trim()
            });

            if (response.data.success) {
                if (response.data.exists) {
                    setAccountStatus('existing');
                    // Optionally pre-fill other fields from existing account
                    if (response.data.user.homeaddress) {
                        // You could pre-fill address if needed
                        // setAddress(response.data.user.homeaddress);
                    }
                } else {
                    setAccountStatus('new');
                }
            }
        } catch (error) {
            console.error('Account check error:', error);
            setAccountStatus(null);
        }
    };

    // Handle first name change with real-time account checking
    const handleFirstNameChange = (e) => {
        const value = e.target.value;
        setFirstName(value);

        // Real-time account checking with debounce
        if (value.trim() && phoneNumber.trim()) {
            const timeoutId = setTimeout(() => {
                checkAccountExists(value, phoneNumber);
            }, 500);

            return () => clearTimeout(timeoutId);
        } else {
            setAccountStatus(null);
        }
    };

    // Handle phone number change with real-time account checking
    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;
        setPhoneNumber(value);

        // Real-time account checking with debounce
        if (value.trim() && firstName.trim()) {
            const timeoutId = setTimeout(() => {
                checkAccountExists(firstName, value);
            }, 500);

            return () => clearTimeout(timeoutId);
        } else {
            setAccountStatus(null);
        }
    };

    return (
        <div className="min-h-screen bg-orange-50 pt-20">
            {/* Header Section */}
            <div className="h-[200px] bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 overflow-hidden relative">
                <div className="absolute inset-0 bg-opacity-20"></div>
                <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">Cart</span>
                </div>
            </div>

            <div className="w-full flex flex-col">
                <div className="w-[90%] max-w-7xl h-full mx-auto flex flex-col py-8">

                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
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
                                    {cart.length > 0 ? cart.map((item) => {
                                        return (
                                            <CartCard
                                                key={item.productId}
                                                productId={item.productId}
                                                qty={item.qty}
                                                onCartUpdate={refreshCart}
                                            />
                                        )
                                    }) : (
                                        <tr>
                                            <td colSpan="6" className="text-center p-8 text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <p className="text-xl mb-4">Your cart is empty</p>
                                                    <button
                                                        onClick={() => navigate('/products')}
                                                        className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
                                                    >
                                                        Continue Shopping
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Only show checkout form if cart has items */}
                    {cart.length > 0 && (
                        <>
                            {/* Delivery Option Selection */}
                            <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800">Delivery Option</h2>
                                <div className="flex gap-6">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="deliveryOption"
                                            value="pickup"
                                            checked={deliveryOption === "pickup"}
                                            onChange={() => handleDeliveryOptionChange("pickup")}
                                            className="mr-3 w-4 h-4 text-orange-600"
                                        />
                                        <span className="text-lg font-medium text-gray-700">Pickup Order</span>
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
                                        ? 'bg-green-100 border border-green-300'
                                        : 'bg-blue-100 border border-blue-300'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full mr-2 ${accountStatus === 'existing' ? 'bg-green-500' : 'bg-blue-500'
                                            }`}></div>
                                        <span className={`text-sm font-medium ${accountStatus === 'existing' ? 'text-green-800' : 'text-blue-800'
                                            }`}>
                                            {accountStatus === 'existing'
                                                ? '✅ Account found! You will be automatically logged in.'
                                                : '🆕 New customer - Account will be created for you automatically.'
                                            }
                                        </span>
                                    </div>
                                )}

                                <p className="text-sm text-gray-600 mb-4">
                                    * We'll automatically check if you have an account and log you in. If not, we'll create one for you!
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={handleFirstNameChange}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="Enter your first name"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="Enter your last name"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={handlePhoneNumberChange}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="Enter your phone number"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address *
                                        </label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="Enter your full address"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    {deliveryOption === "delivery" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nearest City *
                                            </label>
                                            <input
                                                type="text"
                                                value={nearestCity}
                                                onChange={(e) => setNearestCity(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="Enter your nearest city"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            WhatsApp Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="Enter your WhatsApp number"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Preferred Time *
                                        </label>
                                        <input
                                            type="time"
                                            value={preferredTime}
                                            onChange={(e) => setPreferredTime(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Preferred Day *
                                        </label>
                                        <select
                                            value={preferredDay}
                                            onChange={(e) => setPreferredDay(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Select a day</option>
                                            <option value="Monday">Monday</option>
                                            <option value="Tuesday">Tuesday</option>
                                            <option value="Wednesday">Wednesday</option>
                                            <option value="Thursday">Thursday</option>
                                            <option value="Friday">Friday</option>
                                            <option value="Saturday">Saturday</option>
                                            <option value="Sunday">Sunday</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Special Notes (Optional)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                            rows="3"
                                            placeholder="Any special instructions or notes for your order"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary and Checkout */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div className="mb-4 md:mb-0">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Summary</h3>
                                        <div className="text-lg text-gray-600">
                                            <p>Items: {cart.length}</p>
                                            {labelTotal !== total && (
                                                <p className="line-through text-gray-400">Original: Rs. {labelTotal.toFixed(2)}</p>
                                            )}
                                            <p className="text-2xl font-bold text-orange-600">Total: Rs. {total.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={onGoBackClick}
                                            className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                                            disabled={loading}
                                        >
                                            Go Back
                                        </button>

                                        <button
                                            onClick={onCloseOrdersClick}
                                            className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                                            disabled={loading}
                                        >
                                            Clear Cart
                                        </button>

                                        <button
                                            onClick={handleOrderSubmission}
                                            disabled={loading || cart.length === 0}
                                            className="px-8 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Processing...' : 'Place Order'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
import { useEffect, useState } from "react";
import axios from "axios";
import { loadCart, clearCart } from "../utils/cartFunction";
import { storeAuthData } from "../utils/myOrdersFunction";
import CartCard from "../components/cartCard";
import toast from "react-hot-toast";

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [labelTotal, setLabelTotal] = useState(0);

    // Delivery option state
    const [deliveryOption, setDeliveryOption] = useState("pickup");

    // Customer details state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [homeAddress, setHomeAddress] = useState("");
    const [preferredTime, setPreferredTime] = useState("");
    const [preferredDay, setPreferredDay] = useState("");
    const [nearestCity, setNearestCity] = useState("");

    // Loading state for checkout
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    
    // Account status state
    const [accountStatus, setAccountStatus] = useState(null); // 'existing', 'new', null
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const currentCart = loadCart();
        setCart(currentCart);
        console.log(currentCart);

        if (currentCart.length > 0) {
            axios.post(import.meta.env.VITE_BACKEND_URL + "/api/orders/quote", {
                orderedItems: currentCart
            }).then((res) => {
                console.log(res.data);
                if (res.data.total != null) {
                    setTotal(res.data.total);
                    setLabelTotal(res.data.labelTotal);
                }
            }).catch((err) => console.log(err));
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
            }).catch((err) => console.log(err));
        } else {
            setTotal(0);
            setLabelTotal(0);
        }
    }

    // Function to go back to previous page
    function onGoBackClick() {
        window.history.back();
    }

    // Function to close/clear all orders
    function onCloseOrdersClick() {
        const confirmClose = window.confirm("Are you sure you want to remove all items from the cart?");
        if (confirmClose) {
            clearCart();
            setCart([]);
            setTotal(0);
            setLabelTotal(0);
            clearAllFields();
            setAccountStatus(null);
            setIsLoggedIn(false);
            setCurrentUser(null);
            alert("All items have been removed from the cart.");
        }
    }

    // Function to clear all form fields
    function clearAllFields() {
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setHomeAddress("");
        setPreferredTime("");
        setPreferredDay("");
        setNearestCity("");
    }

    // Function to handle delivery option change
    function handleDeliveryOptionChange(option) {
        setDeliveryOption(option);
    }

    // Enhanced function to check account status and perform auto-login
    async function checkAccountStatusAndLogin() {
        if (!firstName.trim() || !phoneNumber.trim()) {
            return;
        }

        try {
            // First, check if account exists
            const checkResponse = await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/check-account", {
                firstName: firstName.trim(),
                phonenumber: phoneNumber.trim()
            });

            if (checkResponse.data.exists) {
                // Account exists, perform automatic login
                try {
                    const loginResponse = await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/login", {
                        firstName: firstName.trim(),
                        phonenumber: phoneNumber.trim()
                    });

                    if (loginResponse.data.token) {
                        // Store authentication data
                        storeAuthData(loginResponse.data.token, loginResponse.data.user);
                        
                        // Update local state
                        setAccountStatus('existing');
                        setIsLoggedIn(true);
                        setCurrentUser(loginResponse.data.user);

                        // Auto-fill form fields with existing user data
                        setLastName(loginResponse.data.user.lastName || "");
                        setHomeAddress(loginResponse.data.user.homeaddress || "");

                        toast.success("✅ Welcome back! You're automatically logged in!");
                    }
                } catch (loginError) {
                    console.error("Auto-login failed:", loginError);
                    setAccountStatus('existing');
                    toast.error("Account found but login failed. Please try again.");
                }
            } else {
                // Account doesn't exist
                setAccountStatus('new');
                setIsLoggedIn(false);
                setCurrentUser(null);
                toast.info("🆕 New account will be created with your details.");
            }
        } catch (error) {
            console.error("Error checking account:", error);
            setAccountStatus('new');
            setIsLoggedIn(false);
            setCurrentUser(null);
        }
    }

    // Enhanced checkout function with streamlined authentication
    // Enhanced checkout function with proper token handling
// Fixed checkout function with proper token handling
async function onOrderCheckOutClick() {
    // Validate all required fields
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim() || !homeAddress.trim() || !preferredTime.trim() || !preferredDay.trim() || !nearestCity.trim()) {
        toast.error("Please fill in all required fields");
        return;
    }

    if (cart.length === 0) {
        toast.error("Your cart is empty");
        return;
    }

    setIsCheckingOut(true);

    try {
        let authToken = null;
        let user = null;

        // Check if already logged in from auto-login
        if (isLoggedIn && currentUser) {
            // Use existing login data
            const storedToken = localStorage.getItem('authToken');
            if (!storedToken) {
                toast.error("Authentication token not found. Please try again.");
                setIsCheckingOut(false);
                return;
            }
            authToken = storedToken;
            user = currentUser;
            
            console.log("Using existing token:", authToken.substring(0, 20) + "..."); // Debug log
            toast.success("🛍️ Using your existing account for checkout!");
        } else {
            // Need to authenticate (either login or register)
            const authResult = await checkUserAndAuthenticate();
            
            if (!authResult.success) {
                toast.error(authResult.error);
                setIsCheckingOut(false);
                return;
            }

            authToken = authResult.token;
            user = authResult.user;
            
            console.log("New authentication token:", authToken.substring(0, 20) + "..."); // Debug log

            // Show appropriate success message
            if (authResult.isNewUser) {
                toast.success("🎉 Welcome! Your account has been created successfully!");
            } else {
                toast.success("✅ Logged in successfully! Welcome back!");
            }
        }

        // Verify token exists before making order request
        if (!authToken) {
            toast.error("Authentication failed. Please try again.");
            setIsCheckingOut(false);
            return;
        }

        // Step 2: Prepare order data
        const orderData = {
            orderedItems: cart,
            deliveryOption: deliveryOption,
            name: `${firstName.trim()} ${lastName.trim()}`,
            phone: phoneNumber.trim(),
            address: homeAddress.trim(),
            whatsappNumber: phoneNumber.trim(),
            preferredTime: preferredTime.trim(),
            preferredDay: preferredDay.trim(),
            nearestTownOrCity: nearestCity.trim()
        };

        console.log("Making order request with token:", authToken ? "Present" : "Missing"); // Debug log
        console.log("Order data:", orderData); // Debug log
        console.log("Request URL:", import.meta.env.VITE_BACKEND_URL + "/api/orders"); // Debug log

        // Step 3: Place order with authentication token
        // Make sure the Authorization header is properly formatted
        const orderResponse = await axios.post(
            import.meta.env.VITE_BACKEND_URL + "/api/orders", 
            orderData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                // Add timeout to prevent hanging
                timeout: 30000 // 30 seconds
            }
        );

        if (orderResponse.data.success) {
            const orderDetails = orderResponse.data.order;
            
            // Show success message with order tracking info
            toast.success(
                `🛍️ Order #${orderDetails.orderId} placed successfully!`,
                { duration: 3000 }
            );

            // Show tracking message
            toast.success(
                "📱 You can now track your order in 'My Orders' section!",
                { duration: 4000 }
            );
            
            // Clear cart and form after successful order
            clearCart();
            setCart([]);
            clearAllFields();
            setTotal(0);
            setLabelTotal(0);
            setAccountStatus(null);
            setIsLoggedIn(false);
            setCurrentUser(null);

            // Show navigation options
            const userChoice = window.confirm(
                `Order placed successfully!\n\nWould you like to:\n- Click "OK" to view your orders\n- Click "Cancel" to continue shopping`
            );

            if (userChoice) {
                // Redirect to My Orders page
                window.location.href = '/my-orders';
            } else {
                // Redirect to products page or home
                window.location.href = '/products';
            }
        }
    } catch (error) {
        console.error("Checkout error:", error);
        console.error("Error response:", error.response); // Debug log
        
        // Better error handling
        if (error.response?.status === 401) {
            console.log("401 error details:", error.response.data); // Debug log
            toast.error("Authentication failed. Please try logging in again.");
            
            // Clear invalid auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            setIsLoggedIn(false);
            setCurrentUser(null);
            setAccountStatus(null);
        } else if (error.response?.status === 400) {
            toast.error(error.response.data.message || "Invalid order data. Please check your information.");
        } else if (error.code === 'ECONNABORTED') {
            toast.error("Request timeout. Please check your internet connection and try again.");
        } else {
            toast.error(error.response?.data?.message || "Failed to place order. Please try again.");
        }
    } finally {
        setIsCheckingOut(false);
    }
}

    // Function to check if user exists and login/register (fallback for non-auto-login cases)
    async function checkUserAndAuthenticate() {
        try {
            // First, try to login with existing credentials
            const loginResponse = await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/login", {
                firstName: firstName.trim(),
                phonenumber: phoneNumber.trim()
            });

            if (loginResponse.data.token) {
                // User exists, store auth data
                storeAuthData(loginResponse.data.token, loginResponse.data.user);
                return {
                    success: true,
                    token: loginResponse.data.token,
                    user: loginResponse.data.user,
                    isNewUser: false
                };
            }
        } catch (loginError) {
            // User doesn't exist, try to create new account
            try {
                const registerResponse = await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users", {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phonenumber: phoneNumber.trim(),
                    homeaddress: homeAddress.trim(),
                    type: "customer"
                });

                if (registerResponse.data.token) {
                    // New user created, store auth data
                    storeAuthData(registerResponse.data.token, registerResponse.data.user);
                    return {
                        success: true,
                        token: registerResponse.data.token,
                        user: registerResponse.data.user,
                        isNewUser: true
                    };
                }
            } catch (registerError) {
                console.error("Registration failed:", registerError);
                return {
                    success: false,
                    error: registerError.response?.data?.message || "Failed to create account"
                };
            }
        }

        return {
            success: false,
            error: "Authentication failed"
        };
    }

    // Handle input changes to trigger auto-login check
    const handleFirstNameChange = (e) => {
        setFirstName(e.target.value);
        setAccountStatus(null);
        setIsLoggedIn(false);
        setCurrentUser(null);
    };

    const handlePhoneNumberChange = (e) => {
        setPhoneNumber(e.target.value);
        setAccountStatus(null);
        setIsLoggedIn(false);
        setCurrentUser(null);
    };

    // Check account status and perform auto-login when both fields are entered
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (firstName.trim() && phoneNumber.trim()) {
                checkAccountStatusAndLogin();
            }
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(timeoutId);
    }, [firstName, phoneNumber]);

    return (
        <div className="relative w-full min-h-screen bg-orange-100">
            <div className="w-full h-[300px] bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 overflow-hidden relative">
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
                    <span className="text-6xl font-bold text-white flex text-center">Cart</span>
                </div>
            </div>

            <div className="w-full h- flex flex-col">
                <div className="w-[90%] h-full mx-auto flex flex-col">
                    {/* Cart Items Table */}
                    <div className="flex-grow">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 text-left">Product</th>
                                    <th className="p-2 text-left">Name</th>
                                    <th className="p-2 text-left">Quantity</th>
                                    <th className="p-2 text-left">Price</th>
                                    <th className="p-2 text-left">Total Price</th>
                                    <th className="p-2 text-left">Action</th>
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
                                        <td colSpan="6" className="text-center p-4 text-gray-500">
                                            Your cart is empty
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Delivery Option Selection */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">Delivery Option</h2>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="deliveryOption"
                                    value="pickup"
                                    checked={deliveryOption === "pickup"}
                                    onChange={() => handleDeliveryOptionChange("pickup")}
                                    className="mr-2"
                                />
                                <span className="text-lg font-medium">Pickup Order</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="deliveryOption"
                                    value="delivery"
                                    checked={deliveryOption === "delivery"}
                                    onChange={() => handleDeliveryOptionChange("delivery")}
                                    className="mr-2"
                                />
                                <span className="text-lg font-medium">Delivery Order</span>
                            </label>
                        </div>
                    </div>

                    {/* Customer Details Form */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">Customer Details</h2>
                        
                        {/* Account Status Indicator */}
                        {accountStatus && (
                            <div className={`mb-4 p-3 rounded-lg flex items-center ${
                                accountStatus === 'existing' 
                                    ? 'bg-green-100 border border-green-300' 
                                    : 'bg-blue-100 border border-blue-300'
                            }`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                    accountStatus === 'existing' ? 'bg-green-500' : 'bg-blue-500'
                                }`}></div>
                                <span className={`text-sm font-medium ${
                                    accountStatus === 'existing' ? 'text-green-800' : 'text-blue-800'
                                }`}>
                                    {accountStatus === 'existing' 
                                        ? (isLoggedIn 
                                            ? '✅ Welcome back! You are automatically logged in. Order will be added to your account.'
                                            : '✅ Account found! Order will be added to your existing account.')
                                        : '🆕 New account will be created with your details.'
                                    }
                                </span>
                            </div>
                        )}

                        {/* Login Status Indicator */}
                        {isLoggedIn && currentUser && (
                            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium text-green-800">
                                        🔐 Logged in as: {currentUser.firstName} {currentUser.lastName}
                                    </span>
                                </div>
                                <p className="text-xs text-green-600 mt-1">
                                    You can now view your orders in "My Orders" section after checkout!
                                </p>
                            </div>
                        )}

                        <p className="text-sm text-gray-600 mb-4">
                            * We'll automatically check if you have an account and log you in. If not, we'll create one for you!
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name * (simple letters only)
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={handleFirstNameChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your first name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name * (simple letters only)
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your last name"
                                    required
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
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your phone number"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nearest City *
                                </label>
                                <input
                                    type="text"
                                    value={nearestCity}
                                    onChange={(e) => setNearestCity(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your nearest city"
                                    required
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
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preferred Day *
                                </label>
                                <input
                                    type="date"
                                    value={preferredDay}
                                    onChange={(e) => setPreferredDay(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Home Address *
                                </label>
                                <textarea
                                    value={homeAddress}
                                    onChange={(e) => setHomeAddress(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your complete home address"
                                    rows="3"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Summary and Checkout */}
                    <div className="mt-6 flex flex-col items-end rounded-lg space-y-2">
                        <div className="text-right">
                            <h1 className="text-xl font-bold text-black">
                                Subtotal: LKR {labelTotal.toFixed(2)}
                            </h1>
                            <h1 className="text-lg font-semibold text-green-600">
                                Discount: LKR {(labelTotal - total).toFixed(2)}
                            </h1>
                            <h1 className="text-2xl font-bold text-black border-t pt-2">
                                Grand Total: LKR {total.toFixed(2)}
                            </h1>
                        </div>

                        <div className="flex justify-between w-full items-center">
                            {/* Go Back button on the left */}
                            <button
                                onClick={onGoBackClick}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-[200px]"
                                disabled={isCheckingOut}
                            >
                                Go Back
                            </button>

                            {/* Clear Cart and Checkout buttons on the right */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={onCloseOrdersClick}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg w-[200px] disabled:bg-gray-400"
                                    disabled={cart.length === 0 || isCheckingOut}
                                >
                                    Clear Cart
                                </button>

                                <button
                                    onClick={onOrderCheckOutClick}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-[200px] disabled:bg-gray-400 flex items-center justify-center"
                                    disabled={cart.length === 0 || isCheckingOut}
                                >
                                    {isCheckingOut ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        'Checkout'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
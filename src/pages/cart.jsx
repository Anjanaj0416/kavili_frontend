import { useEffect, useState } from "react";
import axios from "axios";
import { loadCart, clearCart } from "../utils/cartFunction";
import CartCard from "../components/cartCard";
import toast from "react-hot-toast";

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [labelTotal, setLabelTotal] = useState(0);

    // Delivery option state
    const [deliveryOption, setDeliveryOption] = useState("pickup"); // "pickup" or "delivery"

    // Customer details state
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [nearestTownOrCity, setNearestTownOrCity] = useState("");
    const [customeremail, setCustomerEmail] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [preferredTime, setPreferredTime] = useState("");
    const [preferredDay, setPreferredDay] = useState("");

    // Delivery-specific details
    const [deliveryName, setDeliveryName] = useState("");
    const [deliveryPhone, setDeliveryPhone] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [deliveryWhatsapp, setDeliveryWhatsapp] = useState("");
    const [deliveryTownOrCity, setDeliveryTownOrCity] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("");
    const [deliveryDay, setDeliveryDay] = useState("");

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
            // Clear all form fields
            clearAllFields();
            alert("All items have been removed from the cart.");
        }
    }

    // Function to clear all form fields
    function clearAllFields() {
        setCustomerName("");
        setCustomerPhone("");
        setCustomerAddress("");
        setNearestTownOrCity("");
        setCustomerEmail("");
        setWhatsappNumber("");
        setPreferredTime("");
        setPreferredDay("");
        setDeliveryName("");
        setDeliveryPhone("");
        setDeliveryAddress("");
        setDeliveryWhatsapp("");
        setDeliveryTownOrCity("");
        setDeliveryTime("");
        setDeliveryDay("");
    }

    // Function to handle delivery option change
    function handleDeliveryOptionChange(option) {
        setDeliveryOption(option);
        // Clear fields when switching options
        if (option === "pickup") {
            setDeliveryName("");
            setDeliveryPhone("");
            setDeliveryAddress("");
            setDeliveryWhatsapp("");
            setDeliveryTownOrCity("");
            setDeliveryTime("");
            setDeliveryDay("");
        } else {
            setCustomerName("");
            setCustomerPhone("");
            setCustomerAddress("");
            setNearestTownOrCity("");
            setWhatsappNumber("");
            setPreferredTime("");
            setPreferredDay("");
        }
    }

    function onOrderCheckOutClick() {
        // Validate based on delivery option
        if (deliveryOption === "pickup") {
            if (!customerName.trim() || !customerPhone.trim() || !whatsappNumber.trim() || !preferredTime.trim() || !preferredDay.trim()) {
                toast.error("Please fill in all required pickup details");
                return;
            }
        } else {
            if (!deliveryName.trim() || !deliveryPhone.trim() || !deliveryAddress.trim() || !deliveryWhatsapp.trim() || !deliveryTownOrCity.trim() || !deliveryTime.trim() || !deliveryDay.trim()) {
                toast.error("Please fill in all required delivery details");
                return;
            }
        }

        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        // Prepare order data based on delivery option
        const orderData = {
            orderedItems: cart,
            deliveryOption: deliveryOption,
            email: customeremail.trim()
        };

        if (deliveryOption === "pickup") {
            orderData.name = customerName.trim();
            orderData.phone = customerPhone.trim();
            orderData.whatsappNumber = whatsappNumber.trim();
            orderData.preferredTime = preferredTime.trim();
            orderData.preferredDay = preferredDay.trim();
            orderData.address = "Pickup"; // Default for pickup orders
        } else {
            orderData.name = deliveryName.trim();
            orderData.phone = deliveryPhone.trim();
            orderData.address = deliveryAddress.trim();
            orderData.whatsappNumber = deliveryWhatsapp.trim();
            orderData.nearestTownOrCity = deliveryTownOrCity.trim();
            orderData.preferredTime = deliveryTime.trim();
            orderData.preferredDay = deliveryDay.trim();
        }

        axios.post(import.meta.env.VITE_BACKEND_URL + "/api/orders", orderData)
            .then((res) => {
                console.log(res.data);
                toast.success("Order placed successfully!");
                // Clear cart and form after successful order
                clearCart();
                setCart([]);
                clearAllFields();
                setTotal(0);
                setLabelTotal(0);
            }).catch((err) => {
                console.log(err);
                toast.error("Failed to place order. Please try again.");
            });
    }

    return (
        <div className="relative w-full min-h-screen bg-orange-100  ">
            <div className="w-full h-[300px]  bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        {/* Main spice pile */}
                        <div className="absolute right-50 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                        <div className="absolute right-48 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-80"></div>


                        {/* Additional spice piles */}
                        <div className="absolute left-50 top-1/3 w-48 h-48 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full opacity-60"></div>
                        <div className="absolute left`-70 top-2/3 w-40 h-40 bg-gradient-to-br from-red-500 to-orange-600 rounded-full opacity-50"></div>
                        <div className="absolute left-[300px] top-1/2 w-56 h-56 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-40"></div>
                    </div>
                </div>
                <div className="w-full h-full flex items-center justify-center my-9">
                    <span className="text-6xl font-bold text-white flex text-center"> Cart</span>
                </div>
            </div>
            <div className="w-full h- flex flex-col ">
                <div className="w-[90%] h-full mx-auto flex flex-col ">
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
                        <h2 className="text-xl font-bold mb-4">
                            {deliveryOption === "pickup" ? "Pickup Details" : "Delivery Details"}
                        </h2>

                        {deliveryOption === "pickup" ? (
                            // Pickup form fields
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your phone number"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        WhatsApp Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your WhatsApp number"
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        value={customeremail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                            </div>
                        ) : (
                            // Delivery form fields
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={deliveryName}
                                        onChange={(e) => setDeliveryName(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter recipient's full name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={deliveryPhone}
                                        onChange={(e) => setDeliveryPhone(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter recipient's phone number"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        WhatsApp Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={deliveryWhatsapp}
                                        onChange={(e) => setDeliveryWhatsapp(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter recipient's WhatsApp number"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nearest Town or City *
                                    </label>
                                    <input
                                        type="text"
                                        value={deliveryTownOrCity}
                                        onChange={(e) => setDeliveryTownOrCity(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter nearest town or city"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Preferred Time *
                                    </label>
                                    <input
                                        type="time"
                                        value={deliveryTime}
                                        onChange={(e) => setDeliveryTime(e.target.value)}
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
                                        value={deliveryDay}
                                        onChange={(e) => setDeliveryDay(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Home Address *
                                    </label>
                                    <textarea
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter complete delivery address"
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        value={customeremail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                            </div>
                        )}
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

                        <div className="flex justify-between w-full items-center ">
                            {/* Go Back button on the left */}
                            <button
                                onClick={onGoBackClick}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-[200px]"
                            >
                                Go Back
                            </button>

                            {/* Clear Cart and Checkout buttons on the right */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={onCloseOrdersClick}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg w-[200px] disabled:bg-gray-400"
                                    disabled={cart.length === 0}
                                >
                                    Clear Cart
                                </button>

                                <button
                                    onClick={onOrderCheckOutClick}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-[200px] disabled:bg-gray-400"
                                    disabled={cart.length === 0}
                                >
                                    Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>


        </div>
    )
}
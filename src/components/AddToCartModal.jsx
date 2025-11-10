import React from 'react';
import { ShoppingCart, CreditCard } from 'lucide-react';

export default function AddToCartModal({ isOpen, onClose, onKeepShopping, onPayNow, productName, quantity }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#c9a961] to-[#b89551] p-6 text-white">
                    <div className="flex items-center justify-center mb-2">
                        <div className="bg-white bg-opacity-20 p-3 rounded-full">
                            <ShoppingCart size={32} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center">Added to Cart!</h2>
                    <p className="text-center text-white/90 mt-2">
                        {quantity} × {productName}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-700 text-center mb-6 text-lg">
                        What would you like to do next?
                    </p>

                    {/* Buttons */}
                    <div className="space-y-3">
                        {/* Pay Now Button */}
                        <button
                            onClick={onPayNow}
                            className="w-full bg-[#c9a961] hover:bg-[#b89551] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <CreditCard size={20} />
                            <span>Proceed to Checkout</span>
                        </button>

                        {/* Keep Shopping Button */}
                        <button
                            onClick={onKeepShopping}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 border-2 border-gray-300 hover:border-gray-400"
                        >
                            <ShoppingCart size={20} />
                            <span>Continue Shopping</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
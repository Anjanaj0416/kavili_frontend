import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function OrderConfirmationModal({ isOpen, onClose, onConfirm, loading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fadeIn">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                >
                    <X size={24} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-orange-100 rounded-full p-3">
                        <AlertCircle className="w-8 h-8 text-[#c9a961]" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                    Order Confirmation
                </h2>

                {/* Message */}
                <div className="mb-6 text-gray-600 text-center space-y-3">
                    <p className="text-sm leading-relaxed">
                        Your order will be sent to the company for review. Once they check your order details, they will accept it.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                        <p className="text-sm font-semibold text-blue-800 mb-2">
                            📧 What happens next?
                        </p>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                            <li>Company will review your order</li>
                            <li>You'll receive an email when accepted</li>
                            <li>Check your Gmail for the confirmation</li>
                            <li>Payment options: Online or Cash on Pickup/Delivery</li>
                        </ul>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                        Please check your email inbox for order updates
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                            loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-orange-600 hover:bg-orange-700'
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            'Confirm Order'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
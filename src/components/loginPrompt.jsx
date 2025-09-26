import React from 'react';
import { LogIn } from 'lucide-react';

const LoginPrompt = ({ onLoginClick }) => {
    return (
        <div className="min-h-screen bg-orange-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                    <p className="text-orange-100">Track and manage your spice orders</p>
                </div>
            </div>
            
            {/* Login Prompt */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="mb-6">
                        <LogIn className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
                        <p className="text-gray-600 mb-6">
                            You need to login first to view your orders and track your spice deliveries.
                        </p>
                    </div>
                    
                    <button
                        onClick={onLoginClick}
                        className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center mx-auto text-lg font-medium"
                    >
                        <LogIn className="w-5 h-5 mr-2" />
                        Login to View Orders
                    </button>
                    
                    <p className="text-sm text-gray-500 mt-4">
                        Don't have an account? <span className="text-orange-500 cursor-pointer hover:underline">Sign up here</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPrompt;
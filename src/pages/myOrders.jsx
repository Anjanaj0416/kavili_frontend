/*import React, { useState, useEffect } from 'react';
import { getAuthData, storeAuthData, clearAuthData } from '../utils/myOrdersFunction';
import Login from './login';
import LoginPrompt from '../components/loginPrompt';
import OrderDetails from '../components/orderDetails';

// Main MyOrders Component with Navigation
const MyOrders = () => {
    const [currentView, setCurrentView] = useState('prompt'); // 'prompt', 'login', 'orders'
    const [authToken, setAuthToken] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in on component mount
    useEffect(() => {
        const authData = getAuthData();
        if (authData.token && authData.userData) {
            setAuthToken(authData.token);
            setUserDetails(authData.userData);
            setCurrentView('orders');
        } else {
            // Check if user came from cart checkout (has been redirected)
            const urlParams = new URLSearchParams(window.location.search);
            const fromCheckout = urlParams.get('from') === 'checkout';
            
            if (fromCheckout) {
                // User came from checkout but not authenticated, show login prompt
                setCurrentView('prompt');
            } else {
                setCurrentView('prompt');
            }
        }
        setLoading(false);
    }, []);

    // Navigation handlers
    const handleLoginClick = () => {
        setCurrentView('login');
    };

    const handleLoginSuccess = (token, userData) => {
        setAuthToken(token);
        setUserDetails(userData);
        storeAuthData(token, userData);
        setCurrentView('orders');
    };

    const handleLogout = () => {
        setAuthToken(null);
        setUserDetails(null);
        clearAuthData();
        setCurrentView('prompt');
    };

    const handleBackToPrompt = () => {
        setCurrentView('prompt');
    };

    // Show loading screen while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Render based on current view
    if (currentView === 'prompt') {
        return (
            <LoginPrompt 
                onLoginClick={handleLoginClick}
                // Add any additional props you need for LoginPrompt
            />
        );
    }

    if (currentView === 'login') {
        return (
            <Login 
                onLoginSuccess={handleLoginSuccess}
                onBackToPrompt={handleBackToPrompt}
                // Add any additional props you need for Login
            />
        );
    }

    if (currentView === 'orders') {
        return (
            <OrderDetails 
                authToken={authToken}
                userDetails={userDetails}
                onLogout={handleLogout}
                // Add any additional props you need for OrderDetails
            />
        );
    }

    return null;
};

export default MyOrders;*/

import React, { useState, useEffect } from 'react';
import { getAuthData, storeAuthData, clearAuthData, isAuthenticated, validateToken } from '../utils/myOrdersFunction';
import Login from './login';
import LoginPrompt from '../components/loginPrompt';
import OrderDetails from '../components/orderDetails';

// Main MyOrders Component with Navigation
const MyOrders = () => {
    const [currentView, setCurrentView] = useState('prompt'); // 'prompt', 'login', 'orders'
    const [authToken, setAuthToken] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is already logged in on component mount
    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const authData = getAuthData();
                
                if (authData.token && authData.userData) {
                    // Validate token before using it
                    if (validateToken(authData.token)) {
                        setAuthToken(authData.token);
                        setUserDetails(authData.userData);
                        setCurrentView('orders');
                    } else {
                        // Token is invalid, clear stored data
                        clearAuthData();
                        setCurrentView('prompt');
                    }
                } else {
                    // No authentication data found
                    const urlParams = new URLSearchParams(window.location.search);
                    const fromCheckout = urlParams.get('from') === 'checkout';
                    
                    if (fromCheckout) {
                        // User came from checkout but not authenticated, show login prompt
                        setCurrentView('prompt');
                    } else {
                        setCurrentView('prompt');
                    }
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setError('Error checking authentication status');
                setCurrentView('prompt');
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    // Handle page visibility change (when user comes back to the tab)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && currentView === 'orders') {
                // Check if authentication is still valid when user comes back to the tab
                const authData = getAuthData();
                if (!authData.token || !authData.userData) {
                    // Authentication lost, redirect to login prompt
                    setAuthToken(null);
                    setUserDetails(null);
                    setCurrentView('prompt');
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [currentView]);

    // Navigation handlers
    const handleLoginClick = () => {
        setError(null);
        setCurrentView('login');
    };

    const handleLoginSuccess = (token, userData) => {
        try {
            setAuthToken(token);
            setUserDetails(userData);
            storeAuthData(token, userData);
            setCurrentView('orders');
            setError(null);
        } catch (error) {
            console.error('Error handling login success:', error);
            setError('Error saving login information');
        }
    };

    const handleLogout = () => {
        try {
            setAuthToken(null);
            setUserDetails(null);
            clearAuthData();
            setCurrentView('prompt');
            setError(null);
        } catch (error) {
            console.error('Error during logout:', error);
            setError('Error during logout');
        }
    };

    const handleBackToPrompt = () => {
        setCurrentView('prompt');
        setError(null);
    };

    // Show loading screen while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show error if there's an error
    if (error) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setCurrentView('prompt');
                        }}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Render based on current view
    if (currentView === 'prompt') {
        return (
            <LoginPrompt 
                onLoginClick={handleLoginClick}
                // Add any additional props you need for LoginPrompt
            />
        );
    }

    if (currentView === 'login') {
        return (
            <Login 
                onLoginSuccess={handleLoginSuccess}
                onBackToPrompt={handleBackToPrompt}
                // Add any additional props you need for Login
            />
        );
    }

    if (currentView === 'orders') {
        return (
            <OrderDetails 
                authToken={authToken}
                userDetails={userDetails}
                onLogout={handleLogout}
                // Add any additional props you need for OrderDetails
            />
        );
    }

    return null;
};

export default MyOrders;
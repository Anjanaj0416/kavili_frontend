// src/components/GoogleOneTap.jsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const GoogleOneTap = () => {
    const navigate = useNavigate();
    const hasInitialized = useRef(false);
    const isProcessing = useRef(false);

    useEffect(() => {
        // Prevent double initialization
        if (hasInitialized.current) return;
        
        // Check if user is already logged in
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            console.log('User already logged in, skipping One Tap');
            return;
        }

        hasInitialized.current = true;

        // Get Client ID from environment
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        
        if (!clientId) {
            console.warn('⚠️ VITE_GOOGLE_CLIENT_ID not found in .env file');
            return;
        }

        console.log('✅ Client ID loaded from .env');

        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            try {
                if (window.google && window.google.accounts && window.google.accounts.id) {
                    console.log('🔵 Initializing Google One Tap...');
                    
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleCredentialResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        context: 'signin',
                        itp_support: true,
                    });

                    // Display the One Tap prompt after a short delay
                    setTimeout(() => {
                        window.google.accounts.id.prompt((notification) => {
                            if (notification.isNotDisplayed()) {
                                const reason = notification.getNotDisplayedReason();
                                console.log('One Tap not displayed:', reason);
                                
                                if (reason === 'invalid_client') {
                                    console.error('❌ Invalid Client ID');
                                    console.error('Check: VITE_GOOGLE_CLIENT_ID in .env file');
                                } else if (reason === 'unknown_reason') {
                                    console.log('ℹ️ One Tap dismissed or not available');
                                }
                            }
                            if (notification.isSkippedMoment()) {
                                console.log('One Tap skipped:', notification.getSkippedReason());
                            }
                        });
                    }, 500);
                }
            } catch (error) {
                console.error('Error initializing Google One Tap:', error);
            }
        };

        script.onerror = () => {
            console.error('Failed to load Google Identity Services');
        };

        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            if (window.google && window.google.accounts && window.google.accounts.id) {
                try {
                    window.google.accounts.id.cancel();
                } catch (e) {
                    // Ignore
                }
            }
        };
    }, []);

    const handleCredentialResponse = async (response) => {
        if (isProcessing.current) {
            console.log('Already processing a sign-in');
            return;
        }
        
        isProcessing.current = true;
        console.log('🔵 Processing Google credential...');

        try {
            // Decode JWT to get user info
            const credential = response.credential;
            const payload = JSON.parse(atob(credential.split('.')[1]));
            
            const userData = {
                email: payload.email,
                googleId: payload.sub,
                displayName: payload.name,
                firstName: payload.given_name || payload.name.split(' ')[0],
                lastName: payload.family_name || payload.name.split(' ').slice(1).join(' '),
                photoURL: payload.picture
            };

            console.log('✅ Google authentication successful');
            console.log('User email:', userData.email);

            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
            console.log('🔵 Attempting to connect to backend:', backendUrl);
            
            try {
                // Try to login first
                console.log('🔵 Checking if user exists...');
                const loginResponse = await axios.post(`${backendUrl}/api/users/google-login`, {
                    email: userData.email,
                    googleId: userData.googleId,
                    displayName: userData.displayName
                }, {
                    timeout: 15000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (loginResponse.data.success) {
                    // User exists - log them in
                    console.log('✅ User found - logging in');
                    toast.success(`Welcome back, ${userData.firstName}!`);
                    
                    localStorage.setItem('authToken', loginResponse.data.token);
                    localStorage.setItem('userDetails', JSON.stringify(loginResponse.data.user));
                    
                    setTimeout(() => {
                        navigate('/myOrders', { 
                            replace: true,
                            state: { 
                                loginSuccess: true, 
                                user: loginResponse.data.user 
                            }
                        });
                    }, 1000);
                }
            } catch (loginError) {
                console.log('Response status:', loginError.response?.status);
                
                if (loginError.response?.status === 404) {
                    // User not found - redirect to complete profile
                    console.log('ℹ️ New user - redirecting to complete profile');
                    toast.success('Welcome! Please complete your profile.');
                    
                    sessionStorage.setItem('googleUserData', JSON.stringify(userData));
                    
                    setTimeout(() => {
                        navigate('/complete-profile', {
                            state: { googleUserData: userData }
                        });
                    }, 1000);
                } else if (loginError.code === 'ECONNABORTED' || loginError.code === 'ERR_NETWORK' || loginError.code === 'ECONNREFUSED') {
                    // Backend not reachable
                    console.error('❌ Cannot connect to backend');
                    console.error('Make sure backend is running on:', backendUrl);
                    toast.error('Cannot connect to server. Please ensure the backend is running.');
                } else if (loginError.response?.status === 500) {
                    console.error('❌ Server error');
                    toast.error('Server error. Please try again later.');
                } else {
                    console.error('❌ Unexpected error:', loginError.message);
                    toast.error('Authentication failed. Please try traditional login.');
                }
            }
        } catch (error) {
            console.error('❌ Google One Tap error:', error);
            toast.error('Failed to process Google sign-in. Please use traditional login.');
        } finally {
            isProcessing.current = false;
        }
    };

    return null;
};

export default GoogleOneTap;
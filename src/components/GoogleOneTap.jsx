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

        // Check if backend is accessible before initializing One Tap
        checkBackendHealth().then(isHealthy => {
            if (!isHealthy) {
                console.warn('Backend not accessible, skipping Google One Tap initialization');
                return;
            }

            hasInitialized.current = true;
            initializeGoogleOneTap();
        });

    }, []);

    const checkBackendHealth = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
            const response = await fetch(`${backendUrl}/api/products`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            return response.ok;
        } catch (error) {
            console.error('Backend health check failed:', error);
            return false;
        }
    };

    const initializeGoogleOneTap = () => {
        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            try {
                // Initialize Google One Tap with proper configuration
                if (window.google && window.google.accounts && window.google.accounts.id) {
                    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
                    
                    if (!clientId) {
                        console.error('VITE_GOOGLE_CLIENT_ID not found in environment variables');
                        return;
                    }

                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleCredentialResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        context: 'signin',
                        itp_support: true,
                    });

                    // Display the One Tap prompt
                    window.google.accounts.id.prompt((notification) => {
                        if (notification.isNotDisplayed()) {
                            const reason = notification.getNotDisplayedReason();
                            console.log('One Tap not displayed. Reason:', reason);
                            
                            if (reason === 'invalid_client') {
                                console.error('Invalid Google Client ID. Please check your .env configuration.');
                            } else if (reason === 'opt_out_or_no_session') {
                                console.log('User opted out or no Google session available');
                            }
                        }
                        if (notification.isSkippedMoment()) {
                            console.log('One Tap skipped:', notification.getSkippedReason());
                        }
                        if (notification.isDismissedMoment()) {
                            console.log('One Tap dismissed:', notification.getDismissedReason());
                        }
                    });
                }
            } catch (error) {
                console.error('Error initializing Google One Tap:', error);
            }
        };

        script.onerror = () => {
            console.error('Failed to load Google Identity Services script');
        };

        document.body.appendChild(script);

        return () => {
            // Cleanup
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            // Cancel any pending One Tap prompts
            if (window.google?.accounts?.id) {
                try {
                    window.google.accounts.id.cancel();
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        };
    };

    const handleCredentialResponse = async (response) => {
        // Prevent multiple simultaneous processing
        if (isProcessing.current) {
            console.log('Already processing a credential response');
            return;
        }
        
        isProcessing.current = true;

        try {
            // Decode the JWT credential to get user info
            const credential = response.credential;
            const payload = JSON.parse(atob(credential.split('.')[1]));
            
            const userData = {
                email: payload.email,
                googleId: payload.sub,
                displayName: payload.name,
                firstName: payload.given_name || payload.name.split(' ')[0],
                lastName: payload.family_name || payload.name.split(' ').slice(1).join(' '),
                photoURL: payload.picture,
                emailVerified: payload.email_verified
            };

            console.log('Google One Tap authentication successful:', userData.email);

            // Check if user exists in backend
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
            
            try {
                // Try to login first
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
                    // User exists and logged in successfully
                    toast.success(`Welcome back, ${userData.firstName}!`);
                    
                    // Store authentication data
                    localStorage.setItem('authToken', loginResponse.data.token);
                    localStorage.setItem('userDetails', JSON.stringify(loginResponse.data.user));
                    
                    // Navigate to My Orders
                    setTimeout(() => {
                        navigate('/myOrders', { 
                            replace: true,
                            state: { 
                                loginSuccess: true, 
                                user: loginResponse.data.user 
                            }
                        });
                    }, 800);
                }
            } catch (loginError) {
                console.log('Login attempt failed:', {
                    status: loginError.response?.status,
                    message: loginError.response?.data?.message,
                    error: loginError.message
                });
                
                // User doesn't exist - redirect to complete profile
                if (loginError.response?.status === 404) {
                    toast.success('Welcome! Please complete your profile to continue.');
                    
                    // Store Google user data temporarily for profile completion
                    sessionStorage.setItem('googleUserData', JSON.stringify(userData));
                    
                    // Navigate to complete profile page
                    setTimeout(() => {
                        navigate('/complete-profile', {
                            state: { googleUserData: userData }
                        });
                    }, 800);
                } else if (loginError.code === 'ECONNABORTED' || loginError.code === 'ERR_NETWORK') {
                    // Network/timeout error
                    toast.error('Unable to connect to server. Please check if the backend is running.');
                    console.error('Backend connection error. Is your backend running on port 3000?');
                } else if (loginError.response?.status === 500) {
                    toast.error('Server error. Please try again later.');
                } else {
                    // Other error
                    toast.error('Authentication failed. Please try again or use traditional login.');
                    console.error('Unexpected login error:', loginError);
                }
            }
        } catch (error) {
            console.error('Google One Tap error:', error);
            toast.error('Failed to process Google sign-in. Please try traditional login.');
        } finally {
            isProcessing.current = false;
        }
    };

    // This component doesn't render anything visible
    return null;
};

export default GoogleOneTap;
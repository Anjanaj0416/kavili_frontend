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

        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            try {
                // Initialize Google One Tap with proper configuration
                if (window.google && window.google.accounts && window.google.accounts.id) {
                    window.google.accounts.id.initialize({
                        // IMPORTANT: Replace this with your actual Google OAuth Client ID
                        // Get it from: https://console.cloud.google.com/apis/credentials
                        client_id: '774378170093-YOUR_FULL_CLIENT_ID_HERE.apps.googleusercontent.com',
                        callback: handleCredentialResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        context: 'signin',
                        itp_support: true,
                        use_fedcm_for_prompt: false, // Disable FedCM to avoid errors
                    });

                    // Display the One Tap prompt
                    window.google.accounts.id.prompt((notification) => {
                        if (notification.isNotDisplayed()) {
                            const reason = notification.getNotDisplayedReason();
                            console.log('One Tap not displayed. Reason:', reason);
                            
                            // Only show error for critical issues
                            if (reason === 'invalid_client') {
                                console.error('Invalid Google Client ID. Please check your configuration.');
                            }
                        }
                        if (notification.isSkippedMoment()) {
                            console.log('One Tap skipped:', notification.getSkippedReason());
                        }
                    });
                }
            } catch (error) {
                console.error('Error initializing Google One Tap:', error);
                // Silently fail - don't disrupt user experience
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
            if (window.google && window.google.accounts && window.google.accounts.id) {
                try {
                    window.google.accounts.id.cancel();
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        };
    }, []);

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
                photoURL: payload.picture
            };

            console.log('Google One Tap authentication successful');

            // Check if user exists in backend
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
            
            try {
                // Try to login first
                const loginResponse = await axios.post(`${backendUrl}/api/users/google-login`, {
                    email: userData.email,
                    googleId: userData.googleId,
                    displayName: userData.displayName
                }, {
                    timeout: 10000, // 10 second timeout
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
                    }, 1000);
                }
            } catch (loginError) {
                console.log('Login attempt result:', loginError.response?.status);
                
                // User doesn't exist or login failed
                if (loginError.response?.status === 404) {
                    // User not found - redirect to complete profile
                    toast.success('Welcome! Please complete your profile to continue.');
                    
                    // Store Google user data temporarily for profile completion
                    sessionStorage.setItem('googleUserData', JSON.stringify(userData));
                    
                    // Navigate to complete profile page
                    setTimeout(() => {
                        navigate('/complete-profile', {
                            state: { googleUserData: userData }
                        });
                    }, 1000);
                } else {
                    // Other error
                    console.error('Login error:', loginError);
                    throw new Error('Failed to authenticate with backend');
                }
            }
        } catch (error) {
            console.error('Google One Tap error:', error);
            toast.error('Failed to sign in with Google. Please try traditional login.');
        } finally {
            isProcessing.current = false;
        }
    };

    // This component doesn't render anything visible
    return null;
};

export default GoogleOneTap;
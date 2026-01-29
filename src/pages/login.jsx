import React, { useState } from 'react';
import { User, Phone, Eye, EyeOff } from 'lucide-react';
import { loginUser, validateFormData } from '../utils/myOrdersFunction';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signInWithGoogle } from '../utils/googleAuth';
import { signInWithFacebook } from '../utils/facebookAuth';
import axios from 'axios';

const Login = ({ onLoginSuccess, onBack }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        phonenumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSignUpClick = () => {
        navigate('/register');
    };

    const handleBackClick = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/');
        }
    };

    // Handle Google Sign-In for existing users with email
    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            const result = await signInWithGoogle();

            if (result.success && result.user) {
                toast.success('Google authentication successful! Checking account...');

                // Parse name into first and last name
                const nameParts = result.user.displayName ? result.user.displayName.split(' ') : ['', ''];
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

                try {
                    // Attempt to login with social authentication
                    const response = await axios.post(`${backendUrl}/api/users/social-login`, {
                        email: result.user.email,
                        providerId: result.user.uid,
                        providerName: 'google',
                        displayName: result.user.displayName
                    });

                    if (response.data.success) {
                        toast.success('Login successful! Welcome back!');

                        // Store authentication data
                        localStorage.setItem('authToken', response.data.token);
                        localStorage.setItem('userDetails', JSON.stringify(response.data.user));

                        // Navigate to My Orders
                        setTimeout(() => {
                            navigate('/myOrders', {
                                replace: true,
                                state: {
                                    loginSuccess: true,
                                    user: response.data.user
                                }
                            });
                        }, 1500);
                    }
                } catch (error) {
                    if (error.response?.status === 404) {
                        toast.error('No account found. Please register first.');
                        setTimeout(() => {
                            navigate('/register');
                        }, 2000);
                    } else {
                        toast.error(error.response?.data?.message || 'Failed to sign in with Google');
                    }
                }
            } else {
                toast.error(result.error || 'Failed to sign in with Google. Please try again.');
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            toast.error('An error occurred during Google sign-in. Please try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    // Handle Facebook Sign-In for existing users with email
    const handleFacebookSignIn = async () => {
        setFacebookLoading(true);
        try {
            const result = await signInWithFacebook();

            if (result.success && result.user) {
                toast.success('Facebook authentication successful! Checking account...');

                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

                try {
                    // Attempt to login with social authentication
                    const response = await axios.post(`${backendUrl}/api/users/social-login`, {
                        email: result.user.email,
                        providerId: result.user.uid,
                        providerName: 'facebook',
                        displayName: result.user.displayName
                    });

                    if (response.data.success) {
                        toast.success('Login successful! Welcome back!');

                        // Store authentication data
                        localStorage.setItem('authToken', response.data.token);
                        localStorage.setItem('userDetails', JSON.stringify(response.data.user));

                        // Navigate to My Orders
                        setTimeout(() => {
                            navigate('/myOrders', {
                                replace: true,
                                state: {
                                    loginSuccess: true,
                                    user: response.data.user
                                }
                            });
                        }, 1500);
                    }
                } catch (error) {
                    if (error.response?.status === 404) {
                        toast.error('No account found. Please register first.');
                        setTimeout(() => {
                            navigate('/register');
                        }, 2000);
                    } else {
                        toast.error(error.response?.data?.message || 'Failed to sign in with Facebook');
                    }
                }
            } else {
                toast.error(result.error || 'Failed to sign in with Facebook. Please try again.');
            }
        } catch (error) {
            console.error('Facebook sign-in error:', error);
            toast.error('An error occurred during Facebook sign-in. Please try again.');
        } finally {
            setFacebookLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setMessage('');

        // Validate form data
        const validation = validateFormData(formData);
        if (!validation.valid) {
            setMessage(validation.message);
            setLoading(false);
            toast.error(validation.message + " - Redirecting to registration...");
            setTimeout(() => {
                navigate('/register');
            }, 2000);
            return;
        }

        try {
            const result = await loginUser(formData);

            if (result.success && result.data.token) {
                setMessage('Login successful! Redirecting to your orders...');
                toast.success('Login successful! Welcome back!');

                // Store authentication data in localStorage
                localStorage.setItem('authToken', result.data.token);
                localStorage.setItem('userDetails', JSON.stringify(result.data.user));

                // Clear form
                setFormData({
                    firstName: '',
                    phonenumber: ''
                });

                // Call success callback if provided
                if (onLoginSuccess) {
                    onLoginSuccess(result.data.token, result.data.user);
                }

                // Navigate to My Orders page
                setTimeout(() => {
                    navigate('/myOrders', {
                        replace: true,
                        state: {
                            loginSuccess: true,
                            user: result.data.user
                        }
                    });
                }, 1500);

            } else {
                const errorMessage = result.data?.message || result.error || 'Login failed';
                setMessage(errorMessage);
                toast.error(errorMessage);
            }
        } catch (error) {
            const errorMessage = 'An unexpected error occurred. Please try again.';
            setMessage(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row mt-10 ">
            {/* Left Side - Decorative */}
            <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-gradient-to-br from-[#c9a961] via-[#d4b876] to-[#e0c589] overflow-hidden relative">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-[#e0c589] to-[#b89551] rounded-full opacity-70"></div>
                    <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-80 h-64 sm:h-80 bg-gradient-to-br from-[#e0c589] to-[#b89551] rounded-full opacity-60"></div>
                </div>
                <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">Login</span>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 w-full lg:w-1/2 bg-[#f5f0e8]">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#c9a961] to-[#4a3728] p-4 sm:p-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">Welcome Back</h2>
                            <p className="text-white text-center mt-2 text-xs sm:text-sm">Sign in to continue</p>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6 md:p-8">
                            <div className="space-y-6">
                                {/* Social Login Buttons */}
                                <div className="space-y-3">
                                    {/* Google Sign-In Button */}
                                    <button
                                        onClick={handleGoogleSignIn}
                                        disabled={googleLoading || facebookLoading || loading}
                                         className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2 sm:gap-3"
                                    >
                                        {googleLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                                <span>Signing in with Google...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                                <span>Continue with Google</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Facebook Sign-In Button */}
                                    <button
                                        onClick={handleFacebookSignIn}
                                        disabled={googleLoading || facebookLoading || loading}
                                        className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                                    >
                                        {facebookLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Signing in with Facebook...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                                <span>Continue with Facebook</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">or login with phone</span>
                                    </div>
                                </div>

                                {/* Traditional Login Form */}
                                <div className="space-y-4">
                                    {/* First Name Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a961] focus:border-transparent transition-all text-sm sm:text-base"
                                                placeholder="Enter your first name"
                                                disabled={loading || googleLoading || facebookLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Number Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="tel"
                                                name="phonenumber"
                                                value={formData.phonenumber}
                                                onChange={handleInputChange}
                                                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a961] focus:border-transparent transition-all text-sm sm:text-base"
                                                placeholder="0771234567"
                                                maxLength="10"
                                                disabled={loading || googleLoading || facebookLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Your phone number is your password
                                        </p>
                                    </div>

                                    {/* Login Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || googleLoading || facebookLoading}
                                        className="w-full bg-gradient-to-r from-[#c9a961] to-[#4a3728] text-white py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Signing in...</span>
                                            </div>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </button>
                                </div>

                                {/* Error/Success Message */}
                                {message && (
                                    <div className={`p-3 rounded-lg text-sm ${message.includes('successful')
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                        {message}
                                    </div>
                                )}

                                {/* Register Link */}
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <button
                                            onClick={handleSignUpClick}
                                            className="font-semibold text-[#c9a961] hover:text-[#b89551] transition-colors"
                                        >
                                            Register here
                                        </button>
                                    </p>
                                </div>

                                {/* Back Button */}
                                <button
                                    onClick={handleBackClick}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-semibold transition-colors duration-200"
                                >
                                    ← Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
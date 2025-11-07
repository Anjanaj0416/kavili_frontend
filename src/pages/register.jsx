import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, MapPin, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { signInWithGoogle } from '../utils/googleAuth';

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phonenumber: '',
        homeaddress: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);
    
    // Check if user came from checkout
    const fromCheckout = location.state?.fromCheckout || false;

    // Pre-fill form if coming from checkout
    useEffect(() => {
        if (fromCheckout && location.state) {
            setFormData({
                firstName: location.state.firstName || '',
                lastName: '',
                phonenumber: location.state.phonenumber || '',
                homeaddress: location.state.homeaddress || '',
                email: ''
            });
            // ✅ FIXED: Changed from toast.info to toast.success
            toast.success('Please complete your registration to place your order');
        }
    }, [fromCheckout, location.state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Google Sign-In
    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            const result = await signInWithGoogle();
            
            if (result.success) {
                console.log('Google sign-in successful, navigating to complete profile...');
                
                // Navigate to complete profile page with Google user data
                navigate('/complete-profile', {
                    state: {
                        googleUser: {
                            uid: result.user.uid,
                            email: result.user.email,
                            firstName: result.user.displayName?.split(' ')[0] || '',
                            lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                            photoURL: result.user.photoURL
                        }
                    }
                });
            } else {
                toast.error(result.error || 'Google sign-in failed');
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            toast.error('Failed to sign in with Google');
        } finally {
            setGoogleLoading(false);
        }
    };

    // Handle traditional registration
    const handleSubmit = async () => {
        setLoading(true);
        setMessage('');

        // Basic validation
        if (!formData.firstName || !formData.phonenumber || !formData.homeaddress) {
            setMessage('First name, phone number, and home address are required');
            setLoading(false);
            toast.error('Please fill in all required fields');
            return;
        }

        // Phone number validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phonenumber)) {
            setMessage('Phone number must be 10 digits');
            setLoading(false);
            toast.error('Phone number must be exactly 10 digits');
            return;
        }

        // Email validation (if provided)
        if (formData.email && formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                setMessage('Please enter a valid email address');
                setLoading(false);
                toast.error('Please enter a valid email address');
                return;
            }
        }

        try {
            // Use environment variable for backend URL or fallback to localhost
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
            
            const response = await fetch(`${backendUrl}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok && data.token) {
                // Store token and user data in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userDetails', JSON.stringify(data.user));
                
                setMessage('Registration successful!');
                toast.success('Registration successful!');
                
                // Check if user came from checkout
                if (fromCheckout) {
                    // Check if there's pending checkout data
                    const pendingCheckoutData = localStorage.getItem('pendingCheckoutData');
                    
                    if (pendingCheckoutData) {
                        toast.success('Redirecting back to cart to complete your order...');
                        setTimeout(() => {
                            navigate('/cart');
                        }, 1500);
                    } else {
                        // No pending checkout data, just go to cart
                        setTimeout(() => {
                            navigate('/cart');
                        }, 1500);
                    }
                } else {
                    // Normal registration flow - redirect to products
                    setTimeout(() => {
                        navigate('/products');
                    }, 1500);
                }
            } else {
                setMessage(data.message || 'Registration failed');
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setMessage('Failed to connect to server. Please try again.');
            toast.error('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pt-20">
            {/* Spice-themed Header - Same as Login */}
            <div className="w-full h-[300px] bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 overflow-hidden relative -mt-20">
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
                    <span className="text-6xl font-bold text-white flex text-center">Register</span>
                </div>
            </div>

            {/* Form Container */}
            <div className="flex items-center justify-center p-4 ">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                    {/* Form Content */}
                    <div className="p-8">
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg ${
                                message.includes('successful') 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {message}
                            </div>
                        )}

                        {fromCheckout && (
                            <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                                <p className="text-sm font-medium">
                                    📋 Your checkout information has been saved. Complete registration to place your order.
                                </p>
                            </div>
                        )}

                        {/* Google Sign-In Button */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading || googleLoading}
                            className="w-full mb-6 bg-white border-2 border-gray-300 hover:border-orange-500 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {googleLoading ? 'Signing in with Google...' : 'Sign up with Google'}
                        </button>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or register with email</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        disabled={loading || googleLoading || (fromCheckout && formData.firstName)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                        placeholder="Enter your first name"
                                    />
                                </div>
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        disabled={loading || googleLoading}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                        placeholder="Enter your last name (optional)"
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="tel"
                                        name="phonenumber"
                                        value={formData.phonenumber}
                                        onChange={handleInputChange}
                                        disabled={loading || googleLoading || (fromCheckout && formData.phonenumber)}
                                        maxLength="10"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                        placeholder="10-digit phone number"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Used as your password and for order updates
                                </p>
                            </div>

                            {/* Home Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Home Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <textarea
                                        name="homeaddress"
                                        value={formData.homeaddress}
                                        onChange={handleInputChange}
                                        disabled={loading || googleLoading}
                                        rows="3"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100 resize-none"
                                        placeholder="Enter your complete home address"
                                    />
                                </div>
                            </div>

                            {/* Email (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email (Optional)
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={loading || googleLoading}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Required for Google sign-in
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading || googleLoading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            >
                                {loading ? 'Creating Account...' : 'Register'}
                            </button>

                            {/* Login Link */}
                            <div className="text-center">
                                <p className="text-gray-600">
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="text-orange-600 hover:text-orange-700 font-semibold"
                                        disabled={loading || googleLoading}
                                    >
                                        Login here
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
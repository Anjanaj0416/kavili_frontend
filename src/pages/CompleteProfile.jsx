import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, MapPin, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function CompleteProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const [socialUserData, setSocialUserData] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phonenumber: '',
        homeaddress: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Get social user data from navigation state or sessionStorage
        let socialData = location.state?.socialUserData;
        
        if (!socialData) {
            const storedData = sessionStorage.getItem('socialUserData');
            if (storedData) {
                socialData = JSON.parse(storedData);
            }
        }
        
        if (!socialData) {
            toast.error('No authentication data found. Please try again.');
            navigate('/register');
            return;
        }

        setSocialUserData(socialData);
        
        // Pre-fill form with social provider data
        setFormData(prev => ({
            ...prev,
            firstName: socialData.firstName || '',
            lastName: socialData.lastName || '',
            email: socialData.email || ''
        }));
    }, [location, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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

        // Email validation (should already be valid from social provider)
        if (formData.email && formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setMessage('Please enter a valid email address');
                setLoading(false);
                toast.error('Invalid email address');
                return;
            }
        }

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
            
            // Register the user with complete profile data
            const response = await axios.post(`${backendUrl}/api/users/social-register`, {
                ...formData,
                providerId: socialUserData.providerId,
                providerName: socialUserData.providerName,
                displayName: socialUserData.displayName,
                photoURL: socialUserData.photoURL
            });

            if (response.data.success) {
                setMessage('Registration successful! Redirecting...');
                toast.success(`🎉 Welcome ${formData.firstName}! Registration complete!`);

                // Store authentication data
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userDetails', JSON.stringify(response.data.user));

                // Clear session storage
                sessionStorage.removeItem('socialUserData');

                // Clear form
                setFormData({
                    firstName: '',
                    lastName: '',
                    phonenumber: '',
                    homeaddress: '',
                    email: ''
                });

                // Navigate to My Orders page
                setTimeout(() => {
                    navigate('/myOrders', { 
                        replace: true,
                        state: { 
                            registrationSuccess: true, 
                            user: response.data.user 
                        }
                    });
                }, 2000);

            } else {
                setMessage(response.data.message || 'Registration failed. Please try again.');
                toast.error(response.data.message || 'Registration failed');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Network error. Please check your connection and try again.';
            setMessage(errorMessage);
            toast.error(errorMessage);
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!socialUserData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Get provider display name
    const providerDisplayName = socialUserData.providerName === 'google' ? 'Google' : 'Facebook';

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-70"></div>
                    <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-60"></div>
                </div>
                <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-bold text-white text-center px-4">Complete Profile</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-4 w-full lg:w-1/2">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                            <h2 className="text-3xl font-bold text-white text-center">Complete Your Profile</h2>
                            <p className="text-white text-center mt-2 text-sm">
                                Signed in with {providerDisplayName}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Info Message */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>📝 Almost there!</strong><br />
                                        Please provide your phone number and address to complete registration.
                                    </p>
                                </div>

                                {/* First Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Enter your first name"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>

                                {/* Email (from social provider, read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                            readOnly
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        From your {providerDisplayName} account
                                    </p>
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="tel"
                                            name="phonenumber"
                                            value={formData.phonenumber}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="0771234567"
                                            maxLength="10"
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        10 digits, no spaces or dashes
                                    </p>
                                </div>

                                {/* Home Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Home Address *
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <textarea
                                            name="homeaddress"
                                            value={formData.homeaddress}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                            placeholder="Enter your full address"
                                            rows="3"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Error/Success Message */}
                                {message && (
                                    <div className={`p-3 rounded-lg text-sm ${
                                        message.includes('successful') 
                                            ? 'bg-green-50 text-green-700 border border-green-200' 
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                        {message}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Completing Registration...</span>
                                        </div>
                                    ) : (
                                        'Complete Registration'
                                    )}
                                </button>

                                {/* Back Button */}
                                <button
                                    type="button"
                                    onClick={() => navigate('/register')}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
                                >
                                    ← Back to Registration
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
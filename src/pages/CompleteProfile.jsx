import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, MapPin, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function CompleteProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const [googleUserData, setGoogleUserData] = useState(null);
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
        // Get Google user data from navigation state or sessionStorage
        let googleData = location.state?.googleUserData;
        
        if (!googleData) {
            const storedData = sessionStorage.getItem('googleUserData');
            if (storedData) {
                googleData = JSON.parse(storedData);
            }
        }
        
        if (!googleData) {
            toast.error('No Google authentication data found. Please try again.');
            navigate('/register');
            return;
        }

        setGoogleUserData(googleData);
        
        // Pre-fill form with Google data
        setFormData(prev => ({
            ...prev,
            firstName: googleData.firstName || '',
            lastName: googleData.lastName || '',
            email: googleData.email || ''
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

        // Email validation (should already be valid from Google)
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
            const response = await axios.post(`${backendUrl}/api/users/google-register`, {
                ...formData,
                googleId: googleUserData.googleId,
                displayName: googleUserData.displayName,
                photoURL: googleUserData.photoURL
            });

            if (response.data.success) {
                setMessage('Registration successful! Redirecting...');
                toast.success(`🎉 Welcome ${formData.firstName}! Registration complete!`);

                // Store authentication data
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userDetails', JSON.stringify(response.data.user));

                // Clear session storage
                sessionStorage.removeItem('googleUserData');

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
            console.error('Registration error:', error);
            setMessage(errorMessage);
            toast.error(errorMessage);
            
            if (error.response?.status === 409) {
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!googleUserData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
                        <p className="text-gray-600">Just a few more details to get started</p>
                        
                        {/* Google Account Info */}
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                ✓ Signed in with: <strong>{googleUserData.email}</strong>
                            </p>
                        </div>
                    </div>

                    {message && (
                        <div className={`mb-4 p-3 rounded-lg ${
                            message.includes('success') || message.includes('Redirecting')
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            <p className="text-sm">{message}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                    placeholder="Enter your first name"
                                />
                            </div>
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name (Optional)
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                    placeholder="Enter your last name"
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    name="phonenumber"
                                    value={formData.phonenumber}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    maxLength="10"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                    placeholder="0771234567"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">10 digits, no spaces</p>
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
                                    disabled={loading}
                                    rows="3"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100 resize-none"
                                    placeholder="Enter your delivery address"
                                />
                            </div>
                        </div>

                        {/* Email (Pre-filled from Google) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled={true}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">✓ Verified by Google</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Completing Profile...
                                </span>
                            ) : (
                                'Complete Registration'
                            )}
                        </button>
                    </form>

                    {/* Info Note */}
                    <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600">
                            <strong>Next Steps:</strong><br />
                            • Complete your profile to finalize registration<br />
                            • You'll be redirected to your orders page<br />
                            • You can sign in anytime using Google
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
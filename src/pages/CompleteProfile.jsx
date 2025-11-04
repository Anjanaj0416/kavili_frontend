import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, MapPin, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompleteProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const [googleUser, setGoogleUser] = useState(null);
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
        // Get Google user data from navigation state
        const googleData = location.state?.googleUser;
        
        if (!googleData) {
            toast.error('No Google authentication data found. Please try again.');
            navigate('/register');
            return;
        }

        setGoogleUser(googleData);
        
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

        // Email validation (should already be valid from Google)
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
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
            
            // Include Google user ID for linking accounts
            const registrationData = {
                ...formData,
                googleId: googleUser.uid,
                authProvider: 'google'
            };

            const response = await fetch(`${backendUrl}/api/users/google-register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData)
            });

            const data = await response.json();
            
            if (response.ok && data.token) {
                // Store token and user data in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userDetails', JSON.stringify(data.user));
                
                setMessage('Profile completed successfully! Redirecting...');
                toast.success(`🎉 Welcome ${data.user.firstName}! Your account is ready!`);

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
                            user: data.user 
                        }
                    });
                }, 2000);

            } else {
                setMessage(data.message || 'Registration failed. Please try again.');
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            const errorMessage = 'Network error. Please check your connection and try again.';
            console.error('Registration error:', error);
            setMessage(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!googleUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-600">Loading...</p>
                </div>
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
                        <p className="text-gray-600">
                            Welcome! Please provide additional details to complete your registration.
                        </p>
                    </div>

                    {/* Google Account Info */}
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Signed in with Google: {googleUser.email}
                        </p>
                    </div>

                    {message && (
                        <div className={`mb-4 p-3 rounded-lg ${
                            message.includes('success') 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            <p className="text-sm">{message}</p>
                        </div>
                    )}

                    {/* Form */}
                    <div className="space-y-4">
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
                                    placeholder="10-digit phone number"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                This will be used for order updates
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
                                    disabled={loading}
                                    rows="3"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100 resize-none"
                                    placeholder="Enter your complete home address"
                                />
                            </div>
                        </div>

                        {/* Email (pre-filled from Google) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                    placeholder="Email from Google"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Email is linked to your Google account
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
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
                    </div>

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
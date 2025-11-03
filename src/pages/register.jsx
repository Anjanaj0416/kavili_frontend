import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phonenumber: '',
        homeaddress: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBackClick = () => {
        navigate('/login');
    };

    const handleLoginClick = () => {
        navigate('/login');
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
                
                setMessage('Registration successful! Redirecting to your orders page...');
                toast.success(`🎉 Welcome ${data.user.firstName}! ${formData.email ? 'Email notifications enabled!' : ''}`);

                // Clear form
                setFormData({
                    firstName: '',
                    lastName: '',
                    phonenumber: '',
                    homeaddress: '',
                    email: ''
                });

                // Navigate to My Orders page after a short delay
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
                
                if (response.status === 409) {
                    setTimeout(() => {
                        const shouldLogin = window.confirm('User already exists. Would you like to go to the login page?');
                        if (shouldLogin) {
                            navigate('/login');
                        }
                    }, 1000);
                }
            }
        } catch (error) {
            const errorMessage = 'Network error. Please check your connection and try again.';
            setMessage(errorMessage);
            toast.error(errorMessage);
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Hero Section */}
            <div className="flex-1 bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 relative overflow-hidden">
                {/* Background spice effects */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        <div className="absolute left-20 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                        <div className="absolute left-24 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-80"></div>
                        <div className="absolute left-70 top-2/3 w-40 h-40 bg-gradient-to-br from-red-500 to-orange-600 rounded-full opacity-50"></div>
                        <div className="absolute left-[300px] top-1/2 w-56 h-56 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-40"></div>
                    </div>
                </div>
                <div className="w-full h-full flex items-center justify-center my-9">
                    <span className="text-6xl font-bold text-white flex text-center">Register</span>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
                        <button
                            onClick={handleBackClick}
                            className="text-gray-500 hover:text-gray-700 text-sm transition-colors flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                        </button>
                    </div>

                    {/* Display message */}
                    {message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${
                            message.includes('successful') 
                                ? 'bg-green-50 text-green-600 border border-green-200' 
                                : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                            {message}
                        </div>
                    )}
                    
                    <div className="space-y-6">
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
                                    disabled={loading}
                                />
                            </div>
                        </div>

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
                                    disabled={loading}
                                />
                            </div>
                        </div>

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
                                    placeholder="Enter 10-digit phone number"
                                    maxLength="10"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                This will be used as your password for future logins
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address (Optional)
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Enter your email address"
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Get email notifications when your order status changes
                            </p>
                        </div>

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
                                    rows="3"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    placeholder="Enter your home address"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                'Register'
                            )}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                onClick={handleLoginClick}
                                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                                disabled={loading}
                            >
                                Login here
                            </button>
                        </p>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600">
                            <strong>After registration:</strong><br />
                            • Your account will be created automatically<br />
                            • You'll be logged in and redirected to your orders page<br />
                            • Use your phone number as password for future logins<br />
                            • Add email to receive order status notifications
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
/*import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Phone } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        phonenumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
        if (!formData.firstName || !formData.phonenumber) {
            setMessage('First name and phone number are required');
            setLoading(false);
            return;
        }

        // Phone number validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phonenumber)) {
            setMessage('Phone number must be 10 digits');
            setLoading(false);
            return;
        }

        try {
            // Use the full localhost URL to match your server
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok && data.token) {
                // Store token and user data (using in-memory storage for demo)
                // In your actual app, you'd use: localStorage.setItem('authToken', data.token);
                setMessage('Login successful!');
                
                // Clear form
                setFormData({
                    firstName: '',
                    phonenumber: ''
                });
                
                // Navigate to dashboard after a short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                setMessage(data.message || 'Login failed');
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUpClick = () => {
        navigate('/register');
    };

    return (
        <div className="w-full min-h-screen bg-orange-100">
            <div className="w-full h-[300px] bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        
                        <div className="absolute right-50 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                        <div className="absolute right-48 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-80"></div>
                        
                        
                        <div className="absolute left-50 top-1/3 w-48 h-48 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full opacity-60"></div>
                        <div className="absolute left-70 top-2/3 w-40 h-40 bg-gradient-to-br from-red-500 to-orange-600 rounded-full opacity-50"></div>
                        <div className="absolute left-[300px] top-1/2 w-56 h-56 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-40"></div>
                    </div>
                </div>
                <div className="w-full h-full flex items-center justify-center my-9">
                    <span className="text-6xl font-bold text-white flex text-center">Login</span>
                </div>
            </div>

            
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>
                    
                    <div className="space-y-6">
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
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Enter your first name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="phonenumber"
                                    value={formData.phonenumber}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Enter your phone number"
                                    maxLength="10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Your phone number is your password
                            </p>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${
                                message.includes('successful') 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button 
                                onClick={handleSignUpClick}
                                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                            >
                                Sign up here
                            </button>
                        </p>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600">
                            <strong>How to login:</strong><br/>
                            1. Enter your first name<br/>
                            2. Enter your phone number (this is your password)<br/>
                            3. Click Login
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}*/

// Login.jsx
import React, { useState } from 'react';
import { User, Phone, Eye, EyeOff } from 'lucide-react';
import { loginUser, validateFormData } from '../utils/myOrdersFunction';
import {  useNavigate } from 'react-router-dom';


const Login = ({ onLoginSuccess, onBack }) => {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        phonenumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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

        // Validate form data
        const validation = validateFormData(formData);
        if (!validation.valid) {
            setMessage(validation.message);
            setLoading(false);
            return;
        }

        try {
            const result = await loginUser(formData);

            if (result.success && result.data.token) {
                setMessage('Login successful!');

                // Clear form
                setFormData({
                    firstName: '',
                    phonenumber: ''
                });

                // Call success callback with user data
                setTimeout(() => {
                    onLoginSuccess(result.data.token, result.data.user);
                }, 1500);
            } else {
                setMessage(result.data?.message || result.error || 'Login failed');
            }
        } catch (error) {
            setMessage('An unexpected error occurred. Please try again.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUpClick = () => {
        navigate('/register');
    };

    return (
        <div className="w-full min-h-screen bg-orange-100">
            {/* Header with spice design */}
            <div className="w-full h-[300px] bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 overflow-hidden relative">
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
                    <span className="text-6xl font-bold text-white flex text-center">Login</span>
                </div>
            </div>

            {/* Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                        <button
                            onClick={onBack}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            ← Back
                        </button>
                    </div>

                    <div className="space-y-6">
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
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Enter your first name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="phonenumber"
                                    value={formData.phonenumber}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Enter your phone number"
                                    maxLength="10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Your phone number is your password
                            </p>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.includes('successful')
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                onClick={handleSignUpClick}
                                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                            >
                                Sign up here
                            </button>
                        </p>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600">
                            <strong>How to login:</strong><br />
                            1. Enter your first name<br />
                            2. Enter your phone number (this is your password)<br />
                            3. Click Login
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
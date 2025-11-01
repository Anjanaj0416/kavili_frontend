// src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { Shield, Phone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        phonenumber: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate inputs
        if (!formData.phonenumber || !formData.password) {
            setError('Phone number and password are required');
            setLoading(false);
            toast.error('Please fill in all fields');
            return;
        }

        try {
            console.log('Attempting admin login...');
            
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/login`,
                {
                    phonenumber: formData.phonenumber.trim(),
                    password: formData.password
                }
            );

            console.log('Login response:', response.data);

            if (response.data.success && response.data.token) {
                // Store authentication data
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userDetails', JSON.stringify(response.data.user));

                toast.success('Login successful! Welcome to admin dashboard');

                // Navigate to admin dashboard
                setTimeout(() => {
                    navigate('/admin/dashboard', { replace: true });
                }, 1000);
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.response) {
                // Server responded with error
                errorMessage = error.response.data?.message || errorMessage;
                
                if (error.response.status === 401) {
                    errorMessage = 'Invalid phone number or password';
                } else if (error.response.status === 429) {
                    errorMessage = error.response.data.message; // Account locked message
                } else if (error.response.status === 403) {
                    errorMessage = 'Access denied. Admin privileges required.';
                }
            } else if (error.request) {
                // No response from server
                errorMessage = 'Cannot connect to server. Please check if the server is running.';
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white p-4 rounded-full shadow-lg">
                            <Shield className="text-blue-600" size={48} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
                    <p className="text-blue-200">Udari Shop Administration Portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <Phone className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="phonenumber"
                                    value={formData.phonenumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter your phone number"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <Lock className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter your password"
                                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                'Login to Dashboard'
                            )}
                        </button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800 text-center">
                            🔒 This is a secure admin area. Your session will expire after 4 hours of inactivity.
                        </p>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            ← Back to Store
                        </button>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 text-center text-blue-200 text-sm">
                    <p>Need help? Contact system administrator</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
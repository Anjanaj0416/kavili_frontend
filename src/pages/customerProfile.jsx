import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Phone, Home, Mail, LogOut, Save, Edit2 } from "lucide-react";

export default function CustomerProfile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        homeAddress: "",
        email: ""
    });

    useEffect(() => {
        checkAuthAndLoadProfile();
    }, []);

    const checkAuthAndLoadProfile = async () => {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userDetails');

        if (!token || !storedUser) {
            toast.error('Please log in to view your profile');
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            setUserDetails(userData);
            setFormData({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                phoneNumber: userData.phonenumber || "",
                homeAddress: userData.homeaddress || "",
                email: userData.email || ""
            });
            setLoading(false);
        } catch (error) {
            console.error('Error loading profile:', error);
            toast.error('Failed to load profile');
            navigate('/login');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveProfile = async () => {
        // Validation
        if (!formData.firstName.trim()) {
            toast.error('First name is required');
            return;
        }

        if (!formData.homeAddress.trim()) {
            toast.error('Home address is required');
            return;
        }

        // Email validation if provided
        if (formData.email && formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                toast.error('Please enter a valid email address');
                return;
            }
        }

        setSaving(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
                {
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    homeaddress: formData.homeAddress.trim(),
                    email: formData.email.trim() || null
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                // Update local storage with new user details
                const updatedUser = {
                    ...userDetails,
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    homeaddress: formData.homeAddress.trim(),
                    email: formData.email.trim() || null
                };
                
                localStorage.setItem('userDetails', JSON.stringify(updatedUser));
                setUserDetails(updatedUser);
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userDetails');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.message || 'Failed to update profile');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        // Reset form to original values
        setFormData({
            firstName: userDetails.firstName || "",
            lastName: userDetails.lastName || "",
            phoneNumber: userDetails.phonenumber || "",
            homeAddress: userDetails.homeaddress || "",
            email: userDetails.email || ""
        });
        setIsEditing(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userDetails');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-orange-50 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <User className="text-orange-600" size={32} />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                                <p className="text-gray-600">Manage your account information</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Account Details</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                                    }`}
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
                                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                                    }`}
                                    placeholder="Enter your last name"
                                />
                            </div>
                        </div>

                        {/* Phone Number (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={formData.phoneNumber}
                                    disabled
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Phone number cannot be changed</p>
                        </div>

                        {/* Home Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Home Address *
                            </label>
                            <div className="relative">
                                <Home className="absolute left-3 top-3 text-gray-400" size={20} />
                                <textarea
                                    value={formData.homeAddress}
                                    onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                                    disabled={!isEditing}
                                    rows={3}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                                    }`}
                                    placeholder="Enter your home address"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address (Optional)
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                                    }`}
                                    placeholder="Enter your email address"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Add email to receive order status notifications
                            </p>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex space-x-4 pt-4">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/myOrders')}
                        className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
                    >
                        <h3 className="font-semibold text-gray-800 mb-1">My Orders</h3>
                        <p className="text-sm text-gray-600">View your order history and track deliveries</p>
                    </button>
                    <button
                        onClick={() => navigate('/products')}
                        className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
                    >
                        <h3 className="font-semibold text-gray-800 mb-1">Continue Shopping</h3>
                        <p className="text-sm text-gray-600">Browse our products and place new orders</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
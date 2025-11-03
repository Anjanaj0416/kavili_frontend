// src/admin/adminUserManagement.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Users, Key, Trash2, Shield, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUserManagement() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Create admin form state
    const [newAdmin, setNewAdmin] = useState({
        firstName: '',
        lastName: '',
        phonenumber: '',
        homeaddress: '',
        password: '',
        confirmPassword: ''
    });

    // Password change form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const [passwordStrength, setPasswordStrength] = useState({ score: 0, level: 'Weak' });
    const [passwordErrors, setPasswordErrors] = useState([]);

    useEffect(() => {
        fetchAdmins();
    }, []);

    useEffect(() => {
        // Calculate password strength on change
        if (newAdmin.password) {
            checkPasswordStrength(newAdmin.password);
        }
    }, [newAdmin.password]);

    const fetchAdmins = async () => {
        try {
            // Try both token keys for compatibility
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            
            if (!token) {
                toast.error('Authentication required. Please login again.');
                setLoading(false);
                return;
            }

            // FIXED: Changed from /api/admin/list to /api/admin/admins
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/admins`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setAdmins(response.data.admins);
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to load admin accounts');
            }
        } finally {
            setLoading(false);
        }
    };

    const checkPasswordStrength = (password) => {
        let score = 0;
        const errors = [];

        // Length check
        if (password.length >= 12) score += 25;
        else errors.push('Password must be at least 12 characters');

        // Character variety
        if (/[a-z]/.test(password)) score += 10;
        else errors.push('Add lowercase letters');

        if (/[A-Z]/.test(password)) score += 15;
        else errors.push('Add uppercase letters');

        if (/[0-9]/.test(password)) score += 15;
        else errors.push('Add numbers');

        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 25;
        else errors.push('Add special characters');

        // Common patterns
        if (!/(.)\1{2,}/.test(password)) score += 10;
        else errors.push('Avoid repeating characters');

        let level = 'Weak';
        if (score >= 80) level = 'Strong';
        else if (score >= 60) level = 'Good';
        else if (score >= 40) level = 'Fair';

        setPasswordStrength({ score, level });
        setPasswordErrors(errors);
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();

        // Validation
        if (!newAdmin.firstName.trim()) {
            toast.error('First name is required');
            return;
        }

        if (!newAdmin.phonenumber.trim()) {
            toast.error('Phone number is required');
            return;
        }

        if (!newAdmin.homeaddress.trim()) {
            toast.error('Home address is required');
            return;
        }

        if (newAdmin.password.length < 12) {
            toast.error('Password must be at least 12 characters');
            return;
        }

        if (newAdmin.password !== newAdmin.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordStrength.score < 60) {
            toast.error('Password is too weak. Please use a stronger password.');
            return;
        }

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/create`,
                {
                    firstName: newAdmin.firstName,
                    lastName: newAdmin.lastName,
                    phonenumber: newAdmin.phonenumber,
                    homeaddress: newAdmin.homeaddress,
                    password: newAdmin.password
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Admin account created successfully!');
                setShowCreateForm(false);
                setNewAdmin({
                    firstName: '',
                    lastName: '',
                    phonenumber: '',
                    homeaddress: '',
                    password: '',
                    confirmPassword: ''
                });
                fetchAdmins();
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            if (error.response?.data?.errors) {
                error.response.data.errors.forEach(err => toast.error(err));
            } else {
                toast.error(error.response?.data?.message || 'Failed to create admin account');
            }
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!passwordForm.currentPassword) {
            toast.error('Current password is required');
            return;
        }

        if (passwordForm.newPassword.length < 12) {
            toast.error('New password must be at least 12 characters');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            toast.error('New passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/password`,
                {
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Password changed successfully!');
                setShowPasswordChange(false);
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            if (error.response?.data?.errors) {
                error.response.data.errors.forEach(err => toast.error(err));
            } else {
                toast.error(error.response?.data?.message || 'Failed to change password');
            }
        }
    };

    const handleDeleteAdmin = async (adminId, adminName) => {
        if (!confirm(`Are you sure you want to delete admin account: ${adminName}?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/${adminId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Admin account deleted successfully');
                fetchAdmins();
            }
        } catch (error) {
            console.error('Error deleting admin:', error);
            toast.error(error.response?.data?.message || 'Failed to delete admin account');
        }
    };

    const getStrengthColor = (level) => {
        switch (level) {
            case 'Strong': return 'text-green-600 bg-green-100';
            case 'Good': return 'text-blue-600 bg-blue-100';
            case 'Fair': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-red-600 bg-red-100';
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Shield className="w-8 h-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
                                <p className="text-gray-600">Manage admin accounts and permissions</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowPasswordChange(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <Key size={20} />
                                <span>Change Password</span>
                            </button>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <UserPlus size={20} />
                                <span>Create Admin</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Admin Accounts List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Users className="w-6 h-6 text-gray-600" />
                        <h2 className="text-xl font-semibold text-gray-800">
                            Admin Accounts ({admins.length})
                        </h2>
                    </div>

                    {admins.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No admin accounts found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {admins.map((admin) => (
                                        <tr key={admin.userId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {admin.firstName} {admin.lastName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {admin.phonenumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {admin.userId}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {admin.homeaddress}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin.userId, `${admin.firstName} ${admin.lastName}`)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create Admin Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold mb-6">Create Admin Account</h2>
                            <form onSubmit={handleCreateAdmin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newAdmin.firstName}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newAdmin.lastName}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={newAdmin.phonenumber}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, phonenumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Home Address *
                                    </label>
                                    <textarea
                                        value={newAdmin.homeaddress}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, homeaddress: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password * (min 12 characters)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newAdmin.password}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            minLength="12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {newAdmin.password && (
                                        <div className="mt-2">
                                            <div className={`text-sm px-2 py-1 rounded inline-block ${getStrengthColor(passwordStrength.level)}`}>
                                                Strength: {passwordStrength.level} ({passwordStrength.score}/100)
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={newAdmin.confirmPassword}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Create Admin
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Change Password Modal */}
                {showPasswordChange && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold mb-6">Change Password</h2>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password * (min 12 characters)
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        minLength="12"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmNewPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Change Password
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordChange(false)}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
// src/admin/adminUserManagement.jsx
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
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/list`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setAdmins(response.data.admins);
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
            toast.error(error.response?.data?.message || 'Failed to load admin accounts');
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

        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;
        else errors.push('Add special characters');

        // Complexity bonus
        const uniqueChars = new Set(password).size;
        if (uniqueChars >= 10) score += 15;

        let level;
        if (score >= 80) level = 'Strong';
        else if (score >= 60) level = 'Good';
        else if (score >= 40) level = 'Fair';
        else level = 'Weak';

        setPasswordStrength({ score, level });
        setPasswordErrors(errors);
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (newAdmin.password !== newAdmin.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        // Check password strength
        if (passwordStrength.score < 60) {
            toast.error('Password is too weak. Please use a stronger password.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
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

        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            toast.error('New passwords do not match!');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken');
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
                            <Shield className="text-blue-600" size={32} />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
                                <p className="text-gray-600">Manage admin accounts and permissions</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowPasswordChange(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                <Key size={20} />
                                <span>Change Password</span>
                            </button>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <UserPlus size={20} />
                                <span>Create Admin</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Admin List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Users size={24} className="text-gray-700" />
                        <h2 className="text-xl font-semibold text-gray-800">Admin Accounts ({admins.length})</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">User ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {admins.map((admin) => (
                                    <tr key={admin.userId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Shield size={16} className="text-blue-600 mr-2" />
                                                <span className="font-medium text-gray-900">
                                                    {admin.firstName} {admin.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{admin.phonenumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">{admin.userId}</td>
                                        <td className="px-6 py-4 text-gray-700">{admin.homeaddress}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleDeleteAdmin(admin.userId, `${admin.firstName} ${admin.lastName}`)}
                                                className="text-red-600 hover:text-red-800 transition"
                                                title="Delete admin"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Admin Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-6">Create Admin Account</h2>
                            <form onSubmit={handleCreateAdmin}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newAdmin.firstName}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={newAdmin.lastName}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={newAdmin.phonenumber}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, phonenumber: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Home Address *</label>
                                        <textarea
                                            required
                                            value={newAdmin.homeaddress}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, homeaddress: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows="2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={newAdmin.password}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-2.5 text-gray-500"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {newAdmin.password && (
                                            <div className="mt-2">
                                                <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStrengthColor(passwordStrength.level)}`}>
                                                    {passwordStrength.level}
                                                </div>
                                                {passwordErrors.length > 0 && (
                                                    <ul className="mt-2 text-xs text-red-600 space-y-1">
                                                        {passwordErrors.map((error, index) => (
                                                            <li key={index}>• {error}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                value={newAdmin.confirmPassword}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-2.5 text-gray-500"
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {newAdmin.confirmPassword && newAdmin.password !== newAdmin.confirmPassword && (
                                            <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                                        )}
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                                        <p className="text-xs text-blue-800 font-medium mb-1">Password Requirements:</p>
                                        <ul className="text-xs text-blue-700 space-y-1">
                                            <li>• At least 12 characters long</li>
                                            <li>• Uppercase and lowercase letters</li>
                                            <li>• Numbers and special characters</li>
                                            <li>• No common passwords</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex space-x-3 mt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                                    >
                                        Create Admin
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setNewAdmin({
                                                firstName: '',
                                                lastName: '',
                                                phonenumber: '',
                                                homeaddress: '',
                                                password: '',
                                                confirmPassword: ''
                                            });
                                        }}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
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
                        <div className="bg-white rounded-lg p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold mb-6">Change Password</h2>
                            <form onSubmit={handleChangePassword}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordForm.confirmNewPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-3 mt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                                    >
                                        Change Password
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordChange(false);
                                            setPasswordForm({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmNewPassword: ''
                                            });
                                        }}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
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
// src/admin/adminCustomerManagement.jsx
import React, { useEffect, useState } from 'react';
import { Users, Phone, MapPin, User, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminCustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            
            if (!token) {
                toast.error('Authentication required');
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/customers`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setCustomers(response.data.customers);
                console.log(`Loaded ${response.data.count} customer accounts`);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            setError(error.response?.data?.message || 'Failed to load customer accounts');
            toast.error('Failed to load customer accounts');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading customer accounts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center space-x-3">
                        <AlertCircle className="text-red-600" size={24} />
                        <div>
                            <h3 className="text-red-800 font-semibold">Error Loading Customers</h3>
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Users className="text-blue-600" size={32} />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Customer Accounts</h1>
                                <p className="text-gray-600">View all registered customer accounts</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Users size={24} className="text-gray-700" />
                        <h2 className="text-xl font-semibold text-gray-800">
                            All Customers ({customers.length})
                        </h2>
                    </div>

                    {customers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No customer accounts found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            User ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Address
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customers.map((customer) => (
                                        <tr key={customer.userId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <User size={16} className="text-blue-600 mr-2" />
                                                    <span className="font-medium text-gray-900">
                                                        {customer.firstName} {customer.lastName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-gray-700">
                                                    <Phone size={14} className="mr-2 text-gray-400" />
                                                    {customer.phonenumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                                                {customer.userId}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start text-gray-700">
                                                    <MapPin size={14} className="mr-2 mt-1 text-gray-400 flex-shrink-0" />
                                                    <span className="line-clamp-2">{customer.homeaddress}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Statistics Card */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Customers</p>
                                <p className="text-3xl font-bold text-blue-600">{customers.length}</p>
                            </div>
                            <Users size={40} className="text-blue-200" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
// myOrdersFunction.js - Utility functions for orders
/*import { Clock, Truck, CheckCircle, XCircle, Package } from 'lucide-react';

// API Functions
export const loginUser = async (formData) => {
    try {
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export const fetchUserOrders = async (authToken) => {
    try {
        if (!authToken) {
            return { success: false, error: 'Please log in to view your orders' };
        }

        const response = await fetch('http://localhost:3000/api/users/my-orders', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export const fetchOrderDetails = async (orderId, authToken) => {
    try {
        const response = await fetch(`http://localhost:3000/api/users/my-orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Error fetching order details:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Utility Functions
export const validateFormData = (formData) => {
    if (!formData.firstName || !formData.phonenumber) {
        return { valid: false, message: 'First name and phone number are required' };
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phonenumber)) {
        return { valid: false, message: 'Phone number must be 10 digits' };
    }

    return { valid: true };
};

// Return icon component and props instead of JSX
export const getStatusIconConfig = (status) => {
    switch (status) {
        case 'preparing':
            return { Icon: Clock, className: "w-5 h-5 text-yellow-500" };
        case 'shipped':
            return { Icon: Truck, className: "w-5 h-5 text-blue-500" };
        case 'delivered':
            return { Icon: CheckCircle, className: "w-5 h-5 text-green-500" };
        case 'cancelled':
            return { Icon: XCircle, className: "w-5 h-5 text-red-500" };
        default:
            return { Icon: Package, className: "w-5 h-5 text-gray-500" };
    }
};

export const getStatusColor = (status) => {
    const colorMap = {
        preparing: 'bg-yellow-100 text-yellow-800',
        shipped: 'bg-blue-100 text-blue-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        default: 'bg-gray-100 text-gray-800'
    };

    return colorMap[status] || colorMap.default;
};

export const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Storage Functions (In-memory for Claude.ai)
let authStorage = {
    token: null,
    userData: null
};

export const storeAuthData = (token, userData) => {
    authStorage.token = token;
    authStorage.userData = userData;
};

export const getAuthData = () => {
    return authStorage;
};

export const clearAuthData = () => {
    authStorage.token = null;
    authStorage.userData = null;
};*/


// myOrdersFunction.js - Utility functions for orders
import { Clock, Truck, CheckCircle, XCircle, Package } from 'lucide-react';

// API Functions
export const loginUser = async (formData) => {
    try {
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export const fetchUserOrders = async (authToken) => {
    try {
        if (!authToken) {
            return { success: false, error: 'Please log in to view your orders' };
        }

        const response = await fetch('http://localhost:3000/api/users/my-orders', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export const fetchOrderDetails = async (orderId, authToken) => {
    try {
        const response = await fetch(`http://localhost:3000/api/users/my-orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Error fetching order details:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Utility Functions
export const validateFormData = (formData) => {
    if (!formData.firstName || !formData.phonenumber) {
        return { valid: false, message: 'First name and phone number are required' };
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phonenumber)) {
        return { valid: false, message: 'Phone number must be 10 digits' };
    }

    return { valid: true };
};

// Return icon component and props instead of JSX
export const getStatusIconConfig = (status) => {
    switch (status) {
        case 'preparing':
            return { Icon: Clock, className: "w-5 h-5 text-yellow-500" };
        case 'shipped':
            return { Icon: Truck, className: "w-5 h-5 text-blue-500" };
        case 'delivered':
            return { Icon: CheckCircle, className: "w-5 h-5 text-green-500" };
        case 'cancelled':
            return { Icon: XCircle, className: "w-5 h-5 text-red-500" };
        default:
            return { Icon: Package, className: "w-5 h-5 text-gray-500" };
    }
};

export const getStatusColor = (status) => {
    const colorMap = {
        preparing: 'bg-yellow-100 text-yellow-800',
        shipped: 'bg-blue-100 text-blue-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        default: 'bg-gray-100 text-gray-800'
    };

    return colorMap[status] || colorMap.default;
};

export const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// myOrdersFunction.js - Updated auth utilities

export function storeAuthData(token, user) {
    try {
        // Store token
        localStorage.setItem('authToken', token);
        
        // Store user data
        localStorage.setItem('userData', JSON.stringify(user));
        
        console.log('Auth data stored successfully');
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('User:', user);
    } catch (error) {
        console.error('Error storing auth data:', error);
    }
}

export function getAuthData() {
    try {
        const token = localStorage.getItem('authToken');
        const userDataString = localStorage.getItem('userData');
        
        if (!token || !userDataString) {
            return null;
        }
        
        const userData = JSON.parse(userDataString);
        
        return {
            token,
            user: userData
        };
    } catch (error) {
        console.error('Error getting auth data:', error);
        return null;
    }
}

export function clearAuthData() {
    try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        console.log('Auth data cleared');
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
}

export function isAuthenticated() {
    const authData = getAuthData();
    return authData !== null && authData.token !== null;
}

// Function to validate token (you can add more validation logic here)
export const validateToken = (token) => {
    if (!token) return false;
    
    try {
        // Basic token format check (you can add more validation)
        const parts = token.split('.');
        return parts.length === 3; // JWT should have 3 parts
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
};


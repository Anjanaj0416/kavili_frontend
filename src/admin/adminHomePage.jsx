// src/admin/adminHomePage.jsx
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { MdDashboard, MdOutlineProductionQuantityLimits, MdShoppingCart, MdPeople, MdContactMail, MdInfo } from "react-icons/md";
import { Shield, LogOut } from "lucide-react";
import AdminProductPage from "./adminProductPage";
import EditProductForm from "./editProductForm";
import AddProductForm from "./addProductFrom";
import AdminOrdersPage from "../components/adminOrderPage";
import AdminDashboard from "./adminDashboard";
import AdminUserManagement from "./adminUserManagement";
import AdminCustomerManagement from "./adminCustomerManagement";
import AdminContactManagement from "./adminContactManagement";
import AdminAboutManagement from "./adminAboutManagement";
import toast from "react-hot-toast";
import AdminReviewManagement from './AdminReviewManagement';
import { MessageSquare } from 'lucide-react';

export default function AdminHomePage() {
  const navigate = useNavigate();

  // Handle admin sign out
  const handleSignOut = () => {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userDetails');

    // Show success message
    toast.success('Signed out successfully');

    // Redirect to admin login page
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="bg-blue-200 w-full h-screen">
      {/* Admin Header with Navigation */}
      <div className="bg-blue-700 w-full h-[100px] flex flex-wrap justify-between items-center px-6 text-white">
        {/* Left side - Navigation Links */}
        <div className="flex gap-6">
          <Link to="/admin/dashboard" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
            <MdDashboard size={24} />
            <span>Dashboard</span>
          </Link>

          <Link to="/admin/products" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
            <MdOutlineProductionQuantityLimits size={24} />
            <span>Products</span>
          </Link>

          <Link to="/admin/orders" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
            <MdShoppingCart size={24} />
            <span>Orders</span>
          </Link>

          <Link to="/admin/customers" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
            <MdPeople size={24} />
            <span>Customers</span>
          </Link>

          <Link to="/admin/users" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
            <Shield size={24} />
            <span>Admin Users</span>
          </Link>

          <Link to="/admin/contact" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
            <MdContactMail size={24} />
            <span>Contact Info</span>
          </Link>
          <Link to="/admin/about" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
            <MdInfo size={24} />
            <span>About Info</span>
          </Link>
          <Link
            to="/admin/reviews"
            className="flex items-center space-x-2 hover:text-gray-300 transition-colors"
          >
            <MessageSquare size={24} />
            <span>Reviews</span>
          </Link>


        </div>

        {/* Right side - Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Admin Routes */}
      <div className="w-full h-[calc(100vh-100px)]">
        <Routes>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/products" element={<AdminProductPage />} />
          <Route path="/products/addProduct" element={<AddProductForm />} />
          <Route path="/products/category/:category/productInfo/:productId/edit" element={<EditProductForm />} />
          <Route path="/orders" element={<AdminOrdersPage />} />
          <Route path="/customers" element={<AdminCustomerManagement />} />
          <Route path="/contact" element={<AdminContactManagement />} />
          <Route path="/about" element={<AdminAboutManagement />} />
          <Route path="/users" element={<AdminUserManagement />} />
          <Route path="/reviews" element={<AdminReviewManagement />} />
        </Routes>
      </div>
    </div>
  );
}
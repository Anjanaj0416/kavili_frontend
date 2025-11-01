import { Link, Route, Routes } from "react-router-dom";
import { MdDashboard, MdOutlineProductionQuantityLimits, MdShoppingCart, MdPeople } from "react-icons/md";
import { Shield } from "lucide-react";  // ← ADD THIS IMPORT
import AdminProductPage from "./adminProductPage";
import EditProductForm from "./editProductForm";
import AddProductForm from "./addProductFrom";
import AdminOrdersPage from "../components/adminOrderPage";
import AdminDashboard from "./adminDashboard";
import AdminUserManagement from "./adminUserManagement";  // ← ADD THIS IMPORT

export default function AdminHomePage() {
  return (
    <div className="bg-blue-200 w-full h-screen">
      <div className="bg-blue-700 w-full h-[100px] flex flex-wrap justify-end gap-6">
        <Link to="/admin/dashboard" className="flex items-center space-x-2 hover:text-gray-300">
          <MdDashboard size={24} />
          <span>Dashboard</span>
        </Link>

        <Link to="/admin/products" className="flex items-center space-x-2 hover:text-gray-300">
          <MdOutlineProductionQuantityLimits size={24} />
          <span>Products</span>
        </Link>

        <Link to="/admin/orders" className="flex items-center space-x-2 hover:text-gray-300">
          <MdShoppingCart size={24} />
          <span>Orders</span>
        </Link>

        <Link to="/admin/customers" className="flex items-center space-x-2 hover:text-gray-300">
          <MdPeople size={24} />
          <span>Customers</span>
        </Link>

        {/* ← ADD THIS NEW LINK */}
        <Link to="/admin/users" className="flex items-center space-x-2 hover:text-gray-300">
          <Shield size={24} />
          <span>Admin Users</span>
        </Link>
      </div>

      <div className="w-full h-[calc(100vh-100px)]">
        <Routes>
           <Route path="/dashboard" element={<AdminDashboard/>} />
           <Route path="/products" element={<AdminProductPage/>}/>
           <Route path="/products/addProduct" element={<AddProductForm/>}/>
           <Route path="/products/category/:category/productInfo/:productId/edit" element={<EditProductForm/>} />
           <Route path="/orders" element={<AdminOrdersPage/>}/>
           <Route path="/customers" element={<h1>Customers</h1>}/> 
           <Route path="/users" element={<AdminUserManagement/>}/>  {/* ← ADD THIS ROUTE */}
        </Routes>
      </div>
    </div>
  );
}
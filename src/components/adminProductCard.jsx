import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminProductCard(props) {
    const { product, category, onDelete } = props;
    
    // Determine the correct navigation path
    const getProductPath = () => {
        if (category && category !== "ALL") {
            return `/admin/products/category/${category}/productInfo/${product.productId}/edit`;
        }
        // If we're viewing all products, use the product's actual category
        return `/admin/products/category/${product.category}/productInfo/${product.productId}/edit`;
    };
    
    console.log("Navigation path:", getProductPath());
    console.log("Product data:", props);
    
    const handleDelete = async (e) => {
        e.preventDefault(); // Prevent navigation to edit page
        e.stopPropagation(); // Stop event bubbling
        
        // Confirmation dialog
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.productName}"?\n\nThis action cannot be undone.`
        );
        
        if (!confirmed) {
            return;
        }
        
        try {
            // Check both token keys for compatibility with different login systems
            const token = localStorage.getItem("authToken") || localStorage.getItem("token");
            
            console.log("Delete attempt - Token check:", {
                authToken: localStorage.getItem("authToken") ? "Present" : "Missing",
                token: localStorage.getItem("token") ? "Present" : "Missing",
                finalToken: token ? "Using token" : "No token found"
            });
            
            if (!token) {
                toast.error("Please login again as administrator");
                return;
            }
            
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/products/${product.productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.message) {
                toast.success("Product deleted successfully");
                // Notify parent component to refresh the product list
                if (onDelete) {
                    onDelete(product.productId);
                }
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error(error.response?.data?.message || "Failed to delete product");
        }
    };
    
    return (
        <div className="relative w-[300px] h-[450px] m-[30px]">
            <Link to={getProductPath()}>
                <div className="w-full h-full bg-gray-200 rounded-lg shadow-lg shadow-gray-500 hover:shadow-black hover:border-[10px] transition-shadow duration-200">
                    <img 
                        src={product.images && product.images[0] ? product.images[0] : '/placeholder-image.png'} 
                        alt={product.productName}
                        className="w-full h-[60%] object-cover overflow-hidden rounded-t-lg"
                    />
                    <div className="h-[40%] p-4 flex flex-col justify-between">
                        <div className="flex-1">
                            <h1 className="text-center text-2xl font-semibold mb-2">{product.productName}</h1>
                            <h2 className="text-center text-lg text-gray-500 line-clamp-2">{product.description}</h2>
                        </div>
                        <div className="flex flex-col mt-2">
                            <p className="text-left text-lg font-bold">LKR.{product.lastPrice.toFixed(2)}</p>
                            {(product.lastPrice < product.price) && (
                                <p className="text-left text-sm text-gray-500 line-through">LKR.{product.price.toFixed(2)}</p>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
            
            {/* Delete Button - Positioned absolutely */}
            <button
                onClick={handleDelete}
                className="absolute top-2 right-2 bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors shadow-lg z-10"
                title="Delete Product"
            >
                <FaTrash size={16} />
            </button>
        </div>
    );
}
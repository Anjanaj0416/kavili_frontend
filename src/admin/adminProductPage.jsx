import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AdminProductCard from "../components/adminProductCard";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

export default function ProductPage() {
    const [products, setProducts] = useState([]);
    const [LoadingStatus, setLoadingStatus] = useState("Loading");
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    const categories = [
        { name: "ALL", value: "ALL" },
        { name: "SWEETS", value: "sweets" },
        { name: "SAVORY", value: "savory" },
        { name: "BEVERAGES", value: "beverages" },
        { name: "SPICES", value: "spices" },
        { name: "CURRIES", value: "curries" }
    ];

    useEffect(() => {
        loadProducts();
    }, [selectedCategory]);

    const loadProducts = () => {
        setLoadingStatus("Loading");

        let url = import.meta.env.VITE_BACKEND_URL + "/api/products";

        if (selectedCategory !== "ALL") {
            url += `/category/${selectedCategory}`;
        }

        axios.get(url)
            .then((res) => {
                // Handle different response structures
                if (selectedCategory === "ALL") {
                    setProducts(res.data);
                } else {
                    setProducts(res.data.products || res.data);
                }
                setLoadingStatus("loaded");
            })
            .catch((err) => {
                toast.error(err.message);
                setLoadingStatus("error");
            });
    };

    const handleCategoryClick = (categoryValue) => {
        setSelectedCategory(categoryValue);
    };

    const getCategoryButtonClass = (categoryValue) => {
        const baseClass = "h-[25px] flex items-center justify-center mt-5 rounded-full p-4 ml-2 transition-colors duration-200";

        if (selectedCategory === categoryValue) {
            return `${baseClass} bg-black text-white`;
        }
        return `${baseClass} bg-white text-black hover:bg-black hover:text-white`;
    };

    // Handler for when a product is deleted
    const handleProductDelete = (deletedProductId) => {
        // Remove the deleted product from the state
        setProducts(prevProducts =>
            prevProducts.filter(product => product.productId !== deletedProductId)
        );
    };

    return (
        <>
            <div className="w-full h-full overflow-y-scroll flex flex-wrap justify-center">
                <div className="w-full h-[75px] bg-black flex items-center justify-center">
                    <div className="w-[15%] h-[75px] flex items-center justify-center">
                        <span className="text-white text-2xl font-bold pl-2">Our Products</span>
                    </div>
                    <div className="w-[85%] h-[75px] bg-gray-300 rounded-l-2xl relative">
                        <div>
                            <Link to="/admin/products/addProduct" className="absolute top-[5px] right-[25px] text-[25px] border-[#3b82fb] text-blue-600 border-[2px] p-5 rounded-xl hover:rounded-full"><FaPlus /></Link>
                        </div>
                    </div>
                </div>

                <div className="w-full h-[45px] flex flex-wrap justify-center gap-3">
                    {categories.map((category) => (
                        <button
                            key={category.value}
                            className={`${getCategoryButtonClass(category.value)} min-w-[80px] sm:min-w-[100px] px-4 sm:px-6 ${category.name === "ALL" ? "w-[100px]" :
                                category.name === "SWEETS" ? "w-[150px]" :
                                    category.name === "SAVORY" ? "w-[150px]" :
                                        category.name === "BEVERAGES" ? "w-[180px]" :
                                            category.name === "SPICES" ? "w-[150px]" :
                                                category.name === "CURRIES" ? "w-[150px]" :
                                                    "w-[150px]"
                                }`}
                            onClick={() => handleCategoryClick(category.value)}
                        >
                            <span className="text-2xl font-bold">{category.name}</span>
                        </button>
                    ))}
                </div>

                <div className="w-full min-h-screen flex flex-wrap justify-center">
                    {LoadingStatus === "Loading" && (
                        <div className="w-full flex justify-center items-center h-64">
                            <span className="text-2xl">Loading products...</span>
                        </div>
                    )}

                    {LoadingStatus === "loaded" && products.length === 0 && (
                        <div className="w-full flex justify-center items-center h-64">
                            <span className="text-2xl">No products found in this category</span>
                        </div>
                    )}

                    {LoadingStatus === "loaded" && products.length > 0 && (
                        products.map((product) => (
                            <AdminProductCard
                                key={product.productId}
                                product={product}
                                category={selectedCategory === "ALL" ? product.category : selectedCategory}
                                onDelete={handleProductDelete}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
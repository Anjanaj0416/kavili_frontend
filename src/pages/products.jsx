import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductCard from "../components/productCard";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductPage() {
    const [products, setProducts] = useState([]);
    const [LoadingStatus, setLoadingStatus] = useState("Loading");
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    const { category } = useParams();
    const navigate = useNavigate();

    const categories = [
        { name: "ALL", value: "ALL" },
        { name: "CLOTHES", value: "clothing" },
        { name: "ELECTRONICS", value: "electronics" },
        { name: "FOOD", value: "food" },
        { name: "FURNITURE", value: "furniture" },
        { name: "HOME", value: "home" }
    ];
    useEffect(() => {
        if (category) {
            // Find the category that matches the URL parameter
            const foundCategory = categories.find(cat => cat.value === category);
            if (foundCategory) {
                setSelectedCategory(foundCategory.value);
            } else {
                // If category not found, redirect to all products
                navigate('/products');
                setSelectedCategory("ALL");
            }
        } else {
            setSelectedCategory("ALL");
        }
    }, [category, navigate]);

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
        if (categoryValue === "ALL") {
            navigate('/products');
        } else {
            navigate(`/products/${categoryValue}`);
        }
    };

    const getCategoryButtonClass = (categoryValue) => {
        const baseClass = "min-h-[32px] sm:min-h-[40px] md:h-[45px] flex items-center justify-center mt-3 sm:mt-5 rounded-full py-2 sm:py-3 md:p-4 transition-colors duration-200";

        if (selectedCategory === categoryValue) {
            return `${baseClass} bg-[#c9a961] text-white`;
        }
        return `${baseClass} bg-white text-[#4a3728] hover:bg-[#c9a961] hover:text-white`;
    };

    return (
        <>
            <div className=" w-full min-h-screen bg-[#f5f0e8] ">
                <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-gradient-to-br from-[#c9a961] via-[#d4b876] to-[#e0c589] overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-full h-full">
                            {/* Main spice pile */}
                            <div className="hidden sm:block absolute right-50 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-90"></div>
                            <div className="hidden sm:block absolute right-48 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-90"></div>
                            <div className="hidden sm:block absolute right-16 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-[#d4b876] to-[#c9a961] rounded-full opacity-80"></div>
                            <div className="hidden md:block absolute left-50 top-1/3 w-48 h-48 bg-gradient-to-br from-[#e0c589] to-[#d4b876] rounded-full opacity-60"></div>
                            <div className="hidden md:block absolute left-70 top-2/3 w-40 h-40 bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-50"></div>
                            <div className="hidden md:block absolute left-[300px] top-1/2 w-56 h-56 bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-40"></div>
                        </div>
                    </div>
                    <div className="w-full h-full flex items-center justify-center my-9">
                        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white flex text-center px-4">Products</span>
                    </div>

                </div>

                <div className="w-[95%] sm:w-[90%] min-h-[45px] flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 mx-auto px-2">
                    {categories.map((category) => (
                        <button
                            key={category.value}
                            className={`${getCategoryButtonClass(category.value)} min-w-[80px] sm:min-w-[100px] px-4 sm:px-6 ${category.name === "ALL" ? "w-[100px]" :
                                category.name === "CLOTHES" ? "w-[150px]" :
                                    category.name === "ELECTRONICS" ? "w-[200px]" :
                                        category.name === "FOOD" ? "w-[10%]" :
                                            category.name === "FURNITURE" ? "w-[200px]" :
                                                "w-[150px]"
                                }`}
                            onClick={() => handleCategoryClick(category.value)}
                        >
                            <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">{category.name}</span>
                        </button>
                    ))}
                </div>

                <div className="w-[95%] sm:w-[90%] min-h-screen flex flex-wrap justify-center mt-6 sm:mt-9 mx-auto pb-12 sm:pb-16 md:pb-20 gap-4 sm:gap-6">
                    {LoadingStatus === "Loading" && (
                        <div className="w-full flex justify-center items-center h-64">
                            <span className="text-lg sm:text-xl md:text-2xl">Loading products...</span>
                        </div>
                    )}

                    {LoadingStatus === "loaded" && products.length === 0 && (
                        <div className="w-full flex justify-center items-center h-64">
                            <span className="text-lg sm:text-xl md:text-2xl">No products found in this category</span>
                        </div>
                    )}

                    {LoadingStatus === "loaded" && products.length > 0 && (
                        products.map((product) => (
                            <ProductCard
                                key={product.productId}
                                product={product}
                                category={selectedCategory === "ALL" ? product.category : selectedCategory}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
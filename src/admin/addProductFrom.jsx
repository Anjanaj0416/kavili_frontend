import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import uploadMediaToSupabase from "../utils/mediaUpload";

export default function AddProductForm() {
    const [productId, setProductId] = useState("");
    const [productName, setProductName] = useState("");
    const [alternativeName, setAlternativeName] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [price, setPrice] = useState("");
    const [lastPrice, setLastPrice] = useState("");
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState("");
    const [category, setCategory] = useState("electronics"); // New category state
    const [tags, setTags] = useState(""); // New tags state
    const navigate = useNavigate();

    // Available categories from your model
    const categories = [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'home', label: 'Home & Garden' },
        { value: 'food', label: 'Food & Beverages' },
        { value: 'furniture', label: 'Furniture' }
    ];

    async function handleSubmit() {
        // Validation
        if (!productName || !price || !lastPrice || !quantity || !category) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const alterName = alternativeName ? alternativeName.split(",").map(name => name.trim()) : [];
            const productTags = tags ? tags.split(",").map(tag => tag.trim()) : [];

            // Upload images
            const promisesArray = [];
            for (let i = 0; i < imageFiles.length; i++) {
                promisesArray[i] = uploadMediaToSupabase(imageFiles[i]);
            }

            const imgUrls = await Promise.all(promisesArray);
            console.log(imgUrls);

            const product = {
                productId: productId || undefined, // Let backend generate if empty
                productName: productName,
                altNames: alterName,
                images: imgUrls,
                price: parseFloat(price),
                lastPrice: parseFloat(lastPrice),
                description: description,
                quantity: parseInt(quantity),
                category: category, // Add category
                tags: productTags // Add tags
            };

            const token = localStorage.getItem("token");

            await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/products", product, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            toast.success("Product added successfully");
            navigate("/admin/products");
        } catch (err) {
            console.error("Error adding product:", err);
            toast.error(err.response?.data?.message || "Failed to add product");
        }
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-red-500 to-red-700 p-6">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
                <h1 className="text-[25px] font-bold text-center text-gray-800 mb-6">
                    Add Product Form
                </h1>
                

                <div className="flex flex-col w-full items-center space-y-4">
                    <div className="flex flex-col w-full">
                        <label className="text-gray-700 font-medium">Product ID (Optional)</label>
                        <input
                            type="text"
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            placeholder="Leave empty for auto-generation"
                        />
                    </div>
                    <div className="flex flex-row gap-4 w-full">
                        <div className="flex flex-col w-full">
                            <label className="text-gray-700 font-medium">Product Name *</label>
                            <input
                                type="text"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-gray-700 font-medium">Alternative names</label>
                            <input
                                type="text"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                value={alternativeName}
                                onChange={(e) => setAlternativeName(e.target.value)}
                                placeholder="Separate with commas"
                            />
                        </div>
                    </div>

                    {/* Category and Tags Row */}
                    <div className="flex flex-row gap-4 w-full">
                        <div className="flex flex-col w-full">
                            <label className="text-gray-700 font-medium">Category *</label>
                            <select
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-gray-700 font-medium">Tags</label>
                            <input
                                type="text"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Separate with commas (e.g., new, sale, featured)"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col w-full">
                        <label className="text-gray-700 font-medium">Product Images</label>
                        <input
                            type="file"
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                            onChange={handleFileChange}
                            multiple
                            accept="image/*"
                        />
                    </div>
                </div>
                <div className="flex flex-col w-full items-center space-y-4">
                    <div className="flex flex-row gap-4 w-full mt-4">
                        <div className="flex flex-col w-full">
                            <label className="text-gray-700 font-medium">Price *</label>
                            <input
                                type="number"
                                step="0.01"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-gray-700 font-medium">Last Price *</label>
                            <input
                                type="number"
                                step="0.01"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                value={lastPrice}
                                onChange={(e) => setLastPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-gray-700 font-medium">Quantity *</label>
                            <input
                                type="number"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-full items-center space-y-4 mt-4">
                    <div className="flex flex-col w-full">
                        <label className="text-gray-700 font-medium">Description</label>
                        <textarea
                            className="border border-gray-300 rounded-md px-3 py-2 h-24 focus:ring-2 focus:ring-red-400 focus:outline-none resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Product description..."
                        />
                    </div>

                    <button
                        className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700 transition duration-200"
                        onClick={handleSubmit}
                    >
                        Add Product
                    </button>
                </div>
            </div>
        </div>
    );
}
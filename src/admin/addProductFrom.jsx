import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import uploadMediaToMongoDB from "../utils/mediaUpload";

export default function AddProductForm() {
    const [productId, setProductId] = useState("");
    const [productName, setProductName] = useState("");
    const [alternativeName, setAlternativeName] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [price, setPrice] = useState("");
    const [lastPrice, setLastPrice] = useState("");
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState("");
    const [category, setCategory] = useState("electronics");
    const [tags, setTags] = useState("");
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    // Available categories
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

        if (imageFiles.length === 0) {
            toast.error("Please select at least one product image");
            return;
        }

        setUploading(true);

        try {
            const alterName = alternativeName ? alternativeName.split(",").map(name => name.trim()) : [];
            const productTags = tags ? tags.split(",").map(tag => tag.trim()) : [];

            // Convert images to Base64 and store in MongoDB
            console.log(`📸 Converting ${imageFiles.length} images...`);
            const imagePromises = [];
            
            for (let i = 0; i < imageFiles.length; i++) {
                imagePromises.push(uploadMediaToMongoDB(imageFiles[i]));
            }

            const base64Images = await Promise.all(imagePromises);
            console.log('✅ All images converted successfully');

            const product = {
                productId: productId || undefined,
                productName: productName,
                altNames: alterName,
                images: base64Images, // Store Base64 strings directly
                price: parseFloat(price),
                lastPrice: parseFloat(lastPrice),
                description: description,
                quantity: parseInt(quantity),
                category: category,
                tags: productTags
            };

            // Get admin token (try both keys for compatibility)
            const token = localStorage.getItem("authToken") || localStorage.getItem("token");

            if (!token) {
                toast.error("Authentication required. Please login again.");
                return;
            }

            await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/products", product, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            toast.success("Product added successfully!");
            navigate("/admin/products");
        } catch (err) {
            console.error("Error adding product:", err);
            toast.error(err.message || "Failed to add product");
        } finally {
            setUploading(false);
        }
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-red-500 to-red-700 p-6">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
                <h1 className="text-[25px] font-bold text-center mb-6 text-gray-800">Add Product Form</h1>
                
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-4">
                        <div className="flex flex-col w-full">
                            <label className="text-gray-700 font-medium">Product ID (Optional)</label>
                            <input
                                type="text"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                placeholder="Leave empty for auto-generation"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-row gap-4">
                        <div className="flex flex-col w-full">
                            <label className="text-gray-700 font-medium">Product Name *</label>
                            <input
                                type="text"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                placeholder="Enter Product Name"
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
                                placeholder="Separate with commas"
                                value={alternativeName}
                                onChange={(e) => setAlternativeName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-row gap-4">
                        <div className="flex flex-col w-full">
                            <label className="text-gray-700 font-medium">Category *</label>
                            <select
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                {categories.map(cat => (
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
                                placeholder="Separate with commas (e.g., new, sale, featured)"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col w-full">
                        <label className="text-gray-700 font-medium">Product Images *</label>
                        <input
                            type="file"
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                            onChange={handleFileChange}
                            multiple
                            accept="image/*"
                            required
                        />
                        {imageFiles.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                                {imageFiles.length} image(s) selected
                            </p>
                        )}
                    </div>

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

                    <div className="flex flex-col w-full">
                        <label className="text-gray-700 font-medium">Description</label>
                        <textarea
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                            placeholder="Enter Product Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className={`w-full text-white font-bold py-3 rounded-md transition-colors ${
                            uploading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {uploading ? '⏳ Adding Product...' : 'Add Product'}
                    </button>
                </div>
            </div>
        </div>
    );
}
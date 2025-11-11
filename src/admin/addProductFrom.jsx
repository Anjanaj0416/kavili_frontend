import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import uploadMediaToMongoDB from "../utils/mediaUpload";

export default function AddProductForm() {
    const [productId, setProductId] = useState("");
    const [productName, setProductName] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [price, setPrice] = useState("");
    const [lastPrice, setLastPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("electronics");
    const [packs, setPacks] = useState([]);
    const [newPackName, setNewPackName] = useState("");
    const [newPackQuantity, setNewPackQuantity] = useState("");
    const [newPackPrice, setNewPackPrice] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const categories = [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'home', label: 'Home & Garden' },
        { value: 'food', label: 'Food & Beverages' },
        { value: 'furniture', label: 'Furniture' }
    ];

    const handleAddPack = () => {
        if (!newPackName || !newPackQuantity || !newPackPrice) {
            toast.error("Please fill all pack fields");
            return;
        }

        const pack = {
            packName: newPackName,
            packQuantity: parseInt(newPackQuantity),
            packPrice: parseFloat(newPackPrice)
        };

        setPacks([...packs, pack]);
        setNewPackName("");
        setNewPackQuantity("");
        setNewPackPrice("");
        toast.success("Pack added");
    };

    const handleRemovePack = (index) => {
        setPacks(packs.filter((_, i) => i !== index));
        toast.success("Pack removed");
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (!productName || !price || !lastPrice || !quantity) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (imageFiles.length === 0) {
            toast.error("Please select at least one image");
            return;
        }

        setLoading(true);

        try {
            const imagePromises = [];
            for (let i = 0; i < imageFiles.length; i++) {
                imagePromises.push(uploadMediaToMongoDB(imageFiles[i]));
            }

            const base64Images = await Promise.all(imagePromises);

            const newProduct = {
                productId: productId || undefined,
                productName,
                images: base64Images,
                price: parseFloat(price),
                lastPrice: parseFloat(lastPrice),
                quantity: parseInt(quantity),
                description,
                category,
                packs: packs
            };

            const token = localStorage.getItem("authToken") || localStorage.getItem("token");

            if (!token) {
                toast.error("Authentication required. Please login again.");
                setLoading(false);
                return;
            }

            const response = await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/api/products",
                newProduct,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success("Product added successfully!");
            navigate("/admin/products");

        } catch (error) {
            console.error("Error adding product:", error);
            toast.error(error.response?.data?.message || "Failed to add product");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Add Product Form</h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product ID */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 font-medium">Product ID (Optional)</label>
                        <input
                            type="text"
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                            placeholder="Leave empty for auto-generation"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                        />
                    </div>

                    {/* Product Name */}
                    <div className="flex flex-col">
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

                    {/* Category */}
                    <div className="flex flex-col">
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

                    {/* Product Images */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 font-medium">Product Images *</label>
                        <input
                            type="file"
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                            onChange={(e) => setImageFiles(Array.from(e.target.files))}
                            multiple
                            accept="image/*"
                            required
                        />
                        {imageFiles.length > 0 && (
                            <small className="text-gray-500 mt-1">{imageFiles.length} image(s) selected</small>
                        )}
                    </div>

                    {/* Price Fields */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <label className="text-gray-700 font-medium">Price *</label>
                            <input
                                type="number"
                                step="0.01"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                placeholder="Enter Price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-gray-700 font-medium">Last Price *</label>
                            <input
                                type="number"
                                step="0.01"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                placeholder="Enter Last Price"
                                value={lastPrice}
                                onChange={(e) => setLastPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-gray-700 font-medium">Quantity *</label>
                            <input
                                type="number"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                placeholder="Enter Quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 font-medium">Description</label>
                        <textarea
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                            placeholder="Enter Product Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                        />
                    </div>

                    {/* Pack Management Section */}
                    <div className="border-t pt-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Product Packs</h3>
                        
                        {/* Add Pack Form */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h4 className="font-semibold text-gray-700 mb-3">Add New Pack</h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col">
                                    <label className="text-gray-600 text-sm mb-1">Pack Name</label>
                                    <input
                                        type="text"
                                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                        placeholder="e.g., 10 Pack"
                                        value={newPackName}
                                        onChange={(e) => setNewPackName(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-gray-600 text-sm mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                        placeholder="10"
                                        value={newPackQuantity}
                                        onChange={(e) => setNewPackQuantity(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-gray-600 text-sm mb-1">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                        placeholder="700.00"
                                        value={newPackPrice}
                                        onChange={(e) => setNewPackPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddPack}
                                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                Add Pack
                            </button>
                        </div>

                        {/* Display Added Packs */}
                        {packs.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-700">Added Packs:</h4>
                                {packs.map((pack, index) => (
                                    <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                                        <div className="flex-1">
                                            <span className="font-semibold text-gray-800">{pack.packName}</span>
                                            <span className="text-gray-600 mx-2">-</span>
                                            <span className="text-gray-700">Qty: {pack.packQuantity}</span>
                                            <span className="text-gray-600 mx-2">-</span>
                                            <span className="text-red-600 font-semibold">Rs. {pack.packPrice.toFixed(2)}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePack(index)}
                                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {loading ? "Adding Product..." : "Add Product"}
                    </button>
                </form>
            </div>
        </div>
    );
}
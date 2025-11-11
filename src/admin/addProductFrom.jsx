import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import uploadMediaToMongoDB from "../utils/mediaUpload";

export default function AddProductForm() {
    const [productId, setProductId] = useState("");
    const [productName, setProductName] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [pricePerPiece, setPricePerPiece] = useState("");
    const [stock, setStock] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("electronics");
    const [availabilityStatus, setAvailabilityStatus] = useState("available");
    const [bulkOffers, setBulkOffers] = useState([]);
    const [newOfferPieces, setNewOfferPieces] = useState("");
    const [newOfferPrice, setNewOfferPrice] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const categories = [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'home', label: 'Home & Garden' },
        { value: 'food', label: 'Food & Beverages' },
        { value: 'furniture', label: 'Furniture' }
    ];

    const handleAddOffer = () => {
        if (!newOfferPieces || !newOfferPrice) {
            toast.error("Please fill all offer fields");
            return;
        }

        if (parseInt(newOfferPieces) <= 0) {
            toast.error("Pieces must be greater than 0");
            return;
        }

        if (parseFloat(newOfferPrice) <= 0) {
            toast.error("Offer price must be greater than 0");
            return;
        }

        const offer = {
            pieces: parseInt(newOfferPieces),
            offerPrice: parseFloat(newOfferPrice)
        };

        setBulkOffers([...bulkOffers, offer]);
        setNewOfferPieces("");
        setNewOfferPrice("");
        toast.success("Bulk offer added");
    };

    const handleRemoveOffer = (index) => {
        setBulkOffers(bulkOffers.filter((_, i) => i !== index));
        toast.success("Bulk offer removed");
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (!productName || !pricePerPiece || !stock) {
            toast.error("Please fill all required fields");
            return;
        }

        if (parseFloat(pricePerPiece) <= 0) {
            toast.error("Price per piece must be greater than 0");
            return;
        }

        if (parseInt(stock) <= 0) {
            toast.error("Stock must be greater than 0");
            return;
        }

        setLoading(true);

        try {
            const imageUrls = await uploadMediaToMongoDB(imageFiles);

            const productData = {
                productId: productId || undefined,
                productName,
                images: imageUrls,
                pricePerPiece: parseFloat(pricePerPiece),
                stock: parseInt(stock),
                description,
                category,
                availabilityStatus,
                bulkOffers: bulkOffers.sort((a, b) => a.pieces - b.pieces)
            };

            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/products`,
                productData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            toast.success("Product created successfully!");
            navigate("/admin/products");
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error(error.response?.data?.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-100 px-4 overflow-y-auto py-8">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8 space-y-6"
            >
                <h2 className="text-3xl font-bold text-gray-800 text-center">Add New Product</h2>

                {/* Product ID (Optional) */}
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
                        {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Images */}
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium">Product Images</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                        onChange={(e) => setImageFiles(Array.from(e.target.files))}
                    />
                    <p className="text-sm text-gray-500 mt-1">You can select multiple images</p>
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="text-gray-700 font-medium">Price Per Piece *</label>
                        <input
                            type="number"
                            step="0.01"
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                            placeholder="Enter Price Per Piece"
                            value={pricePerPiece}
                            onChange={(e) => setPricePerPiece(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-700 font-medium">Stock (Available Pieces) *</label>
                        <input
                            type="number"
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                            placeholder="Enter Stock"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-700 font-medium">Availability Status *</label>
                        <select
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                            value={availabilityStatus}
                            onChange={(e) => setAvailabilityStatus(e.target.value)}
                            required
                        >
                            <option value="available">Available</option>
                            <option value="not available">Not Available</option>
                        </select>
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

                {/* Bulk Offers Section */}
                <div className="border-t pt-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Bulk Offers (Optional)</h3>
                    
                    {/* Add Offer Form */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Add New Bulk Offer</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col">
                                <label className="text-gray-600 text-sm mb-1">Number of Pieces</label>
                                <input
                                    type="number"
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                    placeholder="e.g., 20"
                                    value={newOfferPieces}
                                    onChange={(e) => setNewOfferPieces(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-gray-600 text-sm mb-1">Offer Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                    placeholder="e.g., 1500.00"
                                    value={newOfferPrice}
                                    onChange={(e) => setNewOfferPrice(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddOffer}
                            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            Add Bulk Offer
                        </button>
                    </div>

                    {/* Display Added Offers */}
                    {bulkOffers.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-700">Added Bulk Offers:</h4>
                            {bulkOffers.map((offer, index) => (
                                <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                                    <div className="flex-1">
                                        <span className="font-semibold text-gray-800">{offer.pieces} pieces</span>
                                        <span className="text-gray-600 mx-2">-</span>
                                        <span className="text-green-600 font-semibold">Rs. {offer.offerPrice.toFixed(2)}</span>
                                        <span className="text-gray-600 text-sm ml-2">
                                            (Rs. {(offer.offerPrice / offer.pieces).toFixed(2)} per piece)
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOffer(index)}
                                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        className="flex-1 px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:ring focus:ring-gray-300 focus:outline-none"
                        onClick={() => navigate("/admin/products")}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`flex-1 px-4 py-2 font-medium rounded-md focus:ring focus:ring-red-300 focus:outline-none ${
                            loading 
                                ? 'bg-red-400 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                        disabled={loading}
                    >
                        {loading ? 'Creating Product...' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
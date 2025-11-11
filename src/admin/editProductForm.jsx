import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import uploadMediaToMongoDB from "../utils/mediaUpload";

export default function EditProductForm() {
  const { productId, category } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [formProductId, setFormProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [pricePerPiece, setPricePerPiece] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [productCategory, setProductCategory] = useState("electronics");
  const [availabilityStatus, setAvailabilityStatus] = useState("available");
  const [bulkOffers, setBulkOffers] = useState([]);
  const [newOfferPieces, setNewOfferPieces] = useState("");
  const [newOfferPrice, setNewOfferPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'furniture', label: 'Furniture' }
  ];

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !category) {
        console.log("Missing productId or category");
        return;
      }

      if (product) {
        console.log("Product already loaded");
        return;
      }

      console.log("Fetching product:", productId, category);
      setIsFetching(true);

      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        
        if (!token) {
          toast.error("Authentication required. Please login again.");
          navigate("/admin/products");
          return;
        }
        
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/category/${category}/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log("Product fetched:", response.data);
        
        if (response.data && response.data.product) {
          setProduct(response.data.product);
        } else {
          throw new Error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product data");
        navigate("/admin/products");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProduct();
  }, [productId, category, navigate]);

  // Initialize form data
  useEffect(() => {
    if (!product) {
      console.log("Product not loaded yet");
      return;
    }

    console.log("Initializing form with product:", product);

    try {
      setFormProductId(product.productId || "");
      setProductName(product.productName || "");
      setExistingImages(product.images || []);
      
      // Handle both old and new field names
      const price = product.pricePerPiece || product.lastPrice || product.price || "";
      setPricePerPiece(price);
      
      const stockValue = product.stock || product.quantity || "";
      setStock(stockValue);
      
      setDescription(product.description || "");
      setProductCategory(product.category || "electronics");
      setAvailabilityStatus(product.availabilityStatus || "available");
      
      // Handle bulk offers or old packs
      const offers = product.bulkOffers || product.packs || [];
      setBulkOffers(offers);
      
      setIsInitialized(true);
      console.log("Form initialized successfully");
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Error loading product data");
      navigate("/admin/products");
    }
  }, [product, navigate]);

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

  const handleRemoveExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
    toast.success("Image marked for removal");
  };

  async function handleSubmit() {
    if (!product) {
      toast.error("No product data available");
      return;
    }

    setLoading(true);

    try {
      let imageUrls = [...existingImages];

      if (newImageFiles.length > 0) {
        const newUrls = await uploadMediaToMongoDB(newImageFiles);
        imageUrls = [...imageUrls, ...newUrls];
      }

      const updatedProductData = {
        productId: formProductId,
        productName,
        images: imageUrls,
        pricePerPiece: parseFloat(pricePerPiece),
        stock: parseInt(stock),
        description,
        category: productCategory,
        availabilityStatus,
        bulkOffers: bulkOffers.sort((a, b) => a.pieces - b.pieces)
      };

      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`,
        updatedProductData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Product updated successfully!");
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  }

  if (isFetching) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
          <button
            onClick={() => navigate("/admin/products")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">Edit Product</h2>

        {/* Product ID (Read-only) */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium">Product ID</label>
          <input
            type="text"
            className="border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
            value={formProductId}
            disabled
          />
        </div>

        {/* Product Name */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium">Product Name *</label>
          <input
            type="text"
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
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
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Existing Images</label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {existingImages.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Images */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium">Add New Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
            onChange={(e) => setNewImageFiles(Array.from(e.target.files))}
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
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
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
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
              placeholder="Enter Stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Availability Status *</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
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
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
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
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
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
            type="button"
            className={`flex-1 px-4 py-2 font-medium rounded-md focus:ring focus:ring-blue-300 focus:outline-none ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Updating Product...' : 'Update Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
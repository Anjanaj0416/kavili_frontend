import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import uploadMediaToMongoDB from "../utils/mediaUpload";

export default function EditProductForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { category, productId } = useParams();

  const [product, setProduct] = useState(location.state?.product || null);
  const [formProductId, setFormProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [alternativeNames, setAlternativeNames] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [price, setPrice] = useState("");
  const [lastPrice, setLastPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [productCategory, setProductCategory] = useState("electronics");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'furniture', label: 'Furniture' }
  ];

  // Fetch product data if not available
  useEffect(() => {
    const fetchProduct = async () => {
      if (!product && productId && category) {
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
      }
    };

    fetchProduct();
  }, [product, productId, category, navigate]);

  // Initialize form data
  useEffect(() => {
    if (!product) return;

    try {
      const altNames = product.altNames ? product.altNames.join(",") : "";
      const productTags = product.tags ? product.tags.join(",") : "";
      
      setFormProductId(product.productId || "");
      setProductName(product.productName || "");
      setAlternativeNames(altNames);
      setExistingImages(product.images || []);
      setPrice(product.price || "");
      setLastPrice(product.lastPrice || "");
      setStock(product.stock || product.quantity || "");
      setDescription(product.description || "");
      setProductCategory(product.category || "electronics");
      setTags(productTags);
      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Error loading product data");
      navigate("/admin/products");
    }
  }, [product, navigate]);

  async function handleSubmit() {
    if (!product) {
      toast.error("No product data available");
      return;
    }

    setLoading(true);

    try {
      const altNames = alternativeNames.split(",").map(name => name.trim()).filter(name => name);
      const productTags = tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      
      let allImages = [...existingImages];
      
      // Convert and add new images if any are selected
      if (imageFiles && imageFiles.length > 0) {
        console.log(`📸 Converting ${imageFiles.length} new images...`);
        const newImagePromises = [];
        
        for (let i = 0; i < imageFiles.length; i++) {
          newImagePromises.push(uploadMediaToMongoDB(imageFiles[i]));
        }
        
        const newBase64Images = await Promise.all(newImagePromises);
        allImages = [...existingImages, ...newBase64Images];
        console.log('✅ New images converted successfully');
      }

      const productData = {
        productId: formProductId,
        productName: productName,
        altNames: altNames,
        images: allImages, // All images (existing + new) as Base64
        price: parseFloat(price) || 0,
        lastPrice: parseFloat(lastPrice) || 0,
        stock: parseInt(stock) || 0,
        quantity: parseInt(stock) || 0,
        description: description,
        category: productCategory,
        tags: productTags
      };

      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }
      
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${product.productId}`,
        productData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success("Product updated successfully!");
      navigate("/admin/products");
      
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  }

  // Remove an existing image
  const removeImage = (indexToRemove) => {
    setExistingImages(existingImages.filter((_, index) => index !== indexToRemove));
    toast.success("Image removed");
  };

  if (isFetching || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isFetching ? "Loading product..." : "Initializing..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Product</h1>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col flex-1">
              <label className="text-gray-700 font-medium">Product ID</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                value={formProductId}
                disabled
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col flex-1">
              <label className="text-gray-700 font-medium">Product Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                placeholder="Enter Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-gray-700 font-medium">Alternative Names</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                placeholder="Comma-separated"
                value={alternativeNames}
                onChange={(e) => setAlternativeNames(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col flex-1">
              <label className="text-gray-700 font-medium">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-gray-700 font-medium">Tags</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                placeholder="Enter tags (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          {existingImages.length > 0 && (
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2">Current Images</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={img} 
                      alt={`Product ${index + 1}`} 
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Add New Images</label>
            <input
              type="file"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
              multiple
              accept="image/*"
            />
            <small className="text-gray-500 mt-1">
              Select images to add. New images will be added to existing ones.
            </small>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className="text-gray-700 font-medium">Price</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                placeholder="Enter Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className="text-gray-700 font-medium">Last Price</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                placeholder="Enter Last Price"
                value={lastPrice}
                onChange={(e) => setLastPrice(e.target.value)}
              />
            </div>

            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className="text-gray-700 font-medium">Stock/Quantity</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                placeholder="Enter Stock Quantity"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

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
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? '⏳ Updating...' : 'Update Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
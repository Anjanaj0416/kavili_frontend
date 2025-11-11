import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ShoppingCart, Heart, Star, Package, Truck, Shield, ArrowLeft, Plus, Minus } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import NotFound from "../components/notFound";
import { addToCart, clearCart } from "../utils/cartFunction";
import ProductReviews from "../components/ProductReviews";
import AddToCartModal from "../components/AddToCartModal";

export default function ProductOverView() {
    const params = useParams();
    const navigate = useNavigate();

    const { category, productId } = params;

    const [product, setProduct] = useState({});
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [states, setStates] = useState("Loading");
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedPack, setSelectedPack] = useState(null);
    const [customQuantity, setCustomQuantity] = useState(1);
    const [currentPrice, setCurrentPrice] = useState(0);

    // NEW: State for Add to Cart Modal
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        console.log("Category:", category, "Product ID:", productId);
        loadProduct();
    }, [category, productId]);

    const loadProduct = () => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/category/${category}/${productId}`)
            .then((res) => {
                console.log(res.data);

                if (res.data == null || !res.data.product) {
                    setStates("not-found");
                } else {
                    setProduct(res.data.product);
                    setCurrentPrice(res.data.product.lastPrice);
                    setStates("found");
                    loadRelatedProducts(category, res.data.product.productId);
                }
            })
            .catch((error) => {
                console.error("Error fetching product:", error);
                if (error.response && error.response.status === 404) {
                    setStates("not-found");
                } else {
                    toast.error("Failed to load product");
                    setStates("error");
                }
            });
    };

    const loadRelatedProducts = (categoryName, currentProductId) => {
        setRelatedLoading(true);

        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/category/${categoryName}`)
            .then((res) => {
                const filteredProducts = (res.data.products || res.data)
                    .filter(p => p.productId !== currentProductId)
                    .slice(0, 4);

                setRelatedProducts(filteredProducts);
                setRelatedLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching related products:", error);
                setRelatedLoading(false);
            });
    };

    const handlePackSelection = (pack) => {
        if (selectedPack && selectedPack.packName === pack.packName) {
            // Deselect pack
            setSelectedPack(null);
            setCurrentPrice(product.lastPrice);
            setQuantity(customQuantity);
        } else {
            // Select new pack
            setSelectedPack(pack);
            setCurrentPrice(pack.packPrice);
            setQuantity(pack.packQuantity);
        }
    };

    const handleCustomSelection = () => {
        setSelectedPack(null);
        setCurrentPrice(product.lastPrice);
        setQuantity(customQuantity);
    };

    const handleQuantityChange = (increment) => {
        if (selectedPack) {
            // If pack is selected, don't allow quantity change
            toast.info("Quantity is fixed for packs. Select Custom to adjust quantity.");
            return;
        }
        
        if (increment) {
            setCustomQuantity(prev => Math.min(prev + 1, product.quantity));
        } else {
            setCustomQuantity(prev => Math.max(prev - 1, 1));
        }
        setQuantity(prev => increment ? Math.min(prev + 1, product.quantity) : Math.max(prev - 1, 1));
    };

    // MODIFIED: Updated handleAddToCart to show modal
    const handleAddToCart = () => {
        if (product.quantity === 0) {
            toast.error("Product is out of stock");
            return;
        }

        if (quantity > product.quantity) {
            toast.error(`Only ${product.quantity} items available in stock`);
            return;
        }

        // Use the existing addToCart function signature (productId, qty)
        addToCart(product.productId, quantity);
        
        // Show success toast
        toast.success(`${quantity} ${product.productName} added to cart!`);
        
        // Show the modal
        setShowModal(true);
    };

    // Handler for Keep Shopping button
    const handleKeepShopping = () => {
        setShowModal(false);
    };

    // Handler for Pay Now button
    const handlePayNow = () => {
        setShowModal(false);
        navigate('/cart');
    };

    const discount = product.price && product.lastPrice
        ? Math.round(((product.price - product.lastPrice) / product.price) * 100)
        : 0;

    if (states === "not-found") {
        return <NotFound />;
    }

    if (states === "Loading") {
        return (
            <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#c9a961] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F4EF]">
            {/* Add to Cart Modal */}
            <AddToCartModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onKeepShopping={handleKeepShopping}
                onPayNow={handlePayNow}
                productName={product.productName}
                quantity={quantity}
            />

            {/* Breadcrumb */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Link to="/" className="text-gray-600 hover:text-[#c9a961]">Home</Link>
                        <span className="text-gray-400">/</span>
                        <Link to="/products" className="text-gray-600 hover:text-[#c9a961]">Products</Link>
                        <span className="text-gray-400">/</span>
                        <Link to={`/products/${category}`} className="text-gray-600 hover:text-[#c9a961] capitalize">
                            {category}
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-[#c9a961]">{product.productName}</span>
                    </div>
                </div>
            </div>

            {/* Main Product Section */}
            <div className="container mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#c9a961] mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Products
                </button>

                <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Product Images */}
                        <div>
                            <div className="space-y-4">
                                {/* Main Image */}
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[selectedImage]}
                                            alt={product.productName}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-24 h-24 text-gray-300" />
                                        </div>
                                    )}
                                    {discount > 0 && (
                                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                                            -{discount}%
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Images */}
                                {product.images && product.images.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto">
                                        {product.images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                                    ? 'border-[#c9a961] ring-2 ring-[#c9a961] ring-opacity-50'
                                                    : 'border-gray-200 hover:border-[#c9a961]'
                                                    }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${product.productName} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Category Badge */}
                            <div className="inline-block">
                                <span className="px-3 py-1 bg-[#c9a961] bg-opacity-20 text-[#4a3728] rounded-full text-sm font-semibold uppercase">
                                    {category}
                                </span>
                            </div>

                            {/* Product Name */}
                            <h1 className="text-3xl lg:text-4xl font-bold text-[#645430]">
                                {product.productName}
                            </h1>

                            {/* Stock Status */}
                            <div className="flex items-center gap-2">
                                {product.quantity > 0 ? (
                                    <>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-green-700 font-medium">
                                            In Stock ({product.quantity} available)
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-red-700 font-medium">Out of Stock</span>
                                    </>
                                )}
                            </div>

                            {/* Pack Selection */}
                            {product.packs && product.packs.length > 0 && (
                                <div className="border-t border-b border-gray-200 py-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Amount : {selectedPack ? selectedPack.packName : `${customQuantity} Pack`}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product.packs.map((pack, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handlePackSelection(pack)}
                                                className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all ${selectedPack && selectedPack.packName === pack.packName
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                    : 'border-gray-300 hover:border-orange-400'
                                                    }`}
                                            >
                                                {pack.packName}
                                            </button>
                                        ))}
                                        <button
                                            onClick={handleCustomSelection}
                                            className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all ${!selectedPack
                                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                : 'border-gray-300 hover:border-orange-400'
                                                }`}
                                        >
                                            CUSTOM
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Price */}
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-bold text-[#c9a961]">
                                    Rs. {currentPrice.toFixed(2)}
                                </span>
                                {product.price && product.price > currentPrice && !selectedPack && (
                                    <span className="text-xl text-gray-400 line-through">
                                        Rs. {product.price.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="border-t border-b border-gray-200 py-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                                </div>
                            )}

                            {/* Quantity Selector and Add to Cart */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    {!selectedPack && (
                                        <div className="flex items-center border-2 border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => handleQuantityChange(false)}
                                                disabled={quantity <= 1}
                                                className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Minus size={20} className="text-gray-600" />
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    setQuantity(Math.min(Math.max(val, 1), product.quantity));
                                                    setCustomQuantity(Math.min(Math.max(val, 1), product.quantity));
                                                }}
                                                className="w-16 text-center border-x-2 border-gray-300 py-3 focus:outline-none"
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(true)}
                                                disabled={quantity >= product.quantity}
                                                className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Plus size={20} className="text-gray-600" />
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.quantity === 0}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#FF8C00] text-white font-semibold rounded-lg hover:bg-[#FF7700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ShoppingCart size={20} />
                                        ADD TO CART
                                    </button>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                <div className="flex items-center gap-3">
                                    <Truck className="text-[#c9a961]" size={24} />
                                    <div>
                                        <p className="font-semibold text-gray-800">Free Delivery</p>
                                        <p className="text-sm text-gray-600">On orders over Rs. 2000</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="text-[#c9a961]" size={24} />
                                    <div>
                                        <p className="font-semibold text-gray-800">Secure Payment</p>
                                        <p className="text-sm text-gray-600">100% secure payment</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Package className="text-[#c9a961]" size={24} />
                                    <div>
                                        <p className="font-semibold text-gray-800">Quality Assured</p>
                                        <p className="text-sm text-gray-600">Premium products</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Reviews Section */}
                <ProductReviews productId={productId} category={category} />

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
                        {relatedLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a961] mx-auto"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((relatedProduct) => (
                                    <Link
                                        key={relatedProduct.productId}
                                        to={`/products/${relatedProduct.category}/${relatedProduct.productId}`}
                                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                                    >
                                        <div className="aspect-square bg-gray-100">
                                            {relatedProduct.images && relatedProduct.images[0] ? (
                                                <img
                                                    src={relatedProduct.images[0]}
                                                    alt={relatedProduct.productName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-16 h-16 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                                {relatedProduct.productName}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-[#c9a961]">
                                                    Rs. {relatedProduct.lastPrice?.toFixed(2)}
                                                </span>
                                                {relatedProduct.price > relatedProduct.lastPrice && (
                                                    <span className="text-sm text-gray-400 line-through">
                                                        Rs. {relatedProduct.price?.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
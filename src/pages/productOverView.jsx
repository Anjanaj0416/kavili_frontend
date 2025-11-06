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

    const handleQuantityChange = (increment) => {
        if (increment) {
            setQuantity(prev => Math.min(prev + 1, product.quantity));
        } else {
            setQuantity(prev => Math.max(prev - 1, 1));
        }
    };

    // MODIFIED: Updated handleAddToCart to show modal
    const handleAddToCart = () => {
        if (product.quantity === 0) {
            toast.error("Product is out of stock");
            return;
        }

        // Add to cart
        addToCart(product.productId, quantity);

        // Show success toast
        toast.success(`${quantity} ${product.productName} added to cart!`);
        
        // Show the modal
        setShowModal(true);
    };

    // NEW: Handler for Keep Shopping button
    const handleKeepShopping = () => {
        setShowModal(false);
        // Stay on the same page, just close the modal
    };

    // NEW: Handler for Pay Now button
    const handlePayNow = () => {
        setShowModal(false);
        // Navigate to cart page
        navigate('/cart');
    };

    const calculateDiscount = () => {
        if (product.price && product.lastPrice && product.price > product.lastPrice) {
            return Math.round(((product.price - product.lastPrice) / product.price) * 100);
        }
        return 0;
    };

    if (states === "Loading") {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center pt-24">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (states === "not-found") {
        return <NotFound />;
    }

    const discount = calculateDiscount();

    return (
        <div className="min-h-screen bg-orange-50 pt-24 pb-16">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Link to="/" className="hover:text-orange-600">Home</Link>
                    <span>/</span>
                    <Link to="/products" className="hover:text-orange-600">Products</Link>
                    <span>/</span>
                    <Link to={`/products/${category}`} className="hover:text-orange-600 capitalize">{category}</Link>
                    <span>/</span>
                    <span className="text-gray-800">{product.productName}</span>
                </div>
            </div>

            {/* Product Details Section */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Product Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
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
                                <div className="grid grid-cols-4 gap-2">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                                selectedImage === index
                                                    ? 'border-orange-600'
                                                    : 'border-gray-200 hover:border-gray-300'
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

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Category Badge */}
                            <div className="inline-block">
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold uppercase">
                                    {category}
                                </span>
                            </div>

                            {/* Product Name */}
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
                                {product.productName}
                            </h1>

                            {/* Alternative Names */}
                            {product.altNames && product.altNames.length > 0 && (
                                <p className="text-gray-600 italic">
                                    Also known as: {product.altNames.join(', ')}
                                </p>
                            )}

                            {/* Price */}
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-bold text-orange-600">
                                    Rs. {product.lastPrice?.toFixed(2)}
                                </span>
                                {product.price && product.price > product.lastPrice && (
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

                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector and Add to Cart */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border-2 border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => handleQuantityChange(false)}
                                            disabled={quantity <= 1}
                                            className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Minus size={20} />
                                        </button>
                                        <span className="px-6 py-3 font-semibold text-lg">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(true)}
                                            disabled={quantity >= product.quantity}
                                            className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
                                    </p>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.quantity === 0}
                                    className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart size={24} />
                                    {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                    <Truck className="w-6 h-6 text-orange-600" />
                                    <div>
                                        <p className="text-xs text-gray-600">Fast</p>
                                        <p className="font-semibold text-sm">Delivery</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                    <Shield className="w-6 h-6 text-orange-600" />
                                    <div>
                                        <p className="text-xs text-gray-600">Quality</p>
                                        <p className="font-semibold text-sm">Guaranteed</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                    <Package className="w-6 h-6 text-orange-600" />
                                    <div>
                                        <p className="text-xs text-gray-600">Secure</p>
                                        <p className="font-semibold text-sm">Packaging</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Reviews Section */}
                <div className="mt-8">
                    <ProductReviews productId={productId} />
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">You May Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <Link
                                    key={relatedProduct.productId}
                                    to={`/category/${category}/productInfo/${relatedProduct.productId}`}
                                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                                >
                                    <div className="aspect-square bg-gray-100 overflow-hidden">
                                        {relatedProduct.images && relatedProduct.images.length > 0 ? (
                                            <img
                                                src={relatedProduct.images[0]}
                                                alt={relatedProduct.productName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
                                            <span className="text-orange-600 font-bold">
                                                Rs. {relatedProduct.lastPrice?.toFixed(2)}
                                            </span>
                                            {relatedProduct.price && relatedProduct.price > relatedProduct.lastPrice && (
                                                <span className="text-gray-400 text-sm line-through">
                                                    Rs. {relatedProduct.price.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* NEW: Add to Cart Modal */}
            <AddToCartModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onKeepShopping={handleKeepShopping}
                onPayNow={handlePayNow}
                productName={product.productName}
                quantity={quantity}
            />
        </div>
    );
}
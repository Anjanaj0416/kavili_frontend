import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Minus, Plus, ShoppingCart, ArrowLeft, Truck, Shield, Star } from "lucide-react";
import toast from "react-hot-toast";
import { addToCart } from "../utils/cartFunction";
import AddToCartModal from "../components/AddToCartModal";
import NotFound from "../components/notFound";
import ProductReviews from "../components/ProductReviews";

export default function ProductOverView() {
    const navigate = useNavigate();
    const { category, productId } = useParams();

    const [product, setProduct] = useState(null);
    const [states, setStates] = useState("Loading");
    const [mainImage, setMainImage] = useState("");
    const [pieces, setPieces] = useState(1);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [calculatedPrice, setCalculatedPrice] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);

    useEffect(() => {
        if (productId && category) {
            axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/products/category/${category}/${productId}`
            )
                .then((res) => {
                    if (res.data && res.data.product) {
                        setProduct(res.data.product);
                        setMainImage(res.data.product.images?.[0] || "");
                        setStates("found");
                        
                        // Set initial calculated price
                        const pricePerPiece = res.data.product.pricePerPiece || res.data.product.price || 0;
                        setCalculatedPrice(pricePerPiece);
                        
                        // Fetch related products
                        fetchRelatedProducts(category);
                    } else {
                        setStates("not-found");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching product:", error);
                    setStates("not-found");
                });
        }
    }, [productId, category]);

    // Calculate price whenever pieces or selected offer changes
    useEffect(() => {
        if (!product) return;

        if (selectedOffer) {
            // If an offer is selected, use the offer price
            setCalculatedPrice(selectedOffer.offerPrice);
        } else {
            // Calculate price based on pieces
            const pricePerPiece = product.pricePerPiece || product.price || 0;
            setCalculatedPrice(pieces * pricePerPiece);
        }
    }, [pieces, selectedOffer, product]);

    const fetchRelatedProducts = (productCategory) => {
        setRelatedLoading(true);
        const currentProductId = productId;

        axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/products/category/${productCategory}`
        )
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

    const handleOfferSelection = (offer) => {
        if (selectedOffer && selectedOffer.pieces === offer.pieces) {
            // Deselect offer
            setSelectedOffer(null);
            setPieces(1);
        } else {
            // Select new offer
            setSelectedOffer(offer);
            setPieces(offer.pieces);
        }
    };

    const handleCustomSelection = () => {
        setSelectedOffer(null);
        setPieces(1);
    };

    const handlePiecesChange = (increment) => {
        if (selectedOffer) {
            toast.info("Pieces are fixed for bulk offers. Select Custom to adjust pieces.");
            return;
        }
        
        if (increment) {
            setPieces(prev => prev + 1);
        } else {
            setPieces(prev => Math.max(prev - 1, 1));
        }
    };

    const handleAddToCart = () => {
        if (product.availabilityStatus === 'not available') {
            toast.error("Product is currently not available");
            return;
        }

        addToCart(product.productId, pieces);
        toast.success(`${pieces} piece(s) of ${product.productName} added to cart!`);
        setShowModal(true);
    };

    const handleKeepShopping = () => {
        setShowModal(false);
    };

    const handlePayNow = () => {
        setShowModal(false);
        navigate('/cart');
    };

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

    const pricePerPiece = product.pricePerPiece || product.price || 0;

    return (
        <div className="min-h-screen bg-[#F8F4EF]">
            <AddToCartModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onKeepShopping={handleKeepShopping}
                onPayNow={handlePayNow}
                productName={product.productName}
                quantity={pieces}
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
                                            src={mainImage}
                                            alt={product.productName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image Available
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Images */}
                                {product.images && product.images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {product.images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setMainImage(image)}
                                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                                    mainImage === image
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

                            {/* Availability Status */}
                            <div className="flex items-center gap-2">
                                {product.availabilityStatus === 'available' ? (
                                    <>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-green-700 font-medium">
                                            Available
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-red-700 font-medium">Not Available</span>
                                    </>
                                )}
                            </div>

                            {/* Price Per Piece */}
                            <div className="border-t border-b border-gray-200 py-4">
                                <p className="text-sm text-gray-600 mb-1">Price per piece:</p>
                                <p className="text-2xl font-bold text-[#c9a961]">
                                    Rs. {pricePerPiece.toFixed(2)}
                                </p>
                            </div>

                            {/* Bulk Offers */}
                            {product.bulkOffers && product.bulkOffers.length > 0 && (
                                <div className="border-t border-b border-gray-200 py-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">
                                        Select Amount: {selectedOffer ? `${selectedOffer.pieces} pieces (Bulk Offer)` : `${pieces} piece(s)`}
                                    </h3>
                                    <div className="space-y-2">
                                        {/* Custom Option */}
                                        <button
                                            onClick={handleCustomSelection}
                                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                                !selectedOffer
                                                    ? 'border-[#c9a961] bg-[#c9a961] bg-opacity-10'
                                                    : 'border-gray-200 hover:border-[#c9a961]'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Custom Amount</span>
                                                <span className="text-[#c9a961] font-semibold">
                                                    Rs. {pricePerPiece.toFixed(2)} per piece
                                                </span>
                                            </div>
                                        </button>

                                        {/* Bulk Offers */}
                                        {product.bulkOffers.map((offer, index) => {
                                            const pricePerPieceInOffer = offer.offerPrice / offer.pieces;
                                            const savings = (pricePerPiece * offer.pieces) - offer.offerPrice;
                                            const savingsPercent = ((savings / (pricePerPiece * offer.pieces)) * 100).toFixed(0);

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleOfferSelection(offer)}
                                                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                                        selectedOffer?.pieces === offer.pieces
                                                            ? 'border-green-600 bg-green-50'
                                                            : 'border-gray-200 hover:border-green-600'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-semibold text-gray-800">
                                                            {offer.pieces} pieces
                                                        </span>
                                                        <span className="text-green-600 font-bold">
                                                            Rs. {offer.offerPrice.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600">
                                                            Rs. {pricePerPieceInOffer.toFixed(2)} per piece
                                                        </span>
                                                        <span className="text-green-600 font-medium">
                                                            Save {savingsPercent}% (Rs. {savings.toFixed(2)})
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Calculated Total Price */}
                            <div className="bg-[#c9a961] bg-opacity-10 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Price for {pieces} piece(s):</p>
                                        {selectedOffer && (
                                            <p className="text-xs text-green-600 font-medium">Bulk Offer Applied</p>
                                        )}
                                    </div>
                                    <span className="text-3xl font-bold text-[#c9a961]">
                                        Rs. {calculatedPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="border-t border-b border-gray-200 py-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                                </div>
                            )}

                            {/* Pieces Selector and Add to Cart */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    {!selectedOffer && (
                                        <div className="flex items-center border-2 border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => handlePiecesChange(false)}
                                                disabled={pieces <= 1}
                                                className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Minus size={20} className="text-gray-600" />
                                            </button>
                                            <input
                                                type="number"
                                                value={pieces}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    setPieces(Math.max(val, 1));
                                                }}
                                                className="w-16 text-center border-x-2 border-gray-300 py-3 focus:outline-none"
                                            />
                                            <button
                                                onClick={() => handlePiecesChange(true)}
                                                className="p-3 hover:bg-gray-100 transition-colors"
                                            >
                                                <Plus size={20} className="text-gray-600" />
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.availabilityStatus === 'not available'}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#FF8C00] text-white font-semibold rounded-lg hover:bg-[#FF7700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                                    >
                                        <ShoppingCart size={20} />
                                        {product.availabilityStatus === 'not available' ? 'NOT AVAILABLE' : 'ADD TO CART'}
                                    </button>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                <div className="flex items-center gap-3">
                                    <Truck className="text-[#c9a961]" size={24} />
                                    <div>
                                        <p className="font-semibold text-gray-800">Free Delivery</p>
                                        <p className="text-sm text-gray-600">On orders over Rs. 5000</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="text-[#c9a961]" size={24} />
                                    <div>
                                        <p className="font-semibold text-gray-800">Secure Payment</p>
                                        <p className="text-sm text-gray-600">100% secure transactions</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Star className="text-[#c9a961]" size={24} />
                                    <div>
                                        <p className="font-semibold text-gray-800">Quality Assured</p>
                                        <p className="text-sm text-gray-600">Best products only</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Reviews Section */}
                <div className="mt-12">
                    <ProductReviews productId={productId} />
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <Link
                                    key={relatedProduct.productId}
                                    to={`/category/${relatedProduct.category}/productInfo/${relatedProduct.productId}`}
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
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                            {relatedProduct.productName}
                                        </h3>
                                        <p className="text-[#c9a961] font-bold">
                                            Rs. {(relatedProduct.pricePerPiece || relatedProduct.price || 0).toFixed(2)} /piece
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
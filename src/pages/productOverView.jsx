import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import NotFound from "../components/notFound";
import { addToCart, clearCart } from "../utils/cartFunction";

export default function ProductOverView() {
  const params = useParams();
  const navigate = useNavigate();

  // Get both category and productId from params
  const { category, productId } = params;

  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [states, setStates] = useState("Loading");
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    console.log("Category:", category, "Product ID:", productId);
    loadProduct();
  }, [category, productId]);

  const loadProduct = () => {
    // Use the new API endpoint that gets product by category and ID
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/category/${category}/${productId}`)
      .then((res) => {
        console.log(res.data);

        if (res.data == null || !res.data.product) {
          setStates("not-found");
        } else {
          // The API returns { category, product } structure
          setProduct(res.data.product);
          setStates("found");

          // Load related products after main product is loaded
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
        // Filter out the current product and limit to 8 related products
        const filteredProducts = (res.data.products || res.data)
          .filter(p => p.productId !== currentProductId)
          .slice(0, 8);

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
      setQuantity(prev => prev > 1 ? prev - 1 : 1);
    }
  };

  const handleAddToCart = () => {
    if (product.quantity === 0) {
      toast.error("Product is out of stock");
      return;
    }

    // Add to cart
    addToCart(product.productId, quantity);
    toast.success(`Added ${quantity} ${product.productName}(s) to cart!`);
    toast.success(`Go to cart to checkout!`);


  };

  // NEW: Buy Now functionality
  const handleBuyNow = () => {
    if (product.quantity === 0) {
      toast.error("Product is out of stock");
      return;
    }

    // Clear existing cart first (optional - remove if you want to keep existing items)
    clearCart();

    // Add current product to cart
    addToCart(product.productId, quantity);

    // Show success message
    toast.success(`${quantity} ${product.productName}(s) ready for purchase!`);

    // Navigate directly to cart page
    navigate('/cart');
  };

  // Related Product Card Component
  const RelatedProductCard = ({ relatedProduct }) => {
    const getProductPath = () => {
      return `/category/${category}/productInfo/${relatedProduct.productId}`;
    };

    return (
      <Link to={getProductPath()} className="flex-shrink-0 w-full mx-auto bg-orange-500">
        {/* Card Container */}
        <div className="w-[300px] h-[380px] bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div className="relative w-full h-[240px] overflow-hidden">
            <img
              src={relatedProduct.images?.[0]}
              alt={relatedProduct.productName}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {/* Heart icon for favorites 
            <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>*/}
          </div>

          <div className="p-4 h-[140px] flex flex-col justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-800">
                {relatedProduct.productName}
              </h3>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-orange-600">
                  LKR.{relatedProduct.lastPrice?.toFixed(2)}
                </span>
                {relatedProduct.lastPrice < relatedProduct.price && (
                  <span className="text-sm text-gray-500 line-through">
                    LKR.{relatedProduct.price?.toFixed(2)}
                  </span>
                )}
              </div>

              <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors duration-200">
                VIEW DETAILS
              </button>
            </div>
          </div>
        </div>

      </Link>
    );
  };

  return (
    <div className=" mx-auto min-h-screen">
      {states === "Loading" && (
        <div className="w-full h-[calc(100vh-100px)] flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-gray-900">
          </div>
        </div>
      )}

      {(states === "not-found" || states === "error") && <NotFound />}

      {states === "found" && (
        <>
          {/* Main Product Section */}
          <div className=" w-full min-h-screen bg-orange-100 ">
            <div className="w-full h-[300px]  bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Main spice pile */}
                  <div className="absolute right-50 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                  <div className="absolute right-48 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                  <div className="absolute right-16 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-80"></div>


                  {/* Additional spice piles */}
                  <div className="absolute left-50 top-1/3 w-48 h-48 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full opacity-60"></div>
                  <div className="absolute left-70 top-2/3 w-40 h-40 bg-gradient-to-br from-red-500 to-orange-600 rounded-full opacity-50"></div>
                  <div className="absolute left-[300px] top-1/2 w-56 h-56 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-40"></div>
                </div>
              </div>

            </div>


            <div className="w-[90%] h-[calc(100vh-100px)] flex flex-row gap-4 mt-10 px-4 mx-auto">
              <div className="w-[75%] border-[3px] border-blue-900 h-[85%]">
                <img
                  src={product.images?.[0]}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-[65%] h-[85%] flex flex-col gap-3 bg-white p-4">
                <span className="text-6xl font-bold text-black flex text-center  ">{product.productName}</span>


                {product.altNames && product.altNames.length > 0 && (
                  <h2 className="text-2xl font-bold text-stone-900">{product.altNames.join(" | ")}</h2>
                )}

                <p className="text-gray-600 text-lg capitalize">{product.category}</p>
                <p className="text-gray-600 text-lg">{product.description}</p>

                <div className="border rounded-lg ">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-orange-100">
                        <th className="px-4 py-3 text-center font-semibold border-b">Available Stock</th>
                        <th className="px-4 py-3 text-left font-semibold border-b">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-3 text-center">{product.quantity} pcs</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {product.price > product.lastPrice && (
                              <span className="text-gray-500 line-through text-sm">
                                LKR.{product.price?.toFixed(2)}
                              </span>
                            )}
                            <span className="text-xl font-bold text-orange-600">
                              LKR.{product.lastPrice?.toFixed(2)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-12 mt-2 pl-6">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => handleQuantityChange(false)}
                      className="px-3 py-2 hover:bg-gray-100 font-bold text-lg"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(true)}
                      className="px-3 py-2 hover:bg-gray-100 font-bold text-lg"
                      disabled={quantity >= product.quantity}
                    >
                      +
                    </button>
                  </div>

                  {/* UPDATED: Buy Now button with proper functionality */}
                  <button
                    onClick={handleBuyNow}
                    className="bg-orange-600 hover:bg-white  text-white  hover:text-orange-600  px-8 py-3 rounded font-semibold text-sm uppercase tracking-wide flex-1 max-w-xs"
                    disabled={product.quantity === 0}
                  >
                    {product.quantity === 0 ? 'OUT OF STOCK' : 'Buy Now'}
                  </button>
                </div>

                {/* Total Price Display */}
                <div className="mt-4 p-4 bg-orange-100 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Total ({quantity} items):</span>
                    <span className="text-2xl font-bold text-orange-600">
                      LKR.{(product.lastPrice * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex pl-52 mt-2 ">
                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="bg-orange-600 hover:bg-white  text-white  hover:text-orange-600 px-8 py-3 rounded font-semibold text-sm uppercase tracking-wide flex-1 max-w-xs "
                    disabled={product.quantity === 0}
                  >
                    {product.quantity === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                  </button>
                </div>
              </div>
            </div>


            {/* Related Products Section */}
            <div className="w-full px-6 py-12 bg-orange-500 mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold text-white">Related Products</h2>
                <div className="flex gap-2">
                  <button
                    className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
                    onClick={() => {
                      const container = document.getElementById('related-products-container');
                      container.scrollBy({ left: -300, behavior: 'smooth' });
                    }}
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
                    onClick={() => {
                      const container = document.getElementById('related-products-container');
                      container.scrollBy({ left: 300, behavior: 'smooth' });
                    }}
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {relatedLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : relatedProducts.length > 0 ? (
              <div
                id="related-products-container"
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {relatedProducts.map((relatedProduct) => (
                  <RelatedProductCard
                    key={relatedProduct.productId}
                    relatedProduct={relatedProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg">No related products found in this category.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>

  );
}
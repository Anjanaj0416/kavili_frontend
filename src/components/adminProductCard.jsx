import { Link } from "react-router-dom";

export default function AdminProductCard(props) {
    const { product, category } = props;
    
    // Determine the correct navigation path
    const getProductPath = () => {
        if (category && category !== "ALL") {
            return `/admin/products/category/${category}/productInfo/${product.productId}/edit`;
        }
        // If we're viewing all products, use the product's actual category
        return `/admin/products/category/${product.category}/productInfo/${product.productId}/edit`;
    };
    
    console.log("Navigation path:", getProductPath());
    console.log("Product data:", props);
    
    return (
        <Link to={getProductPath()}>
            <div className="w-[300px] h-[450px] m-[30px] bg-gray-200 rounded-lg shadow-lg shadow-gray-500 hover:shadow-black hover:border-[10px] transition-shadow duration-200">
                <img 
                    src={product.images && product.images[0] ? product.images[0] : '/placeholder-image.png'} 
                    alt={product.productName}
                    className="w-full h-[60%] object-cover overflow-hidden rounded-t-lg"
                />
                <div className="h-[40%] p-4 flex flex-col justify-between">
                    <div className="flex-1">
                        <h1 className="text-center text-2xl font-semibold mb-2">{product.productName}</h1>
                        <h2 className="text-center text-lg text-gray-500 line-clamp-2">{product.description}</h2>
                    </div>
                    <div className="flex flex-col mt-2">
                        <p className="text-left text-lg font-bold">LKR.{product.lastPrice.toFixed(2)}</p>
                        {(product.lastPrice < product.price) && (
                            <p className="text-left text-sm text-gray-500 line-through">LKR.{product.price.toFixed(2)}</p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
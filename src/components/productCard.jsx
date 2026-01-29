import { Link } from "react-router-dom";

export default function ProductCard(props) {
    const { product, category } = props;

    // Determine the correct navigation path
    const getProductPath = () => {
        if (category && category !== "ALL") {
            return `/category/${category}/productInfo/${product.productId}`;
        }
        // If we're viewing all products, use the product's actual category
        return `/category/${product.category}/productInfo/${product.productId}`;
    };

    console.log(props);

    return (
        <Link to={getProductPath()}>
            <div className="w-full sm:w-[280px] md:w-[300px] h-[400px] sm:h-[450px] m-2 sm:m-4 md:m-[30px] bg-white rounded-lg shadow-lg shadow-[#f5f0e8] hover:shadow-[#c9a961] hover:border-4 sm:hover:border-[10px] transition-shadow duration-200">
                <img
                    src={product.images[0]}
                    alt={product.productName}
                    className="w-full h-[55%] sm:h-[60%] object-cover overflow-hidden rounded-t-lg"
                />
                <div className="h-[45%] sm:h-[40%] p-3 sm:p-4 flex flex-col justify-between">
                    <div className="flex-1">
                        <h1 className="text-center text-lg sm:text-xl md:text-2xl font-semibold mb-1 sm:mb-2 text-[#4a3728] line-clamp-2">{product.productName}</h1>
                        <h2 className="text-center text-sm sm:text-base md:text-lg text-black-500 line-clamp-2">{product.description}</h2>
                    </div>
                    <div className="flex flex-col mt-1 sm:mt-2">
                        <p className="text-left text-[#c9a961] text-base sm:text-lg font-bold">LKR.{product.lastPrice.toFixed(2)}</p>
                        {(product.lastPrice < product.price) && (
                            <p className="text-left text-xs sm:text-sm text-[#c9a961] line-through">LKR.{product.price.toFixed(2)}</p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
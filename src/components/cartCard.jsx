import { useEffect, useState } from "react";
import { deleteItem } from "../utils/cartFunction";
import axios from "axios";

export default function CartCard(props) {
    const productId = props.productId;
    const qty = props.qty;
    const onCartUpdate = props.onCartUpdate; // Callback to refresh parent cart
    const [product, setProduct] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!loaded) {
            axios.get(import.meta.env.VITE_BACKEND_URL + `/api/products/` + productId)
                .then((res) => {
                    if (res.data != null) {
                        setProduct(res.data);
                        console.log(res.data);
                        setLoaded(true);
                    } else {
                        deleteItem(productId);
                        if (onCartUpdate) onCartUpdate(); // Refresh parent cart
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [loaded, productId, onCartUpdate]);

    function handleRemoveItem() {
        if (window.confirm("Are you sure you want to remove this item from cart?")) {
            deleteItem(productId);
            if (onCartUpdate) onCartUpdate(); // Refresh parent cart
        }
    }

    if (!loaded || !product) {
        return (
            <tr>
                <td colSpan="6" className="text-center p-4">Loading...</td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-gray-100 border-b">
            <td className="text-center p-2">
                <img 
                    src={product?.images[0]} 
                    className="w-[80px] h-[80px] object-cover mx-auto rounded"
                    alt={product?.productName}
                />
            </td>
            <td className="text-center p-2 font-medium">{product?.productName}</td>
            <td className="text-center p-2">
                <span className="bg-gray-200 px-2 py-1 rounded">{qty}</span>
            </td>
            <td className="text-center p-2">LKR {product?.lastPrice.toFixed(2)}</td>
            <td className="text-center p-2 font-semibold">
                LKR {(product?.lastPrice * qty).toFixed(2)}
            </td>
            <td className="text-center p-2">
                <button
                    onClick={handleRemoveItem}
                    className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                    Remove
                </button>
            </td>
        </tr>
    );
}
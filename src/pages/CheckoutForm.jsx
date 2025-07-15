import { useEffect, useState } from "react";
import axios from "axios";

export default function CheckoutForm(props) {
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

    return (
        <div className="flex flex-col w-full h-[500px] bg-gray-100">
            <div className="flex justify-center items-center h-[50px] bg-gray-200 p-8">
                <h1 className="text-4xl font-bold text-gray-800">Checkout Form</h1>
            </div>
            <div className="flex w-full h-full">
                <div className="flex flex-col w-[65%] h-full bg-black">
                    <table className="w-full border-collapse ">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2 text-left">Product</th>
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-left">Quantity</th>
                                <th className="p-2 text-left">Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
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
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-col bg-yellow-500 w-[35%] h-full">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 p-8">Your delivery Details</h1>
                    </div>
                    <div>
                        
                    </div>

                </div>
            </div>
        </div>
    );
}
// utils/cartFunction.js
// Enhanced cart utility functions with validation

export function loadCart(){
    const cart = localStorage.getItem('cart');
    if(cart != null){
        try {
            const parsedCart = JSON.parse(cart);
            // Validate that it's an array
            if (Array.isArray(parsedCart)) {
                return parsedCart;
            } else {
                console.error("Cart is not an array, resetting...");
                localStorage.removeItem('cart');
                return [];
            }
        } catch (error) {
            console.error("Error parsing cart:", error);
            localStorage.removeItem('cart');
            return [];
        }
    } else {
        return [];
    }
}

export function addToCart(productId, qty){
    // Validate inputs
    if (!productId || typeof productId === 'object') {
        console.error("Invalid productId:", productId);
        return;
    }
    
    if (!qty || typeof qty !== 'number' || qty <= 0) {
        console.error("Invalid quantity:", qty);
        return;
    }
    
    const cart = loadCart();
    const index = cart.findIndex(
        (item) => {
            return item.productId == productId
        }
    )
    if(index == -1){
        cart.push(
            {productId, qty}
        )
    } else {
        const newQty = cart[index].qty + qty;
        if(newQty <= 0){
            cart.splice(index, 1);
        } else {
            cart[index].qty = newQty
        }
    }
    saveCart(cart);
}

export function saveCart(cart){
    // Validate that cart is an array before saving
    if (!Array.isArray(cart)) {
        console.error("Attempted to save invalid cart (not an array):", cart);
        return;
    }
    
    // Clean the cart before saving - remove any invalid items
    const validCart = cart.filter(item => {
        return item.productId && 
               typeof item.productId !== 'object' && 
               item.qty && 
               typeof item.qty === 'number' && 
               item.qty > 0;
    });
    
    localStorage.setItem('cart', JSON.stringify(validCart));
}

export function clearCart(){
    localStorage.removeItem('cart');
}

export function deleteItem(productId){
    const cart = loadCart();
    const index = cart.findIndex(
        (item) => {return item.productId == productId}
    )
    if(index != -1){
        cart.splice(index, 1); // Remove the item at the found index
        saveCart(cart); // Save the updated cart
    }
}
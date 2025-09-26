import { useState, useEffect } from 'react';
import { MdOutlineAccountCircle } from 'react-icons/md';
import { Link, useLocation } from "react-router-dom";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Function to check if the current path matches the link
    const isActiveLink = (path) => {
        return location.pathname === path;
    };

    return (
        <header className={`transition-all duration-300 z-50 ${isScrolled
            ? 'fixed top-0 left-0 right-0 bg-white shadow-lg'
            : 'absolute top-4 left-20 right-20 bg-white rounded-lg shadow-md'
            }`}>
            <div className="flex items-center justify-between  px-6 py-4">
                {/* Logo */}
                <div className="flex items-center w-1/5 ">
                    <span className="text-2xl font-bold text-orange-600">Udari Shop</span>
                </div>
                {/* Navigation */}
                <nav className="flex items-center justify-center w-2/5 space-x-8 ">
                    <Link
                        to="/"
                        className={`transition-colors text-lg ${isActiveLink('/')
                            ? 'text-orange-600 underline'
                            : 'text-gray-700 hover:text-orange-600 hover:underline'
                            }`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/products"
                        className={`transition-colors text-lg ${isActiveLink('/products')
                            ? 'text-orange-600 underline'
                            : 'text-gray-700 hover:text-orange-600'
                            }`}
                    >
                        Products
                    </Link>
                    <Link
                        to="/about"
                        className={`transition-colors text-lg ${isActiveLink('/about')
                            ? 'text-orange-600 underline'
                            : 'text-gray-700 hover:text-orange-600'
                            }`}
                    >
                        About
                    </Link>
                    <Link
                        to="/contact"
                        className={`transition-colors text-lg ${isActiveLink('/contact')
                            ? 'text-orange-600 underline'
                            : 'text-gray-700 hover:text-orange-600'
                            }`}
                    >
                        Contact
                    </Link>
                    <Link
                        to="/cart"
                        className={`transition-colors text-lg ${isActiveLink('/cart')
                            ? 'text-orange-600 underline'
                            : 'text-gray-700 hover:text-orange-600'
                            }`}
                    >
                        Cart
                    </Link>
                    <Link
                        to="/myOrders"
                        className={`transition-colors text-lg ${isActiveLink('/myOrders')
                            ? 'text-orange-600 underline'
                            : 'text-gray-700 hover:text-orange-600'
                            }`}
                    >
                        My Orders
                    </Link>

                </nav>
                {/* Search or additional content */}
                <div className="flex items-center justify-end w-1/5 gap-4">

                    <Link
                        to="/login"
                        className={`transition-colors text-lg ${isActiveLink('/login')
                            ? 'text-orange-600 underline'
                            : 'text-gray-700 hover:text-orange-600'
                            }`}
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className={`transition-colors text-lg ${isActiveLink('/register')
                                ? 'text-orange-600 underline'
                                : 'text-gray-700 hover:text-orange-600'
                            }`}
                    >
                        Register
                    </Link>

                </div>
            </div>
        </header>
    );
}
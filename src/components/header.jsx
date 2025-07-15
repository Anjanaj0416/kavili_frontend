import { useState, useEffect } from 'react';
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
        <header className={`transition-all duration-300 z-50 ${
            isScrolled 
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
                        className={`transition-colors text-lg ${
                            isActiveLink('/') 
                                ? 'text-orange-600 underline' 
                                : 'text-gray-700 hover:text-orange-600 hover:underline'
                        }`}
                    >
                        Home
                    </Link>
                    <Link 
                        to="/products" 
                        className={`transition-colors text-lg ${
                            isActiveLink('/products') 
                                ? 'text-orange-600 underline' 
                                : 'text-gray-700 hover:text-orange-600'
                        }`}
                    >
                        Products
                    </Link>
                    <Link 
                        to="/about" 
                        className={`transition-colors text-lg ${
                            isActiveLink('/about') 
                                ? 'text-orange-600 underline' 
                                : 'text-gray-700 hover:text-orange-600'
                        }`}
                    >
                        About
                    </Link>
                    <Link 
                        to="/contact" 
                        className={`transition-colors text-lg ${
                            isActiveLink('/contact') 
                                ? 'text-orange-600 underline' 
                                : 'text-gray-700 hover:text-orange-600'
                        }`}
                    >
                        Contact
                    </Link>
                    <Link 
                        to="/cart" 
                        className={`transition-colors text-lg ${
                            isActiveLink('/cart') 
                                ? 'text-orange-600 underline' 
                                : 'text-gray-700 hover:text-orange-600'
                        }`}
                    >
                        Cart
                    </Link>
                    <Link 
                        to="/myOrders" 
                        className={`transition-colors text-lg ${
                            isActiveLink('/myOrders') 
                                ? 'text-orange-600 underline' 
                                : 'text-gray-700 hover:text-orange-600'
                        }`}
                    >
                        My Orders
                    </Link>

                </nav>
                {/* Search or additional content */}
                <div className="flex items-center justify-end w-1/5">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
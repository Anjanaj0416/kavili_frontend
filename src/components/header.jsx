import { useState, useEffect } from 'react';
import { ShoppingCart, User } from 'lucide-react';
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
            ? 'fixed top-0 left-0 right-0 shadow-lg'
            : 'absolute top-4 left-20 right-20 rounded-lg shadow-md'
            }`}>
            {/* Main Header Bar with Gold Background */}
            <div className="bg-[#C9A961] relative" style={{ height: '80px' }}>
                <div className="flex items-center justify-between h-full px-12 relative">
                    {/* Left: Brand Name */}
                    <div className="flex-1 flex items-center">
                        <Link 
                            to="/" 
                            className="text-4xl font-bold text-[#4A3728] hover:opacity-80 transition-opacity" 
                            style={{ fontFamily: 'Brush Script MT, cursive', fontStyle: 'italic' }}
                        >
                            Real Food
                        </Link>
                    </div>

                    {/* Center: Navigation Links on both sides of logo */}
                    <div className="flex items-center justify-center gap-12 flex-1">
                        {/* Left side links: About Us | Contact Us */}
                        
                        <div className="flex items-center gap-4 ml-9">
                            <Link
                                to="/products"
                                className={`text-xl font-medium transition-colors  ${isActiveLink('/products')
                                    ? 'text-[#3A2818] font-semibold'
                                    : 'text-[#5D4A37] hover:text-[#3A2818]'
                                    }`}
                            >
                                Products
                            </Link>
                            
                            {/* Separator */}
                            <span className="text-2xl text-[#5D4A37] font-light">|</span>
                            
                            <Link
                                to="/myOrders"
                                className={`text-xl font-medium transition-colors   ${isActiveLink('/myOrders')
                                    ? 'text-[#3A2818] font-semibold'
                                    : 'text-[#5D4A37] hover:text-[#3A2818]'
                                    }`}
                            >
                                Orders
                            </Link>
                        </div>

                        {/* Space for Logo in center */}
                        <div style={{ width: '180px' }}></div>

                        {/* Right side links: Products | Orders */}
                        <div className="flex items-center gap-4">
                            <Link
                                to="/about"
                                className={`text-xl font-medium transition-colors   w-[90px] ${isActiveLink('/about')
                                    ? 'text-[#3A2818] font-semibold'
                                    : 'text-[#5D4A37] hover:text-[#3A2818]'
                                    }`}
                            >
                                About Us
                            </Link>
                            
                            {/* Separator */}
                            <span className="text-2xl text-[#5D4A37] font-light">|</span>
                            
                            <Link
                                to="/contact"
                                className={`text-xl font-medium transition-colors w-[100px]  ${isActiveLink('/contact')
                                    ? 'text-[#3A2818] font-semibold'
                                    : 'text-[#5D4A37] hover:text-[#3A2818]'
                                    }`}
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>

                    {/* Right: Icons */}
                    <div className="flex items-center justify-end gap-4 flex-1">
                        <Link
                            to="/cart"
                            className="bg-[#6B4E3D] hover:bg-[#5D4A37] text-white p-3.5 rounded-full transition-all hover:scale-110 shadow-lg"
                        >
                            <ShoppingCart size={24} strokeWidth={2} />
                        </Link>
                        <Link
                            to="/login"
                            className="bg-[#6B4E3D] hover:bg-[#5D4A37] text-white p-3.5 rounded-full transition-all hover:scale-110 shadow-lg"
                        >
                            <User size={24} strokeWidth={2} />
                        </Link>
                    </div>

                    {/* Centered Logo - positioned absolutely to overlap header */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 50 }}>
                        <Link 
                            to="/" 
                            className="block hover:scale-105 transition-transform duration-300"
                        >
                            <div className="relative">
                                {/* White background circle behind logo */}
                                <div className="absolute inset-0  rounded-full transform scale-110 shadow-xl"></div>
                                
                                {/* Logo */}
                                <img 
                                    src="/images/logo.png" 
                                    alt="Real Food Logo" 
                                    className="relative z-10 h-36 w-36 object-contain"
                                    style={{ 
                                        filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25))'
                                    }}
                                />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
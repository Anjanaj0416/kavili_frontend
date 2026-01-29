import { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { Link, useLocation } from "react-router-dom";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <>
            <header className={`transition-all duration-300 z-50 ${isScrolled
                ? 'fixed top-0 left-0 right-0 shadow-lg'
                : 'absolute top-0 sm:top-4 left-0 sm:left-4 md:left-10 lg:left-20 right-0 sm:right-4 md:right-10 lg:right-20 sm:rounded-lg shadow-md'
                }`}>
                {/* Main Header Bar with Gold Background */}
                <div className="bg-[#C9A961] relative" style={{ height: '70px' }}>
                    <div className="flex items-center justify-between h-full px-4 sm:px-6 md:px-8 lg:px-12 relative">
                        {/* Left: Brand Name (Hidden on mobile, logo centered) */}
                        <div className="hidden lg:flex flex-1 items-center">
                            <Link 
                                to="/" 
                                className="text-3xl xl:text-4xl font-bold text-[#4A3728] hover:opacity-80 transition-opacity" 
                                style={{ fontFamily: 'Brush Script MT, cursive', fontStyle: 'italic' }}
                            >
                                Real Food
                            </Link>
                        </div>

                        {/* Mobile: Hamburger Menu (Left) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-[#4A3728] hover:bg-[#b89551] rounded transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>

                        {/* Desktop: Navigation Links */}
                        <div className="hidden lg:flex items-center justify-center gap-8 xl:gap-12 flex-1">
                            {/* Left side links */}
                            <div className="flex items-center gap-3 xl:gap-4 ml-9">
                                <Link
                                    to="/products"
                                    className={`text-lg xl:text-xl font-medium transition-colors  ${isActiveLink('/products')
                                        ? 'text-[#3A2818] font-semibold'
                                        : 'text-[#5D4A37] hover:text-[#3A2818]'
                                        }`}
                                >
                                    Products
                                </Link>
                                
                                <span className="text-xl xl:text-2xl text-[#5D4A37] font-light">|</span>
                                
                                <Link
                                    to="/myOrders"
                                    className={`text-lg xl:text-xl font-medium transition-colors   ${isActiveLink('/myOrders')
                                        ? 'text-[#3A2818] font-semibold'
                                        : 'text-[#5D4A37] hover:text-[#3A2818]'
                                        }`}
                                >
                                    Orders
                                </Link>
                            </div>

                            {/* Space for Logo in center */}
                            <div style={{ width: '140px' }} className="xl:w-[180px]"></div>

                            {/* Right side links */}
                            <div className="flex items-center gap-3 xl:gap-4">
                                <Link
                                    to="/about"
                                    className={`text-lg xl:text-xl font-medium transition-colors w-[80px] xl:w-[90px] ${isActiveLink('/about')
                                        ? 'text-[#3A2818] font-semibold'
                                        : 'text-[#5D4A37] hover:text-[#3A2818]'
                                        }`}
                                >
                                    About Us
                                </Link>
                                
                                <span className="text-xl xl:text-2xl text-[#5D4A37] font-light">|</span>
                                
                                <Link
                                    to="/contact"
                                    className={`text-lg xl:text-xl font-medium transition-colors w-[90px] xl:w-[100px]  ${isActiveLink('/contact')
                                        ? 'text-[#3A2818] font-semibold'
                                        : 'text-[#5D4A37] hover:text-[#3A2818]'
                                        }`}
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </div>

                        {/* Right: Icons (Visible on all screens) */}
                        <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4 lg:flex-1">
                            <Link
                                to="/cart"
                                className="bg-[#6B4E3D] hover:bg-[#5D4A37] text-white p-2.5 sm:p-3 md:p-3.5 rounded-full transition-all hover:scale-110 shadow-lg"
                            >
                                <ShoppingCart size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
                            </Link>
                            <Link
                                to="/login"
                                className="bg-[#6B4E3D] hover:bg-[#5D4A37] text-white p-2.5 sm:p-3 md:p-3.5 rounded-full transition-all hover:scale-110 shadow-lg"
                            >
                                <User size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
                            </Link>
                        </div>

                        {/* Centered Logo - positioned absolutely to overlap header (Desktop) */}
                        <div className="hidden lg:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 50 }}>
                            <Link 
                                to="/" 
                                className="block hover:scale-105 transition-transform duration-300"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0  rounded-full transform scale-110 shadow-xl"></div>
                                    {/* Logo */}
                                    <img 
                                        src="/images/logo.png" 
                                        alt="Real Food Logo" 
                                        className="relative z-10 h-28 w-28 xl:h-36 xl:w-36 object-contain"
                                        style={{ 
                                            filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25))'
                                        }}
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* Mobile: Centered Logo */}
                        <Link 
                            to="/" 
                            className="lg:hidden absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            style={{ zIndex: 40 }}
                        >
                            <img 
                                src="/images/logo.png" 
                                alt="Real Food Logo" 
                                className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
                                style={{ 
                                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))'
                                }}
                            />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Dropdown */}
            <div 
                className={`lg:hidden fixed top-[70px] left-0 right-0 bg-[#f5f0e8] shadow-lg z-40 transition-all duration-300 overflow-hidden ${
                    isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <nav className="flex flex-col p-4 space-y-2">
                    <Link
                        to="/products"
                        className={`py-3 px-4 rounded-lg transition-colors ${
                            isActiveLink('/products')
                                ? 'bg-[#c9a961] text-white font-semibold'
                                : 'text-[#4A3728] hover:bg-[#e5dac5]'
                        }`}
                    >
                        Products
                    </Link>
                    
                    <Link
                        to="/myOrders"
                        className={`py-3 px-4 rounded-lg transition-colors ${
                            isActiveLink('/myOrders')
                                ? 'bg-[#c9a961] text-white font-semibold'
                                : 'text-[#4A3728] hover:bg-[#e5dac5]'
                        }`}
                    >
                        My Orders
                    </Link>
                    
                    <Link
                        to="/about"
                        className={`py-3 px-4 rounded-lg transition-colors ${
                            isActiveLink('/about')
                                ? 'bg-[#c9a961] text-white font-semibold'
                                : 'text-[#4A3728] hover:bg-[#e5dac5]'
                        }`}
                    >
                        About Us
                    </Link>
                    
                    <Link
                        to="/contact"
                        className={`py-3 px-4 rounded-lg transition-colors ${
                            isActiveLink('/contact')
                                ? 'bg-[#c9a961] text-white font-semibold'
                                : 'text-[#4A3728] hover:bg-[#e5dac5]'
                        }`}
                    >
                        Contact Us
                    </Link>

                    
                </nav>
            </div>
        </>
    );
}
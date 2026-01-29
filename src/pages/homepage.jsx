import { Link, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import ProductPage from './products';
import NotFound from '../components/notFound';
import ProductOverView from './productOverView';
import Cart from './cart';
import CheckoutForm from './CheckoutForm';
import HomeBody from '../components/homeBody';
import About from './about';
import ContactPage from './contactPage';
import MyOrders from './myOrders';
import CustomerProfile from './customerProfile';
import FAQ from './faq';
import FeaturedReviews from '../components/FeaturedReviews';
import Register from './register';
import Login from './login';

// Hero Circle Image Carousel Component
const HeroImageCarousel = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Add your hero circle images here
  // Place your images in: public/images/hero/
  const heroImages = [
    '/images/hero/circle1.jpg',
    '/images/hero/circle2.jpg',
    '/images/hero/circle3.jpg',
    '/images/hero/circle4.jpg'
  ];

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % heroImages.length
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <>
      {/* Smaller decorative circles - BEHIND the big circle */}
      <div className="hidden lg:block absolute right-24 top-[200px] transform -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-br from-[#4a3728] to-[#d4b876] rounded-full opacity-80 z-0"></div>
      <div className="hidden lg:block absolute right-[700px] top-[550px] transform -translate-y-1/2 w-[200px] h-[200px] bg-gradient-to-br from-[#645430] to-[#c9a961] rounded-full opacity-80 z-0"></div>
      <div className="hidden lg:block absolute right-[10px] top-[420px] transform -translate-y-1/2 w-[200px] h-[200px] bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-80 z-0"></div>
      <div className="hidden lg:block absolute right-[180px] top-[560px] transform -translate-y-1/2 w-[150px] h-[150px] bg-gradient-to-br from-[#c9a961] to-[#d4b876] rounded-full opacity-80 z-0"></div>
      <div className="hidden lg:block absolute right-[750px] top-[250px] transform -translate-y-1/2 w-[100px] h-[100px] bg-gradient-to-br from-[#f0e3bb] to-[#e0c589] rounded-full opacity-80 z-0"></div>

      {/* Main Circle with Rotating Images - IN FRONT */}
      <div className="absolute right-[200px] top-[400px] transform -translate-y-1/2 w-[580px] h-[580px] rounded-full overflow-hidden shadow-2xl z-10 ">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <img
              src={image}
              alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Optional: Add a subtle overlay for better visual effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#c9a961]/20 to-[#4a3728]/20"></div>
          </div>
        ))}
      </div>
    </>
  );
};

export default function HomePage() {

  return (
    <div className="min-h-screen w-full relative flex flex-col">

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="w-full flex-grow">
        {/* Hero Section - only show on home page */}
        <Routes>
          <Route path="/" element={
            <div className="relative">
              {/* Hero Background */}
              <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[750px] bg-gradient-to-br from-[#4a3728] via-[#d4b876] to-[#e0c589] overflow-hidden relative">
                {/* Background overlay */}
                <div className="absolute inset-0 bg-opacity-20"></div>

                {/* Spice pile visual effects with Image Carousel */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Hero Circle with Rotating Images */}
                    <HeroImageCarousel />

                    {/* Text content */}
                    {/* Text content */}
                    <div className="absolute left-4 sm:left-8 md:left-12 lg:left-20 top-1/2 transform -translate-y-1/2 z-20 max-w-full sm:max-w-2xl md:max-w-3xl w-[90%] sm:w-[80%] md:w-[600px] px-4">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#4a3728] mb-2 sm:mb-3 md:mb-4 drop-shadow-lg">
                        AUTHENTIC
                      </h1>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#c9a961] mb-3 sm:mb-4 md:mb-6 drop-shadow-lg">
                        HEALTHY FOOD
                      </h2>
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-2 sm:mb-3 drop-shadow-md leading-relaxed">
                        <span className="font-semibold">REAL FOOD</span> is your Trusted Food Supplier of Sri Lankan Traditional Sweet & Authentic Ready Made Curry Bottles since 1996..
                      </p>
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-4 sm:mb-5 md:mb-6 drop-shadow-md">
                        Get delivered a wide range of Vegen Food products to your doorstep.
                      </p>
                      <p className="text-base sm:text-lg md:text-xl text-[#4a3728] font-bold mb-4 sm:mb-6 md:mb-8 drop-shadow-md">
                        NO ADDED ARTIFICIAL INGREDIENTS & PRESERVATIVES
                      </p>
                      <Link to="/products">
                        <button className="bg-[#4a3728] hover:bg-[#3a2818] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                          SHOP NOW
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Body Component */}
              <HomeBody />

              <FeaturedReviews />
            </div>
          } />

          {/* Other Routes - Changed from bg-gray-50 to neutral background */}
          <Route path="/products" element={
            <ProductPage />
          } />

          <Route path="/about" element={
            <About />
          } />
          <Route path="/faq" element={<FAQ />} />

          <Route path="/contact" element={
            <ContactPage />
          } />

          <Route path="/cart" element={
            <Cart />
          } />
          <Route path="/myOrders" element={
            <MyOrders />
          } />
          <Route path="/profile" element={
            <CustomerProfile />
          } />
          <Route path="/category/:category/productInfo/:productId" element={
            <ProductOverView />
          } />
          <Route path="/checkout" element={
            <div className="pt-24 min-h-screen bg-gray-50">
              <CheckoutForm />
            </div>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/products/:category" element={<ProductPage />} />
          <Route path="*" element={
            <div className="pt-24 min-h-screen bg-gray-50">
              <NotFound />
            </div>
          } />
        </Routes>
      </main>


      {/* Footer - Added here to show on all customer pages */}
      <Footer />
    </div>
  );
}
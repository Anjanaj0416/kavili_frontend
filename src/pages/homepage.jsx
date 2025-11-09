import { Route, Routes } from 'react-router-dom';
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
      <div className="absolute right-24 top-[200px] transform -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full opacity-80 z-0"></div>
      <div className="absolute right-[750px] top-[550px] transform -translate-y-1/2 w-[200px] h-[200px] bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-80 z-0"></div>      
      <div className="absolute right-[10px] top-[420px] transform -translate-y-1/2 w-[200px] h-[200px] bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-80 z-0"></div>
      <div className="absolute right-[180px] top-[560px] transform -translate-y-1/2 w-[150px] h-[150px] bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-80 z-0 "></div>
      <div className="absolute right-[830px] top-[250px] transform -translate-y-1/2 w-[100px] h-[100px] bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full opacity-80 z-0"></div>

      {/* Main Circle with Rotating Images - IN FRONT */}
      <div className="absolute right-[260px] top-1/2 transform -translate-y-1/2 w-[580px] h-[580px] rounded-full overflow-hidden shadow-2xl z-10">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Optional: Add a subtle overlay for better visual effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
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
              <div className="h-[750px] bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 overflow-hidden relative">
                {/* Background overlay */}
                <div className="absolute inset-0 bg-opacity-20"></div>

                {/* Spice pile visual effects with Image Carousel */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Hero Circle with Rotating Images */}
                    <HeroImageCarousel />

                    {/* Text content */}
                    <div className="absolute left-20 top-1/2 transform -translate-y-1/2 z-20 max-w-2xl">
                      <h1 className="text-7xl font-bold text-white mb-6 drop-shadow-lg">
                        We bring unique flavors
                      </h1>
                      <p className="text-2xl text-white mb-8 drop-shadow-md">
                        Authentic, Fresh and Direct from the Farms
                      </p>
                      <button className="bg-orange-800 hover:bg-orange-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                        SHOP NOW
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Body Component */}
              <HomeBody />
              
              <FeaturedReviews />
            </div>
          } />

          {/* Other Routes - Changed from bg-gray-50 to bg-orange-100 */}
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
            <div className="pt-24 min-h-screen bg-orange-100">
              <CheckoutForm />
            </div>
          } />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/products/:category" element={<ProductPage />} />
          <Route path="*" element={
            <div className="pt-24 min-h-screen bg-orange-100">
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
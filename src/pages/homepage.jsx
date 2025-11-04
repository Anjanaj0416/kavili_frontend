import { Route, Routes } from 'react-router-dom';
import Header from '../components/header';
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
import GoogleOneTap from '../components/GoogleOneTap';

import Register from './register';
import Login from './login';



export default function HomePage() {
  
  return (
    <div className="min-h-screen w-full relative">
      <GoogleOneTap />
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="w-full">
        {/* Hero Section - only show on home page */}
        <Routes>
          <Route path="/" element={
            <div className="relative">
              {/* Hero Background */}
              <div className="h-[750px] bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 overflow-hidden relative">
                {/* Background overlay */}
                <div className="absolute inset-0   bg-opacity-20"></div>

                {/* Spice pile visual effects */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Main spice pile */}
                    <div className="absolute right-20 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                    <div className="absolute right-24 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-80"></div>
                    <div className="absolute right-28 top-1/2 transform -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-orange-400 to-red-400 rounded-full opacity-70"></div>

                    {/* Additional spice piles */}
                    <div className="absolute right-96 top-1/3 w-48 h-48 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full opacity-60"></div>
                    <div className="absolute right-80 top-2/3 w-40 h-40 bg-gradient-to-br from-red-500 to-orange-600 rounded-full opacity-50"></div>
                    <div className="absolute right-[500px] top-1/2 w-56 h-56 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-40"></div>
                  </div>
                </div>

                {/* Hero Content */}
                <div className="absolute inset-0 z-10 flex items-center h-full">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl">
                      <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
                        <span className="text-orange-200">PREMIUM</span> QUALITY<br />
                        <span className="text-orange-200">UDARI</span><br />
                        <span className="text-orange-300">SHOP</span> <span className="text-orange-400">EXPERIENCE</span>
                      </h1>

                      <p className="text-xl text-white mb-8 leading-relaxed">
                        Discover amazing products with the best quality and service
                      </p>

                      <button className="bg-orange-700 hover:bg-orange-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                        SHOP NOW
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Body Component */}
              <HomeBody />
            </div>
          } />

          {/* Other Routes - Changed from bg-gray-50 to bg-orange-100 */}
          <Route path="/products" element={

            <ProductPage />

          } />

          <Route path="/about" element={
            <About />
          } />

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
    </div>
  );
}
import { Route, Routes } from 'react-router-dom';
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


import Register from './register';
import Login from './login';



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
                <div className="absolute inset-0   bg-opacity-20"></div>

                {/* Spice pile visual effects */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Main spice pile */}
                    <div className="absolute right-20 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                    <div className="absolute right-24 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full opacity-80"></div>

                    {/* Text content */}
                    <div className="absolute left-20 top-1/2 transform -translate-y-1/2 z-10 max-w-2xl">
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
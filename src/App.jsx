import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/homepage.jsx'
import AdminHomePage from './admin/adminHomePage.jsx'
import ProductPage from './pages/products.jsx'
import AdminLogin from './pages/AdminLogin.jsx' 
import ProductOverView from './pages/productOverView.jsx'
import CompleteProfile from './pages/CompleteProfile';
import PaymentPage from './pages/PaymentPage'; 
import WhatsAppWidget from './components/WhatsAppWidget.jsx';


// Wrapper component to conditionally show WhatsApp widget
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        <Route path="/*" element={<HomePage/>} />
        <Route path="/admin/login" element={<AdminLogin/>} />
        <Route path="/admin/*" element={<AdminHomePage/>} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} /> {/* NEW ROUTE */}
      </Routes>
      
      {/* Show WhatsApp widget only on customer pages (not admin routes) */}
      {!isAdminRoute && <WhatsAppWidget />}
    </>
  );
}

function App() {
  const [count, setCount] = useState(0)
  return (
    <BrowserRouter>
      <Toaster position="top-center"/>
      <AppContent />
    </BrowserRouter>
  );
}


export default App
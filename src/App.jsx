import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/homepage.jsx'
import AdminHomePage from './admin/adminHomePage.jsx'
import ProductPage from './pages/products.jsx'

import ProductOverView from './pages/productOverView.jsx'




function App() {
  const [count, setCount] = useState(0)
  return (
    <BrowserRouter>
    <Toaster position="top-center"/>
      <Routes>
        <Route path="/*" element={<HomePage/>} />
        <Route path="/admin/*" element={<AdminHomePage/>} />
        
      </Routes>
    </BrowserRouter>
  );
}


export default App
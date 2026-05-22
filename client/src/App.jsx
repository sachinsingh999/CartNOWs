import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Product from "./pages/Product";
import Navbar from "./componenets/Navbar";
import Men from "./pages/Men";
import Women from "./pages/Women";
import Kid from "./pages/Kid";
import Footer from "./componenets/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import PlaceOrder from "./pages/PlaceOrder";
import Orderdetail from "./pages/Orderdetail";
import Track from "./pages/Track";
import { ToastContainer } from 'react-toastify';
import Profile from "./pages/Profile";
import Help from "./pages/Help";

const App = () => {

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer/>

      <Navbar />

      {/* MAIN must grow */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/product" element={<Product />} />
          <Route path="/product/men" element={<Men />} />
          <Route path="/product/women" element={<Women />} />
          <Route path="/product/kid" element={<Kid />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/placeorder" element={<PlaceOrder />} />
          <Route path="/orderdetail" element={<Orderdetail />} />
          <Route path="/track/:id" element={<Track />} />
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/help" element={<Help />} />
        </Routes>
      </main>

      <Footer />

    </div>
  );
};



export default App;

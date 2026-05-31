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
import { ToastContainer, Slide } from 'react-toastify';
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import TryOn from "./pages/TryOn";
import Verify from "./pages/Verify";
import OrderConfirmed from "./pages/OrderConfirmed";
import Wishlist from "./pages/Wishlist";
import CoShop from "./pages/CoShop";
import AiAssistant from "./componenets/AiAssistant";
import ScrollToTop from "./componenets/ScrollToTop";
import ComparisonTray from "./componenets/ComparisonTray";

const App = () => {

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <ScrollToTop />
      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        draggable
        transition={Slide}
        toastClassName={() =>
          "relative flex items-center gap-3 min-h-[52px] w-[340px] rounded-2xl border border-white/10 bg-slate-900 dark:bg-slate-800 text-white shadow-2xl shadow-black/30 px-4 py-3 mb-2 overflow-hidden cursor-pointer select-none"
        }
        bodyClassName={() =>
          "flex-1 text-[13px] font-semibold leading-snug text-slate-100"
        }
        closeButton={({ closeToast }) => (
          <button
            onClick={closeToast}
            className="ml-1 shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer text-xs font-black"
          >
            ✕
          </button>
        )}
      />

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
          <Route path="/tryon" element={<TryOn />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/coshop/:roomId" element={<CoShop />} />
        </Routes>
      </main>

      <Footer />
      <AiAssistant />
      <ComparisonTray />

    </div>
  );
};



export default App;

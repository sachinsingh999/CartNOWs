import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { Store, Truck } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-650 dark:focus:border-indigo-500";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/login`,
        { email, password }
      );

      if (response.data.success) {
        const receivedToken = response.data.token;
        setToken(receivedToken);
        localStorage.setItem("token", receivedToken);

        // Merge guest cart items into database cart
        const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
        for (const key in guestCart) {
          const [itemId, size] = key.split("_");
          const qty = guestCart[key];
          try {
            await axios.post(
              `${backendUrl}/api/cart/add`,
              { itemId, size, qty },
              { headers: { Authorization: `Bearer ${receivedToken}` } }
            );
          } catch (mergeErr) {
            console.error("Cart merge error:", mergeErr);
          }
        }
        localStorage.removeItem("cart");

        // Merge guest wishlist items into database wishlist
        const guestWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        if (guestWishlist.length > 0) {
          try {
            const currentWishlistRes = await axios.post(
              `${backendUrl}/api/wishlist/get`,
              {},
              { headers: { Authorization: `Bearer ${receivedToken}` } }
            );
            if (currentWishlistRes.data.success) {
              const serverWishlistIds = currentWishlistRes.data.wishlist || [];
              const toMerge = guestWishlist.filter(id => !serverWishlistIds.includes(id));
              
              for (const productId of toMerge) {
                await axios.post(
                  `${backendUrl}/api/wishlist/toggle`,
                  { productId },
                  { headers: { Authorization: `Bearer ${receivedToken}` } }
                );
              }
            }
          } catch (mergeWishErr) {
            console.error("Wishlist merge error:", mergeWishErr);
          }
        }
        localStorage.removeItem("wishlist");

        toast.success(response.data.message || "Login successful");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Try again.");
      }
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-12 transition-colors duration-200">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md shadow-sm lg:grid-cols-[1fr_440px]">
        <div className="relative hidden min-h-[620px] lg:block">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d"
            alt="Fashion rack"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex h-full flex-col justify-end p-10 text-white text-left">
            <p className="text-sm font-medium uppercase tracking-wide text-white/70">
              CartNOW
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              Sign in and continue your shopping flow.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/75 font-light">
              Access your cart, profile, order tracking, and product reviews.
            </p>
          </div>
        </div>

        <div className="flex items-center p-6 sm:p-10 text-left bg-white dark:bg-transparent">
          <div className="w-full">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Welcome back
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-slate-100 tracking-tight">
              Login to CartNOW
            </h2>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-black dark:bg-indigo-650 hover:bg-slate-800 dark:hover:bg-indigo-700 py-3.5 text-xs font-black uppercase tracking-wider text-white transition active:scale-98 cursor-pointer shadow"
              >
                Login
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?
              <button
                onClick={() => navigate("/signup")}
                className="ml-1 font-bold text-slate-950 dark:text-slate-100 hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                Access Other Portals
              </p>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="https://cartnow-seller.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50/35 dark:hover:bg-orange-950/20 hover:text-orange-650 dark:hover:text-orange-400 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-sm"
                >
                  <Store size={15} className="text-orange-500" />
                  <span>Seller Portal</span>
                </a>
                <a
                  href="https://cart-now-deliveryagent.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/35 dark:hover:bg-blue-950/20 hover:text-blue-650 dark:hover:text-blue-400 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-sm"
                >
                  <Truck size={15} className="text-blue-500" />
                  <span>Delivery Agent</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

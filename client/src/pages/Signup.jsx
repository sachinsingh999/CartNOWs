import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { backendUrl } from "../config";

const inputClass =
  "w-full rounded-xl border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/register`,
        { name, email, password }
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

        toast.success("Account created successfully!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-12 transition-colors duration-200">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md shadow-sm lg:grid-cols-[440px_1fr]">
        
        <div className="flex items-center p-6 sm:p-10 text-left bg-white dark:bg-transparent">
          <div className="w-full">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Create account
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-slate-100 tracking-tight">
              Join CartNOW
            </h2>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              Save your cart, track orders, and write reviews after purchase.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-950 dark:bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 py-3.5 text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white transition active:scale-98 cursor-pointer shadow"
              >
                Sign Up
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?
              <button
                onClick={() => navigate("/login")}
                className="ml-1 font-bold text-slate-950 dark:text-slate-100 hover:underline cursor-pointer"
              >
                Login
              </button>
            </p>
          </div>
        </div>

        <div className="relative hidden min-h-[650px] lg:block">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b"
            alt="Shopping"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex h-full flex-col justify-end p-10 text-slate-100 dark:text-white text-left">
            <p className="text-sm font-medium uppercase tracking-wide text-white/70">
              Shop better
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              Your orders, profile, cart, and reviews in one place.
            </h1>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;

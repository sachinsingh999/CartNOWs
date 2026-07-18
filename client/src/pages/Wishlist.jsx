import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Heart, ArrowRight } from "lucide-react";
import { backendUrl } from "../config";
import { cachedGet } from "../utils/apiCache";
import { WishlistSkeleton } from "../components/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  const fetchWishlistData = async () => {
    setLoading(true);
    try {
      if (token) {
        const response = await axios.post(
          `${backendUrl}/api/wishlist/get`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setWishlist(response.data.products || []);
        } else {
          toast.error(response.data.message);
        }
      } else {
        // Guest mode
        const localWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        if (localWishlist.length > 0) {
          const productsRes = await cachedGet(`${backendUrl}/api/product/list`);
          if (productsRes.data?.success) {
            const filtered = productsRes.data.products.filter((p) =>
              localWishlist.includes(p._id)
            );
            setWishlist(filtered);
          }
        } else {
          setWishlist([]);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistData();
  }, [token]);

  useEffect(() => {
    const handleWishlistUpdateEvent = () => {
      try {
        const localList = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlist((prevList) => prevList.filter((item) => localList.includes(item._id)));
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener("wishlistUpdate", handleWishlistUpdateEvent);
    return () => window.removeEventListener("wishlistUpdate", handleWishlistUpdateEvent);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070A13] flex items-center justify-center">
        <div className="max-w-7xl w-full mx-auto px-6 py-12">
          <WishlistSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#070A13] px-6 py-16 sm:px-12 lg:px-20 transition-colors duration-300 text-left relative">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Simple Page Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 select-none">
          <div className="h-12 w-12 bg-pink-500/10 text-pink-500 rounded-md flex items-center justify-center border border-pink-500/20 shadow-xs">
            <Heart size={22} className="fill-pink-500 text-pink-500 animate-pulse" />
          </div>
          <div className="text-left space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight font-sans">
              My Favorites
            </h1>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
              {wishlist.length} Saved Item{wishlist.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          {wishlist.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="py-24 text-center max-w-md mx-auto space-y-6"
            >
              <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 text-slate-350 dark:text-slate-655 rounded-full flex items-center justify-center mx-auto">
                <Heart size={30} />
              </div>
              <div className="space-y-2">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Your wishlist is empty</h2>
                <p className="text-xs text-slate-450 dark:text-slate-500 leading-relaxed font-semibold">
                  Browse our catalog and save the designs you love.
                </p>
              </div>
              <Link
                to="/product"
                className="inline-flex items-center gap-2 bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-md cursor-pointer no-underline border-none"
              >
                <span>Browse Products</span>
                <ArrowRight size={13} />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="favorites-grid"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              {wishlist.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Wishlist;

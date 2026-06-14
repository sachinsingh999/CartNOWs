import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { backendUrl } from "../config";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    setLoading(true);
    if (token) {
      try {
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
      } catch (error) {
        console.log(error);
        toast.error("Failed to load wishlist");
      }
    } else {
      // Guest mode - fetch from localStorage and load product details
      try {
        const localWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        if (localWishlist.length > 0) {
          const response = await axios.get(`${backendUrl}/api/product/list`);
          if (response.data.success) {
            const filtered = response.data.products.filter((p) =>
              localWishlist.includes(p._id)
            );
            setWishlist(filtered);
          }
        } else {
          setWishlist([]);
        }
      } catch (error) {
        console.log(error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const handleRemove = async (productId) => {
    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/wishlist/toggle`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success("Removed from wishlist");
          fetchWishlist();
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to remove item");
      }
    } else {
      const localWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const updated = localWishlist.filter((id) => id !== productId);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      toast.success("Removed from wishlist");
      fetchWishlist();
    }
  };

  const handleAddToCart = async (product) => {
    const chosenSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M";

    const cartItem = {
      itemId: product._id,
      size: chosenSize,
      qty: 1
    };

    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/add`,
          cartItem,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success("Added to cart");
        }
      } catch (error) {
        toast.error("Failed to add to cart");
      }
    } else {
      let guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${product._id}_${chosenSize}`;
      guestCart[key] = (guestCart[key] || 0) + 1;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      toast.success("Added to cart");
      // dispatch custom event to update navbar cart badge
      window.dispatchEvent(new Event("storage"));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-xl flex items-center justify-center border border-rose-100 dark:border-rose-900/30 shadow-sm">
          <Heart size={20} className="fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Favorites</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-700 rounded-full flex items-center justify-center">
            <Heart size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your wishlist is empty</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed mt-1">
              Save your favorite clothing designs to purchase them later or try them on with our AI Stylist.
            </p>
          </div>
          <Link
            to="/product"
            className="inline-flex items-center gap-2 bg-[#FF5100] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition duration-200 shadow-lg shadow-orange-500/10 active:scale-95"
          >
            <span>Start Shopping</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div className="relative">
                {/* Image Frame */}
                <div className="aspect-[4/5] bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 p-3 flex items-center justify-center shadow-inner relative">
                  <img
                    src={product.images?.[0]?.startsWith("http") ? product.images[0] : `${backendUrl}/${product.images?.[0]}`}
                    alt={product.name}
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-2 right-2 h-8 w-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center text-rose-500 shadow-sm cursor-pointer active:scale-90 transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Remove from favorites"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate tracking-tight">{product.name}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{product.category}</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-1.5">₹{product.price}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all"
                >
                  <ShoppingBag size={12} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

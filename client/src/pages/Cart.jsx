import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Ticket,
  Star,
  Heart,
  Bookmark,
  Lock,
  ChevronRight,
  RotateCcw,
  Truck,
  Percent
} from "lucide-react";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { useLanguage } from "../context/LanguageContext";
import { getAverageRating } from "../utils/productRatings";

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const token = localStorage.getItem("token");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const fetchCart = async () => {
    try {
      let cartData = {};
      if (token) {
        const cartRes = await axios.post(
          `${backendUrl}/api/cart/get`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (cartRes.data.success) {
          cartData = cartRes.data.cartData || {};
        }
      } else {
        cartData = JSON.parse(localStorage.getItem("cart") || "{}");
      }

      const items = [];

      for (const key in cartData) {
        const [itemId, size] = key.split("_");
        const qty = cartData[key];

        if (qty > 0) {
          try {
            const productRes = await axios.get(
              `${backendUrl}/api/product/single/${itemId}`
            );

            if (productRes.data.success && productRes.data.product) {
              items.push({
                itemId,
                size,
                qty,
                product: productRes.data.product,
                selected: true,
              });
            }
          } catch (err) {
            console.log(`Failed to load cart item ${itemId}:`, err);
          }
        }
      }

      setCartItems(items);
    } catch (error) {
      console.log("CART FETCH ERROR:", error);
    }
  };

  useEffect(() => {
    fetchCart();
    const saved = JSON.parse(localStorage.getItem("savedForLater") || "[]");
    setSavedItems(saved);
  }, [token]);

  const updateQty = async (index, newQty) => {
    if (newQty < 1) return;

    const item = cartItems[index];

    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${item.itemId}_${item.size}`;
      guestCart[key] = newQty;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      
      const updated = [...cartItems];
      updated[index].qty = newQty;
      setCartItems(updated);
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/update`,
        {
          itemId: item.itemId,
          size: item.size,
          qty: newQty,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const updated = [...cartItems];
        updated[index].qty = newQty;
        setCartItems(updated);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const removeItem = async (index) => {
    const item = cartItems[index];

    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${item.itemId}_${item.size}`;
      delete guestCart[key];
      localStorage.setItem("cart", JSON.stringify(guestCart));
      
      setCartItems(cartItems.filter((_, i) => i !== index));
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/update`,
        {
          itemId: item.itemId,
          size: item.size,
          qty: 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setCartItems(cartItems.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSelectItem = (index) => {
    const updated = [...cartItems];
    updated[index].selected = !updated[index].selected;
    setCartItems(updated);
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.every((item) => item.selected);
    const updated = cartItems.map((item) => ({
      ...item,
      selected: !allSelected,
    }));
    setCartItems(updated);
  };

  // Move to Wishlist
  const moveToWishlist = async (index) => {
    const item = cartItems[index];

    if (token) {
      try {
        const res = await axios.post(
          `${backendUrl}/api/wishlist/toggle`,
          { productId: item.itemId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          toast.success("Item moved to Wishlist!");
          await removeItem(index);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to move item to Wishlist");
      }
    } else {
      const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
      if (!list.includes(item.itemId)) {
        list.push(item.itemId);
        localStorage.setItem("wishlist", JSON.stringify(list));
      }
      toast.success("Item moved to Wishlist!");
      await removeItem(index);
    }
  };

  // Save for Later
  const saveForLater = async (index) => {
    const item = cartItems[index];
    const saved = JSON.parse(localStorage.getItem("savedForLater") || "[]");
    
    const key = `${item.itemId}_${item.size}`;
    if (!saved.some(x => `${x.itemId}_${x.size}` === key)) {
      saved.push(item);
      localStorage.setItem("savedForLater", JSON.stringify(saved));
      setSavedItems(saved);
    }

    toast.success("Saved for later!");
    await removeItem(index);
  };

  // Move back to Cart
  const moveToCart = async (savedIndex) => {
    const item = savedItems[savedIndex];

    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${item.itemId}_${item.size}`;
      guestCart[key] = (guestCart[key] || 0) + item.qty;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      
      const updatedSaved = savedItems.filter((_, i) => i !== savedIndex);
      localStorage.setItem("savedForLater", JSON.stringify(updatedSaved));
      setSavedItems(updatedSaved);

      toast.success("Item moved back to Cart!");
      fetchCart();
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId: item.itemId, size: item.size, qty: item.qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const updatedSaved = savedItems.filter((_, i) => i !== savedIndex);
        localStorage.setItem("savedForLater", JSON.stringify(updatedSaved));
        setSavedItems(updatedSaved);
        toast.success("Item moved back to Cart!");
        fetchCart();
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to move item to Cart");
    }
  };

  const removeSavedItem = (savedIndex) => {
    const updatedSaved = savedItems.filter((_, i) => i !== savedIndex);
    localStorage.setItem("savedForLater", JSON.stringify(updatedSaved));
    setSavedItems(updatedSaved);
    toast.success("Removed from saved list");
  };

  // Coupon handler
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");

    if (!token) {
      setCouponError("Please login to apply coupons");
      setCouponLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/coupon/apply`,
        { code: couponCode, cartAmount: total },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setAppliedCoupon(response.data);
        toast.success("Coupon applied successfully!");
      } else {
        setCouponError(response.data.message);
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || "Failed to apply coupon");
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // Delivery estimation helper
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  if (cartItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-slate-50 dark:bg-slate-950 px-6 py-20 transition-colors duration-200 flex items-center justify-center">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md p-10 text-center shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-black text-slate-900 dark:text-slate-100">{t("cart_empty")}</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            Add your favorite products and come back here to checkout.
          </p>
          <button
            onClick={() => navigate("/product")}
            className="mt-6 rounded-xl bg-indigo-600 text-white px-6 py-3 text-xs font-black uppercase tracking-wider hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
          >
            {t("continue_shopping")}
          </button>
        </div>
      </div>
    );
  }

  // Calculations
  const selectedItems = cartItems.filter((item) => item.selected);
  const total = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  const originalTotal = selectedItems.reduce(
    (sum, item) => sum + (item.product.originalPrice || Math.round(item.product.price * 1.25)) * item.qty,
    0
  );

  const itemSavings = originalTotal - total;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const savings = itemSavings + couponDiscount;

  const shipping = total > 999 || total === 0 ? 0 : 10;
  const taxes = Math.round(total * 0.05); // 5% GST included
  const itemCount = selectedItems.reduce((sum, item) => sum + item.qty, 0);
  const grandTotal = Math.max(0, total + shipping - couponDiscount);

  const handleCheckout = () => {
    if (!token) {
      toast.info("Please login to proceed to checkout.");
      navigate("/login");
      return;
    }
    navigate("/placeorder", {
      state: {
        cartItems: selectedItems.map((item) => ({
          ...item.product,
          qty: item.qty,
          size: item.size,
        })),
        total,
        appliedCoupon,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-6 transition-colors duration-200 pb-28 lg:pb-12">
      <div className="mx-auto max-w-[1440px]">
        
        {/* Sleek Breadcrumb and Compact Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-4 text-left">
          <div>
            <nav className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              <span className="hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer transition" onClick={() => navigate("/")}>Home</span>
              <ChevronRight size={10} />
              <span className="text-slate-600 dark:text-slate-300">Cart</span>
            </nav>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <span>Shopping Cart</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
              </span>
              {itemCount > 0 && (
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                  {itemCount} Selected
                </span>
              )}
            </h1>
          </div>
          <button
            onClick={() => navigate("/product")}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500 flex items-center gap-1 transition cursor-pointer self-start sm:self-auto"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Layout Grid (12 Columns) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          
          {/* Left Side: Cart items & Saved items (70% - 8 Columns) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Compact Select All Banner */}
            {cartItems.length > 0 && (
              <div className="flex items-center justify-between bg-white dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-2 px-3.5 shadow-xs text-left">
                <label className="flex items-center gap-2.5 cursor-pointer text-[11px] font-bold text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={cartItems.length > 0 && cartItems.every((item) => item.selected)}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-750 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 bg-white dark:bg-slate-900"
                  />
                  <span>Select All ({cartItems.length})</span>
                </label>
                {selectedItems.length > 0 && (
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {selectedItems.length} Selected
                  </span>
                )}
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-3">
              {cartItems.map((item, index) => {
                const avgRating = getAverageRating(item.product) || 4.5;
                const originalPrice = item.product.originalPrice || Math.round(item.product.price * 1.25);
                const discountPercent = Math.round(((originalPrice - item.product.price) / originalPrice) * 100);

                return (
                  <div
                    key={`${item.itemId}-${item.size}`}
                    className={`group flex items-center gap-3 rounded-[20px] border p-3.5 shadow-sm transition-all duration-300 hover:shadow-md ${
                      item.selected
                        ? "border-indigo-500/80 bg-indigo-50/5 dark:bg-indigo-950/5"
                        : "border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* Modern Checkbox Selector */}
                    <div className="flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelectItem(index)}
                        className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-750 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 bg-white dark:bg-slate-900"
                      />
                    </div>

                    {/* Product Image Frame (120x120 max) */}
                    <div className="h-[110px] w-[110px] sm:h-[120px] sm:w-[120px] flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden border border-slate-100 dark:border-slate-800 p-1.5 shrink-0 transition-transform duration-300 group-hover:scale-[1.02]">
                      <img
                        src={item.product.images[0]?.startsWith("http") ? item.product.images[0] : `${backendUrl}/${item.product.images[0]}`}
                        className="h-full w-full object-contain"
                        alt={item.product.name}
                        loading="lazy"
                      />
                    </div>

                    {/* Meta and Details */}
                    <div className="flex flex-col sm:flex-row justify-between flex-1 gap-2 text-left h-full min-h-[110px] sm:min-h-[120px]">
                      
                      {/* Product details */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-black text-slate-950 dark:text-white leading-snug line-clamp-2 pr-4">
                            {item.product.name}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize mt-0.5">
                            {item.product.category} · {item.product.brand || "Fashion"}
                          </p>
                          
                          {/* Rating and Stock Indicators */}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-500/5 px-1.5 py-0.5 rounded-md">
                              <Star className="h-3 w-3 fill-amber-500 stroke-none" />
                              <span>{avgRating.toFixed(1)}</span>
                            </span>
                            <span className={`h-1.5 w-1.5 rounded-full ${item.product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                              {item.product.stock > 0 ? `In Stock (${item.product.stock})` : "Out of Stock"}
                            </span>
                          </div>
                        </div>

                        {/* Actions row */}
                        <div className="flex items-center gap-3.5 mt-2">
                          <button
                            onClick={() => moveToWishlist(index)}
                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          >
                            <Heart size={11} className="stroke-[2.5]" />
                            <span>Wishlist</span>
                          </button>
                          <button
                            onClick={() => saveForLater(index)}
                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                          >
                            <Bookmark size={11} className="stroke-[2.5]" />
                            <span>Save for Later</span>
                          </button>
                        </div>
                      </div>

                      {/* Right aligned actions: Pricing and Stepper */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 sm:text-right">
                        
                        {/* Price Block */}
                        <div className="text-left sm:text-right">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                              ₹{item.product.price.toLocaleString("en-IN")}
                            </span>
                            {discountPercent > 0 && (
                              <span className="text-[10px] font-semibold text-slate-400 line-through">
                                ₹{originalPrice.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          {discountPercent > 0 && (
                            <span className="text-[9px] font-black bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        {/* Stepper controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 overflow-hidden h-8 shrink-0">
                            <button
                              onClick={() => updateQty(index, item.qty - 1)}
                              className="h-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition cursor-pointer px-2.5"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3 stroke-[3]" />
                            </button>
                            <span className="min-w-5 text-center text-xs font-black text-slate-950 dark:text-white">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(index, item.qty + 1)}
                              className="h-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition cursor-pointer px-2.5"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3 stroke-[3]" />
                            </button>
                          </div>

                          {/* Delete Item (Trash bin icon only) */}
                          <button
                            onClick={() => removeItem(index)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
                            title="Remove from Cart"
                          >
                            <Trash2 size={14} className="stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Delivery estimation */}
                        <p className="hidden sm:flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          <Truck size={10} className="text-emerald-500" />
                          <span>Delivery by {getDeliveryDate()}</span>
                        </p>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Saved for Later Section */}
            {savedItems.length > 0 && (
              <div className="mt-8 border-t border-slate-200/60 dark:border-slate-800/80 pt-6 text-left">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <span>Saved for Later</span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                    {savedItems.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedItems.map((item, idx) => (
                    <div
                      key={`saved-${item.itemId}-${item.size}`}
                      className="group flex gap-3 border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 p-3 rounded-[20px] shadow-xs hover:shadow-sm transition"
                    >
                      <div className="h-16 w-16 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden p-1 shrink-0">
                        <img
                          src={item.product.images[0]?.startsWith("http") ? item.product.images[0] : `${backendUrl}/${item.product.images[0]}`}
                          className="h-full w-full object-contain"
                          alt={item.product.name}
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between text-left">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">{item.product.name}</h4>
                          <p className="text-[9px] font-bold text-slate-400 mt-0.5">Size: {item.size} · Price: ₹{item.product.price}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <button
                            onClick={() => moveToCart(idx)}
                            className="text-[9px] font-black uppercase text-indigo-600 hover:underline transition cursor-pointer"
                          >
                            Move to Cart
                          </button>
                          <span className="text-slate-200 dark:text-slate-800 text-[9px]">•</span>
                          <button
                            onClick={() => removeSavedItem(idx)}
                            className="text-[9px] font-black uppercase text-red-500 hover:underline transition cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Side: Order Summary (30% - 4 Columns on Desktop, Hidden Mobile or static panel) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            
            <div className="rounded-[20px] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 shadow-sm text-left space-y-5">
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white">Order Summary</h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Review items & checkout</p>
              </div>

              {/* Coupon Code Panel */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-0.5">
                  Have a Promo Code?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter code (e.g. GET50)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={couponLoading || appliedCoupon}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white outline-none focus:border-indigo-500 transition shadow-inner"
                    />
                  </div>
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="rounded-xl border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 text-xs font-bold uppercase transition"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="rounded-xl bg-slate-900 dark:bg-indigo-600 text-white px-4 py-2 text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition cursor-pointer disabled:opacity-50"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-[10px] font-bold text-red-500 mt-1 pl-0.5">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-[10px] font-bold text-emerald-500 mt-1 pl-0.5">
                    Code "{appliedCoupon.code}" applied! Discount: ₹{appliedCoupon.discountAmount}
                  </p>
                )}
              </form>

              {/* Summary calculations */}
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-black text-slate-950 dark:text-white">₹{total.toLocaleString("en-IN")}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Percent size={11} className="stroke-[2.5]" />
                      <span>Total Savings</span>
                    </span>
                    <span className="font-black">-₹{savings.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Shipping</span>
                  <span className="font-black text-slate-950 dark:text-white">
                    {shipping === 0 ? <span className="text-emerald-500">Free</span> : `₹${shipping}`}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Taxes (GST 5%)</span>
                  <span className="font-black text-slate-950 dark:text-white">
                    {total > 0 ? `₹${taxes.toLocaleString("en-IN")}` : "₹0"}
                  </span>
                </div>
                
                <p className="text-[9px] text-slate-400 dark:text-slate-500 text-right font-medium">Taxes are calculated and included in subtotal</p>
              </div>

              <hr className="border-slate-200/50 dark:border-slate-800/80" />

              {/* Grand Total */}
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-slate-950 dark:text-white">Total Amount</span>
                  <p className="text-[9px] font-medium text-slate-400">VAT & GST included</p>
                </div>
                <span className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Checkout Button */}
              <div className="pt-1">
                <button
                  disabled={itemCount === 0}
                  onClick={handleCheckout}
                  className={`w-full rounded-xl py-4 h-[56px] text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-98 cursor-pointer shadow-md ${
                    itemCount === 0
                      ? "bg-slate-300 dark:bg-slate-800 cursor-not-allowed hover:shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-750 hover:shadow-indigo-600/10 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                  }`}
                >
                  <Lock size={13} className="stroke-[2.5]" />
                  <span>Secure Checkout ({itemCount})</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">Secure Pay</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                    <RotateCcw size={16} />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">30 Day Return</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                    <Truck size={16} />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">Fast Delivery</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Mobile Sticky Bottom Checkout Bar (lg:hidden) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] flex items-center justify-between">
        <div className="text-left">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Amount</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-slate-950 dark:text-white">
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
          </div>
          {savings > 0 && (
            <p className="text-[9px] font-bold text-emerald-600">Saved: ₹{savings.toLocaleString("en-IN")}</p>
          )}
        </div>
        <button
          disabled={itemCount === 0}
          onClick={handleCheckout}
          className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 transition active:scale-95 shadow-md ${
            itemCount === 0
              ? "bg-slate-300 dark:bg-slate-800 cursor-not-allowed hover:shadow-none"
              : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-650"
          }`}
        >
          <Lock size={12} className="stroke-[2.5]" />
          <span>Checkout ({itemCount})</span>
        </button>
      </div>

    </div>
  );
};

export default Cart;

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
  Percent,
  Sparkles,
  Gift,
  HelpCircle,
  Copy,
  Check
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

  // Additional Premium features states
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [couponsDrawerOpen, setCouponsDrawerOpen] = useState(false);
  const [copiedCouponId, setCopiedCouponId] = useState(null);

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
        const firstUnderscoreIdx = key.indexOf("_");
        const itemId = firstUnderscoreIdx !== -1 ? key.substring(0, firstUnderscoreIdx) : key;
        const size = firstUnderscoreIdx !== -1 ? key.substring(firstUnderscoreIdx + 1) : "";
        const qty = cartData[key];

        if (qty > 0) {
          try {
            const productRes = await axios.get(
              `${backendUrl}/api/product/single/${itemId}`
            );

            if (productRes.data.success && productRes.data.product) {
              const prod = productRes.data.product;
              let itemPrice = prod.price;
              let itemStock = prod.stock;
              let itemSku = prod.sku;

              if (prod.variants && prod.variants.length > 0 && size && size.includes(":")) {
                const selectedAttributes = {};
                size.split(",").forEach(pair => {
                  const [k, v] = pair.split(":");
                  if (k && v) selectedAttributes[k] = v;
                });

                const match = prod.variants.find(variant => {
                  return Object.keys(selectedAttributes).every(k => variant.attributes?.[k] === selectedAttributes[k]);
                });

                if (match) {
                  itemPrice = match.price;
                  itemStock = match.stock;
                  itemSku = match.sku;
                }
              }

              items.push({
                itemId,
                size,
                qty,
                product: prod,
                price: itemPrice,
                stock: itemStock,
                sku: itemSku,
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

  const fetchCouponsAndRecommendations = async () => {
    try {
      // Fetch available coupons
      const couponRes = await axios.get(`${backendUrl}/api/coupon/list`);
      if (couponRes.data.success) {
        const now = new Date();
        const active = (couponRes.data.coupons || []).filter(
          (c) => c.isActive && (!c.expiryDate || new Date(c.expiryDate) > now)
        );
        setAvailableCoupons(active);
      }

      // Fetch recommended products
      const prodRes = await axios.get(`${backendUrl}/api/product/list`);
      if (prodRes.data.success) {
        const cartIds = cartItems.map((item) => item.itemId);
        const recs = (prodRes.data.products || [])
          .filter((p) => !cartIds.includes(p._id) && p.stock > 0)
          .slice(0, 10);
        setRecommendedProducts(recs);
      }
    } catch (err) {
      console.log("Failed to fetch additional cart components data:", err);
    }
  };

  useEffect(() => {
    fetchCart();
    const saved = JSON.parse(localStorage.getItem("savedForLater") || "[]");
    setSavedItems(saved);
  }, [token]);

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchCouponsAndRecommendations();
    }
  }, [cartItems.length]);

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

  // Add Item to Cart (from recommendations)
  const handleAddRecommended = async (product) => {
    const size = product.sizes?.length ? (Array.isArray(product.sizes) ? product.sizes[0] : product.sizes) : "standard";
    if (product.stock <= 0) return;

    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${product._id}_${size}`;
      guestCart[key] = (guestCart[key] || 0) + 1;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      window.dispatchEvent(new Event("cartUpdate"));
      toast.success("Added to cart! 🛍️");
      fetchCart();
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId: product._id, size, qty: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        window.dispatchEvent(new Event("cartUpdate"));
        toast.success("Added to cart! 🛍️");
        fetchCart();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error adding to cart");
    }
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
    if (e) e.preventDefault();
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
        { code: couponCode.trim(), cartAmount: total },
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

  const applySpecificCoupon = async (code) => {
    setCouponCode(code);
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
        { code: code.trim(), cartAmount: total },
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

  const handleCopyCoupon = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponId(id);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopiedCouponId(null), 2000);
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
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md p-10 text-center shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-black text-slate-900 dark:text-slate-100">{t("cart_empty")}</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            Add your favorite products and come back here to checkout.
          </p>
          <button
            onClick={() => navigate("/product")}
            className="mt-6 rounded-xl bg-indigo-600 text-slate-100 dark:text-white px-6 py-3 text-xs font-black uppercase tracking-wider hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
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
    (sum, item) => sum + (item.price !== undefined ? item.price : item.product.price) * item.qty,
    0
  );

  const originalTotal = selectedItems.reduce(
    (sum, item) => {
      const price = item.price !== undefined ? item.price : item.product.price;
      return sum + (item.product.originalPrice ? Math.round(price * (item.product.originalPrice / item.product.price)) : Math.round(price * 1.25)) * item.qty;
    },
    0
  );

  const itemSavings = originalTotal - total;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const wrapFee = giftWrap ? 50 : 0;
  const savings = itemSavings + couponDiscount;

  const shipping = total > 999 || total === 0 ? 0 : 10;
  const taxes = Math.round(total * 0.05); // 5% GST included
  const itemCount = selectedItems.reduce((sum, item) => sum + item.qty, 0);
  const grandTotal = Math.max(0, total + shipping + wrapFee - couponDiscount);



  const handleCheckout = () => {
    if (!token) {
      toast.info("Please login to proceed to checkout.");
      navigate("/login");
      return;
    }
    navigate("/placeorder", {
      state: {
        cartItems: selectedItems.map((item) => {
          const hasDynamicAttrs = item.product.attributes && typeof item.product.attributes === "object" && !Array.isArray(item.product.attributes) && Object.keys(item.product.attributes).length > 0;
          let selectedAttributes = undefined;
          if (hasDynamicAttrs && item.size && item.size.includes(":")) {
            selectedAttributes = {};
            item.size.split(",").forEach(pair => {
              const [k, v] = pair.split(":");
              if (k && v) selectedAttributes[k] = v;
            });
          }
          return {
            ...item.product,
            price: item.price !== undefined ? item.price : item.product.price,
            stock: item.stock !== undefined ? item.stock : item.product.stock,
            sku: item.sku !== undefined ? item.sku : item.product.sku,
            qty: item.qty,
            size: item.size,
            selectedAttributes,
          };
        }),
        total,
        appliedCoupon,
        giftWrap,
        giftMessage,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-6 transition-colors duration-200 pb-28 lg:pb-12 text-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-[1440px]">
        
        {/* Breadcrumb and Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800/60 pb-4 text-left">
          <div>
            <nav className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition" onClick={() => navigate("/")}>Home</span>
              <ChevronRight size={10} />
              <span className="text-slate-700 dark:text-slate-400">Cart</span>
            </nav>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2 tracking-tight">
              <span>Shopping Cart</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
              </span>
              {itemCount > 0 && (
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-0.5 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                  {itemCount} Selected
                </span>
              )}
            </h1>
          </div>
          <button
            onClick={() => navigate("/product")}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition cursor-pointer self-start sm:self-auto"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={12} />
          </button>
        </div>



        {/* Layout Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          
          {/* Left Side: Cart items & Saved items (8 Columns) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Select All Banner */}
            {cartItems.length > 0 && (
              <div className="flex items-center justify-between bg-white/70 dark:bg-slate-900/20 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 rounded-xl p-2.5 px-4 shadow-xs text-left">
                <label className="flex items-center gap-2.5 cursor-pointer text-[11px] font-bold text-slate-700 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={cartItems.length > 0 && cartItems.every((item) => item.selected)}
                    onChange={toggleSelectAll}
                    className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 cursor-pointer accent-indigo-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  />
                  <span>Select All ({cartItems.length})</span>
                </label>
                {selectedItems.length > 0 && (
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    {selectedItems.length} Checked
                  </span>
                )}
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-3.5">
              {cartItems.map((item, index) => {
                const avgRating = getAverageRating(item.product) || 4.5;
                const itemPrice = item.price !== undefined ? item.price : item.product.price;
                const originalPrice = item.product.originalPrice ? Math.round(itemPrice * (item.product.originalPrice / item.product.price)) : Math.round(itemPrice * 1.25);
                const discountPercent = Math.round(((originalPrice - itemPrice) / originalPrice) * 100);
                const itemStock = item.stock !== undefined ? item.stock : item.product.stock;
                const imageUrl = item.product.images?.[0]?.startsWith("http") ? item.product.images[0] : `${backendUrl}/${item.product.images?.[0]}`;

                return (
                  <div key={`${item.itemId}-${item.size}`} className="w-full">
                    {/* DESKTOP CARD VIEW */}
                    <div
                      className={`hidden lg:flex items-center gap-3.5 rounded-[20px] border p-4 shadow-sm transition-all duration-350 hover:scale-[1.005] hover:shadow-md w-full ${ item.selected ? "border-indigo-500/80 bg-indigo-50/5 dark:bg-indigo-950/5" : "border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700" }`}
                    >
                      {/* Checkbox Selector */}
                      <div className="flex items-center justify-center shrink-0">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleSelectItem(index)}
                          className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 cursor-pointer accent-indigo-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        />
                      </div>

                      {/* Product Image Frame */}
                      <div className="h-28 w-28 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-950 overflow-hidden border border-slate-100 dark:border-slate-800 p-2 shrink-0 transition-transform duration-300 group-hover:scale-[1.02] shadow-inner">
                        <img
                          src={imageUrl}
                          className="h-full w-full object-contain"
                          alt={item.product.name}
                          loading="lazy"
                        />
                      </div>

                      {/* Details and Operations */}
                      <div className="flex flex-col sm:flex-row justify-between flex-1 gap-3.5 text-left h-full min-h-[110px] sm:min-h-[120px]">
                        <div className="flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2 pr-4 tracking-tight">
                              {item.product.name}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
                              {item.product.category} · {item.product.brand || "Acme"}
                            </p>
                            
                            {/* Rating and details */}
                            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-500 bg-amber-500/5 px-1.5 py-0.5 rounded-md border border-amber-500/10 uppercase tracking-wider">
                                <Star className="h-3 w-3 fill-amber-500 stroke-none" />
                                <span>{avgRating.toFixed(1)}</span>
                              </span>
                              {item.size && (
                                <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200/40 dark:border-white/[0.04] uppercase tracking-wider">
                                  {item.size.includes(":") ? (
                                    item.size.split(",").map(pair => {
                                      const [k, v] = pair.split(":");
                                      return `${k}: ${v}`;
                                    }).join(" • ")
                                  ) : (
                                    `Size ${item.size}`
                                  )}
                                </span>
                              )}
                              <span className={`h-1.5 w-1.5 rounded-full ${itemStock > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                {itemStock > 0 ? `In Stock (${itemStock})` : "Out of Stock"}
                              </span>
                            </div>
                          </div>

                          {/* Operations buttons */}
                          <div className="flex items-center gap-4 mt-2">
                            <button
                              onClick={() => moveToWishlist(index)}
                              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer"
                            >
                              <Heart size={12} className="stroke-[2.5]" />
                              <span>Wishlist</span>
                            </button>
                            <button
                              onClick={() => saveForLater(index)}
                              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                            >
                              <Bookmark size={12} className="stroke-[2.5]" />
                              <span>Save for Later</span>
                            </button>
                          </div>
                        </div>

                        {/* Right aligned actions: Pricing and Stepper */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 sm:text-right">
                          {/* Price Display */}
                          <div className="text-left sm:text-right">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                ₹{itemPrice.toLocaleString("en-IN")}
                              </span>
                              {discountPercent > 0 && (
                                <span className="text-[10px] font-semibold text-slate-400 line-through">
                                  ₹{originalPrice.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                            {discountPercent > 0 && (
                              <span className="text-[9px] font-black bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          {/* Stepper block */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 overflow-hidden h-8 shrink-0">
                              <button
                                onClick={() => updateQty(index, item.qty - 1)}
                                className="h-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer px-2.5 active:scale-95"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3 stroke-[3]" />
                              </button>
                              <span className="min-w-6 text-center text-xs font-black text-slate-950 dark:text-white">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(index, item.qty + 1)}
                                className="h-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer px-2.5 active:scale-95"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3 stroke-[3]" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(index)}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
                              title="Remove from Cart"
                            >
                              <Trash2 size={15} className="stroke-[2.5]" />
                            </button>
                          </div>

                          {/* Delivery Info */}
                          <p className="hidden sm:flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                            <Truck size={10} className="text-emerald-600" />
                            <span>Delivery by {getDeliveryDate()}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* MOBILE CARD VIEW */}
                    <div
                      className={`block lg:hidden rounded-3xl border p-4 shadow-xs transition-all duration-350 bg-white dark:bg-slate-900 ${ item.selected ? "border-indigo-500/80 bg-indigo-50/5 dark:bg-indigo-950/5" : "border-slate-200/70 dark:border-slate-800/80" }`}
                    >
                      {/* Top Row: Checkbox, Image, Title & Attributes */}
                      <div className="flex gap-3 items-start">
                        {/* Checkbox Selector */}
                        <div className="flex items-center justify-center shrink-0 mt-2">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleSelectItem(index)}
                            className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 cursor-pointer accent-indigo-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                          />
                        </div>

                        {/* Product Image Frame */}
                        <div className="h-20 w-20 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden border border-slate-100 dark:border-slate-800 p-1.5 shrink-0 shadow-inner">
                          <img
                            src={imageUrl}
                            className="h-full w-full object-contain"
                            alt={item.product.name}
                          />
                        </div>

                        {/* Details (Right of Image) */}
                        <div className="flex-1 min-w-0 text-left">
                          <h3 className="text-xs font-black text-slate-900 dark:text-white leading-snug line-clamp-2 tracking-tight">
                            {item.product.name}
                          </h3>
                          
                          {/* Brand & Category */}
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
                            {item.product.category} · {item.product.brand || "Acme"}
                          </p>

                          {/* Selected Size Badge */}
                          {item.size && (
                            <div className="mt-1">
                              <span className="inline-block text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200/40 dark:border-white/[0.04] uppercase tracking-wider">
                                {item.size.includes(":") ? (
                                  item.size.split(",").map(pair => {
                                    const [k, v] = pair.split(":");
                                    return `${k}: ${v}`;
                                  }).join(" • ")
                                ) : (
                                  `Size ${item.size}`
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Middle Row: Price, Stock, Stepper */}
                      <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
                        {/* Pricing Info */}
                        <div className="text-left">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              ₹{itemPrice.toLocaleString("en-IN")}
                            </span>
                            {discountPercent > 0 && (
                              <span className="text-[10px] font-semibold text-slate-400 line-through">
                                ₹{originalPrice.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          {discountPercent > 0 && (
                            <span className="text-[9px] font-black bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        {/* Quantity Stepper & Delete */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden h-7 shrink-0">
                            <button
                              onClick={() => updateQty(index, item.qty - 1)}
                              className="h-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition px-2 active:scale-90"
                            >
                              <Minus className="h-2.5 w-2.5 stroke-[3]" />
                            </button>
                            <span className="min-w-5 text-center text-xs font-black text-slate-900 dark:text-white">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(index, item.qty + 1)}
                              className="h-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition px-2 active:scale-90"
                            >
                              <Plus className="h-2.5 w-2.5 stroke-[3]" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(index)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 size={14} className="stroke-[2.5]" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Wishlist, Save for later, Est Delivery */}
                      <div className="mt-2.5 pt-2.5 border-t border-dashed border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => moveToWishlist(index)}
                            className="flex items-center gap-1 hover:text-rose-500 transition cursor-pointer"
                          >
                            <Heart size={11} className="stroke-[2.5]" />
                            <span>Wishlist</span>
                          </button>
                          <button
                            onClick={() => saveForLater(index)}
                            className="flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer"
                          >
                            <Bookmark size={11} className="stroke-[2.5]" />
                            <span>Save Later</span>
                          </button>
                        </div>

                        {/* Delivery Date */}
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 lowercase">
                          <Truck size={10} className="text-emerald-500 shrink-0" />
                          <span>by {getDeliveryDate()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Premium Interactive Gift Wrapping Card */}
            {selectedItems.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left space-y-4 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition border ${ giftWrap ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700" }`}>
                      <Gift size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Make it a Gift</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Premium wrap, ribbon, and customized handwritten card for ₹50.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGiftWrap(!giftWrap)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${ giftWrap ? "bg-indigo-600 text-slate-100 dark:text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 text-slate-700 dark:text-slate-300" }`}
                  >
                    {giftWrap ? "Added" : "Add Gift Wrap"}
                  </button>
                </div>

                {giftWrap && (
                  <div className="space-y-1.5 animate-scaleUp pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-0.5">Handwritten Gift Message</label>
                    <textarea
                      rows="3"
                      placeholder="Write your heartfelt message here (e.g., Happy Birthday! Warmest wishes on your special day...)"
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none transition focus:bg-white dark:focus:bg-slate-900 resize-none shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Saved for Later Section */}
            {savedItems.length > 0 && (
              <div className="mt-8 border-t border-slate-200 dark:border-slate-800/80 pt-6 text-left">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2.5 mb-4.5">
                  <span>Saved for Later</span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                    {savedItems.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedItems.map((item, idx) => (
                    <div
                      key={`saved-${item.itemId}-${item.size}`}
                      className="group flex gap-3.5 border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-3.5 rounded-[20px] shadow-xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="h-20 w-20 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden p-1 shrink-0 flex items-center justify-center">
                        <img
                          src={item.product.images?.[0]?.startsWith("http") ? item.product.images[0] : `${backendUrl}/${item.product.images?.[0]}`}
                          className="h-full w-full object-contain"
                          alt={item.product.name}
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between text-left min-w-0">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-indigo-500 transition">{item.product.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                            Size: {item.size} · Price: <span className="text-slate-900 dark:text-white font-extrabold">₹{item.product.price}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[9px] font-black uppercase tracking-wider">
                          <button
                            onClick={() => moveToCart(idx)}
                            className="text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                          >
                            Move to Cart
                          </button>
                          <span className="text-slate-200 dark:text-slate-800">•</span>
                          <button
                            onClick={() => removeSavedItem(idx)}
                            className="text-red-500 hover:text-red-700 transition cursor-pointer"
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

          {/* Right Side: Order Summary Panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            
            <div className="rounded-[20px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5.5 shadow-sm text-left space-y-5">
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white tracking-tight">Order Summary</h2>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Review items & checkout</p>
              </div>

              {/* Coupon Code Input Panel */}
              <div className="border-b border-slate-100 dark:border-slate-800/85 pb-4 space-y-2">
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-0.5 flex items-center gap-1.5 justify-between">
                    <span>Have a Promo Code?</span>
                    {availableCoupons.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCouponsDrawerOpen(!couponsDrawerOpen)}
                        className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 lowercase hover:underline flex items-center gap-0.5 transition cursor-pointer select-none"
                      >
                        <Percent size={9} />
                        <span>{couponsDrawerOpen ? "hide coupons" : "view coupons"}</span>
                      </button>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code (e.g. GET50)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={couponLoading || appliedCoupon}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-slate-950 dark:text-white outline-none transition shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="rounded-xl border border-red-200 hover:bg-red-50 text-red-600 dark:border-red-500 dark:hover:bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={couponLoading || !couponCode.trim()}
                        className="rounded-xl bg-slate-900 dark:bg-indigo-600 text-slate-100 dark:text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition cursor-pointer disabled:opacity-50"
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

                {/* Available Coupons Drawer inside Summary Page */}
                {couponsDrawerOpen && availableCoupons.length > 0 && (
                  <div className="animate-scaleUp bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-3 space-y-2 mt-2 max-h-48 overflow-y-auto custom-scrollbar">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Available Coupons</p>
                    {availableCoupons.map((coupon) => {
                      const isEligible = total >= coupon.minOrderAmount;
                      return (
                        <div 
                          key={coupon._id} 
                          className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        >
                          <div className="min-w-0 text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-tight bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{coupon.code}</span>
                              <span className="text-[10px] text-emerald-500 font-bold">
                                {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Min order: ₹{coupon.minOrderAmount} · Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="flex gap-1.5 items-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopyCoupon(coupon.code, coupon._id)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 transition"
                              title="Copy code"
                            >
                              {copiedCouponId === coupon._id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                            </button>
                            <button
                              type="button"
                              disabled={!isEligible}
                              onClick={() => applySpecificCoupon(coupon.code)}
                              className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded transition select-none cursor-pointer ${ isEligible ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed" }`}
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary Calculations Details */}
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">₹{total.toLocaleString("en-IN")}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Percent size={11} className="stroke-[2.5]" />
                      <span>Total Savings</span>
                    </span>
                    <span className="font-extrabold">-₹{savings.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 dark:text-slate-500">
                  <span>Shipping Fee</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {shipping === 0 ? <span className="text-emerald-500">Free</span> : `₹${shipping}`}
                  </span>
                </div>

                {giftWrap && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-500">
                    <span>Gift Wrapping</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">₹50</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Taxes (GST 5%)</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {total > 0 ? `₹${taxes.toLocaleString("en-IN")}` : "₹0"}
                  </span>
                </div>
                
                <p className="text-[9px] text-slate-400 dark:text-slate-500 text-right font-medium">GST & standard taxes are computed and included in total</p>
              </div>

              <hr className="border-slate-200/50 dark:border-slate-800/80" />

              {/* Grand Total display */}
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-slate-950 dark:text-white">Total Amount</span>
                  <p className="text-[9px] font-medium text-slate-400">All duties & fees included</p>
                </div>
                <span className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Secure Checkout CTA */}
              <div className="pt-1">
                <button
                  disabled={itemCount === 0}
                  onClick={handleCheckout}
                  className={`w-full rounded-xl h-[56px] text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer shadow-md ${ itemCount === 0 ? "bg-slate-300 dark:bg-slate-800 cursor-not-allowed hover:shadow-none" : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/25 shadow-indigo-600/10" }`}
                >
                  <Lock size={13} className="stroke-[2.5]" />
                  <span>Secure Checkout ({itemCount})</span>
                </button>
              </div>

              {/* Trust Badges section */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 grid grid-cols-3 gap-2 text-center select-none">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/10 shadow-xs">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">Secure Pay</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/10 shadow-xs">
                    <RotateCcw size={16} />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">30 Day Return</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100/10 shadow-xs">
                    <Truck size={16} />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">Fast Delivery</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Dynamic frequently Bought Together Recommendations Section */}
        {recommendedProducts.length > 0 && (
          <div className="mt-12 text-left space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-500 animate-pulse" />
                  <span>Frequently Bought Together</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Explore best-selling additions highly recommended for your catalog cart.</p>
              </div>
            </div>
            
            {/* Horizontal recommendations swipe slider */}
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1.5 custom-scrollbar scroll-smooth snap-x">
              {recommendedProducts.map((prod) => {
                const avgRating = getAverageRating(prod) || 4.5;
                const origVal = prod.originalPrice || Math.round(prod.price * 1.25);
                const discount = Math.round(((origVal - prod.price) / origVal) * 100);

                return (
                  <div 
                    key={prod._id} 
                    className="w-48 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between shrink-0 shadow-xs snap-start hover:border-indigo-500/50 dark:hover:border-indigo-500/40 hover:scale-[1.01] transition duration-200"
                  >
                    <div>
                      {/* Frame image */}
                      <div 
                        onClick={() => navigate(`/product/${prod._id}`)}
                        className="h-32 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-1.5 cursor-pointer relative group overflow-hidden"
                      >
                        <img 
                          src={prod.images?.[0]?.startsWith("http") ? prod.images[0] : `${backendUrl}/${prod.images?.[0]}`} 
                          alt="" 
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-rose-500 text-slate-100 dark:text-white font-black text-[8px] uppercase tracking-wider rounded">
                            -{discount}%
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="mt-2.5 space-y-1">
                        <p 
                          onClick={() => navigate(`/product/${prod._id}`)}
                          className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 cursor-pointer hover:text-indigo-500 transition leading-snug"
                        >
                          {prod.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 stroke-none" />
                          <span className="text-[10px] font-black text-slate-500">{avgRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-1.5">
                      <div className="text-left">
                        <p className="text-xs font-black text-slate-900 dark:text-white">₹{prod.price}</p>
                        <p className="text-[9px] text-slate-400 line-through">₹{origVal}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddRecommended(prod)}
                        className="h-7 px-3 bg-slate-900 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-slate-100 dark:text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={10} className="stroke-[3]" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Sticky Bottom Checkout Bar */}
      <div className="lg:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800/80 p-4 shadow-[0_-6px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_-6px_20px_rgba(0,0,0,0.3)] flex items-center justify-between select-none">
        <div className="text-left">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Total Amount</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-black text-slate-950 dark:text-white leading-none">
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
          </div>
          {savings > 0 && (
            <p className="text-[9px] font-bold text-emerald-600 mt-0.5">Saved: ₹{savings.toLocaleString("en-IN")}</p>
          )}
        </div>
        <button
          disabled={itemCount === 0}
          onClick={handleCheckout}
          className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white flex items-center gap-1.5 transition active:scale-95 shadow-md ${ itemCount === 0 ? "bg-slate-300 dark:bg-slate-800 cursor-not-allowed hover:shadow-none" : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600" }`}
        >
          <Lock size={12} className="stroke-[2.5]" />
          <span>Checkout ({itemCount})</span>
        </button>
      </div>

    </div>
  );
};

export default Cart;

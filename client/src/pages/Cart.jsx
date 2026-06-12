import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Minus, Plus, ShoppingBag, Trash2, Sparkles, ArrowRight, ShieldCheck, Ticket } from "lucide-react";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { useLanguage } from "../context/LanguageContext";

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
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

    fetchCart();
  }, [token, navigate]);

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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-slate-50 dark:bg-slate-950 px-6 py-20 transition-colors duration-200">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-950 dark:text-slate-100">{t("cart_empty")}</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-450">
            Add your favorite products and come back here to checkout.
          </p>
          <button
            onClick={() => navigate("/product")}
            className="mt-6 rounded-xl bg-black dark:bg-indigo-650 text-white px-6 py-3 text-xs font-black uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
          >
            {t("continue_shopping")}
          </button>
        </div>
      </div>
    );
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );
  const shipping = 0;
  const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // Free shipping threshold variables
  const shippingThreshold = 999;
  const amountNeededForFreeShipping = Math.max(0, shippingThreshold - total);
  const progressPercent = Math.min(100, (total / shippingThreshold) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-12 transition-colors duration-200">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Row */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-6 text-left">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-650 dark:text-indigo-400">
              Shopping Bag
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{t("your_cart")}</h1>
          </div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
            {itemCount} {itemCount === 1 ? "item" : "items"} ready for checkout
          </p>
        </div>


        {/* Cart Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          
          {/* Items List */}
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={`${item.itemId}-${item.size}`}
                className="group grid gap-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 p-5 shadow-sm sm:grid-cols-[120px_1fr_auto] hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-all duration-300"
              >
                {/* Thumbnail Frame */}
                <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden border border-slate-100 dark:border-slate-800 p-2 shrink-0 group-hover:scale-[1.02] transition-transform duration-300">
                  <img
                    src={item.product.images[0]?.startsWith("http") ? item.product.images[0] : `${backendUrl}/${item.product.images[0]}`}
                    className="h-full w-full object-contain"
                    alt={item.product.name}
                  />
                </div>

                {/* Meta details */}
                <div className="text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-905 dark:text-white leading-snug">{item.product.name}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">{item.product.category} · {item.product.brand || "Fashion"}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20">
                      Size: {item.size}
                    </span>
                    <span className="rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      Subtotal: ₹{(item.product.price * item.qty).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Actions & Stepper */}
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="text-lg font-extrabold text-slate-905 dark:text-white">
                    ₹{item.product.price.toLocaleString("en-IN")}
                  </p>

                  {/* Qty Stepper */}
                  <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden h-10 shrink-0">
                    <button
                      onClick={() => updateQty(index, item.qty - 1)}
                      className="px-3.5 h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-black text-slate-900 dark:text-white">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(index, item.qty + 1)}
                      className="px-3.5 h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(index)}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Summary */}
          <div className="h-fit rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6 shadow-sm lg:sticky lg:top-28 text-left space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-905 dark:text-white">Order Summary</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-450 font-medium">Review your subtotal and checkout details.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold">
                <span>{t("subtotal")}</span>
                <span className="font-extrabold text-slate-905 dark:text-white">₹{total.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold">
                <span>{t("shipping")}</span>
                <span className="font-extrabold text-slate-905 dark:text-white">
                  {shipping === 0 ? "Free" : `₹${shipping}`}
                </span>
              </div>
            </div>

            <hr className="border-slate-200/50 dark:border-slate-800/50" />

            <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white">
              <span>{t("total")}</span>
              <span>₹{(total + shipping).toLocaleString("en-IN")}</span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  if (!token) {
                    toast.info("Please login to proceed to checkout.");
                    navigate("/login");
                    return;
                  }
                  navigate("/placeorder", {
                    state: {
                      cartItems: cartItems.map((item) => ({
                        ...item.product,
                        qty: item.qty,
                        size: item.size,
                      })),
                      total,
                    },
                  });
                }}
                className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-550 py-4 text-xs font-bold uppercase tracking-wider text-white hover:shadow-lg hover:shadow-orange-500/10 active:scale-98 transition-all cursor-pointer shadow-md"
              >
                {t("proceed_checkout")}
              </button>

              <button
                onClick={() => navigate("/product")}
                className="mt-3 w-full rounded-xl border border-slate-200 dark:border-slate-800 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {t("continue_shopping")}
              </button>
            </div>

            {/* Security Checkout Badge */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider pt-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Secure SSL Checkout Guarantee</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

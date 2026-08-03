import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight, 
  MapPin, 
  CreditCard, 
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Truck,
  Calendar,
  KeyRound,
  AlarmClock,
  Loader2,
  FileText,
  User,
  RotateCcw,
  MessageSquare,
  ChevronRight
} from "lucide-react";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

const OrderConfirmed = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [deliveryVerificationKey, setDeliveryVerificationKey] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setDeliveryVerificationKey(res.data.user.deliveryVerificationKey);
        }
      } catch (err) {
        console.log("FETCH PROFILE ERROR 👉", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.post(
          `${backendUrl}/api/order/userOrder`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          const foundOrder = res.data.orders.find(
            (o) => String(o._id) === String(orderId)
          );
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            toast.error("Order details not found.");
          }
        }
      } catch (err) {
        console.log("FETCH ORDER DETAILS ERROR 👉", err);
        toast.error("Failed to load order receipt.");
      } finally {
        setLoading(false);
      }
    };

    if (!order && orderId) {
      fetchOrderDetails();
    }
  }, [orderId, order, navigate]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    const code = order?.verificationCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCodeCopied(true);
      toast.success("Verification code copied!");
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-200">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Generating order receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center px-4 transition-colors duration-200">
        <HelpCircle size={48} className="text-slate-400 dark:text-slate-500 animate-bounce" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-4">Order receipt not found.</p>
        <button
          onClick={() => navigate("/product")}
          className="mt-4 rounded-md bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer"
        >
          Browse Store
        </button>
      </div>
    );
  }

  // Calculate Subtotal & Shipping
  const platformFee = 20;
  const shippingFee = order.amount > 519 ? 0 : 40; // Align with place order logic!
  const discount = order.discount || 0;
  const subtotal = Math.max(0, order.amount - shippingFee - platformFee + discount);

  // Expected delivery: 7 days from order date
  const expectedDelivery = new Date(order.createdAt || Date.now());
  expectedDelivery.setDate(expectedDelivery.getDate() + 7);
  const expectedDeliveryStr = expectedDelivery.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const orderDateStr = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  const isDelivered = order.orderStatus === "Delivered";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-6 text-left select-none transition-colors duration-200 text-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* ── SUCCESS HERO BANNER (Full-width header panel) ── */}
        <div className="relative overflow-hidden rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4 text-left">
            {/* Success Icon */}
            <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
              <span className="absolute h-full w-full rounded-full bg-emerald-500/20 animate-ping opacity-75" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600 text-white shadow-xs">
                <Check size={20} className="stroke-[3]" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">Order Confirmed!</h1>
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Confirmed
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-relaxed">
                Thank you for your purchase! Digital receipt & tax invoice available for{" "}
                <span className="font-extrabold text-slate-900 dark:text-white">{order.address?.email || "customer@cartnow.com"}</span>
              </p>
            </div>
          </div>

          {/* EST Delivery and Order ID Cards */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Est Delivery Card */}
            <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-md px-3.5 py-2 flex items-center gap-2.5 min-w-[140px] shadow-xs text-left">
              <div className="h-7 w-7 rounded-sm bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Calendar size={14} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block leading-none">Est. Delivery</span>
                <span className="text-xs font-black text-slate-900 dark:text-white block mt-1">{expectedDeliveryStr}</span>
              </div>
            </div>

            {/* Order ID Card */}
            <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-md px-3.5 py-2 flex items-center gap-2.5 min-w-[140px] shadow-xs text-left">
              <div className="h-7 w-7 rounded-sm bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <FileText size={14} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block leading-none">Order ID</span>
                <span className="text-xs font-black text-slate-900 dark:text-white block mt-1 truncate font-mono">#{String(order.orderNumber || orderId).slice(-8).toUpperCase()}</span>
              </div>
              <button
                onClick={handleCopyId}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition shrink-0 cursor-pointer"
                title="Copy Order ID"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── 2-COLUMN FULL-WIDTH GRID LAYOUT (Equal height stretch) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* LEFT COLUMN: Items Purchased & Quick Action Buttons (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            
            {/* Purchased Items Card (Stretches flex-1) */}
            <div className="flex-1 flex flex-col justify-between rounded-md border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4 text-left">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-white font-black">
                    Items Purchased ({order.items?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    {orderDateStr}
                  </span>
                </div>
                
                {/* Items List */}
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {order.items?.map((item, idx) => {
                    const imgUrl = Array.isArray(item.image)
                      ? item.image[0]
                      : (item.image || item.productImage || "");
                    const finalSrc = imgUrl.startsWith("http") || imgUrl.startsWith("data:")
                      ? imgUrl
                      : `${backendUrl}/${imgUrl.replace(/^\//, '')}`;

                    return (
                      <div
                        key={`${item.productId || item.name}-${item.size}-${idx}`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex gap-3.5 text-left items-center min-w-0">
                          <div className="h-16 w-16 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1 flex items-center justify-center shrink-0 shadow-xs">
                            <img
                              src={finalSrc}
                              alt={item.name}
                              className="h-14 w-14 rounded-sm object-contain bg-white dark:bg-slate-900"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/100x100?text=Product";
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug truncate">{item.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                              Qty: {item.qty} • Size: {item.size}
                            </p>
                            
                            {/* Warranty Badge */}
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-sm">
                                <ShieldCheck size={11} className="text-emerald-500" />
                                1 Year Warranty Included
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price and Track Order Button */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-0 border-slate-100 dark:border-slate-800 pt-2 sm:pt-0">
                          <span className="font-black text-sm text-slate-900 dark:text-white">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                          
                          <button
                            onClick={() =>
                              navigate(`/track/${order._id}`, {
                                state: {
                                  item: {
                                    ...item,
                                    orderId: order._id,
                                    status: order.orderStatus,
                                    paymentMethod: order.paymentMethod,
                                    price: item.price,
                                  },
                                },
                              })
                            }
                            className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                          >
                            <span>Track Order</span>
                            <ChevronRight size={11} className="stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/order/${orderId}`)}
                className="flex-1 rounded-md bg-indigo-600 hover:bg-indigo-700 py-3.5 text-xs font-black text-white uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <MessageSquare size={14} className="stroke-[2.5]" />
                <span>View Details & Support</span>
                <ArrowRight size={14} className="stroke-[2.5]" />
              </button>
              
              <button
                onClick={() => navigate("/product")}
                className="flex-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3.5 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <ShoppingBag size={14} className="stroke-[2.5]" />
                <span>Continue Shopping</span>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Receipt Summary & Guarantee Cards (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            {/* Consolidated Billing Card */}
            <div className="rounded-md border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4 text-left">
              
              {/* Receipt Summary */}
              <div className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-white font-black border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3 flex items-center gap-2">
                  <FileText size={14} className="text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
                  <span>Receipt Summary</span>
                </h3>
                
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Discount</span>
                    <span>- ₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Delivery</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider">FREE</span>
                  ) : (
                    <span className="text-slate-900 dark:text-white font-extrabold">₹{shippingFee}</span>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">₹{platformFee}</span>
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">Total Amount Paid</span>
                    <span className="text-[9px] text-slate-400 block font-semibold leading-none mt-0.5">(Taxes included)</span>
                  </div>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tight">₹{order.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Delivery Address & Payment Method Split view */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  
                  {/* Shipping Address */}
                  <div className="space-y-1">
                    <span className="font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1.5 text-[9px]">
                      <MapPin size={11} className="text-slate-400" />
                      Deliver To
                    </span>
                    <div className="text-slate-600 dark:text-slate-300 font-medium leading-tight space-y-0.5 text-[11px]">
                      <p className="font-extrabold text-slate-900 dark:text-white truncate max-w-[130px]">{order.address?.firstName} {order.address?.lastName}</p>
                      <p className="truncate max-w-[130px]">{order.address?.street}</p>
                      <p className="truncate max-w-[130px]">{order.address?.city}, {order.address?.state}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1">
                    <span className="font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1.5 text-[9px]">
                      <CreditCard size={11} className="text-slate-400" />
                      Payment
                    </span>
                    <div className="text-slate-600 dark:text-slate-300 font-medium leading-tight text-[11px]">
                      <p className="font-extrabold text-slate-900 dark:text-white capitalize">{order.paymentMethod === "cod" ? "Cash On Delivery" : order.paymentMethod}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wide border ${ order.paymentStatus === "paid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" }`}>
                        {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Guaranteed Purchase Trust Banner */}
            <div className="rounded-md border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-xs text-left space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0 stroke-[2.5]" />
                <span className="text-xs font-black uppercase tracking-wider">Guaranteed Purchase</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800/80">
                    <Truck size={13} className="text-slate-500 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 dark:text-white block">Insured Logistics</span>
                    <span className="text-slate-400 block mt-0.5 leading-tight">100% safe & insured package delivery</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800/80">
                    <RotateCcw size={13} className="text-slate-500 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 dark:text-white block">30-Day Returns</span>
                    <span className="text-slate-400 block mt-0.5 leading-tight">Easy returns within 30 days</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderConfirmed;

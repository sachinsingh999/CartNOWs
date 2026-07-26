import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Truck,
  Package,
  Tag,
  Copy,
  Check,
  ShoppingBag,
  Clock,
  ShieldCheck,
  MapPin,
  FileText,
  Edit2,
  Calendar,
  RotateCcw,
  Headset
} from "lucide-react";
import { motion } from "framer-motion";
import OrderCommunication from "../components/OrderCommunication";
import { ProductGridSkeleton } from "../components/SkeletonLoader";

const SingleOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const token = localStorage.getItem("token") || "";

  const fetchOrderDetails = async () => {
    if (!token) {
      toast.error("Please login to view order details.");
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/order/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        toast.error("Failed to load order details.");
        navigate("/orderdetail");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error(error.response?.data?.message || "Error loading order.");
      navigate("/orderdetail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(true);
    toast.success("Order ID copied!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getStatusStep = (status) => {
    const s = String(status).toLowerCase();
    if (s === "placed" || s === "order placed") return 0;
    if (s === "confirmed" || s === "packed") return 1;
    if (s === "shipped") return 2;
    if (s === "out for delivery") return 3;
    if (s === "delivered") return 4;
    return 0;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-left">
        <ProductGridSkeleton count={1} />
      </div>
    );
  }

  if (!order) return null;

  const currentStep = getStatusStep(order.orderStatus);
  const steps = [
    { label: "Placed", desc: "Order placed successfully", icon: ShoppingBag },
    { label: "Confirmed", desc: "Packed & awaiting pickup", icon: FileText },
    { label: "Shipped", desc: "In transit to hub", icon: Truck },
    { label: "Out For Delivery", desc: "Delivery agent assigned", icon: MapPin },
    { label: "Delivered", desc: "Order completed", icon: ShieldCheck }
  ];

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  // Billing math
  const platformFee = 20;
  const shippingFee = order.amount > 519 ? 0 : 40; // Align with place order logic!
  const discount = order.discount || 0;
  const subtotal = Math.max(0, order.amount - shippingFee - platformFee + discount);
  const savedAmount = Math.max(0, Math.round(subtotal * 0.25)); // Estimate original savings

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-8 w-full text-left select-none">
      
      {/* Back button */}
      <button
        onClick={() => navigate("/orderdetail")}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-205 text-[10px] font-black uppercase tracking-wider mb-4 transition cursor-pointer border-none bg-transparent"
      >
        <ArrowLeft size={13} className="stroke-[2.5]" />
        <span>Back to Orders</span>
      </button>

      {/* Main Order Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
        
        {/* Left Section: Progress, Items List */}
        <div className="space-y-4">
          
          {/* ORDER INFORMATION CONTAINER CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-3xs">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#4f46e5] dark:text-indigo-400">Order Information</p>
                <h1 className="text-sm font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                  <span>Order ID:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 font-extrabold uppercase">{order._id}</span>
                  <button
                    onClick={handleCopyId}
                    className="text-slate-400 hover:text-slate-600 transition shrink-0 cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copiedId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </h1>
              </div>
              
              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-450 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {order.orderStatus === "placed" || order.orderStatus === "Order Placed" ? "Order Placed" : order.orderStatus}
              </span>
            </div>

            {/* Stepper Timeline matches Mockup */}
            <div className="py-2 px-1 relative">
              <div className="flex justify-between items-center w-full">
                
                {/* Horizontal Progress Lines */}
                <div className="absolute top-4.5 left-6 right-6 h-[2px] bg-slate-100 dark:bg-slate-800 z-0" />
                <div
                  className="absolute top-4.5 left-6 h-[2px] bg-[#4f46e5] dark:bg-indigo-500 z-0 transition-all duration-500"
                  style={{ width: `${(currentStep / 4) * 88}%` }}
                />

                {steps.map((step, index) => {
                  const isActive = index <= currentStep;
                  const isCurrent = index === currentStep;
                  const StepIcon = step.icon;
                  
                  return (
                    <div key={index} className="flex flex-col items-center z-10 relative w-16">
                      <div
                        className={`h-9.5 w-9.5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                          isActive
                            ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-xs"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                        }`}
                      >
                        <StepIcon size={14} className="stroke-[2.5]" />
                      </div>
                      
                      {/* Numeric Badge label underneath */}
                      <span className="text-[9px] font-bold text-slate-400 mt-1 leading-none">
                        {index + 1}
                      </span>
                      
                      <span className={`text-[9px] font-black uppercase mt-1.5 tracking-tight ${isActive ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                        {step.label}
                      </span>
                      
                      {/* Date values */}
                      <span className="text-[8px] font-semibold text-slate-400 mt-0.5 leading-none whitespace-nowrap">
                        {index === 0 ? `${formattedDate}` : "Pending"}
                      </span>
                      {index === 0 && (
                        <span className="text-[7px] text-slate-405 font-medium leading-none mt-0.5">
                          {formattedTime}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order placed notification strip below timeline */}
            <div className="bg-indigo-500/[0.03] border border-indigo-500/10 rounded p-3 text-[10px] text-slate-500 font-semibold text-left flex items-center gap-2 mt-7 select-none">
              <Clock size={12} className="text-[#4f46e5] shrink-0" />
              <span>Your order has been placed successfully. We'll notify you once it's confirmed.</span>
            </div>
          </div>

          {/* ORDERED ITEMS CONTAINER CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-3xs text-left">
            <h2 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
              <ShoppingBag size={14} className="text-[#4f46e5]" />
              <span>Ordered Items ({order.items.length})</span>
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map((item, idx) => {
                const imageUrl = item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`;
                const originalVal = item.originalPrice || Math.round(item.price * 1.25);
                const discountPercent = Math.max(5, Math.round(((originalVal - item.price) / originalVal) * 100));

                return (
                  <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="h-16 w-16 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                      <img src={imageUrl} alt={item.name} className="h-12 w-12 object-contain bg-white dark:bg-slate-900" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">Qty: {item.qty}</span>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">Size: {item.size || "Standard"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 text-xs select-none">
                        <span className="font-black text-slate-900 dark:text-white">₹{item.price.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-slate-400 line-through font-semibold">₹{originalVal.toLocaleString("en-IN")}</span>
                        <span className="text-[9px] font-black text-red-500">{discountPercent}% OFF</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secure Chat Channel collapsible card */}
          <OrderCommunication orderId={orderId} />
        </div>

        {/* Right Section: Delivery Address and Pricing Summaries */}
        <div className="space-y-4">
          
          {/* DELIVERY ADDRESS DETAILS CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-3xs text-left">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={13} className="text-[#4f46e5]" />
                <span>Delivery Address</span>
              </h2>
              
              <button
                type="button"
                onClick={() => navigate(`/orderdetail`)}
                className="border border-indigo-200 dark:border-slate-800 text-[#4f46e5] hover:bg-indigo-50/50 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 cursor-pointer transition shadow-3xs leading-none"
              >
                <Edit2 size={9} />
                <span>Edit</span>
              </button>
            </div>

            <div className="flex gap-3 text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
              <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-[#4f46e5] flex items-center justify-center shrink-0 border border-indigo-100/50">
                <MapPin size={13} className="text-[#4f46e5]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-905 dark:text-white text-xs">{order.address.firstName} {order.address.lastName}</span>
                  <span className="bg-indigo-500/10 text-[#4f46e5] px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide leading-none">Home</span>
                </div>
                <p className="text-[11px] leading-tight text-slate-500">{order.address.street}, {order.address.city}</p>
                <p className="text-[11px] leading-none text-slate-550 mt-1">{order.address.state}, {order.address.country} - {order.address.pincode || "390001"}</p>
                <p className="pt-2 text-[10px] text-slate-500 flex items-center gap-1 leading-none font-bold">
                  <span>📞 {order.address.phone}</span>
                </p>
              </div>
            </div>

            {/* Split calendar details under delivery info */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-500">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Calendar size={11} className="text-slate-400" />
                  Order Placed
                </span>
                <p className="text-slate-900 dark:text-white font-black">{formattedDate}</p>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5">at {formattedTime}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <CreditCard size={11} className="text-slate-405" />
                  Payment Option
                </span>
                <p className="text-slate-900 dark:text-white font-black uppercase">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-wide bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 text-emerald-600">
                  COD
                </span>
              </div>
            </div>
          </div>

          {/* BILL SUMMARY CONTAINER CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-3xs text-left space-y-3.5">
            <h2 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileText size={13} className="text-[#4f46e5]" />
              <span>Bill Summary</span>
            </h2>

            <div className="space-y-2 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">₹{shippingFee}</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2.5 flex justify-between items-baseline">
                <span className="text-[11px] font-black text-slate-800 dark:text-white">Total Bill</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">₹{order.amount.toLocaleString("en-IN")}</span>
              </div>
              
              {/* You saved green highlight alert tag */}
              <div className="mt-4 bg-emerald-500/[0.04] text-emerald-600 border border-emerald-500/10 rounded p-2.5 text-[10px] font-bold flex items-center gap-1.5">
                <Tag size={11} className="text-emerald-500" />
                <span>You saved ₹{savedAmount.toLocaleString("en-IN")} on this order!</span>
              </div>
            </div>
          </div>

          {/* BOTTOM GUARANTEES TRUST DECK */}
          <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-3xs text-left">
            <div className="grid grid-cols-2 gap-4 text-[9px] font-semibold text-slate-500 dark:text-slate-400">
              {/* Insured Delivery */}
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 text-blue-500">
                  <ShieldCheck size={13} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="font-black text-slate-900 dark:text-white block">Secure Payments</span>
                  <span className="text-slate-400 block mt-0.5 leading-tight font-semibold">100% secure payments</span>
                </div>
              </div>

              {/* 30-day Returns */}
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 text-blue-500">
                  <Truck size={13} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="font-black text-slate-900 dark:text-white block">Fast Delivery</span>
                  <span className="text-slate-400 block mt-0.5 leading-tight font-semibold">Quick and reliable shipping</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 mt-2 border-t border-slate-50 dark:border-slate-800/50 pt-2.5 col-span-2 grid grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 text-blue-500">
                    <Headset size={13} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 dark:text-white block">24/7 Support</span>
                    <span className="text-slate-400 block mt-0.5 leading-tight font-semibold">We're here to help you</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 text-blue-500">
                    <RotateCcw size={13} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 dark:text-white block">Easy Returns</span>
                    <span className="text-slate-400 block mt-0.5 leading-tight font-semibold">Hassle-free return policy</span>
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

export default SingleOrderDetail;

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
  ShieldCheck
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

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Verification code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
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
      <div className="max-w-6xl mx-auto px-4 py-12 text-left">
        <ProductGridSkeleton count={1} />
      </div>
    );
  }

  if (!order) return null;

  const currentStep = getStatusStep(order.orderStatus);
  const steps = [
    { label: "Placed", desc: "Order placed successfully" },
    { label: "Confirmed", desc: "Packed & awaiting pickup" },
    { label: "Shipped", desc: "In transit to hub" },
    { label: "Out For Delivery", desc: "Delivery agent assigned" },
    { label: "Delivered", desc: "Order completed" }
  ];

  const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-left select-none">
      
      {/* Back button */}
      <button
        onClick={() => navigate("/orderdetail")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-black uppercase tracking-wider mb-6 transition cursor-pointer border-none bg-transparent"
      >
        <ArrowLeft size={14} />
        <span>Back to Orders</span>
      </button>

      {/* Main Order Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 items-start">
        
        {/* Left Section: Progress, Items List */}
        <div className="space-y-6">
          
          {/* Top Panel Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Order Information</p>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  ID: <span className="font-mono text-sm uppercase text-slate-700 dark:text-slate-300">{order._id}</span>
                </h1>
              </div>
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3.5 py-1 text-xs font-black uppercase tracking-wider">
                {order.orderStatus}
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="py-2">
              <div className="relative flex justify-between items-center w-full">
                {/* Horizontal progress bar background */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 z-0" />
                <div
                  className="absolute top-4 left-0 h-1 bg-indigo-600 dark:bg-indigo-500 z-0 transition-all duration-500"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />

                {steps.map((step, index) => {
                  const isActive = index <= currentStep;
                  const isCurrent = index === currentStep;
                  return (
                    <div key={index} className="flex flex-col items-center z-10 relative">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCurrent
                            ? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white ring-4 ring-indigo-500/20"
                            : isActive
                            ? "bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                        }`}
                      >
                        <span className="text-xs font-black">{index + 1}</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase mt-2 ${isActive ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Key Verification */}
            {order.orderStatus === "Out for Delivery" && order.verificationCode && (
              <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8.5 w-8.5 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Provide Verification Key</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Share this with the delivery agent to release shipment</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/25">
                  <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400 tracking-wider">
                    {order.verificationCode}
                  </span>
                  <button
                    onClick={() => handleCopyCode(order.verificationCode)}
                    className="p-1 rounded bg-white hover:bg-slate-50 text-slate-500 border border-slate-200/50 cursor-pointer transition"
                  >
                    {copiedCode ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShoppingBag size={15} className="text-indigo-500" />
              <span>Ordered Items ({order.items.length})</span>
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {order.items.map((item, idx) => {
                const imageUrl = item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`;
                const originalVal = item.originalPrice || Math.round(item.price * 1.25);
                const discountPercent = Math.max(5, Math.round(((originalVal - item.price) / originalVal) * 100));

                return (
                  <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="h-20 w-20 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-2 shrink-0">
                      <img src={imageUrl} alt={item.name} className="h-full w-full object-contain rounded" />
                    </div>

                    <div className="flex-1 min-w-0 text-left flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">Qty: {item.qty}</span>
                          {item.size && (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">Size: {item.size}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-slate-900 dark:text-white">₹{item.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-slate-400 line-through font-semibold">₹{originalVal.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] font-black text-red-500">{discountPercent}% OFF</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div 
          className="space-y-6 lg:sticky lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto pr-2 scrollbar-thin"
          style={{ top: "100px" }}
        >
          
          {/* Delivery Address & Metadata */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-left">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Truck size={15} className="text-indigo-500" />
              <span>Delivery Address</span>
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold space-y-1">
              <p className="font-extrabold text-slate-800 dark:text-white text-sm">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p>{order.address.street}</p>
              <p>{order.address.city}, {order.address.state}</p>
              <p>{order.address.country} - {order.address.pincode || "390001"}</p>
              <p className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="font-bold">Phone:</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold">{order.address.phone}</span>
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-500">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Order Placed</span>
                <p className="text-slate-800 dark:text-slate-200 font-black">{formattedDate}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Payment Option</span>
                <p className="text-slate-800 dark:text-slate-200 font-black uppercase">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-left space-y-3.5">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Tag size={15} className="text-indigo-500" />
              <span>Bill Summary</span>
            </h2>

            <div className="space-y-2 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">₹{(order.amount + order.discount - 10).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">₹10</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span>-₹{order.discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">Total Bill</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">₹{order.amount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Secure Chat Widget console panel */}
          <OrderCommunication orderId={orderId} />

        </div>
      </div>

    </div>
  );
};

export default SingleOrderDetail;

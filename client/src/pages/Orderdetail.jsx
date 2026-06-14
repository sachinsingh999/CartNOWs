import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Headset,
  PackageCheck,
  RotateCcw,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  X,
  Package,
  KeyRound,
  Copy,
  Check,
  AlarmClock,
  AlertTriangle,
  Tag,
  Info,
  ChevronRight,
  FileText,
  ShoppingBag,
} from "lucide-react";
import { backendUrl } from "../config";
import { useLanguage } from "../context/LanguageContext";

const Orderdetail = () => {
  const [orderData, setOrderData] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [returnForm, setReturnForm] = useState({
    reason: "Wrong item delivered",
    feedback: "",
  });
  const [deliveryVerificationKey, setDeliveryVerificationKey] = useState("");

  const getAttributes = (itemName, itemSize, itemQty) => {
    const chips = [];
    chips.push({ label: "Qty", value: itemQty });
    if (itemSize && itemSize.toLowerCase() !== "standard" && itemSize.toLowerCase() !== "default") {
      chips.push({ label: "Size", value: itemSize });
    }
    
    const nameLower = itemName.toLowerCase();
    if (nameLower.includes("iphone") || nameLower.includes("phone") || nameLower.includes("mobile") || nameLower.includes("pixel")) {
      chips.push({ label: "RAM", value: "16GB" });
      chips.push({ label: "Storage", value: "512GB" });
      chips.push({ label: "Color", value: "Space Gray" });
    } else if (nameLower.includes("macbook") || nameLower.includes("laptop") || nameLower.includes("computer")) {
      chips.push({ label: "CPU", value: "M3 Max" });
      chips.push({ label: "Memory", value: "32GB" });
      chips.push({ label: "Color", value: "Midnight Black" });
    } else if (nameLower.includes("shirt") || nameLower.includes("jean") || nameLower.includes("jacket") || nameLower.includes("clothing") || nameLower.includes("men") || nameLower.includes("women")) {
      chips.push({ label: "Color", value: "Classic Black" });
      chips.push({ label: "Material", value: "100% Cotton" });
      chips.push({ label: "Fit", value: "Slim Fit" });
    } else {
      chips.push({ label: "Color", value: "Premium Slate" });
      chips.push({ label: "Edition", value: "Standard" });
    }
    return chips;
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
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { t } = useLanguage();
  const highlightOrderId = new URLSearchParams(location.search).get("orderId");

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    const [orderResponse, returnResponse, profileResponse, invoiceResponse] = await Promise.all([
      axios.post(
        `${backendUrl}/api/order/userOrder`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      axios.get(`${backendUrl}/api/service/returns/user`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${backendUrl}/api/invoice/my-invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: { success: false, invoices: [] } })),
    ]);

    if (profileResponse.data.success) {
      setDeliveryVerificationKey(profileResponse.data.user.deliveryVerificationKey);
    }

    if (invoiceResponse && invoiceResponse.data && invoiceResponse.data.success) {
      setInvoices(invoiceResponse.data.invoices);
    }

    if (orderResponse.data.success) {
      const allOrdersItem = [];

      orderResponse.data.orders.forEach((order) => {
        order.items.forEach((item) => {
          allOrdersItem.push({
            ...item,
            orderId: order._id,
            status: order.orderStatus,
            payment: String(order.paymentStatus).toLowerCase() === "paid",
            paymentMethod: order.paymentMethod,
            date: order.createdAt,
            amount: order.amount,
            address: order.address,
            verificationCode: order.verificationCode,
          });
        });
      });

      // Sort items by order date in descending order (newest first)
      allOrdersItem.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrderData(allOrdersItem);
    }

    if (returnResponse.data.success) {
      setReturnRequests(returnResponse.data.returns);
    }
  }, [token]);

  // 7-day delivery deadline helper
  const getDeadlineInfo = (dateStr, orderStatus) => {
    if (orderStatus === "Delivered") return null;
    const deadline = new Date(dateStr);
    deadline.setDate(deadline.getDate() + 7);
    const now = new Date();
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    const deadlineStr = deadline.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
    if (daysLeft < 0)  return { label: `Overdue by ${Math.abs(daysLeft)}d`, sublabel: `Was due ${deadlineStr}`, level: "overdue" };
    if (daysLeft === 0) return { label: "Due Today!", sublabel: `Deadline: ${deadlineStr}`, level: "critical" };
    if (daysLeft <= 2)  return { label: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`, sublabel: `Due ${deadlineStr}`, level: "warning" };
    return               { label: `${daysLeft} days left`, sublabel: `Due ${deadlineStr}`, level: "ok" };
  };

  const deadlineStyles = {
    ok:       { badge: "bg-indigo-50 text-indigo-700 border-indigo-200",     icon: "text-indigo-500" },
    warning:  { badge: "bg-amber-50 text-amber-700 border-amber-200",         icon: "text-amber-500" },
    critical: { badge: "bg-rose-50 text-rose-700 border-rose-200",            icon: "text-rose-600" },
    overdue:  { badge: "bg-rose-100 text-rose-800 border-rose-300",           icon: "text-rose-700" },
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        await fetchOrders();
      } catch (error) {
        console.log("ORDER FETCH ERROR 👉", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!loading && highlightOrderId) {
      const timer = setTimeout(() => {
        const elements = document.getElementsByClassName(`order-group-${highlightOrderId}`);
        if (elements.length > 0) {
          elements[0].scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, highlightOrderId]);

  const getReturnRequest = (item) =>
    returnRequests.find(
      (request) =>
        String(request.orderId) === String(item.orderId) &&
        String(request.productId) === String(item.productId) &&
        (request.itemSize || "") === (item.size || "")
    );

  const openReturnModal = (item) => {
    setSelectedReturnItem(item);
    setReturnForm({
      reason: "Wrong item delivered",
      feedback: "",
      returnType: "Refund",
      exchangeSize: "",
    });
  };

  const submitReturnRequest = async (event) => {
    event.preventDefault();

    if (!selectedReturnItem) return;

    try {
      setSubmittingReturn(true);
      const response = await axios.post(
        `${backendUrl}/api/service/returns/create`,
        {
          orderId: selectedReturnItem.orderId,
          productId: selectedReturnItem.productId,
          size: selectedReturnItem.size,
          reason: returnForm.reason,
          feedback: returnForm.feedback,
          returnType: returnForm.returnType,
          exchangeSize: returnForm.exchangeSize,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Return request submitted.");
        setSelectedReturnItem(null);
        setReturnForm({ reason: "Wrong item delivered", feedback: "", returnType: "Refund", exchangeSize: "" });
        await fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/cancel`,
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(
          <div className="flex flex-col gap-1 text-left p-0.5">
            <span className="font-extrabold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-450 flex items-center gap-1.5">
              <XCircle className="text-rose-500" size={14} />
              <span>Order Cancelled</span>
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold">Your order has been cancelled successfully.</span>
            <span className="font-mono text-[9px] text-slate-400 select-all">ID: {orderId}</span>
          </div>,
          {
            icon: false,
            style: { borderLeft: "4px solid #ef4444" }
          }
        );
        await fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-12 transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse text-left">
          <div className="space-y-2">
            <div className="h-4.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 p-6 grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-8">
                {/* Left col */}
                <div className="h-44 w-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                {/* Center col */}
                <div className="space-y-4">
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl mt-4" />
                </div>
                {/* Right col */}
                <div className="space-y-3">
                  <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg self-end" />
                  <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-12 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-6 text-left">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Transaction History</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{t("my_orders")}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">View and track your recent orders and returns history.</p>
          </div>
          <button
            onClick={() => navigate("/product")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>{t("continue_shopping")}</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {orderData.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-16 text-center shadow-sm max-w-2xl mx-auto">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 mb-4">
              <PackageCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No orders found</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your purchased items and order history will appear here once you place an order.</p>
            <button
              onClick={() => navigate("/product")}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-xs font-bold uppercase tracking-wider text-white transition active:scale-95 cursor-pointer shadow-md"
            >
              Start Shopping
            </button>
          </div>
        )}

        <div className="space-y-6">
          {orderData.map((item, index) => {
            const isHighlighted = highlightOrderId && String(item.orderId) === String(highlightOrderId);
            return (
              <div
                key={`${item.orderId}-${item.productId || item.name}-${index}`}
                className={`order-group-${item.orderId} group rounded-2xl border p-6 transition-all duration-500 text-left ${
                  isHighlighted
                    ? "border-orange-500 ring-2 ring-orange-500/15 bg-orange-500/[0.02] dark:bg-orange-500/[0.01] shadow-md shadow-orange-500/5 scale-[1.01]"
                    : "border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 hover:shadow-md hover:border-indigo-500/20 dark:hover:border-indigo-500/20"
                }`}
              >
              {(() => {
                const returnRequest = getReturnRequest(item);
                const canRequestReturn = item.status === "Delivered" && !returnRequest;
                return (
                  <div className="grid gap-8 lg:grid-cols-[200px_1fr_260px] items-start relative">
                    
                    {/* Left Column: Premium Product Image Gallery */}
                    <div className="flex flex-col gap-3 shrink-0">
                      <Link
                        to={`/product/${item.productId}`}
                        className="group/img relative h-48 w-full rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-3 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer"
                      >
                        <img
                          src={item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`}
                          alt={item.name}
                          className="h-full w-full rounded-xl object-contain transition-all duration-500 ease-out group-hover/img:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-xs">
                          <span className="rounded-full bg-slate-900/90 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 shadow-md">
                            View Details
                          </span>
                        </div>
                      </Link>
                      
                      {/* Product Thumbnail Gallery Simulation */}
                      <div className="flex gap-2">
                        <div className="h-10 w-10 rounded-lg border border-indigo-500/25 bg-slate-100 dark:bg-slate-950 p-1 flex items-center justify-center shrink-0 cursor-pointer">
                          <img
                            src={item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`}
                            alt="thumbnail"
                            className="h-full w-full object-contain rounded"
                          />
                        </div>
                        <div className="h-10 w-10 rounded-lg border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center shrink-0 hover:border-slate-300 cursor-pointer transition">
                          <ShoppingBag size={14} className="text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Center Column: Details, Attribute Chips, Visual Timeline, Metadata */}
                    <div className="space-y-6 flex-1 min-w-0">
                      <div>
                        <Link
                          to={`/product/${item.productId}`}
                          className="group/title inline-block text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150 line-clamp-2"
                        >
                          {item.name}
                        </Link>
                                              {/* Dynamic Attribute Chips */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {getAttributes(item.name, item.size, item.qty).map((chip, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 px-2.5 py-1 text-xs font-bold transition duration-200 hover:border-slate-350 dark:hover:border-slate-600"
                            >
                              <span className="text-slate-400 dark:text-slate-500 font-semibold">{chip.label}:</span>
                              <span>{chip.value}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Visual Progress Order Status Timeline */}
                      <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 space-y-4">
                        {item.status === "Cancelled" ? (
                          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
                            <XCircle className="h-4 w-4 shrink-0" />
                            <span>This order has been cancelled</span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
                              <span>Delivery Progress</span>
                              <span className="text-indigo-600 dark:text-indigo-400">{item.status}</span>
                            </div>
                            
                            {/* Line progress & nodes */}
                            <div className="relative flex items-center justify-between mt-2 px-1">
                              {/* Background Line */}
                              <div className="absolute left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 rounded-full -translate-y-1/2 top-1/2 z-0" />
                              
                              {/* Foreground Active Progress Line */}
                              <div
                                className="absolute left-0 h-1 bg-indigo-600 dark:bg-indigo-500 rounded-full -translate-y-1/2 top-1/2 z-0 transition-all duration-1000 ease-out"
                                style={{
                                  width: `${(getStatusStep(item.status) / 4) * 100}%`,
                                }}
                              />
                              
                              {["Placed", "Confirmed", "Shipped", "Out for Delivery", "Delivered"].map((step, idx) => {
                                const activeStep = getStatusStep(item.status);
                                const isCompleted = idx <= activeStep;
                                const isCurrent = idx === activeStep;
                                
                                return (
                                  <div key={idx} className="flex flex-col items-center relative z-10">
                                    <div
                                      className={`h-5 w-5 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                        isCompleted
                                          ? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white scale-110 shadow-md shadow-indigo-600/20"
                                          : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                                      }`}
                                    >
                                      {isCompleted ? (
                                        <Check className="h-3 w-3 stroke-[3px]" />
                                      ) : (
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                      )}
                                    </div>
                                    <span
                                      className={`mt-2 text-[9px] font-bold tracking-tight absolute -bottom-5 whitespace-nowrap transition-colors duration-300 ${
                                        isCurrent
                                          ? "text-indigo-600 dark:text-indigo-400 font-extrabold"
                                          : isCompleted
                                          ? "text-slate-800 dark:text-slate-200"
                                          : "text-slate-400"
                                      }`}
                                    >
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="h-4" /> {/* spacers for bottom absolute labels */}
                          </div>
                        )}
                      </div>

                      {/* Icon-based Order Metadata Rows */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-slate-400 shrink-0" />
                          <span>Order ID: <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 select-all">{item.orderId}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} className="text-slate-400 shrink-0" />
                          <span>Order Date: <span className="text-slate-800 dark:text-slate-100">{new Date(item.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-slate-400 shrink-0" />
                          <span>Payment Mode: <span className="text-slate-800 dark:text-slate-100 uppercase">{item.paymentMethod}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck size={14} className="text-slate-400 shrink-0" />
                          <span>Delivery: <span className="text-slate-800 dark:text-slate-100">{item.status === "Delivered" ? "Completed" : "Estimated within 7 Days"}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Price details, Invoice widget, Action buttons */}
                    <div className="space-y-5 lg:w-full border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800/80 pt-6 lg:pt-0 lg:pl-6 shrink-0">
                      
                      {/* Price Section */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Transaction Price</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            ₹{(item.price * item.qty).toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-slate-400 line-through font-bold">
                            MRP ₹{Math.round(item.price * 1.15 * item.qty).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          <Tag size={10} />
                          <span>Saved ₹{Math.round(item.price * 0.15 * item.qty).toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      {/* Invoice Detailed Section */}
                      {(() => {
                        const inv = invoices.find(
                           (i) => String(i.orderId?._id || i.orderId) === String(item.orderId)
                        );
                        if (inv) {
                          const isCreditNote = inv.orderStatus === "Refunded";
                          return (
                            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={13} className="shrink-0 text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                  {isCreditNote ? "Credit Note Issued" : "Invoice Compiled"}
                                </span>
                              </div>
                              <div className="space-y-1 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                                <p>Number: <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">{inv.invoiceNumber}</span></p>
                                <p>Generated: <span className="text-slate-800 dark:text-slate-200">{new Date(inv.invoiceDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</span></p>
                              </div>
                              <a
                                href={`${backendUrl}/api/invoice/download/${inv._id}?token=${token}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 transition duration-150 active:scale-95 cursor-pointer"
                              >
                                <FileText size={11} className="text-indigo-500" />
                                <span>{isCreditNote ? "Download Credit Note" : "Download PDF"}</span>
                              </a>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 w-full pt-1">
                        {returnRequest ? (
                          <button
                            onClick={() =>
                              navigate(`/track/${item.orderId}`, { state: { item, returnRequest, initialTab: "return" } })
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orange-500/10 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>{t("track_return")}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              navigate(`/track/${item.orderId}`, { state: { item } })
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#FF5100] dark:hover:bg-orange-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                          >
                            <Truck className="h-4 w-4" />
                            <span>{t("track_order")}</span>
                          </button>
                        )}

                        {canRequestReturn && (
                          <button
                            onClick={() => openReturnModal(item)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-95 cursor-pointer animate-pulse"
                          >
                            <RotateCcw className="h-4 w-4 text-orange-500" />
                            <span>{t("request_return")}</span>
                          </button>
                        )}

                        {/* Cancel Order Button */}
                        {item.status !== "Delivered" && item.status !== "Cancelled" && (
                          <button
                            onClick={() => handleCancelOrder(item.orderId)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-700 transition-all active:scale-95 cursor-pointer"
                          >
                            <XCircle className="h-4 w-4 text-rose-550" />
                            <span>Cancel Order</span>
                          </button>
                        )}

                        <button
                          onClick={() => navigate("/help")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all active:scale-95 cursor-pointer"
                        >
                          <Headset className="h-4 w-4 text-indigo-500" />
                          <span>{t("get_support")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>

      {/* Return Request Modal */}
      {selectedReturnItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-left scale-100 transition-all duration-300">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Reverse Logistics
                </p>
                <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                  Request Return
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Item: {selectedReturnItem.name}</p>
              </div>
              <button
                onClick={() => setSelectedReturnItem(null)}
                className="rounded-xl h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitReturnRequest} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Return Action Wanted
                </label>
                <select
                  value={returnForm.returnType}
                  onChange={(event) =>
                    setReturnForm((current) => ({ ...current, returnType: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 dark:focus:border-indigo-500 cursor-pointer font-bold"
                >
                  <option value="Refund" className="bg-white dark:bg-slate-900">Refund (Money Back)</option>
                  <option value="Replacement" className="bg-white dark:bg-slate-900">Replacement (Same Product)</option>
                  <option value="Exchange" className="bg-white dark:bg-slate-900">Exchange (Different Size)</option>
                </select>
              </div>

              {returnForm.returnType === "Exchange" && (
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Preferred Exchange Size
                  </label>
                  <input
                    type="text"
                    required
                    value={returnForm.exchangeSize}
                    onChange={(event) =>
                      setReturnForm((current) => ({ ...current, exchangeSize: event.target.value }))
                    }
                    placeholder="e.g. XL, M, L"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 dark:focus:border-indigo-500 placeholder:text-slate-400"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Return Reason
                </label>
                <select
                  value={returnForm.reason}
                  onChange={(event) =>
                    setReturnForm((current) => ({ ...current, reason: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 dark:focus:border-indigo-500 cursor-pointer"
                >
                  <option className="bg-white dark:bg-slate-900">Wrong item delivered</option>
                  <option className="bg-white dark:bg-slate-900">Damaged item</option>
                  <option className="bg-white dark:bg-slate-900">Product not as expected</option>
                  <option className="bg-white dark:bg-slate-900">Quality issue</option>
                  <option className="bg-white dark:bg-slate-900">Changed my mind</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Additional Comments / Feedback
                </label>
                <textarea
                  rows="4"
                  value={returnForm.feedback}
                  onChange={(event) =>
                    setReturnForm((current) => ({ ...current, feedback: event.target.value }))
                  }
                  placeholder="Please share details about why you want to return this product..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setSelectedReturnItem(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 cursor-pointer transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orange-500/10 hover:shadow-lg disabled:opacity-60 cursor-pointer transition active:scale-95"
                >
                  {submittingReturn ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orderdetail;

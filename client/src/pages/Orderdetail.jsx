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
  ChevronLeft,
  ChevronRight,
  FileText,
  ShoppingBag,
  Search,
  ShieldCheck,
} from "lucide-react";
import { backendUrl } from "../config";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

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

  const [selectedTab, setSelectedTab] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [openActionMenuIndex, setOpenActionMenuIndex] = useState(null);

  const formatDateCompact = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

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
        (String(request.productId) === String(item.productId || item._id || item.id) ||
         (!request.productId && request.itemName === item.name)) &&
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
          productId: selectedReturnItem.productId || selectedReturnItem._id || selectedReturnItem.id,
          size: selectedReturnItem.size || "",
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
            <span className="font-extrabold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
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
            <div className="h-4.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm" />
            <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="rounded-md border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 p-6 grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-8">
                {/* Left col */}
                <div className="h-44 w-44 rounded-md bg-slate-200 dark:bg-slate-800" />
                {/* Center col */}
                <div className="space-y-4">
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-md mt-4" />
                </div>
                {/* Right col */}
                <div className="space-y-3">
                  <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm self-end" />
                  <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orderData.filter(item => {
    if (selectedTab === "All") return true;
    const s = String(item.status).toLowerCase();
    if (selectedTab === "Processing") {
      return ["placed", "order placed", "confirmed", "packed"].includes(s);
    }
    if (selectedTab === "Shipped") {
      return ["shipped", "out for delivery"].includes(s);
    }
    if (selectedTab === "Delivered") {
      return s === "delivered";
    }
    if (selectedTab === "Cancelled") {
      return s === "cancelled";
    }
    return true;
  });

  const filteredAndSortedOrders = filteredOrders.filter(item => {
    if (!searchQuery) return true;
    const nameMatch = String(item.name).toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = String(item.orderId).toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || idMatch;
  }).sort((a, b) => {
    if (sortOrder === "latest") {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-8 sm:py-12 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        
        {/* MOBILE HEADER BAR */}
        <div className="block lg:hidden mb-6">
          <div className="flex items-center justify-between h-14 border-b border-slate-200/50 dark:border-slate-800/50 px-1 mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-wide">My Orders</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-orange-500 text-[8px] font-black text-slate-100 dark:text-white rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>

          {/* Collapsible Search Input Box */}
          <AnimatePresence>
            {showSearchInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden w-full mb-4 px-1"
              >
                <input
                  type="text"
                  placeholder="Search by product name or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page Title & Subtitle below header */}
          <div className="text-left py-2 px-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Orders</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Track, manage and view your orders</p>
          </div>
        </div>

        {/* DESKTOP HEADER BLOCK */}
        <div className="hidden lg:flex flex-col gap-4 text-left mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Transaction History</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t("my_orders")}</h1>
            </div>
            
            {/* Header Icons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="p-2 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 cursor-pointer"
                title="Search Orders"
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="p-2 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 relative cursor-pointer"
                title="View Cart"
              >
                <ShoppingBag size={16} />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 text-[9px] font-black text-slate-100 dark:text-white rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>

          {/* Collapsible Search Input Box */}
          <AnimatePresence>
            {showSearchInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden w-full max-w-md"
              >
                <input
                  type="text"
                  placeholder="Search by product name or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none mb-4">
          {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map((tab) => {
            const isActive = selectedTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                  setOpenActionMenuIndex(null);
                }}
                className={`py-3 px-4 text-xs font-black whitespace-nowrap transition-all duration-200 border-b-2 outline-none cursor-pointer ${ isActive ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" }`}
              >
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex items-center justify-between border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 rounded-md p-3 mb-6 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 cursor-pointer">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
            </svg>
            <span>Filter</span>
          </div>
          <button 
            onClick={() => {
              setSortOrder(prev => prev === "latest" ? "oldest" : "latest");
              toast.info(`Sorted by ${sortOrder === "latest" ? "Oldest First" : "Latest First"} 🔄`);
            }}
            className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition cursor-pointer"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Sort</span>
          </button>
        </div>

        {filteredAndSortedOrders.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-16 text-center shadow-sm max-w-2xl mx-auto">
            <div className="mx-auto h-14 w-14 rounded-md bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 mb-4">
              <PackageCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No orders found</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No order matches the current status tab filters or search queries.</p>
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {filteredAndSortedOrders.map((item, index) => {
            const isHighlighted = highlightOrderId && String(item.orderId) === String(highlightOrderId);
            const returnRequest = getReturnRequest(item);
            const canRequestReturn = item.status === "Delivered" && !returnRequest;
            const imageUrl = item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`;
            const formattedDate = new Date(item.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
            const totalPrice = item.price * item.qty;

            return (
              <div
                key={`${item.orderId}-${item.productId || item.name}-${index}`}
                className={`order-group-${item.orderId} group transition-all duration-300 ${ isHighlighted ? "ring-2 ring-orange-500/15 scale-[1.01]" : "" }`}
              >
                
                {/* DESKTOP VIEW CARD */}
                <div className="hidden lg:grid gap-8 lg:grid-cols-[200px_1fr_260px] items-start relative rounded-md border p-6 text-left border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 hover:shadow-md hover:border-indigo-500/20">
                  
                  {/* Left Column: Premium Product Image Gallery */}
                  <div className="flex flex-col gap-3 shrink-0">
                    <Link
                      to={`/product/${item.productId}`}
                      className="group/img relative h-48 w-full rounded-md border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-3 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer"
                    >
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="h-full w-full rounded-md object-contain transition-all duration-500 ease-out group-hover/img:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-xs">
                        <span className="rounded-full bg-slate-900/90 text-slate-100 dark:text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 shadow-md">
                          View Details
                        </span>
                      </div>
                    </Link>
                    
                    {/* Product Thumbnail Gallery Simulation */}
                    <div className="flex gap-2">
                      <div className="h-10 w-10 rounded-sm border border-indigo-500/25 bg-slate-100 dark:bg-slate-950 p-1 flex items-center justify-center shrink-0 cursor-pointer">
                        <img
                          src={imageUrl}
                          alt="thumbnail"
                          className="h-full w-full object-contain rounded"
                        />
                      </div>
                      <div className="h-10 w-10 rounded-sm border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center shrink-0 hover:border-slate-300 cursor-pointer transition">
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
                            className="inline-flex items-center gap-1.5 rounded-sm bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 px-2.5 py-1 text-xs font-bold transition duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                          >
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">{chip.label}:</span>
                            <span>{chip.value}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Visual Progress Order Status Timeline */}
                    <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 rounded-md p-4 space-y-4">
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
                                    className={`h-5 w-5 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${ isCompleted ? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-slate-100 dark:text-white scale-110 shadow-md shadow-indigo-600/20" : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400" }`}
                                  >
                                    {isCompleted ? (
                                      <Check className="h-3 w-3 stroke-[3px]" />
                                    ) : (
                                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                    )}
                                  </div>
                                  <span
                                    className={`mt-2 text-[9px] font-bold tracking-tight absolute -bottom-5 whitespace-nowrap transition-colors duration-300 ${ isCurrent ? "text-indigo-600 dark:text-indigo-400 font-extrabold" : isCompleted ? "text-slate-800 dark:text-slate-200" : "text-slate-400" }`}
                                  >
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="h-4" /> {/* spacers for bottom absolute labels */}

                          {/* OTP Key widget inside timeline card */}
                          {item.verificationCode && item.status !== "Delivered" && item.status !== "Cancelled" && (
                            <div className="mt-5 flex items-center justify-between rounded-md bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 dark:border-amber-500/30 px-3.5 py-2.5">
                              <div className="flex items-center gap-2">
                                <KeyRound size={14} className="text-amber-500 animate-pulse shrink-0" />
                                <span className="font-bold text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">Delivery Key:</span>
                                <span className="font-mono font-black text-sm tracking-widest bg-amber-500/25 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-500/35">{item.verificationCode}</span>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(item.verificationCode);
                                  toast.success("Verification code copied!");
                                }}
                                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-sm bg-amber-500 text-slate-100 dark:text-white hover:bg-amber-600 active:scale-95 transition cursor-pointer shadow-sm shadow-amber-500/20"
                              >
                                <Copy size={12} />
                                <span>Copy</span>
                              </button>
                            </div>
                          )}
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
                        <span>Order Date: <span className="text-slate-800 dark:text-slate-100">{formattedDate}</span></span>
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
                          ₹{totalPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-bold">
                          MRP ₹{Math.round(totalPrice * 1.15).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                        <Tag size={10} />
                        <span>Saved ₹{Math.round(totalPrice * 0.15).toLocaleString("en-IN")}</span>
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
                          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-md p-3.5 space-y-2 text-xs">
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
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-sm border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 transition duration-150 active:scale-95 cursor-pointer"
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
                          className="inline-flex items-center justify-center gap-2 rounded-md bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-100 dark:text-white shadow-md shadow-orange-500/10 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>{t("track_return")}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            navigate(`/track/${item.orderId}`, { state: { item } })
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-[#FF5100] dark:hover:bg-orange-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-100 dark:text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                        >
                          <Truck className="h-4 w-4" />
                          <span>{t("track_order")}</span>
                        </button>
                      )}

                      {canRequestReturn && (
                        <button
                          onClick={() => openReturnModal(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-95 cursor-pointer animate-pulse"
                        >
                          <RotateCcw className="h-4 w-4 text-orange-500" />
                          <span>{t("request_return")}</span>
                        </button>
                      )}

                      {item.status !== "Delivered" && item.status !== "Cancelled" && (
                        <button
                          onClick={() => handleCancelOrder(item.orderId)}
                          className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-700 transition-all active:scale-95 cursor-pointer"
                        >
                          <XCircle className="h-4 w-4 text-rose-500" />
                          <span>Cancel Order</span>
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/order/${item.orderId}`)}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-95 cursor-pointer"
                      >
                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                        <span>View Details & Chat</span>
                      </button>

                      <button
                        onClick={() => navigate("/help")}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all active:scale-95 cursor-pointer"
                      >
                        <Headset className="h-4 w-4 text-indigo-500" />
                        <span>{t("get_support")}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* MOBILE VIEW CARD */}
                <div className="block lg:hidden rounded-md border p-4 space-y-4 hover:shadow-md transition relative border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/30">
                  <div className="flex items-start">
                    {/* Thumbnail Image */}
                    <Link
                      to={`/product/${item.productId}`}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-md border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-1.5 shrink-0 cursor-pointer"
                    >
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="h-full w-full object-contain rounded"
                      />
                    </Link>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0 pl-3 text-left flex flex-col justify-between">
                      {/* Row 1: Order ID & Price */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          Order #OD{item.orderId?.slice(-7).toUpperCase()}
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          ₹{totalPrice.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Row 2: Product Name */}
                      <div className="mt-1">
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate hover:text-indigo-600 block leading-tight"
                        >
                          {item.name}
                        </Link>
                      </div>

                      {/* Row 3: Date/Qty & Status Badge */}
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold">
                          {formattedDate} • {item.qty} {item.qty > 1 ? "Items" : "Item"}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${ item.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : item.status === "Cancelled" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sub Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs font-bold">
                    {/* Left Side: Status Info */}
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
                      {item.status === "Delivered" ? (
                        <>
                          <Truck size={14} className="text-emerald-600 shrink-0" />
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Delivered on {formattedDate}</span>
                        </>
                      ) : item.status === "Cancelled" ? (
                        <>
                          <XCircle size={14} className="text-rose-500 shrink-0" />
                          <span className="text-[10px] text-slate-600 dark:text-slate-400">Cancelled on {formattedDate}</span>
                        </>
                      ) : (
                        <>
                          <Truck size={14} className="text-blue-500 shrink-0" />
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Estimated delivery: {new Date(new Date(item.date).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Right Side: Actions button & dots menu */}
                    <div className="flex items-center gap-2 relative">
                      {item.status === "Cancelled" ? (
                        <button
                          onClick={() => navigate(`/track/${item.orderId}`, { state: { item } })}
                          className="px-3 py-1.5 rounded-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-wider transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          View Details
                        </button>
                      ) : returnRequest ? (
                        <button
                          onClick={() => navigate(`/track/${item.orderId}`, { state: { item, returnRequest, initialTab: "return" } })}
                          className="px-3 py-1.5 rounded-sm border border-orange-200 dark:border-orange-900 bg-orange-50/50 hover:bg-orange-100/50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                        >
                          Track Return
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/track/${item.orderId}`, { state: { item } })}
                          className="px-3 py-1.5 rounded-sm border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 hover:bg-indigo-50/80 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                        >
                          Track Order
                        </button>
                      )}

                      {/* Three Dots Button */}
                      <button
                        onClick={() => setOpenActionMenuIndex(openActionMenuIndex === index ? null : index)}
                        className="h-7 w-7 rounded-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                          <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                        </svg>
                      </button>

                      {/* Action Menu popover floating overlay */}
                      {openActionMenuIndex === index && (
                        <>
                          {/* overlay click-catcher */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenActionMenuIndex(null)}
                          />
                          <div className="absolute right-0 bottom-9 z-20 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-1.5 shadow-xl text-left space-y-0.5">
                            {/* Invoice compiled download */}
                            {(() => {
                              const inv = invoices.find(i => String(i.orderId?._id || i.orderId) === String(item.orderId));
                              if (inv) {
                                return (
                                  <a
                                    href={`${backendUrl}/api/invoice/download/${inv._id}?token=${token}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                  >
                                    <FileText size={13} className="text-slate-500" />
                                    <span>Download Invoice</span>
                                  </a>
                                );
                              }
                              return null;
                            })()}

                            {/* Request Return */}
                            {canRequestReturn && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuIndex(null);
                                  openReturnModal(item);
                                }}
                                className="w-full flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left cursor-pointer"
                              >
                                <RotateCcw size={13} className="text-orange-500" />
                                <span>Request Return</span>
                              </button>
                            )}

                            {/* Cancel Order */}
                            {item.status !== "Delivered" && item.status !== "Cancelled" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuIndex(null);
                                  handleCancelOrder(item.orderId);
                                }}
                                className="w-full flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left cursor-pointer"
                              >
                                <XCircle size={13} className="text-rose-500" />
                                <span>Cancel Order</span>
                              </button>
                            )}

                            {/* View details & chat */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionMenuIndex(null);
                                navigate(`/order/${item.orderId}`);
                              }}
                              className="w-full flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left cursor-pointer"
                            >
                              <ShieldCheck size={13} className="text-indigo-500" />
                              <span>View Details & Chat</span>
                            </button>

                            {/* Get support */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionMenuIndex(null);
                                navigate("/help");
                              }}
                              className="w-full flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left cursor-pointer"
                            >
                              <Headset size={13} className="text-slate-500" />
                              <span>Get Support</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Mobile Help Card matching Mock */}
        <div className="block lg:hidden bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/30 rounded-md p-4 flex items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Headset size={18} />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Need help with your order?</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Our support team is here to help you.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/help")}
            className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>Contact Support</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>

      {/* Return Request Modal */}
      {selectedReturnItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-left scale-100 transition-all duration-300">
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
                className="rounded-md h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition dark: cursor-pointer font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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
                    className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition dark: placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition dark: cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition dark: placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setSelectedReturnItem(null)}
                  className="rounded-md border border-slate-200 dark:border-slate-800 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 cursor-pointer transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="rounded-md bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-100 dark:text-white shadow-md shadow-orange-500/10 hover:shadow-lg disabled:opacity-60 cursor-pointer transition active:scale-95"
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

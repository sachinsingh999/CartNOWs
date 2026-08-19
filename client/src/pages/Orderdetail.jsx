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
  Eye,
  MessageSquare,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Star,
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

  const [expandedOrders, setExpandedOrders] = useState({});
  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const getProductRating = (productId, productName) => {
    const seed = String(productId || productName || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = (4.2 + (seed % 9) / 10).toFixed(1);
    const reviews = 30 + (seed * 13) % 250;
    return { rating, reviews };
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={13} className="fill-amber-400 text-amber-400" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<Star key={i} size={13} className="fill-amber-400/30 text-amber-400" />);
      } else {
        stars.push(<Star key={i} size={13} className="text-slate-600 fill-transparent" />);
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    toast.success("Delivery Key copied to clipboard! 📋");
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

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

  const [rmaList, setRmaList] = useState([]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    const [orderResponse, returnResponse, profileResponse, invoiceResponse, rmsRmaResponse, rmsReqResponse] = await Promise.all([
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
      axios.get(`${backendUrl}/api/rms/rma/list`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: { success: false, rmas: [] } })),
      axios.get(`${backendUrl}/api/rms/request/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: { success: false, requests: [] } })),
    ]);

    if (rmsRmaResponse && rmsRmaResponse.data && rmsRmaResponse.data.success) {
      setRmaList(rmsRmaResponse.data.rmas || []);
    }

    if (rmsReqResponse && rmsReqResponse.data && rmsReqResponse.data.success) {
      setReturnRequests(rmsReqResponse.data.requests || []);
    }

    if (profileResponse.data.success) {
      setDeliveryVerificationKey(profileResponse.data.user.deliveryVerificationKey);
    }

    if (invoiceResponse && invoiceResponse.data && invoiceResponse.data.success) {
      setInvoices(invoiceResponse.data.invoices);
    }

    if (orderResponse.data.success) {
      const formattedOrders = (orderResponse.data.orders || []).map((order) => {
        const rawItems = order.orderItems && order.orderItems.length > 0 ? order.orderItems : (order.items || []);
        const formattedItems = rawItems.map((item) => {
          const itemSt = item.status || "Placed";
          const topSt = order.orderStatus || "Placed";

          let effectiveStatus = topSt || itemSt || "Placed";
          if (itemSt && itemSt.toLowerCase() === "cancelled") {
            effectiveStatus = "Cancelled";
          }

          return {
            ...item,
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: effectiveStatus,
            shopName: item.shopName || "Platform Store",
            sellerName: item.sellerName || "Store Merchant",
            name: item.productName || item.name,
            image: item.productImage || item.image || (item.images && item.images[0]),
            price: item.unitPrice || item.price,
            qty: item.quantity || item.qty || 1,
            size: item.variant?.size || item.size || "Standard",
            productId: item.productId || item._id,
          };
        });

        return {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.orderStatus || "Placed",
          date: order.createdAt || order.date || Date.now(),
          payment: order.paymentStatus === "Paid" || order.paymentStatus === true || order.payment === true,
          paymentMethod: order.paymentMethod,
          amount: order.amount,
          address: order.address,
          verificationCode: order.verificationCode,
          items: formattedItems,
        };
      });
      setOrderData(formattedOrders.reverse());
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
      reason: "Wrong Item Delivered",
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
        `${backendUrl}/api/rms/request/create`,
        {
          orderId: selectedReturnItem.orderId,
          orderItemId: selectedReturnItem._id || selectedReturnItem.orderItemId || selectedReturnItem.id || selectedReturnItem.productId,
          returnReason: returnForm.reason,
          customerDescription: returnForm.feedback,
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

  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null });
  const [cancelReason, setCancelReason] = useState("Ordered by mistake");
  const [cancelNotes, setCancelNotes] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const openCancelModal = (orderId) => {
    setCancelModal({ open: true, orderId });
    setCancelReason("Ordered by mistake");
    setCancelNotes("");
  };

  const submitCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelModal.orderId) return;

    try {
      setSubmittingCancel(true);
      const response = await axios.post(
        `${backendUrl}/api/order/cancel`,
        { orderId: cancelModal.orderId, reason: `${cancelReason}${cancelNotes ? ` - ${cancelNotes}` : ""}` },
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
            <span className="font-mono text-[9px] text-slate-400 select-all">ID: {cancelModal.orderId}</span>
          </div>,
          {
            icon: false,
            style: { borderLeft: "4px solid #ef4444" }
          }
        );
        setCancelModal({ open: false, orderId: null });
        await fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmittingCancel(false);
    }
  };

  const getDeliveryDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 4);
    return today.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  };

  const downloadInvoice = (orderId) => {
    toast.info("Downloading Invoice PDF... 📄");
    const downloadUrl = `${backendUrl}/api/invoice/download/${orderId}?token=${token}`;
    window.open(downloadUrl, "_blank");
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
              <div key={n} className="rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 p-6 grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-8">
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

  const filteredOrders = orderData.filter((item) => {
    if (selectedTab === "All") return true;
    const s = String(item.status || "").toLowerCase();
    if (selectedTab === "Processing") {
      return ["placed", "order placed", "confirmed", "packed", "processing"].includes(s);
    }
    if (selectedTab === "Shipped") {
      return ["shipped", "out for delivery"].includes(s);
    }
    if (selectedTab === "Delivered") {
      return s === "delivered" || s === "completed";
    }
    if (selectedTab === "Cancelled") {
      return s === "cancelled";
    }
    return true;
  });

  const filteredAndSortedOrders = filteredOrders
    .filter((order) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const idMatch = String(order.orderId || "").toLowerCase().includes(query) || String(order.orderNumber || "").toLowerCase().includes(query);
      const nameMatch = (order.items || []).some((it) => String(it.name || "").toLowerCase().includes(query));
      return nameMatch || idMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || Date.now());
      const dateB = new Date(b.date || Date.now());
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#050508] px-3 sm:px-6 py-6 sm:py-8 text-[#121217] dark:text-[#FFFFFF] transition-colors duration-200">
      <div className="w-full max-w-[1536px] mx-auto space-y-6">
        
        {/* MOBILE HEADER BAR */}
        <div className="block lg:hidden mb-6">
          <div className="flex items-center justify-between h-14 border-b border-[#E5E7EB] dark:border-slate-800/50 px-1 mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#111827] dark:hover:bg-[#1F2937] border border-transparent dark:border-slate-800 transition text-[#4B5563] dark:text-[#CFCFD8] cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-sm font-black text-[#121217] dark:text-[#FFFFFF] tracking-wide">My Orders</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="p-2 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#111827] dark:hover:bg-[#1F2937] border border-transparent dark:border-slate-800 transition text-[#4B5563] dark:text-[#CFCFD8] cursor-pointer"
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="p-2 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#111827] dark:hover:bg-[#1F2937] border border-transparent dark:border-slate-800 transition relative cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-[#10B981] text-[8px] font-black text-slate-100 dark:text-[#FFFFFF] rounded-full flex items-center justify-center border border-white dark:border-[#050508]">
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
                  className="w-full rounded border border-[#E5E7EB] dark:border-slate-800 bg-[#FFFFFF] dark:bg-[#111827] px-4 py-2.5 text-xs font-semibold outline-none transition text-[#121217] dark:text-[#FFFFFF] placeholder-[#7A7D89] dark:placeholder-[#8E8EA0] focus:ring-2 focus:ring-[#10B981]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page Title & Subtitle below header */}
          <div className="text-left py-2 px-1">
            <h1 className="text-2xl font-black text-[#121217] dark:text-[#FFFFFF]">Orders</h1>
            <p className="text-xs text-[#4B5563] dark:text-[#8E8EA0] font-semibold mt-1">Track, manage and view your orders</p>
          </div>
        </div>

        {/* DESKTOP HEADER BLOCK */}
        <div className="hidden lg:flex flex-col gap-4 text-left mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#121217] dark:text-[#FFFFFF]">{t("my_orders")}</h1>
            </div>
            
            {/* Header Icons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="p-2.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#111827] dark:hover:bg-[#1F2937] border border-transparent dark:border-slate-800 transition text-[#4B5563] dark:text-[#CFCFD8] cursor-pointer"
                title="Search Orders"
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="p-2.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#111827] dark:hover:bg-[#1F2937] border border-transparent dark:border-slate-800 transition text-[#4B5563] dark:text-[#CFCFD8] relative cursor-pointer"
                title="View Cart"
              >
                <ShoppingBag size={16} />
                <span className="absolute -top-1 -right-1 h-4.5 w-4.5 bg-[#10B981] text-[9px] font-black text-white rounded-full flex items-center justify-center border border-white dark:border-[#050508]">
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
                  className="w-full rounded border border-[#E5E7EB] dark:border-slate-800 bg-[#FFFFFF] dark:bg-[#111827] px-4 py-2 text-xs font-semibold outline-none transition text-[#121217] dark:text-[#FFFFFF] placeholder-[#7A7D89] dark:placeholder-[#8E8EA0] focus:ring-2 focus:ring-[#10B981]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Combined Status Tabs, Filter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between bg-transparent border-none rounded-xl px-0 py-0 mb-6 gap-3">
          {/* Left: Status Tabs with Live Order Count Badges */}
          <div className="flex items-center overflow-x-auto scrollbar-none gap-2 py-0.5">
            {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map((tab) => {
              const isActive = selectedTab === tab;
              const count = orderData.filter((item) => {
                if (tab === "All") return true;
                const s = String(item.status || "").toLowerCase();
                if (tab === "Processing") return ["placed", "order placed", "confirmed", "packed", "processing"].includes(s);
                if (tab === "Shipped") return ["shipped", "out for delivery"].includes(s);
                if (tab === "Delivered") return s === "delivered" || s === "completed";
                if (tab === "Cancelled") return s === "cancelled";
                return true;
              }).length;

              return (
                <button
                  key={tab}
                  onClick={() => {
                    setSelectedTab(tab);
                    setOpenActionMenuIndex(null);
                  }}
                  className={`py-1.5 px-3.5 text-xs font-extrabold whitespace-nowrap rounded transition-all duration-200 outline-none cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? "bg-[#10B981] border-[#10B981] text-white shadow-md shadow-[#10B981]/10"
                      : "bg-[#F1F3F7] dark:bg-[#111827] hover:bg-[#E5E7EB] dark:hover:bg-[#1F2937] text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-[#DFE4EE] dark:border-slate-800"
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                    isActive ? "bg-white text-[#10B981]" : "bg-slate-200 dark:bg-[#1F2937] text-slate-500 dark:text-slate-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Filter & Sort Actions */}
          <div className="flex items-center gap-2.5 shrink-0 py-0.5">
            <button className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-[#121217] dark:hover:text-white transition cursor-pointer bg-[#F1F3F7] dark:bg-[#111827] hover:bg-[#E5E7EB] dark:hover:bg-[#1F2937] border border-[#DFE4EE] dark:border-slate-800 px-3.5 py-1.5 rounded">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
              </svg>
              <span>Filter</span>
            </button>
            <button 
              onClick={() => {
                setSortOrder(prev => prev === "latest" ? "oldest" : "latest");
                toast.info(`Sorted by ${sortOrder === "latest" ? "Oldest First" : "Latest First"} 🔄`);
              }}
              className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-[#121217] dark:hover:text-white transition cursor-pointer bg-[#F1F3F7] dark:bg-[#111827] hover:bg-[#E5E7EB] dark:hover:bg-[#1F2937] border border-[#DFE4EE] dark:border-slate-800 px-3.5 py-1.5 rounded"
            >
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span>Sort ({sortOrder === "latest" ? "Latest" : "Oldest"})</span>
            </button>
          </div>
        </div>

        {filteredAndSortedOrders.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-[#111827]/40 p-12 text-center max-w-2xl mx-auto space-y-3">
            <div className="mx-auto h-14 w-14 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center text-slate-400">
              <PackageCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No orders under "{selectedTab}" tab</h3>
            <p className="text-xs text-slate-400">You currently have 0 orders in the {selectedTab} status category.</p>
            {selectedTab !== "All" && (
              <button
                onClick={() => setSelectedTab("All")}
                className="mt-2 px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition cursor-pointer"
              >
                View All Orders ({orderData.length})
              </button>
            )}
          </div>
        )}

        <div className="space-y-6">
          {filteredAndSortedOrders.map((order, index) => {
            const isHighlighted = highlightOrderId && String(order.orderId) === String(highlightOrderId);
            const isCancellable = !["shipped", "out for delivery", "delivered", "cancelled", "return pending", "return requested", "returned", "return approved"].includes(String(order.status).toLowerCase());
            const items = order.items || [];
            const orderIndexNum = filteredAndSortedOrders.length - index;
            const isExpanded = !!expandedOrders[order.orderId];
            
            const firstItem = items[0] || {};
            const ratingInfo = getProductRating(firstItem.productId, firstItem.name);
            const colors = ["Grey", "Midnight Black", "Space Gray", "Classic Blue", "Premium White"];
            const seed = String(firstItem.productId || firstItem.name).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const itemColor = firstItem.color && firstItem.size.toLowerCase() !== "standard" ? firstItem.color : colors[seed % colors.length];

            const renderStepper = (order) => {
              const steps = [
                { label: "Placed", status: "placed" },
                { label: "Confirmed", status: "confirmed" },
                { label: "Shipped", status: "shipped" },
                { label: "Delivered", status: "delivered" }
              ];

              const currentStep = getStatusStep(order.status);

              return (
                <div className="flex flex-col gap-4 text-left">
                  <span className="text-xs font-bold text-slate-400">Delivery Progress</span>
                  <div className="flex items-center justify-between w-full relative px-2">
                    {/* Connecting Lines */}
                    <div className="absolute top-[10px] left-[10%] right-[10%] h-[2px] bg-slate-200 dark:bg-slate-800 z-0">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(Math.min(currentStep, 3) / 3) * 100}%` }}
                      />
                    </div>

                    {steps.map((step, idx) => {
                      const isCompleted = idx < currentStep || (order.status.toLowerCase() === "delivered" && idx === 3);
                      const isActive = idx === currentStep && order.status.toLowerCase() !== "delivered";

                      return (
                        <div key={step.label} className="flex flex-col items-center z-10 min-w-[65px] text-center">
                          {/* Node Icon */}
                          <div 
                            className={`h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isCompleted 
                                ? "bg-emerald-500 text-white" 
                                : isActive 
                                ? "bg-white dark:bg-[#111622] border-2 border-amber-500 text-amber-500 scale-110" 
                                : "bg-slate-100 dark:bg-[#1f2937] border-2 border-slate-200 dark:border-[#374151] text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {isCompleted ? (
                              <Check size={11} className="stroke-[3.5]" />
                            ) : isActive ? (
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                            )}
                          </div>
                          
                          {/* Step Label */}
                          <span className={`text-[10px] font-black mt-2 leading-none block ${isCompleted || isActive ? "text-slate-800 dark:text-slate-100" : "text-slate-500"}`}>
                            {step.label}
                          </span>
                          
                          {/* Step Date */}
                          <span className="text-[9px] font-bold text-slate-500 mt-1 block">
                            {isCompleted ? formatDateCompact(order.date) : "--"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            };

            return (
              <div key={order.orderId || index} className="space-y-2">
                {/* SINGLE ORDER CARD - Clean Light Design with Subtle Amber Accent */}
                <div
                  className={`order-group-${order.orderId} group rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0C0F16] overflow-hidden text-left shadow-xs hover:shadow-md transition-all duration-300 relative ${ isHighlighted ? "ring-2 ring-amber-400/80" : "" }`}
                >
                  {/* Subtle Light Amber Top Accent Strip */}
                  <div className="h-[2px] w-full bg-gradient-to-r from-amber-400/80 via-yellow-400/80 to-amber-500/80 z-10 relative" />

                  {/* CARD HEADER */}
                  <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-[#0F131C]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag size={13} className="text-amber-500" />
                        ORDER #{String(order.orderNumber || order.orderId).slice(-8).toUpperCase()}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        order.status === "Delivered" 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25" 
                          : order.status === "Cancelled" 
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25" 
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Chevron expand toggle */}
                    {items.length > 0 && (
                      <button
                        onClick={() => toggleOrderExpand(order.orderId)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      >
                        <span>
                          {items.length} Product{items.length > 1 ? "s" : ""}
                        </span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>

                  {/* CARD BODY: Clean Master-Detail Layout */}
                  <div className="p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-white dark:bg-[#0C0F16] border-b border-slate-100 dark:border-slate-800/80 items-start">
                    
                    {/* Left Col (7/12) - Purchased Products List */}
                    <div className="lg:col-span-7 flex flex-col gap-4 min-w-0">
                      
                      {/* Sub-header for Multi-item Orders */}
                      {items.length > 1 && (
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <ShoppingBag size={14} className="text-amber-500" />
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                              Package Items ({items.length})
                            </span>
                          </div>
                          <button
                            onClick={() => toggleOrderExpand(order.orderId)}
                            className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? "Collapse List" : "View All Items"}</span>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        </div>
                      )}

                      {/* Display Items List */}
                      <div className="space-y-3.5">
                        {(isExpanded || items.length === 1 ? items : items.slice(0, 2)).map((item, idx) => {
                          const itemRating = getProductRating(item.productId, item.name);
                          const itemColorSeed = String(item.productId).charCodeAt(0) || 0;
                          const currentItemColor = item.color || colors[itemColorSeed % colors.length];

                          return (
                            <div 
                              key={item._id || idx} 
                              className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl border transition-colors ${
                                items.length > 1 
                                  ? "bg-slate-50/60 dark:bg-[#111622]/40 border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700" 
                                  : "border-transparent p-0 bg-transparent"
                              }`}
                            >
                              {/* Product Image */}
                              <Link
                                to={`/product/${item.productId}`}
                                className="h-22 w-22 sm:h-24 sm:w-24 rounded-lg bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-2 shrink-0 flex items-center justify-center cursor-pointer hover:border-amber-400 transition-all shadow-2xs group-hover:scale-[1.02]"
                              >
                                <img 
                                  src={item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`} 
                                  alt={item.name} 
                                  className="h-full w-full object-contain rounded-sm" 
                                />
                              </Link>

                              {/* Product Details */}
                              <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5 text-left">
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <Link
                                      to={`/product/${item.productId}`}
                                      className="text-sm font-black text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition line-clamp-1"
                                    >
                                      {item.name}
                                    </Link>

                                    {/* Individual Item Status Pill */}
                                    {items.length > 1 && item.status && item.status.toLowerCase() !== order.status.toLowerCase() && (
                                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider shrink-0 ${
                                        item.status === "Cancelled" 
                                          ? "bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/25" 
                                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                                      }`}>
                                        {item.status}
                                      </span>
                                    )}
                                  </div>

                                  {/* Star Rating Row */}
                                  <div className="flex items-center gap-2 mt-1">
                                    {renderStars(itemRating.rating)}
                                    <span className="text-[10px] font-bold text-slate-400">
                                      {itemRating.rating} &nbsp;
                                      <span className="text-slate-500">({itemRating.reviews})</span>
                                    </span>
                                  </div>

                                  {/* Specs Badges */}
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                    <span className="bg-slate-200/60 dark:bg-slate-800/80 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">Qty: {item.qty}</span>
                                    <span className="bg-slate-200/60 dark:bg-slate-800/80 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">Color: {currentItemColor}</span>
                                    <span className="bg-slate-200/60 dark:bg-slate-800/80 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">Size: {item.size}</span>
                                  </div>
                                </div>

                                {/* Price & Seller Footer */}
                                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-base font-black text-slate-900 dark:text-white leading-none">₹{item.price?.toLocaleString("en-IN")}</span>
                                    <span className="text-xs text-slate-400 line-through leading-none">₹{(item.price * 1.3).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-sm border border-amber-500/20 leading-none">
                                      23% OFF
                                    </span>
                                  </div>

                                  <div className="text-[10px] font-bold text-slate-500">
                                    Seller: <span className="text-amber-600 dark:text-amber-400 font-extrabold">{item.shopName}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Collapsed Items Count Indicator */}
                        {!isExpanded && items.length > 2 && (
                          <button
                            onClick={() => toggleOrderExpand(order.orderId)}
                            className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <span>+ {items.length - 2} more product{items.length - 2 > 1 ? "s" : ""} in this order</span>
                            <ChevronDown size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right Col (5/12) - Operations Side Panel */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      
                      {/* Delivery Stepper Block */}
                      <div className="bg-slate-50/60 dark:bg-[#111622]/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        {renderStepper(order)}
                      </div>

                      {/* Summary Data Grid */}
                      <div className="bg-slate-50/60 dark:bg-[#111622]/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 grid grid-cols-2 gap-3.5 text-left">
                        
                        {/* Order Placed */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <CalendarDays size={12} />
                            <span>Placed</span>
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                            {formatDateCompact(order.date)}
                          </span>
                        </div>

                        {/* Order Total */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <CreditCard size={12} />
                            <span>Total</span>
                          </span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                            ₹{order.amount?.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Order ID */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Tag size={12} />
                            <span>Order ID</span>
                          </span>
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400 block uppercase tracking-wide">
                            #{String(order.orderNumber || order.orderId).slice(-8).toUpperCase()}
                          </span>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <ShieldCheck size={12} />
                            <span>Payment</span>
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block uppercase">
                            {order.paymentMethod} ({order.payment ? "Paid" : "COD"})
                          </span>
                        </div>

                      </div>

                      {/* Delivery Verification Key Banner */}
                      {order.verificationCode && order.status !== "Delivered" && order.status !== "Cancelled" && (
                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                              <KeyRound size={15} className="animate-pulse" />
                            </div>
                            <div className="text-left">
                              <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block leading-tight">Delivery Key</span>
                              <span className="font-mono font-black text-base tracking-widest text-amber-600 dark:text-amber-400 block leading-tight mt-0.5">{order.verificationCode}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(order.verificationCode, order.orderId)}
                            className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition cursor-pointer shrink-0 border border-amber-500/20"
                          >
                            <span>{copiedCodeId === order.orderId ? "Copied!" : "Copy Key"}</span>
                            <Copy size={12} />
                          </button>
                        </div>
                      )}

                    </div>

                  </div>

                  {/* CARD ACTIONS FOOTER */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3.5 sm:p-4 bg-slate-50/60 dark:bg-[#0A0D14] border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => navigate(`/track/${order.orderId}`)}
                      className="px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Truck size={15} />
                      <span>Track Order</span>
                    </button>

                    <button
                      onClick={() => navigate(`/order/${order.orderId}#chat`)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <MessageSquare size={15} />
                      <span>Order Chat</span>
                    </button>

                    <button
                      onClick={() => downloadInvoice(order.orderId)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <FileText size={15} />
                      <span>Invoice</span>
                    </button>

                    {isCancellable ? (
                      <button
                        onClick={() => openCancelModal(order.orderId)}
                        className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-black text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <XCircle size={15} />
                        <span>Cancel Order</span>
                      </button>
                    ) : (
                      <span className="px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 opacity-70 text-xs font-black text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2 select-none">
                        <XCircle size={15} />
                        <span>{order.status === "Cancelled" ? "Cancelled" : "Completed"}</span>
                      </span>
                    )}
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
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition cursor-pointer font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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
                    className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  <option className="bg-white dark:bg-slate-900">Wrong Item Delivered</option>
                  <option className="bg-white dark:bg-slate-900">Defective/Damaged</option>
                  <option className="bg-white dark:bg-slate-900">Size Mismatch</option>
                  <option className="bg-white dark:bg-slate-900">Item Not As Described</option>
                  <option className="bg-white dark:bg-slate-900">Quality Not Expected</option>
                  <option className="bg-white dark:bg-slate-900">Changed Mind</option>
                  <option className="bg-white dark:bg-slate-900">Other</option>
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
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition dark:placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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

      {/* 5. CANCEL ORDER MODAL */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 text-left shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Cancel Order</h3>
                  <p className="text-[11px] font-bold text-slate-400">Order ID: {cancelModal.orderId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancelModal({ open: false, orderId: null })}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitCancelOrder} className="mt-5 space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>Are you sure you want to cancel this order? If any payment was made, your refund will be processed automatically.</span>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition font-bold focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option className="bg-white dark:bg-slate-900">Ordered by mistake</option>
                  <option className="bg-white dark:bg-slate-900">Found cheaper price elsewhere</option>
                  <option className="bg-white dark:bg-slate-900">Delivery taking too long</option>
                  <option className="bg-white dark:bg-slate-900">Need to change shipping address / variant</option>
                  <option className="bg-white dark:bg-slate-900">Changed my mind / Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Provide additional details if necessary..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-[#121217] dark:text-[#FFFFFF] outline-none transition placeholder:text-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCancelModal({ open: false, orderId: null })}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 cursor-pointer transition"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider shadow-md shadow-rose-600/20 disabled:opacity-60 cursor-pointer transition active:scale-95"
                >
                  {submittingCancel ? "Cancelling..." : "Confirm Cancellation"}
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

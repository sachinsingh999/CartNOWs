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

          let effectiveStatus = itemSt;
          if (["return pending", "return requested", "returned", "cancelled"].includes(itemSt.toLowerCase())) {
            effectiveStatus = itemSt;
          } else if (["delivered", "cancelled", "return pending"].includes(topSt.toLowerCase())) {
            effectiveStatus = topSt;
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
    const inv = invoices.find((i) => String(i.orderId?._id || i.orderId) === String(orderId));
    if (inv) {
      window.open(`${backendUrl}/api/invoice/download/${inv._id}?token=${token}`, "_blank");
    } else {
      toast.info("Compiling invoice PDF... Please check details page.");
      navigate(`/order/${orderId}`);
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
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0B0B0F] px-3 sm:px-6 py-6 sm:py-8 text-[#121217] dark:text-[#FFFFFF] transition-colors duration-200">
      <div className="w-full max-w-[1536px] mx-auto space-y-6">
        
        {/* MOBILE HEADER BAR */}
        <div className="block lg:hidden mb-6">
          <div className="flex items-center justify-between h-14 border-b border-[#E5E7EB] dark:border-slate-800/50 px-1 mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-md text-[#4B5563] dark:text-[#CFCFD8] hover:bg-[#F1F3F7] dark:hover:bg-[#20202A] transition cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-sm font-black text-[#121217] dark:text-[#FFFFFF] tracking-wide">My Orders</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="p-2 rounded-md text-[#4B5563] dark:text-[#CFCFD8] hover:bg-[#F1F3F7] dark:hover:bg-[#20202A] transition cursor-pointer"
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="p-2 rounded-md text-[#4B5563] dark:text-[#CFCFD8] hover:bg-[#F1F3F7] dark:hover:bg-[#20202A] transition relative cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-orange-500 text-[8px] font-black text-slate-100 dark:text-[#FFFFFF] rounded-full flex items-center justify-center">
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
                  className="w-full rounded-md border border-[#E5E7EB] dark:border-slate-800 bg-[#FFFFFF] dark:bg-[#111118] px-4 py-2.5 text-xs font-semibold outline-none transition text-[#121217] dark:text-[#FFFFFF] placeholder-[#7A7D89] dark:placeholder-[#8E8EA0] focus:ring-2 focus:ring-[#4F7CFF]"
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
              <p className="text-[10px] font-black uppercase tracking-widest text-[#4F7CFF] dark:text-indigo-400">Transaction History</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#121217] dark:text-[#FFFFFF]">{t("my_orders")}</h1>
            </div>
            
            {/* Header Icons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="p-2 rounded-md bg-[#F1F3F7] hover:bg-slate-200/80 dark:bg-[#111118] dark:hover:bg-[#20202A] transition text-[#4B5563] dark:text-[#CFCFD8] cursor-pointer"
                title="Search Orders"
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="p-2 rounded-md bg-[#F1F3F7] hover:bg-slate-200/80 dark:bg-[#111118] dark:hover:bg-[#20202A] transition text-[#4B5563] dark:text-[#CFCFD8] relative cursor-pointer"
                title="View Cart"
              >
                <ShoppingBag size={16} />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#4F7CFF] text-[9px] font-black text-white rounded-full flex items-center justify-center">
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
                  className="w-full rounded-md border border-[#E5E7EB] dark:border-slate-800 bg-[#FFFFFF] dark:bg-[#111118] px-4 py-2 text-xs font-semibold outline-none transition text-[#121217] dark:text-[#FFFFFF] placeholder-[#7A7D89] dark:placeholder-[#8E8EA0] focus:ring-2 focus:ring-[#4F7CFF]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs Bar */}
        <div className="flex overflow-x-auto scrollbar-none mb-4">
          {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map((tab) => {
            const isActive = selectedTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                  setOpenActionMenuIndex(null);
                }}
                className={`py-3 px-4 text-xs font-black whitespace-nowrap transition-all duration-200 border-b-2 outline-none cursor-pointer ${ isActive ? "border-[#4F7CFF] dark:border-indigo-500 text-[#4F7CFF] dark:text-indigo-400" : "border-transparent text-[#4B5563] hover:text-[#121217] dark:text-[#8E8EA0] dark:hover:text-[#CFCFD8]" }`}
              >
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex items-center justify-between bg-[#FFFFFF] dark:bg-[#111118] rounded-none p-3 mb-6 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#4F7CFF] dark:text-indigo-400 cursor-pointer">
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
            className="flex items-center gap-1.5 text-xs font-black text-[#4B5563] dark:text-[#CFCFD8] hover:text-[#4F7CFF] transition cursor-pointer"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Sort</span>
          </button>
        </div>

        {filteredAndSortedOrders.length === 0 && (
          <div className="rounded-md bg-[#FFFFFF] dark:bg-[#18181F] p-16 text-center shadow-sm max-w-2xl mx-auto">
            <div className="mx-auto h-14 w-14 rounded-full bg-[#F1F3F7] dark:bg-[#20202A] flex items-center justify-center text-[#7A7D89] dark:text-[#8E8EA0] mb-4">
              <PackageCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#121217] dark:text-[#FFFFFF]">No orders found</h3>
            <p className="mt-2 text-sm text-[#4B5563] dark:text-[#8E8EA0]">No order matches the current status tab filters or search queries.</p>
          </div>
        )}

        <div className="space-y-8">
          {filteredAndSortedOrders.map((order, index) => {
            const isHighlighted = highlightOrderId && String(order.orderId) === String(highlightOrderId);
            const formattedDate = new Date(order.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
            const isCancellable = !["shipped", "out for delivery", "delivered", "cancelled", "return pending", "return requested", "returned", "return approved"].includes(String(order.status).toLowerCase());
            const items = order.items || [];
            const orderIndexNum = filteredAndSortedOrders.length - index;

            return (
              <div key={order.orderId || index} className="space-y-2">
                {/* ORDER SEPARATOR HEADER (OUTSIDE CARD COMPONENT) */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#4F7CFF]" />
                    <span className="text-xs font-black uppercase tracking-widest text-[#4F7CFF] dark:text-indigo-400">
                      Order #{orderIndexNum}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#7A7D89] dark:text-[#8E8EA0]">
                    {items.length} Product{items.length > 1 ? "s" : ""}
                  </span>
                </div>

                {/* SINGLE ORDER CARD */}
                <div
                  className={`order-group-${order.orderId} group rounded-md bg-[#ECEFF5] hover:bg-[#E3E8F2] dark:bg-[#12121A] dark:hover:bg-[#0C0C12] overflow-hidden text-left shadow-xs hover:shadow-md transition-shadow duration-200 ${ isHighlighted ? "ring-2 ring-[#4F7CFF]/50" : "" }`}
                >
                  {/* 1. SINGLE ORDER HEADER BAR */}
                  <div className="bg-[#DFE4EE] group-hover:bg-[#D4DAE8] dark:bg-[#0A0A10] dark:group-hover:bg-[#050508] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition-colors duration-200">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#7A7D89] dark:text-[#8E8EA0] block">Order Placed</span>
                        <span className="font-extrabold text-[#121217] dark:text-[#FFFFFF]">{formattedDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#7A7D89] dark:text-[#8E8EA0] block">Total Amount</span>
                        <span className="font-black text-[#121217] dark:text-[#FFFFFF]">₹{order.amount?.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#7A7D89] dark:text-[#8E8EA0] block">Order ID</span>
                        <span className="font-mono font-extrabold text-[#4F7CFF] dark:text-indigo-400 uppercase">#{String(order.orderNumber || order.orderId).slice(-8).toUpperCase()}</span>
                      </div>
                    </div>

                  {/* Right Header Status Pill & Primary Details Link */}
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      order.status === "Delivered" ? "bg-emerald-100/70 dark:bg-emerald-950/50 text-[#15803D] dark:text-[#22C55E]" : order.status === "Cancelled" ? "bg-rose-100/70 dark:bg-rose-950/50 text-[#B91C1C] dark:text-[#EF4444]" : "bg-blue-100/70 dark:bg-indigo-950/50 text-[#1D4ED8] dark:text-indigo-400"
                    }`}>
                      {order.status}
                    </span>
                    <button
                      onClick={() => navigate(`/order/${order.orderId}`)}
                      className="px-3.5 py-1.5 rounded-md bg-[#4F7CFF] hover:bg-[#3b67e6] text-white text-xs font-black uppercase tracking-wider transition-colors duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Eye size={13} />
                      <span>View Order</span>
                    </button>
                  </div>
                </div>

                {/* 2. ORDER PRODUCTS LIST (All 3-4 Products Inside Single Card) */}
                <div className="p-4 sm:p-5 space-y-4">
                  {items.map((item, idx) => {
                    const imageUrl = item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`;
                    const returnRequest = getReturnRequest(item);
                    const stLower = (item.status || "").toLowerCase();
                    const canRequestReturn =
                      (stLower === "delivered" || stLower === "completed") &&
                      !returnRequest &&
                      !["return pending", "return requested", "returned", "cancelled"].includes(stLower);

                    return (
                      <div key={item._id || idx} className="pt-2 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <Link
                            to={`/product/${item.productId}`}
                            className="h-16 w-16 rounded-md bg-[#FFFFFF] dark:bg-slate-900 p-1 shrink-0 flex items-center justify-center cursor-pointer hover:border-[#4F7CFF] transition shadow-2xs"
                          >
                            <img src={imageUrl} alt={item.name} className="h-full w-full object-contain rounded-sm" />
                          </Link>

                          <div className="min-w-0">
                            <Link
                              to={`/product/${item.productId}`}
                              className="text-sm font-black text-[#121217] dark:text-white hover:text-[#4F7CFF] dark:hover:text-indigo-400 transition line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#4B5563] font-semibold">
                              <span>Qty: {item.qty}</span>
                              <span>·</span>
                              <span>Size: {item.size}</span>
                              <span>·</span>
                              <span className="font-bold text-[#121217] dark:text-slate-200">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                              <span>·</span>
                              <span className="text-[10px] text-[#7A7D89]">Seller: {item.shopName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Item Status & Individual Item Action */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] font-bold px-2.5 py-1 rounded-md bg-[#DFE4EE] dark:bg-[#20202A] text-[#121217] dark:text-[#CFCFD8] uppercase">
                            {item.status}
                          </span>

                          {(() => {
                            const itemRma = rmaList.find(
                              (r) =>
                                String(r.orderItemId) === String(item._id || item.orderItemId || item.id) ||
                                (String(r.orderId) === String(order.orderId) && String(r.productId) === String(item.productId))
                            );
                            if (itemRma) {
                              return (
                                <button
                                  onClick={() => navigate(`/rma/${itemRma._id}`)}
                                  className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border border-purple-200 dark:border-purple-900/50 shadow-2xs"
                                >
                                  <RefreshCw size={11} className="animate-spin" />
                                  <span>RMA #{itemRma.rmaNumber}</span>
                                </button>
                              );
                            }

                            if (canRequestReturn) {
                              return (
                                <button
                                  onClick={() => openReturnModal(item)}
                                  className="px-2.5 py-1 rounded-md bg-amber-100/70 dark:bg-amber-950/40 text-[#B45309] dark:text-[#F59E0B] text-[10px] font-black uppercase transition cursor-pointer"
                                >
                                  Return
                                </button>
                              );
                            }
                            return null;
                          })()}

                          <button
                            onClick={() => navigate(`/product/${item.productId}`)}
                            className="px-2.5 py-1 rounded-md bg-blue-100/70 dark:bg-indigo-950/40 text-[#1D4ED8] dark:text-[#4F7CFF] text-[10px] font-black uppercase transition cursor-pointer"
                          >
                            Buy Again
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3. ORDER FOOTER BAR */}
                <div className="bg-[#DFE4EE] group-hover:bg-[#D4DAE8] dark:bg-[#0A0A10] dark:group-hover:bg-[#050508] p-4 flex flex-wrap items-center justify-between gap-3 transition-colors duration-200">
                  {/* Delivery Verification Code OTP */}
                  {order.verificationCode && order.status !== "Delivered" && order.status !== "Cancelled" ? (
                    <div className="flex items-center gap-2">
                      <KeyRound size={14} className="text-[#F59E0B] animate-pulse" />
                      <span className="font-bold text-xs text-[#F59E0B]">Delivery Key:</span>
                      <span className="font-mono font-black text-sm tracking-widest bg-amber-500/10 text-[#F59E0B] px-2 py-0.5 rounded-md border border-amber-500/20">
                        {order.verificationCode}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-[#7A7D89] font-semibold">
                      Payment: <strong className="uppercase text-[#121217] dark:text-slate-200">{order.paymentMethod}</strong> ({order.payment ? "Paid" : "Pending"})
                    </div>
                  )}

                  {/* Actions Suite */}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => navigate(`/track/${order.orderId}`)}
                      className="px-3 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Truck size={13} />
                      <span>Track Order</span>
                    </button>

                    <button
                      onClick={() => navigate(`/order/${order.orderId}#chat`)}
                      className="px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-xs font-bold text-[#22C55E] dark:text-emerald-400 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      <span>Order Chat</span>
                    </button>

                    <button
                      onClick={() => downloadInvoice(order.orderId)}
                      className="px-3 py-1.5 rounded-md bg-[#FFFFFF] dark:bg-[#18181F] text-xs font-bold text-[#4B5563] dark:text-[#CFCFD8] flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <FileText size={13} className="text-[#4F7CFF]" />
                      <span>Invoice</span>
                    </button>

                    {isCancellable ? (
                      <button
                        onClick={() => openCancelModal(order.orderId)}
                        className="px-3 py-1.5 rounded-md bg-rose-50 dark:bg-rose-950/30 text-xs font-bold text-[#EF4444] dark:text-rose-400 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <XCircle size={13} />
                        <span>Cancel Order</span>
                      </button>
                    ) : String(order.status).toLowerCase() === "cancelled" ? (
                      <span className="px-3 py-1.5 rounded-md bg-rose-100/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5">
                        <XCircle size={13} />
                        <span>Cancelled</span>
                      </span>
                    ) : null}
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
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition cursor-pointer"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500"
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

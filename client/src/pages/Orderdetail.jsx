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
} from "lucide-react";
import { backendUrl } from "../config";
import { useLanguage } from "../context/LanguageContext";

const Orderdetail = () => {
  const [orderData, setOrderData] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [returnForm, setReturnForm] = useState({
    reason: "Wrong item delivered",
    feedback: "",
  });
  const [deliveryVerificationKey, setDeliveryVerificationKey] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { t } = useLanguage();
  const highlightOrderId = new URLSearchParams(location.search).get("orderId");

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    const [orderResponse, returnResponse, profileResponse] = await Promise.all([
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
    ]);

    if (profileResponse.data.success) {
      setDeliveryVerificationKey(profileResponse.data.user.deliveryVerificationKey);
    }

    if (orderResponse.data.success) {
      const allOrdersItem = [];

      orderResponse.data.orders.forEach((order) => {
        order.items.forEach((item) => {
          allOrdersItem.push({
            ...item,
            orderId: order._id,
            status: order.orderStatus,
            payment: order.paymentStatus === "paid",
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
        toast.success("Order cancelled successfully!");
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
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="space-y-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 w-full bg-slate-200 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800" />
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
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer"
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
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-550 text-xs font-bold uppercase tracking-wider text-white transition active:scale-95 cursor-pointer shadow-md"
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
                  <div className="grid gap-6 lg:grid-cols-[112px_1fr_200px] lg:items-center">
                    
                    {/* Left: Product Thumbnail — click to view product */}
                    <Link
                      to={`/product/${item.productId}`}
                      title="View product"
                      className="relative h-28 w-28 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-2 group-hover:scale-[1.02] transition-all duration-300 shrink-0 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md hover:shadow-orange-500/10 cursor-pointer"
                    >
                      <img
                        src={item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`}
                        alt={item.name}
                        className="h-full w-full rounded-lg object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 flex items-end justify-center pb-1.5 opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">View</span>
                      </span>
                    </Link>

                    {/* Middle: Details */}
                    <div>
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <Link
                            to={`/product/${item.productId}`}
                            className="group/name inline-block text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-150"
                          >
                            {item.name}
                            <span className="block h-0.5 max-w-0 bg-orange-500 transition-all duration-300 group-hover/name:max-w-full rounded-full" />
                          </Link>
                          <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200/50 dark:border-slate-700/50">Qty {item.qty}</span>
                            <span>·</span>
                            <span className="font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200/50 dark:border-slate-700/50">Size {item.size}</span>
                          </div>
                        </div>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-right">
                          ₹{(item.price * item.qty).toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Info Badges */}
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-1">
                          <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
                          <span>{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </span>

                        {/* Order Status Badge */}
                        {(() => {
                          let bg = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
                          let icon = <Clock className="h-3.5 w-3.5" />;
                          if (item.status === "Delivered") {
                            bg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
                            icon = <CheckCircle2 className="h-3.5 w-3.5" />;
                          } else if (item.status === "Cancelled") {
                            bg = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
                            icon = <XCircle className="h-3.5 w-3.5" />;
                          }
                          return (
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${bg}`}>
                              {icon}
                              <span>{item.status}</span>
                            </span>
                          );
                        })()}

                        {/* Payment Status Badge */}
                        {item.payment ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Paid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-1">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                            <span>Payment Pending</span>
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-1">
                          <CreditCard className="h-3.5 w-3.5 text-slate-500" />
                          <span>{item.paymentMethod.toUpperCase()}</span>
                        </span>

                        {returnRequest && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-550/20 px-2.5 py-1">
                            <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                            <span>Return {returnRequest.status}</span>
                          </span>
                        )}
                      </div>

                      {/* Return Details Expansion */}
                      {returnRequest && (
                        <div className="mt-4 rounded-xl bg-orange-500/5 border border-orange-500/10 dark:border-orange-500/20 p-4 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-orange-700 dark:text-orange-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>RETURN DETAIL ({returnRequest.status.toUpperCase()})</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">
                            <strong className="text-slate-700 dark:text-slate-300">Reason:</strong> {returnRequest.reason}
                          </p>
                          {returnRequest.feedback && (
                            <p className="text-slate-600 dark:text-slate-400">
                              <strong className="text-slate-700 dark:text-slate-300">Your note:</strong> {returnRequest.feedback}
                            </p>
                          )}
                          {returnRequest.adminNote && (
                            <div className="mt-2.5 pt-2 border-t border-orange-500/10 dark:border-orange-500/20 text-slate-700 dark:text-slate-300">
                              <strong className="text-orange-700 dark:text-orange-400 font-bold">Admin response:</strong> {returnRequest.adminNote}
                            </div>
                          )}
                        </div>
                      )}

                      <p className="mt-4 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        Order ID: <span className="font-mono">{item.orderId}</span>
                      </p>

                      {/* Delivery Verification Code (only shown for active orders) */}
                      {item.verificationCode && item.status !== "Delivered" && item.status !== "Cancelled" && (
                        <div className="mt-3 rounded-xl border border-amber-200/65 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/15 p-3 text-left space-y-2">
                          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-405 font-bold">
                            <KeyRound size={13} className="shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-wider">User Secret Key for Delivery</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                            Provide this secret key to the delivery agent to verify and complete your delivery. Do not share it until you receive the package.
                          </p>
                          <div className="flex items-center justify-between bg-white dark:bg-slate-900/50 rounded-xl border border-amber-200/50 dark:border-amber-800/30 px-3 py-2 shadow-inner">
                            <span className="font-mono text-base font-black tracking-[0.25em] text-amber-700 dark:text-amber-305 select-all">
                              {item.verificationCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(item.verificationCode);
                                setCopiedCodeId(item.orderId);
                                toast.success("Secret key copied!");
                                setTimeout(() => setCopiedCodeId(null), 2000);
                              }}
                              className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                              title="Copy Secret Key"
                            >
                              {copiedCodeId === item.orderId ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                              <span>{copiedCodeId === item.orderId ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Delivery Deadline Badge */}
                      {(() => {
                        const dl = getDeadlineInfo(item.date, item.status);
                        if (!dl) return null;
                        const ds = deadlineStyles[dl.level];
                        return (
                          <div className={`mt-2 flex items-center gap-2 rounded-xl border px-3 py-2 ${ds.badge}`}>
                            {dl.level === "overdue" || dl.level === "critical"
                              ? <AlertTriangle size={13} className={`shrink-0 ${ds.icon}`} />
                              : <AlarmClock size={13} className={`shrink-0 ${ds.icon}`} />
                            }
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest">Delivery Deadline</p>
                              <p className="font-extrabold text-xs leading-tight">{dl.label}</p>
                              <p className="text-[10px] font-semibold opacity-70">{dl.sublabel}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Right: Actions Column */}
                    <div className="flex flex-col gap-2.5 lg:w-full">
                      {returnRequest ? (
                        <button
                          onClick={() =>
                            navigate(`/track/${item.orderId}`, { state: { item, returnRequest, initialTab: "return" } })
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-550 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orange-500/10 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>{t("track_return")}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            navigate(`/track/${item.orderId}`, { state: { item } })
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-850 dark:bg-orange-600 dark:hover:bg-orange-550 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                        >
                          <Truck className="h-4 w-4" />
                          <span>{t("track_order")}</span>
                        </button>
                      )}

                      {canRequestReturn && (
                        <button
                          onClick={() => openReturnModal(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-all active:scale-95 cursor-pointer"
                        >
                          <RotateCcw className="h-4 w-4 text-orange-500" />
                          <span>{t("request_return")}</span>
                        </button>
                      )}

                      {/* Cancel Order Button */}
                      {item.status !== "Delivered" && item.status !== "Cancelled" && (
                        <button
                          onClick={() => handleCancelOrder(item.orderId)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-250 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-rose-650 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-350 dark:hover:border-rose-700 transition-all active:scale-95 cursor-pointer"
                        >
                          <XCircle className="h-4 w-4 text-rose-500" />
                          <span>Cancel Order</span>
                        </button>
                      )}

                      <button
                        onClick={() => navigate("/help")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all active:scale-95 cursor-pointer"
                      >
                        <Headset className="h-4 w-4" />
                        <span>{t("get_support")}</span>
                      </button>
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
                <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Item: {selectedReturnItem.name}</p>
              </div>
              <button
                onClick={() => setSelectedReturnItem(null)}
                className="rounded-xl h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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

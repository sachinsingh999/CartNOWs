import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import {
  ArrowLeft,
  RefreshCw,
  Truck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  QrCode,
  Box,
  CreditCard,
  PackageCheck,
  Building,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const buildDynamicTimeline = (rma) => {
  const returnType = rma.returnType || rma.requestId?.returnType || "Refund";
  const rmaStatus = rma.status || rma.rmaStatus || "Pending Review";
  const qcStatus = rma.inspectionStatus || "Pending";
  const refundStatus = rma.refund?.status || rma.refundId?.refundStatus || "Pending";
  const deliveryStatus = rma.shipment?.status || rma.exchangeId?.deliveryStatus || "Reserved";

  let returnSteps = [];

  if (rmaStatus === "Rejected") {
    returnSteps = [
      { title: "Return Request Submitted", status: "completed", desc: "Customer submitted return claim." },
      { title: "Return Request Rejected", status: "rejected", desc: rma.sellerNotes || rma.adminNotes || "Request declined by merchant." }
    ];
    return { returnType, section1: returnSteps, section2: null };
  }

  if (rmaStatus === "Cancelled") {
    returnSteps = [
      { title: "Return Request Created", status: "completed", desc: "Return request initialized." },
      { title: "Return Cancelled", status: "cancelled", desc: "Return process was cancelled." }
    ];
    return { returnType, section1: returnSteps, section2: null };
  }

  const isPickupScheduledDone = ["Pickup Scheduled", "Out for Pickup", "Picked Up", "Inspection Passed", "Inspection Failed", "Refund Initiated", "Replacement Packed", "Replacement Shipped", "Completed"].includes(rmaStatus);
  const isPickedUpDone = ["Picked Up", "Inspection Passed", "Inspection Failed", "Refund Initiated", "Replacement Packed", "Replacement Shipped", "Completed"].includes(rmaStatus);
  const isWarehouseReceivedDone = ["Inspection Passed", "Inspection Failed", "Refund Initiated", "Replacement Packed", "Replacement Shipped", "Completed"].includes(rmaStatus);
  const isQcDone = ["Inspection Passed", "Refund Initiated", "Replacement Packed", "Replacement Shipped", "Completed"].includes(rmaStatus);
  const isQcFailed = qcStatus === "Failed" || rmaStatus === "Inspection Failed";

  returnSteps = [
    {
      title: `${returnType} Approved`,
      status: "completed",
      desc: `Return Order #${rma.rmaNumber || String(rma._id).slice(-8).toUpperCase()} initialized.`
    },
    {
      title: "Pickup Scheduled",
      status: isPickupScheduledDone ? "completed" : rmaStatus === "RMA Created" ? "active" : "pending",
      desc: rma.pickupScheduledDate ? `Courier: ${rma.pickupCourier || 'Express Shipping'}` : "Assigning pickup executive..."
    },
    {
      title: "Item Picked Up",
      status: isPickedUpDone ? "completed" : rmaStatus === "Out for Pickup" ? "active" : "pending",
      desc: isPickedUpDone ? "Verified via doorstep OTP." : "Executive out for collection."
    },
    {
      title: "Received at Warehouse",
      status: isWarehouseReceivedDone ? "completed" : rmaStatus === "Picked Up" ? "active" : "pending",
      desc: isWarehouseReceivedDone ? `Facility ${rma.warehouseId || 'WH-MAIN-01'}` : "In transit to facility."
    },
    {
      title: isQcFailed ? "Quality Check Failed" : "Quality Check Passed",
      status: isQcFailed ? "failed" : isQcDone ? "completed" : isWarehouseReceivedDone ? "active" : "pending",
      desc: isQcFailed ? (rma.inspectionNotes || "Item damaged during inspection.") : isQcDone ? "Verified authentic & undamaged." : "Pending inspection."
    }
  ];

  if (isQcFailed) {
    return { returnType, section1: returnSteps, section2: null };
  }

  let outcomeTitle = "REFUND";
  let outcomeSubtitle = "Financial Credit";
  let outcomeSteps = [];

  if (returnType === "Refund") {
    outcomeTitle = "REFUND";
    outcomeSubtitle = "Credit Progress";

    const isInitiatedDone = ["Processing", "Successful"].includes(refundStatus) || ["Refund Initiated", "Completed"].includes(rmaStatus);
    const isProcessingDone = refundStatus === "Successful" || rmaStatus === "Completed";
    const isCreditedDone = refundStatus === "Successful" || rmaStatus === "Completed";

    outcomeSteps = [
      {
        title: "Refund Initiated",
        status: isInitiatedDone ? "completed" : rmaStatus === "Refund Initiated" ? "active" : "pending",
        desc: "Ledger opened for finance."
      },
      {
        title: "Refund Processing",
        status: isProcessingDone ? "completed" : (refundStatus === "Processing" || rmaStatus === "Refund Initiated") ? "active" : "pending",
        desc: "Gateway processing payment."
      },
      {
        title: "Money Credited",
        status: isCreditedDone ? "completed" : refundStatus === "Processing" ? "active" : "pending",
        desc: isCreditedDone ? `₹${rma.refund?.amount || rma.amount} credited to source account.` : "Awaiting settlement."
      }
    ];
  } else if (returnType === "Replacement") {
    outcomeTitle = "REPLACEMENT";
    outcomeSubtitle = "Fulfillment";

    const isReservedDone = ["Packing", "Shipped", "Out for Delivery", "Delivered"].includes(deliveryStatus) || ["Replacement Packed", "Replacement Shipped", "Completed"].includes(rmaStatus);
    const isPackedDone = ["Shipped", "Out for Delivery", "Delivered"].includes(deliveryStatus) || ["Replacement Shipped", "Completed"].includes(rmaStatus);
    const isShippedDone = ["Out for Delivery", "Delivered"].includes(deliveryStatus) || rmaStatus === "Completed";
    const isOutDone = deliveryStatus === "Out for Delivery" || deliveryStatus === "Delivered" || rmaStatus === "Completed";
    const isDeliveredDone = deliveryStatus === "Delivered" || rmaStatus === "Completed";

    outcomeSteps = [
      {
        title: "Replacement Reserved",
        status: isReservedDone ? "completed" : "active",
        desc: "Reserved in stock."
      },
      {
        title: "Replacement Packed",
        status: isPackedDone ? "completed" : deliveryStatus === "Packing" ? "active" : "pending",
        desc: "Packed at facility."
      },
      {
        title: "Replacement Shipped",
        status: isShippedDone ? "completed" : deliveryStatus === "Shipped" ? "active" : "pending",
        desc: rma.shipment?.trackingNumber ? `Dispatched (Tracking #${rma.shipment.trackingNumber}).` : "Dispatched via express."
      },
      {
        title: "Replacement Delivered",
        status: isDeliveredDone ? "completed" : isOutDone ? "active" : "pending",
        desc: "Delivered to customer."
      }
    ];
  } else if (returnType === "Exchange") {
    const variantSize = rma.requestedVariant?.size || rma.requestedVariant?.requestedSize || rma.exchangeId?.replacementVariant?.size || "New Size";
    const variantLabel = `Size ${variantSize}`;
    outcomeTitle = "EXCHANGE";
    outcomeSubtitle = `Swap to ${variantLabel}`;

    const isReservedDone = ["Packing", "Shipped", "Out for Delivery", "Delivered"].includes(deliveryStatus) || ["Replacement Packed", "Replacement Shipped", "Completed"].includes(rmaStatus);
    const isPackedDone = ["Shipped", "Out for Delivery", "Delivered"].includes(deliveryStatus) || ["Replacement Shipped", "Completed"].includes(rmaStatus);
    const isShippedDone = ["Out for Delivery", "Delivered"].includes(deliveryStatus) || rmaStatus === "Completed";
    const isOutDone = deliveryStatus === "Out for Delivery" || deliveryStatus === "Delivered" || rmaStatus === "Completed";
    const isDeliveredDone = deliveryStatus === "Delivered" || rmaStatus === "Completed";

    outcomeSteps = [
      {
        title: `${variantLabel} Reserved`,
        status: isReservedDone ? "completed" : "active",
        desc: "Reserved in inventory."
      },
      {
        title: `${variantLabel} Packed`,
        status: isPackedDone ? "completed" : deliveryStatus === "Packing" ? "active" : "pending",
        desc: "Packed at facility."
      },
      {
        title: `${variantLabel} Shipped`,
        status: isShippedDone ? "completed" : deliveryStatus === "Shipped" ? "active" : "pending",
        desc: rma.shipment?.trackingNumber ? `Dispatched (Tracking #${rma.shipment.trackingNumber}).` : "Dispatched via express."
      },
      {
        title: `${variantLabel} Delivered`,
        status: isDeliveredDone ? "completed" : isOutDone ? "active" : "pending",
        desc: "Delivered to customer."
      }
    ];
  }

  return { returnType, section1: returnSteps, section2: { title: outcomeTitle, subtitle: outcomeSubtitle, steps: outcomeSteps } };
};

const RMADetail = () => {
  const { rmaId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [rma, setRma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const fetchRMADetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/rms/rma/${rmaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setRma(res.data.rma);
      } else {
        toast.error(res.data.message || "Failed to load Return Order details");
      }
    } catch (error) {
      console.error("Error fetching RMA details:", error);
      toast.error(error.response?.data?.message || "Error loading RMA details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rmaId && token) {
      fetchRMADetails();
    }
  }, [rmaId, token]);

  useEffect(() => {
    if (!rmaId || !token) return;

    const socket = io(backendUrl, {
      auth: { token },
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join_rma_room", { rmaId });
    });

    socket.on("rma:status_updated", (data) => {
      toast.info(`RMA Update: ${data.status}`);
      fetchRMADetails();
    });

    socket.on("rma:refund_updated", () => {
      fetchRMADetails();
    });

    socket.on("rma:qc_updated", () => {
      fetchRMADetails();
    });

    socket.on("rma:shipment_updated", () => {
      fetchRMADetails();
    });

    return () => {
      socket.disconnect();
    };
  }, [rmaId, token]);

  const handleCopyOtp = () => {
    if (!rma?.pickupVerificationCode) return;
    navigator.clipboard.writeText(rma.pickupVerificationCode);
    setCopiedOtp(true);
    toast.success("Doorstep Pickup OTP copied!");
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-8">
        <div className="w-full max-w-[1300px] mx-auto animate-pulse">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        </div>
      </div>
    );
  }

  if (!rma) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-16 flex flex-col items-center justify-center text-center">
        <AlertCircle size={40} className="text-rose-500 mb-3" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Return Order Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">The requested RMA record does not exist or you do not have permission.</p>
        <button
          onClick={() => navigate("/orderdetail")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-sm text-xs uppercase tracking-wider transition"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isCompleted = rma.status === "Completed";
  const isFailed = rma.status === "Inspection Failed";
  const timelineData = buildDynamicTimeline(rma);
  const returnType = rma.returnType || "Refund";

  const themeBadge =
    returnType === "Exchange"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
      : returnType === "Replacement"
      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";

  // Stage Calculation for Horizontal Master Progress Bar
  const rmaStatus = rma.status || "";
  const getStageIndex = () => {
    if (rmaStatus === "Completed") return 3;
    if (["Inspection Passed", "Refund Initiated", "Replacement Packed", "Replacement Shipped"].includes(rmaStatus)) return 2;
    if (["Pickup Scheduled", "Out for Pickup", "Picked Up"].includes(rmaStatus)) return 1;
    return 0;
  };
  const activeStage = getStageIndex();
  const stages = [
    { label: "Approved", desc: "Claim Accepted" },
    { label: "Reverse Pickup", desc: "Doorstep OTP" },
    { label: "QC Inspection", desc: "Warehouse" },
    { label: returnType === "Refund" ? "Refund Credited" : `${returnType} Fulfilled`, desc: "Completed" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D14] px-4 sm:px-6 lg:px-8 py-6 text-left transition-colors duration-200 text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-[1350px] mx-auto">
        
        {/* ── SINGLE UNIFIED MASTER CONTAINER CARD ── */}
        <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 sm:p-6 shadow-xs space-y-6">
          
          {/* 1. HEADER ROW */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="h-8 w-8 rounded-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shrink-0 border border-slate-200/60 dark:border-slate-700/60"
                title="Back"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    RMA #{rma.rmaNumber || rma._id}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider ${themeBadge}`}>
                    {returnType}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex flex-wrap items-center gap-2">
                  <span>Order: <Link to={`/order/${rma.orderId}`} className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline inline-flex items-center gap-1">#{String(rma.orderId).slice(-8).toUpperCase()} <ExternalLink size={10} /></Link></span>
                  <span>·</span>
                  <span>Created: <strong className="text-slate-700 dark:text-slate-300">{new Date(rma.createdAt || rma.updatedAt || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} at {new Date(rma.createdAt || rma.updatedAt || Date.now()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-black uppercase tracking-wider ${
                isCompleted
                  ? "bg-emerald-600 text-white"
                  : isFailed
                  ? "bg-rose-600 text-white"
                  : "bg-indigo-600 text-white"
              }`}>
                {isCompleted ? <CheckCircle2 size={14} /> : isFailed ? <AlertCircle size={14} /> : <RefreshCw size={14} className="animate-spin" />}
                <span>{rma.status}</span>
              </span>
            </div>
          </div>

          {/* 2. HORIZONTAL HIGH-LEVEL STAGE PROGRESS BAR */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-sm border border-slate-200/80 dark:border-slate-800/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {stages.map((stg, idx) => {
                const isPast = idx < activeStage;
                const isCurrent = idx === activeStage;

                return (
                  <div key={stg.label} className="flex items-center gap-3 relative">
                    <div className={`h-8 w-8 rounded-sm flex items-center justify-center text-xs font-black shrink-0 transition ${
                      isPast || (isCurrent && isCompleted)
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                    }`}>
                      {isPast || (isCurrent && isCompleted) ? "✓" : idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-black uppercase tracking-tight truncate ${
                        isCurrent || isPast ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                      }`}>
                        {stg.label}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">{stg.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. PRODUCT & CLAIM STRIP */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-sm border border-slate-200/80 dark:border-slate-800/80 items-center">
            <div className="md:col-span-5 flex items-center gap-3">
              {rma.itemImage ? (
                <img src={rma.itemImage} alt={rma.itemName} className="h-12 w-12 object-cover rounded-sm border border-slate-200 dark:border-slate-800 shrink-0" />
              ) : (
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-sm flex items-center justify-center text-slate-400 shrink-0">
                  <Box size={20} />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Returned Product</span>
                <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">{rma.itemName}</h3>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>Qty: {rma.quantity}</span>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">₹{rma.amount?.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-4">
              <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Claim Reason</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {rma.requestId?.returnReason || rma.reason || "Defective / Size Issue"}
              </p>
            </div>

            <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-4">
              {rma.pickupVerificationCode && rma.status !== "Completed" ? (
                <div>
                  <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Pickup OTP</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-indigo-600 dark:text-indigo-400 tracking-wider">{rma.pickupVerificationCode}</span>
                    <button
                      onClick={handleCopyOtp}
                      className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-[10px] rounded-sm hover:bg-indigo-100 transition"
                    >
                      {copiedOtp ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">OTP Verification</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">✓ Customer Verified</span>
                </div>
              )}
            </div>
          </div>

          {/* 4. BALANCED DUAL-COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
            
            {/* Timeline Column (7 Cols) */}
            <div className="lg:col-span-7 space-y-5 pr-0 lg:pr-5 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-5 lg:pb-0">
              
              {/* Section 1 */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    <Truck size={15} className="text-indigo-600 dark:text-indigo-400" />
                    <span>SECTION 1: REVERSE LOGISTICS</span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Pickup
                  </span>
                </div>

                <div className="relative pl-5 space-y-3 mt-3 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {timelineData.section1.map((step, idx) => {
                    const isDone = step.status === "completed";
                    const isActive = step.status === "active";
                    const isFailed = step.status === "failed" || step.status === "rejected";

                    return (
                      <div key={idx} className="relative text-left">
                        <div className={`absolute -left-5 top-1 h-2.5 w-2.5 rounded-full ${
                          isFailed
                            ? "bg-rose-500"
                            : isDone
                            ? "bg-emerald-500"
                            : isActive
                            ? "bg-indigo-500 ring-4 ring-indigo-500/20"
                            : "bg-slate-300 dark:bg-slate-700"
                        }`} />
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-extrabold uppercase tracking-wide ${
                            isFailed ? "text-rose-500" : isDone ? "text-emerald-500" : isActive ? "text-indigo-400" : "text-slate-400"
                          }`}>
                            {step.title}
                          </h4>
                          {isDone && <span className="text-[10px] font-bold text-emerald-500 uppercase">✓ Done</span>}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2 */}
              {timelineData.section2 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      {returnType === "Refund" ? (
                        <CreditCard size={15} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <PackageCheck size={15} className="text-amber-600 dark:text-amber-400" />
                      )}
                      <span>SECTION 2: {timelineData.section2.title}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${
                      returnType === "Refund"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {returnType}
                    </span>
                  </div>

                  <div className="relative pl-5 space-y-3 mt-3 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {timelineData.section2.steps.map((step, idx) => {
                      const isDone = step.status === "completed";
                      const isActive = step.status === "active";

                      return (
                        <div key={idx} className="relative text-left">
                          <div className={`absolute -left-5 top-1 h-2.5 w-2.5 rounded-full ${
                            isDone
                              ? "bg-emerald-500"
                              : isActive
                              ? "bg-indigo-500 ring-4 ring-indigo-500/20"
                              : "bg-slate-300 dark:bg-slate-700"
                          }`} />
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-extrabold uppercase tracking-wide ${
                              isDone ? "text-emerald-500" : isActive ? "text-indigo-400" : "text-slate-400"
                            }`}>
                              {step.title}
                            </h4>
                            {isDone && <span className="text-[10px] font-bold text-emerald-500 uppercase">✓ Done</span>}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Operations Ledger Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    <Truck size={14} />
                    <span>Reverse Logistics</span>
                  </div>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <p><strong className="text-slate-900 dark:text-white">Courier:</strong> {rma.pickupCourier || "Express Logistics"}</p>
                  <p><strong className="text-slate-900 dark:text-white">Tracking #:</strong> <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{rma.pickupTrackingNumber || "Pending Waybill"}</span></p>
                  {rma.deliverymanId && (
                    <p><strong className="text-slate-900 dark:text-white">Agent:</strong> {rma.deliverymanId.name || "Delivery Executive"}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    <Building size={14} />
                    <span>Warehouse Inspection</span>
                  </div>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <p><strong className="text-slate-900 dark:text-white">Facility:</strong> {rma.warehouseId || "WH-MAIN-01"}</p>
                  <p><strong className="text-slate-900 dark:text-white">QC Status:</strong> <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-sm ${rma.inspectionStatus === "Passed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : rma.inspectionStatus === "Failed" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>{rma.inspectionStatus || "Pending Inspection"}</span></p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {returnType === "Refund" ? <CreditCard size={14} /> : <PackageCheck size={14} />}
                    <span>{returnType === "Refund" ? "Financial Refund Ledger" : `${returnType} Details`}</span>
                  </div>
                </div>
                {returnType === "Refund" ? (
                  <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
                    <p><strong className="text-slate-900 dark:text-white">Amount:</strong> <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">₹{(rma.refund?.amount || rma.refundId?.amount || rma.amount)?.toLocaleString("en-IN")}</span></p>
                    <p><strong className="text-slate-900 dark:text-white">Status:</strong> <span className="font-black uppercase text-[10px] px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{rma.refund?.status || rma.refundId?.refundStatus || "Pending"}</span></p>
                  </div>
                ) : (
                  <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
                    <p><strong className="text-slate-900 dark:text-white">Variant:</strong> <span className="font-black text-amber-600 dark:text-amber-400">Size {rma.requestedVariant?.size || rma.exchangeId?.replacementVariant?.size || "Requested Size"}</span></p>
                    <p><strong className="text-slate-900 dark:text-white">Shipment:</strong> <span className="font-black uppercase text-[10px] px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400">{rma.shipment?.status || rma.exchangeId?.deliveryStatus || "Reserved"}</span></p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default RMADetail;

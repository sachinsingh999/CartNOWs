import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import {
  ArrowLeft,
  RefreshCw,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  QrCode,
  Box,
  CreditCard,
  PackageCheck,
  Building,
} from "lucide-react";
import { toast } from "react-toastify";

const RMADetail = () => {
  const { rmaId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [rma, setRma] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse text-left">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!rma) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-16 flex flex-col items-center justify-center text-center">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Return Order Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">The requested RMA record does not exist or you do not have permission to view it.</p>
        <button
          onClick={() => navigate("/orderdetail")}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isCompleted = rma.status === "Completed";
  const isFailed = rma.status === "Inspection Failed";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-8 text-left select-none transition-colors duration-200 text-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* ── Top Full-Width Master Header Bar ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-4 shrink-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="h-9 w-9 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shrink-0"
                title="Back"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    RMA #{rma.rmaNumber}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    rma.returnType === "Exchange"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {rma.returnType}
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Associated Order: <Link to={`/order/${rma.orderId}`} className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline">View Source Order</Link>
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-black uppercase tracking-wider ${
                isCompleted
                  ? "bg-emerald-600 text-white"
                  : isFailed
                  ? "bg-rose-600 text-white"
                  : "bg-indigo-600 text-white"
              }`}>
                {isCompleted ? <CheckCircle2 size={14} /> : <RefreshCw size={14} className="animate-spin" />}
                <span>{rma.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── 2-COLUMN FULL-WIDTH GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN: Product Banner, OTP Card, and Timeline (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Product Details Banner Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2.5">
                Item Details
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                {rma.itemImage ? (
                  <img src={rma.itemImage} alt={rma.itemName} className="h-20 w-20 object-cover rounded-md border border-slate-200 dark:border-slate-800 shrink-0" />
                ) : (
                  <div className="h-20 w-20 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center text-slate-400 shrink-0">
                    <Box size={28} />
                  </div>
                )}
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {rma.itemName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 mt-1.5">
                    <span className="bg-slate-200/60 dark:bg-slate-800 px-2.5 py-0.5 rounded text-slate-700 dark:text-slate-300">Qty: {rma.quantity}</span>
                    <span className="bg-slate-200/60 dark:bg-slate-800 px-2.5 py-0.5 rounded text-slate-700 dark:text-slate-300">Value: ₹{rma.amount?.toLocaleString("en-IN")}</span>
                    {rma.requestId?.returnReason && (
                      <span className="text-amber-600 dark:text-amber-400 font-extrabold">Reason: {rma.requestId.returnReason}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Doorstep Verification Code Card */}
              {rma.pickupVerificationCode && rma.status !== "Completed" && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                      <QrCode size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-100">Doorstep Pickup OTP</h4>
                      <p className="text-[10px] text-indigo-200 mt-0.5">Share code with executive during pickup</p>
                    </div>
                  </div>
                  <div className="bg-white text-indigo-900 px-5 py-2 rounded-md font-mono text-2xl font-black tracking-widest shadow-xs">
                    {rma.pickupVerificationCode}
                  </div>
                </div>
              )}
            </div>

            {/* RMA Step-by-Step Vertical Timeline Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                <Clock size={16} className="text-indigo-600" />
                <span>Return Lifecycle Timeline</span>
              </div>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {(rma.timeline || []).map((evt, idx) => (
                  <div key={idx} className="relative text-left">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-600 shadow-xs" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
                        {evt.status}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-snug">
                      {evt.description}
                    </p>
                    <span className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 mt-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                      Actor: {evt.actorRole}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Reverse Logistics, Inspection, and Financial Ledger (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Reverse Pickup Logistics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Truck size={15} />
                <span>Reverse Logistics</span>
              </div>
              <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 font-medium">
                <p><strong className="text-slate-900 dark:text-white">Courier:</strong> {rma.pickupCourier}</p>
                <p><strong className="text-slate-900 dark:text-white">Tracking #:</strong> {rma.pickupTrackingNumber || "Pending Waybill"}</p>
                <p><strong className="text-slate-900 dark:text-white">Scheduled Date:</strong> {rma.pickupScheduledDate ? new Date(rma.pickupScheduledDate).toLocaleDateString() : "To be assigned"}</p>
                {rma.deliverymanId && (
                  <p><strong className="text-slate-900 dark:text-white">Assigned Agent:</strong> {rma.deliverymanId.name || "Delivery Partner"}</p>
                )}
              </div>
            </div>

            {/* Warehouse Quality Control */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <Building size={15} />
                <span>Warehouse Inspection</span>
              </div>
              <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 font-medium">
                <p><strong className="text-slate-900 dark:text-white">Facility:</strong> {rma.warehouseId}</p>
                <p><strong className="text-slate-900 dark:text-white">QC Status:</strong> <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{rma.inspectionStatus}</span></p>
                {rma.inspectionNotes && (
                  <p><strong className="text-slate-900 dark:text-white">QC Notes:</strong> {rma.inspectionNotes}</p>
                )}
              </div>
            </div>

            {/* Financial Refund / Exchange Ledger */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {rma.returnType === "Exchange" ? <PackageCheck size={15} /> : <CreditCard size={15} />}
                <span>{rma.returnType === "Exchange" ? "Exchange Shipment" : "Refund Ledger"}</span>
              </div>
              {rma.returnType === "Refund" ? (
                <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 font-medium">
                  <p><strong className="text-slate-900 dark:text-white">Refund Amount:</strong> ₹{rma.refundId?.amount || rma.amount}</p>
                  <p><strong className="text-slate-900 dark:text-white">Status:</strong> <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{rma.refundId?.refundStatus || "Pending"}</span></p>
                  {rma.refundId?.gatewayRefundId && (
                    <p><strong className="text-slate-900 dark:text-white">Gateway Ref:</strong> {rma.refundId.gatewayRefundId}</p>
                  )}
                </div>
              ) : (
                <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 font-medium">
                  <p><strong className="text-slate-900 dark:text-white">Replacement Variant:</strong> {rma.exchangeId?.replacementVariant?.size || "Requested Size"}</p>
                  <p><strong className="text-slate-900 dark:text-white">Shipment Status:</strong> <span className="font-extrabold text-amber-600 dark:text-amber-400">{rma.exchangeId?.deliveryStatus || "Reserved"}</span></p>
                  {rma.exchangeId?.trackingNumber && (
                    <p><strong className="text-slate-900 dark:text-white">Tracking #:</strong> {rma.exchangeId.trackingNumber}</p>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default RMADetail;

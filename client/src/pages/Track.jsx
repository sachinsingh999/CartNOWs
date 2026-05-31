import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Copy, 
  HelpCircle, 
  MapPin, 
  Package, 
  RotateCcw,
  ShieldCheck, 
  Truck, 
  Warehouse 
} from "lucide-react";
import { toast } from "react-toastify";

const steps = [
  {
    title: "Order Placed",
    description: "Your order has been registered and is awaiting warehouse processing.",
    icon: CheckCircle2,
  },
  {
    title: "Packed",
    description: "Items have been inspected, packed securely, and are ready for carrier pickup.",
    icon: Warehouse,
  },
  {
    title: "Shipped",
    description: "Your package is in transit with our logistics partner towards your destination.",
    icon: Truck,
  },
  {
    title: "Out for Delivery",
    description: "A delivery associate is en route to deliver the package to your address today.",
    icon: MapPin,
  },
  {
    title: "Delivered",
    description: "Package was successfully handed over and signed for at the destination.",
    icon: Package,
  },
];

const Track = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;

  const statusMap = {
    "order placed": 0,
    packed: 1,
    shipped: 2,
    "out for delivery": 3,
    delivered: 4,
  };
  
  const currentStep = statusMap[item?.status?.toLowerCase()] ?? 0;

  const returnRequest = location.state?.returnRequest;
  const initialTab = location.state?.initialTab || "delivery";
  const [activeTab, setActiveTab] = useState(returnRequest ? initialTab : "delivery");
  const [copied, setCopied] = useState(false);

  const returnStatusMap = {
    requested: 0,
    approved: 1,
    rejected: 1,
    received: 2,
    refunded: 3,
  };

  const currentReturnStep = returnStatusMap[returnRequest?.status?.toLowerCase()] ?? 0;

  const returnSteps = [
    {
      title: "Return Requested",
      description: returnRequest?.createdAt 
        ? `Your return request was submitted on ${new Date(returnRequest.createdAt).toLocaleDateString()}.`
        : "Your return request has been submitted and is awaiting review.",
      icon: RotateCcw,
    },
    {
      title: returnRequest?.status === "Rejected" ? "Return Rejected" : "Return Approved",
      description: returnRequest?.status === "Rejected"
        ? (returnRequest.adminNote 
            ? `Reason: ${returnRequest.adminNote}` 
            : "Your return request was not approved.")
        : "The return request has been approved. A pickup is being scheduled.",
      icon: returnRequest?.status === "Rejected" ? HelpCircle : CheckCircle2,
    },
    {
      title: "Item Received",
      description: "The item has been received and inspected at our quality assurance facility.",
      icon: Warehouse,
    },
    {
      title: "Refund Processed",
      description: returnRequest?.status === "Refunded"
        ? `Refund of ₹${returnRequest.amount || (item.price * item.qty)} has been credited to your account.`
        : "The refund will be issued to your original payment method upon successful validation.",
      icon: ShieldCheck,
    },
  ];

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <HelpCircle size={48} className="text-slate-400 dark:text-slate-500 animate-bounce" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-4">Order tracking data not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-xl bg-slate-900 dark:bg-orange-606 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:hover:bg-orange-500 cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getEstimatedDate = () => {
    // Generate a mock delivery date 3 days after today's date for display
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const imageUrl = item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-4xl">
        
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="group mb-8 inline-flex items-center gap-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:border-slate-350 dark:hover:border-slate-700 hover:text-slate-955 dark:hover:text-slate-100 hover:shadow cursor-pointer"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to orders</span>
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          
          {/* LEFT SIDE: Shipment Timeline */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm dark:shadow-slate-950/20">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-8">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {activeTab === "return" ? "Return Progress Tracking" : "Live Shipment Tracking"}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Order Reference:</span>
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  {id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-200 transition cursor-pointer"
                  title="Copy Order ID"
                >
                  <Copy size={12} className={copied ? "text-emerald-500" : ""} />
                </button>
              </div>
            </div>

            {returnRequest && (
              <div className="flex border border-slate-100 dark:border-slate-800 mb-8 p-1 bg-slate-50 dark:bg-slate-955 rounded-xl">
                <button
                  onClick={() => setActiveTab("delivery")}
                  className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    activeTab === "delivery"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200/50 dark:border-slate-800"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                  }`}
                >
                  Delivery Tracking
                </button>
                <button
                  onClick={() => setActiveTab("return")}
                  className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    activeTab === "return"
                      ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200/50 dark:border-slate-800"
                      : "text-slate-400 hover:text-slate-655 dark:hover:text-slate-350"
                  }`}
                >
                  Return Tracking
                </button>
              </div>
            )}

            {/* Vertical timeline steps */}
            <div className="relative space-y-10">
              
              {/* Timeline Connector Line */}
              <div className="absolute left-[20px] -translate-x-1/2 top-5 bottom-5 w-0.5 bg-slate-105 dark:bg-slate-800 z-0">
                <div 
                  className={`w-full transition-all duration-700 ease-out ${
                    activeTab === "return" && returnRequest?.status === "Rejected"
                      ? "bg-red-500"
                      : "bg-gradient-to-b from-orange-500 to-amber-500"
                  }`} 
                  style={{
                    height: `${((activeTab === "return" ? currentReturnStep : currentStep) / ((activeTab === "return" ? returnSteps : steps).length - 1)) * 100}%`,
                  }}
                />
              </div>

              {(activeTab === "return" ? returnSteps : steps).map((step, idx) => {
                const StepIcon = step.icon;
                const activeCurrentStep = activeTab === "return" ? currentReturnStep : currentStep;
                const isCompleted = idx < activeCurrentStep;
                const isActive = idx === activeCurrentStep;
                const isPending = idx > activeCurrentStep;
                const isRejected = activeTab === "return" && returnRequest?.status === "Rejected";

                // Get dynamic border/background classes for step node circle
                let nodeStyleClass = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-350 dark:text-slate-600";
                if (isCompleted) {
                  nodeStyleClass = "bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900";
                } else if (isActive) {
                  if (isRejected && idx === 1) {
                    nodeStyleClass = "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600 dark:text-red-400 scale-110 shadow-sm shadow-red-100 dark:shadow-red-950/30";
                  } else {
                    nodeStyleClass = "bg-white dark:bg-slate-900 border-orange-500 text-orange-600 dark:text-orange-400 scale-110";
                  }
                }

                return (
                  <div key={idx} className="relative flex gap-6 items-start z-10">
                    
                    {/* Node circle */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                      {isActive && (
                        <span className={`absolute h-10 w-10 rounded-full animate-ping pointer-events-none ${
                          isRejected && idx === 1 ? "bg-red-400/20" : "bg-orange-400/20"
                        }`} />
                      )}
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-sm ${nodeStyleClass}`}
                      >
                        <StepIcon size={18} className={isActive ? "animate-pulse" : ""} />
                      </div>
                    </div>

                    {/* Step details */}
                    <div className="min-w-0 flex-1 pt-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold ${
                          isCompleted || isActive 
                            ? (isRejected && idx === 1 ? "text-red-700 dark:text-red-405" : "text-slate-900 dark:text-slate-50")
                            : "text-slate-400 dark:text-slate-500"
                        }`}>
                          {step.title}
                        </h3>
                        {isActive && (
                          <span className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            isRejected && idx === 1
                              ? "bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-red-650 dark:text-red-400"
                              : "bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400"
                          }`}>
                            {isRejected && idx === 1 ? "Rejected" : "Active"}
                          </span>
                        )}
                      </div>
                      <p className={`mt-1.5 text-xs leading-relaxed ${
                        isActive ? "text-slate-650 dark:text-slate-350 font-medium" : "text-slate-400 dark:text-slate-500"
                      }`}>
                        {step.description}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE: Info panel */}
          <div className="space-y-6">
            
            {/* Dynamic Status Card */}
            <div className={`rounded-2xl border p-6 shadow-sm ${
              activeTab === "return" 
                ? (returnRequest?.status === "Rejected" ? "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10" : "border-orange-200 dark:border-orange-900/50 bg-orange-50/30 dark:bg-orange-950/10")
                : "border-orange-200 dark:border-orange-900/50 bg-orange-50/30 dark:bg-orange-950/10"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${
                  activeTab === "return"
                    ? (returnRequest?.status === "Rejected" ? "bg-red-100 dark:bg-red-955/30 text-red-600 dark:text-red-400" : "bg-orange-100 dark:bg-orange-955/30 text-orange-600 dark:text-orange-400")
                    : "bg-orange-100 dark:bg-orange-955/30 text-orange-600 dark:text-orange-400"
                }`}>
                  {activeTab === "return" ? (
                    <RotateCcw size={20} />
                  ) : (
                    <Calendar size={20} />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-505 dark:text-slate-400 font-semibold">
                    {activeTab === "return" ? "Return Request Status" : "Estimated Delivery"}
                  </p>
                  <p className={`text-base font-extrabold mt-0.5 ${
                    activeTab === "return" && returnRequest?.status === "Rejected" ? "text-red-700 dark:text-red-400" : "text-slate-900 dark:text-slate-50"
                  }`}>
                    {activeTab === "return" 
                      ? (returnRequest?.status || "Requested")
                      : (currentStep === 4 ? "Delivered" : getEstimatedDate())}
                  </p>
                </div>
              </div>
            </div>

            {/* Product snapshot info card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-slate-950/20">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Item Details</h2>
              <div className="flex gap-4">
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="h-20 w-20 object-contain rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-805 p-2"
                />
                <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">{item.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-semibold">
                      Qty: {item.qty} · Size: <span className="font-bold">{item.size}</span>
                    </p>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400 dark:text-slate-505 font-bold">Subtotal:</span>
                    <span className="font-black text-sm text-slate-900 dark:text-slate-100">₹{item.price * item.qty}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipment/Return logistics details */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-805 bg-white dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-slate-950/20 space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {activeTab === "return" ? "Return Logistics" : "Logistics Summary"}
              </h2>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <p className="font-semibold text-slate-450 dark:text-slate-400">
                    {activeTab === "return" ? "Pickup Carrier" : "Carrier"}
                  </p>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    {activeTab === "return" ? "CartNOW Reverse Logistics" : "CartNOW Express"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-450 dark:text-slate-400">
                    {activeTab === "return" ? "Pickup Method" : "Shipping Method"}
                  </p>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    {activeTab === "return" ? "Free Home Pickup" : "Free Air Express"}
                  </p>
                </div>
                {activeTab === "return" ? (
                  <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <p className="font-semibold text-slate-450 dark:text-slate-400 font-bold">Return Reason</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-1.5 leading-relaxed">
                      {returnRequest?.reason || "Reason not specified"}
                    </p>
                    {returnRequest?.feedback && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic leading-relaxed">
                        "{returnRequest.feedback}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <p className="font-semibold text-slate-455 dark:text-slate-400">Delivery Address</p>
                    <p className="font-medium text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
                      123, Shopping Avenue, Fashion District, New Delhi, 110001
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                  <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{activeTab === "return" ? "Secured Refund" : "Verified Purchase"}</span>
                </span>
                <span className="font-extrabold text-slate-700 dark:text-slate-300 capitalize">
                  {activeTab === "return" ? "Original Source" : (item.paymentMethod || "Prepaid")}
                </span>
              </div>
            </div>

            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="w-full rounded-2xl bg-slate-950 dark:bg-orange-600 py-4 text-sm font-bold text-white transition hover:bg-slate-800 dark:hover:bg-orange-500 active:scale-98 shadow cursor-pointer"
            >
              Back to Orders
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Track;

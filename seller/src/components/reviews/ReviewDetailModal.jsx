import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  CornerDownRight,
  MessageSquare,
  Package,
  CheckCircle2,
  AlertCircle,
  Copy,
  Calendar,
  Sparkles,
  Send,
  Edit3,
  ThumbsUp,
  ShieldCheck,
  Tag,
  ExternalLink,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const QUICK_TEMPLATES = [
  {
    label: "🌟 High Quality & Delight",
    text: "Thank you so much for your wonderful review! We are delighted that you loved the quality and craftsmanship. Looking forward to serving you again soon! ✨"
  },
  {
    label: "🚚 Fast Delivery",
    text: "Glad our express delivery exceeded your expectations! Thank you for choosing CartNOW and for your fantastic support. 🚚💨"
  },
  {
    label: "🙏 Grateful & Appreciative",
    text: "We truly appreciate your feedback and high recommendation! Your satisfaction is our topmost priority. 🙏"
  },
  {
    label: "🛠️ Resolution & Support",
    text: "We sincerely apologize for any inconvenience caused. Our customer support team will get in touch with you immediately to ensure complete resolution. 🛠️"
  }
];

const ReviewDetailModal = ({
  isOpen,
  onClose,
  review,
  onSendReply,
  isSubmitting = false
}) => {
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (review) {
      setReplyText(review.reply || "");
    }
  }, [review]);

  if (!isOpen || !review) return null;

  const copyToClipboard = (text, label = "Review ID") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const reviewId = review._id || "";
  const matchedProduct = review.matchedProduct;
  const prodName = matchedProduct?.name || review.productName || "Product Item";
  const prodImage = matchedProduct?.images?.[0] || matchedProduct?.image?.[0] || null;
  const prodCategory = matchedProduct?.category || "Catalog Item";
  const prodPrice = matchedProduct?.price;
  const prodId = matchedProduct?._id || review.productId || "";

  const reviewDate = new Date(review.date || review.createdAt || Date.now()).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const reviewTime = new Date(review.date || review.createdAt || Date.now()).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const rating = Number(review.rating) || 5;

  const handleSave = async () => {
    if (!replyText.trim()) {
      toast.error("Reply text cannot be empty");
      return;
    }
    const success = await onSendReply(reviewId, prodId, replyText.trim());
    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left z-10"
        >
          {/* Top Modal Header */}
          <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Star size={20} className="fill-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                    Customer Review Inspection
                  </h2>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(reviewId, "Review ID")}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    title="Copy Review ID"
                  >
                    <Copy size={13} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Submitted on {reviewDate} at {reviewTime}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs">
            {/* 1. PRODUCT INFORMATION CARD */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                  {prodImage ? (
                    <img src={prodImage} alt={prodName} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <Package size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {prodName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {prodCategory}
                    </span>
                    {prodPrice && (
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 font-mono">
                        ₹{prodPrice}
                      </span>
                    )}
                    {prodId && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: #{String(prodId).slice(-6).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CUSTOMER FEEDBACK BREAKDOWN */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-500 text-white font-black text-xs flex items-center justify-center uppercase shadow-xs">
                    {review.name ? review.name[0] : "C"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                        {review.name || "Customer"}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <ShieldCheck size={10} />
                        Verified Purchase
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-200/80 dark:border-amber-900/60">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"}
                      />
                    ))}
                  </div>
                  <span className="font-mono font-black text-xs text-amber-700 dark:text-amber-400">
                    {rating.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>

              {/* Comment Box */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                <span className="text-amber-500 font-serif font-black text-lg mr-1">“</span>
                <span>{review.comment || "No written comment provided."}</span>
                <span className="text-amber-500 font-serif font-black text-lg ml-1">”</span>
              </div>
            </div>

            {/* 3. OFFICIAL MERCHANT REPLY COMPOSER */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CornerDownRight size={14} className="text-indigo-500" />
                  Official Merchant Reply
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {replyText.length} characters
                </span>
              </div>

              {/* Quick Template Chips */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-500" />
                  Apply Quick Response Template:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {QUICK_TEMPLATES.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(tpl.text)}
                      className="p-2 rounded-xl text-left text-[10px] font-bold bg-slate-50 dark:bg-slate-900 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:bg-amber-500/10 dark:hover:text-amber-400 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 transition cursor-pointer"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your official response to this customer review..."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-800 dark:text-white font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-400 custom-scrollbar"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || !replyText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={13} />
              )}
              <span>{review.reply ? "Update Reply" : "Post Official Reply"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewDetailModal;

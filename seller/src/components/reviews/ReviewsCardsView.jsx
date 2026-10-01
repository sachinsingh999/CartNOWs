import React, { useState } from "react";
import {
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
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { backendUrl } from "../../config";

const QUICK_TEMPLATES = [
  {
    label: "Positive Feedback",
    text: "Thank you so much for your wonderful review! We are delighted that you loved the quality and service. Looking forward to serving you again! ✨"
  },
  {
    label: "Fast Shipping",
    text: "Glad our express delivery exceeded your expectations! Thank you for choosing us and for your fantastic support. 🚚💨"
  },
  {
    label: "Value Appreciation",
    text: "We truly appreciate your feedback and high recommendation! Your satisfaction is our topmost priority. 🙏"
  },
  {
    label: "Critical / Apology",
    text: "We sincerely apologize for any inconvenience caused. Our customer support team will get in touch with you immediately to ensure complete resolution. 🛠️"
  }
];

const ReviewsCardsView = ({
  reviews = [],
  productMap = {},
  onOpenDetails,
  onSendReply,
  submittingReplyId = null
}) => {
  const [localReplies, setLocalReplies] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);

  const copyToClipboard = (text, label = "ID") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleTemplateClick = (reviewId, templateText) => {
    setLocalReplies((prev) => ({
      ...prev,
      [reviewId]: templateText
    }));
  };

  const handlePostReply = async (reviewId, productId) => {
    const text = localReplies[reviewId];
    if (!text || !text.trim()) {
      toast.error("Please enter a reply before posting");
      return;
    }
    const success = await onSendReply(reviewId, productId, text.trim());
    if (success) {
      setLocalReplies((prev) => ({ ...prev, [reviewId]: "" }));
      setEditingReplyId(null);
    }
  };

  const getSentimentBadge = (rating) => {
    const num = Number(rating) || 0;
    if (num >= 4) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ThumbsUp size={10} />
          Positive ({num}★)
        </span>
      );
    }
    if (num === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Neutral ({num}★)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <AlertCircle size={10} />
        Critical ({num}★)
      </span>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Star size={22} className="text-amber-400" />
        </div>
        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No customer reviews found</p>
        <p className="text-[11px] text-slate-400 mt-1">Try resetting your search query or changing your rating filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      {reviews.map((r) => {
        const reviewId = r._id;
        const matchedProduct = productMap[r.productId] || productMap[r.productName?.toLowerCase()];
        const prodName = matchedProduct?.name || r.productName || "Product Item";
        const prodImage = matchedProduct?.images?.[0] || matchedProduct?.image?.[0] || null;
        const prodCategory = matchedProduct?.category || "Catalog Item";
        const prodPrice = matchedProduct?.price;
        const hasReply = Boolean(r.reply && r.reply.trim());
        const isEditing = editingReplyId === reviewId;
        const isSubmitting = submittingReplyId === reviewId;

        const reviewDate = new Date(r.date || r.createdAt || Date.now()).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });

        const currentReplyText = localReplies[reviewId] ?? (isEditing ? r.reply : "");

        return (
          <motion.div
            key={reviewId}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between overflow-hidden"
          >
            {/* 1. TOP PRODUCT BANNER */}
            <div className="p-3.5 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                  {prodImage ? (
                    <img src={prodImage} alt={prodName} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <Package size={18} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate block">
                      {prodName}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      {prodCategory}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                    {prodPrice && <span>₹{prodPrice}</span>}
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-[9px]">
                      <Calendar size={10} />
                      {reviewDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sentiment & Inspection Trigger */}
              <div className="flex items-center gap-1.5 shrink-0">
                {getSentimentBadge(r.rating)}
                <button
                  type="button"
                  onClick={() => onOpenDetails({ ...r, matchedProduct })}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                  title="Inspect Review Details"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* 2. CUSTOMER FEEDBACK & COMMENT SECTION */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                {/* Reviewer Name & Star Rating */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-500 text-white font-black text-[10px] flex items-center justify-center uppercase shadow-xs">
                      {r.name ? r.name[0] : "C"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {r.name || "Customer"}
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <ShieldCheck size={9} />
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stars Display */}
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-200/60 dark:border-amber-900/50">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={i < (r.rating || 5) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 font-mono">
                      {r.rating ? Number(r.rating).toFixed(1) : "5.0"}
                    </span>
                  </div>
                </div>

                {/* Customer Comment Bubble */}
                <div className="relative p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <span className="text-amber-500 font-serif font-black text-base mr-1">“</span>
                  <span>{r.comment || "No written comment provided."}</span>
                  <span className="text-amber-500 font-serif font-black text-base ml-1">”</span>
                </div>
              </div>

              {/* 3. OFFICIAL MERCHANT REPLY SECTION */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
                {hasReply && !isEditing ? (
                  <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        <CornerDownRight size={13} className="text-indigo-500" />
                        <span>Official Merchant Response</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReplyId(reviewId);
                          setLocalReplies((prev) => ({ ...prev, [reviewId]: r.reply }));
                        }}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/50 transition cursor-pointer"
                      >
                        <Edit3 size={10} />
                        <span>Edit</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {r.reply}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Quick Templates Carousel */}
                    <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 shrink-0 mr-1 flex items-center gap-0.5">
                        <Sparkles size={10} className="text-amber-500" />
                        Quick:
                      </span>
                      {QUICK_TEMPLATES.map((tpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleTemplateClick(reviewId, tpl.text)}
                          className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 hover:bg-amber-500/10 hover:text-amber-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 transition shrink-0 cursor-pointer"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>

                    {/* Reply Input Box */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Type official merchant response..."
                        value={currentReplyText}
                        onChange={(e) =>
                          setLocalReplies((prev) => ({
                            ...prev,
                            [reviewId]: e.target.value
                          }))
                        }
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-white font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-400"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReplyId(null);
                              setLocalReplies((prev) => ({ ...prev, [reviewId]: "" }));
                            }}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handlePostReply(reviewId, r.productId || matchedProduct?._id)}
                          disabled={isSubmitting || !currentReplyText?.trim()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <div className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Send size={12} />
                          )}
                          <span>{isEditing ? "Update" : "Post Reply"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ReviewsCardsView;

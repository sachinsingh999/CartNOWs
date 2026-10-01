import React from "react";
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
  Eye,
  ChevronRight
} from "lucide-react";
import { toast } from "react-toastify";
import { backendUrl } from "../../config";

const ReviewsTableView = ({
  reviews = [],
  productMap = {},
  onOpenDetails,
  onSendReply,
  submittingReplyId = null
}) => {
  const copyToClipboard = (text, label = "Review ID") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getSentimentBadge = (rating) => {
    const num = Number(rating) || 0;
    if (num >= 4) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ThumbsUp size={10} />
          <span>Positive ({num}★)</span>
        </span>
      );
    }
    if (num === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <span>Neutral ({num}★)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <AlertCircle size={10} />
        <span>Critical ({num}★)</span>
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden text-left">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs min-w-[950px]">
          <thead>
            <tr className="bg-slate-50/90 dark:bg-slate-900/80 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-200/70 dark:border-slate-800">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Feedback Comment</th>
              <th className="py-3 px-4">Response Status</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Star size={22} className="text-amber-400" />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No reviews matched your filters</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try resetting the search query or adjusting your rating filters.</p>
                </td>
              </tr>
            ) : (
              reviews.map((r) => {
                const reviewId = r._id;
                const matchedProduct = productMap[r.productId] || productMap[r.productName?.toLowerCase()];
                const prodName = matchedProduct?.name || r.productName || "Product Item";
                const prodImage = matchedProduct?.images?.[0] || matchedProduct?.image?.[0] || null;
                const prodCategory = matchedProduct?.category || "Catalog Item";
                const prodPrice = matchedProduct?.price;
                const hasReply = Boolean(r.reply && r.reply.trim());

                const reviewDate = new Date(r.date || r.createdAt || Date.now()).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                });

                return (
                  <tr
                    key={reviewId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition group cursor-pointer"
                    onClick={() => onOpenDetails({ ...r, matchedProduct })}
                  >
                    {/* 1. Product Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 max-w-[240px]">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                          {prodImage ? (
                            <img src={prodImage} alt={prodName} className="h-full w-full object-cover rounded-md" />
                          ) : (
                            <Package size={14} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors truncate block text-xs">
                            {prodName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-0.5">
                            <span className="px-1.5 py-0.2 rounded text-[8px] uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {prodCategory}
                            </span>
                            {prodPrice && <span>₹{prodPrice}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Customer */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-500 text-white font-black text-[10px] flex items-center justify-center uppercase shrink-0">
                          {r.name ? r.name[0] : "C"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-black text-slate-900 dark:text-slate-100 text-xs">
                              {r.name || "Customer"}
                            </span>
                            <ShieldCheck size={11} className="text-blue-500 shrink-0" />
                          </div>
                          <span className="text-[9px] text-slate-400 block font-mono">Verified Buyer</span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Rating & Sentiment */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={11}
                                className={
                                  i < (r.rating || 5)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300 dark:text-slate-700"
                                }
                              />
                            ))}
                          </div>
                          <span className="font-mono font-black text-[11px] text-slate-900 dark:text-slate-100">
                            {r.rating ? Number(r.rating).toFixed(1) : "5.0"}
                          </span>
                        </div>
                        {getSentimentBadge(r.rating)}
                      </div>
                    </td>

                    {/* 4. Feedback Snippet */}
                    <td className="py-3 px-4 max-w-[260px]">
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic font-normal">
                        "{r.comment || "No written comment"}"
                      </p>
                    </td>

                    {/* 5. Response Status */}
                    <td className="py-3 px-4">
                      {hasReply ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={11} />
                            Replied
                          </span>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {r.reply}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                          <MessageSquare size={11} />
                          Needs Reply
                        </span>
                      )}
                    </td>

                    {/* 6. Date */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {reviewDate}
                    </td>

                    {/* 7. Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onOpenDetails({ ...r, matchedProduct })}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 transition cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>{hasReply ? "View" : "Reply"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(reviewId, "Review ID")}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Copy Review ID"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewsTableView;

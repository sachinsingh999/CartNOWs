import React, { useState, useEffect, useMemo } from "react";
import { Star, CornerDownRight, MessageSquare, Search, Filter, Package, RefreshCw, ThumbsUp, CheckCircle2, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../config";

const Reviews = ({ token, products = [] }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [starFilter, setStarFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReviews = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/seller/reviews`, {
        headers: { token }
      });
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (error) {
      console.log("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [token]);

  const handleSendReply = async (reviewId, productId) => {
    const text = replyText[reviewId];
    if (!text?.trim()) {
      toast.error("Reply text cannot be empty");
      return;
    }
    try {
      const res = await axios.post(
        `${backendUrl}/api/seller/review/reply`,
        { productId, reviewId, reply: text },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Response posted successfully!");
        setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
        fetchReviews();
      } else {
        toast.error(res.data.message || "Failed to post reply");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Helper map to quickly find matching product object by ID or name
  const productMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      if (p._id) map[p._id] = p;
      if (p.name) map[p.name.toLowerCase()] = p;
    });
    return map;
  }, [products]);

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return sum / reviews.length;
  };

  const avg = calculateAverageRating();

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      // Star filter
      if (starFilter !== "all" && String(r.rating) !== String(starFilter)) return false;
      // Search filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchedProd = productMap[r.productId] || productMap[r.productName?.toLowerCase()];
        const prodName = matchedProd?.name || r.productName || "";
        const reviewerName = r.name || "";
        const comment = r.comment || "";
        return prodName.toLowerCase().includes(q) || reviewerName.toLowerCase().includes(q) || comment.toLowerCase().includes(q);
      }
      return true;
    });
  }, [reviews, starFilter, searchQuery, productMap]);

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Summary & Filters ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center shadow-xs shrink-0">
              <Star size={16} className="fill-amber-400" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Customer Product Reviews</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Monitor item ratings, inspect customer feedback, and post official responses</p>
            </div>
          </div>

          <button
            onClick={fetchReviews}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={loading ? "animate-spin text-amber-500" : ""} />
            <span>Refresh Feedback</span>
          </button>
        </div>

        {/* Rating Score Snapshot & Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Average Rating Card */}
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 flex items-center gap-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white shrink-0">
              {avg > 0 ? avg.toFixed(1) : "0.0"}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className={i < Math.round(avg) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"} />
                ))}
              </div>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">Overall Satisfaction Score</p>
            </div>
          </div>

          {/* Rating Filters Pills */}
          <div className="md:col-span-2 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-black uppercase text-slate-400 mr-1">Filter:</span>
            {[
              { id: "all", label: "All Reviews" },
              { id: "5", label: "5 Stars" },
              { id: "4", label: "4 Stars" },
              { id: "3", label: "3 Stars" },
              { id: "2", label: "2 Stars" },
              { id: "1", label: "1 Star" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStarFilter(tab.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                  starFilter === tab.id
                    ? "bg-slate-900 dark:bg-amber-500 text-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 flex items-center">
            <div className="relative w-full">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search product or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">Loading customer reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-xs font-semibold text-slate-400 space-y-2">
            <Package size={24} className="mx-auto text-slate-300 dark:text-slate-700" />
            <p>No customer reviews matched your search and filter criteria.</p>
          </div>
        ) : (
          filteredReviews.map((r) => {
            // Find matching product object from prop products array
            const matchedProduct = productMap[r.productId] || productMap[r.productName?.toLowerCase()];
            const prodName = matchedProduct?.name || r.productName || "Product Item";
            const prodImage = matchedProduct?.images?.[0] || matchedProduct?.image?.[0] || null;
            const prodCategory = matchedProduct?.category || "Catalog";
            const prodPrice = matchedProduct?.price;

            return (
              <div key={r._id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs space-y-3 text-left">
                
                {/* ── PROMINENT PRODUCT BANNER HEADER ── */}
                <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-900 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                      {prodImage ? (
                        <img src={prodImage} alt={prodName} className="h-full w-full object-cover rounded-md" />
                      ) : (
                        <Package size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {prodName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
                          {prodCategory}
                        </span>
                      </div>
                      {prodPrice && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold mt-0.5">
                          Catalog Price: <span className="text-slate-900 dark:text-white">₹{prodPrice}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-0.5 justify-end">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-800"}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                      {new Date(r.date || r.createdAt || Date.now()).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Reviewer Name & Comment */}
                <div className="space-y-1.5 px-1">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[9px] font-black uppercase">
                      {r.name ? r.name[0] : "C"}
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{r.name}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold bg-slate-50/60 dark:bg-slate-950/40 p-3 rounded-xl">
                    "{r.comment}"
                  </p>
                </div>

                {/* Admin Reply Section */}
                {r.reply ? (
                  <div className="flex gap-2.5 text-xs bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-300 p-3 rounded-xl">
                    <CornerDownRight size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                    <div className="text-left">
                      <span className="font-black text-[9px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Official Merchant Reply:</span>
                      <p className="mt-0.5 leading-relaxed font-semibold text-slate-800 dark:text-slate-200 text-xs">{r.reply}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Type your official merchant response..."
                      value={replyText[r._id] || ""}
                      onChange={(e) => setReplyText((prev) => ({ ...prev, [r._id]: e.target.value }))}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none transition w-full focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleSendReply(r._id, r.productId)}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-xs w-full sm:w-auto shrink-0"
                    >
                      Post Reply
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default Reviews;

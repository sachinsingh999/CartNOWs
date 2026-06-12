import React, { useState, useEffect } from "react";
import { Star, CornerDownRight } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../config";

const Reviews = ({ token }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState({});

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

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return sum / reviews.length;
  };

  const avg = calculateAverageRating();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Reviews</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Monitor customer testimonials, address feedback, and track aggregate score stars.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <p className="text-xs text-slate-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-xs text-slate-400 font-semibold">
              No product reviews received yet.
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 text-left">
                    <h4 className="font-extrabold text-slate-900 text-sm">{r.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      Product: <strong className="text-slate-650">{r.productName || "Product"}</strong> · {new Date(r.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100/50 text-left">
                  "{r.comment}"
                </p>

                {/* Admin reply section */}
                {r.reply ? (
                  <div className="flex gap-2.5 text-xs bg-indigo-50/50 text-indigo-900 p-3.5 rounded-xl border border-indigo-100/50 text-left">
                    <CornerDownRight size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-[9px] uppercase tracking-wider text-indigo-500">Your Response:</span>
                      <p className="mt-0.5 leading-relaxed font-semibold text-slate-800">{r.reply}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your official response..."
                      value={replyText[r._id] || ""}
                      onChange={(e) => setReplyText((prev) => ({ ...prev, [r._id]: e.target.value }))}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-slate-800 transition"
                    />
                    <button
                      onClick={() => handleSendReply(r._id, r.productId)}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
                    >
                      Post Reply
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Rating Summary card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-black text-sm text-slate-900">Score Summary</h3>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black text-slate-950">{avg > 0 ? avg.toFixed(1) : "0.0"}</span>
            <div className="space-y-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className={i < Math.round(avg) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"} />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-bold">Based on {reviews.length} verified reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;

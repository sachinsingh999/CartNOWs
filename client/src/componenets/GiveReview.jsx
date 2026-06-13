import React, { useState } from "react";
import { Star } from "lucide-react";

const GiveReview = ({ onSubmit, loading }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (rating === 0 || !comment.trim()) {
      setError("Please select a rating and write a review.");
      return;
    }

    const success = await onSubmit({
      rating,
      comment,
    });

    if (success) {
      setRating(0);
      setComment("");
    }
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 5: return "Excellent! Loved it.";
      case 4: return "Good! Satisfied.";
      case 3: return "Average. It's okay.";
      case 2: return "Poor. Could be better.";
      case 1: return "Terrible. Disliked it.";
      default: return "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
      <div>
        <h3 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 tracking-wider">
          Write a Review
        </h3>
        <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
          Share your experience with fit, materials, or delivery.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 dark:bg-red-950/20 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 animate-pulse">
          {error}
        </p>
      )}

      <div>
        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          Your Rating
        </label>
        <div className="flex flex-col gap-1">
          <div 
            className="flex items-center gap-1"
            onMouseLeave={() => setHoverRating(0)}
          >
             {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                className="h-7.5 w-7.5 flex items-center justify-center active:scale-90 focus:outline-none cursor-pointer"
              >
                <Star
                  size={18}
                  className={`transition-all duration-150 origin-center cursor-pointer hover:scale-125 hover:rotate-6 ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-400 stroke-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]"
                      : "stroke-slate-300 dark:stroke-slate-700 fill-transparent hover:stroke-slate-400"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 h-4 transition-all duration-150">
            {(hoverRating || rating) > 0 ? getRatingLabel(hoverRating || rating) : "\u00A0"}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Your Review
        </label>
        <textarea
          rows="2"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about quality and fit."
          className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs resize-none outline-none transition duration-200 focus:border-slate-800 dark:focus:border-indigo-500 dark:bg-slate-900 dark:text-white"
        />
      </div>

      <button
        disabled={loading}
        className="w-full rounded-xl bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition disabled:opacity-60 active:scale-98 cursor-pointer"
      >
        {loading ? "Submitting Review..." : "Submit Review"}
      </button>
    </form>
  );
};

export default GiveReview;

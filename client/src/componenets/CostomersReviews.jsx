import React from "react";
import { Star } from "lucide-react";

const CostomersReviews = ({ reviews = [] }) => {
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-5 py-10 text-center">
        <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">No reviews yet</p>
        <p className="mt-1 text-xs text-slate-550 dark:text-slate-400">
          Be the first to share your thoughts on this product.
        </p>
      </div>
    );
  }

  // Helper to draw rating stars
  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={`${
              star <= rating
                ? "fill-amber-400 stroke-amber-400"
                : "stroke-slate-200 dark:stroke-slate-700 fill-slate-100 dark:fill-slate-800"
            }`}
          />
        ))}
      </div>
    );
  };

  // Color options for avatars to make it colorful and modern
  const avatarColors = [
    "bg-indigo-650 text-indigo-50",
    "bg-emerald-650 text-emerald-50",
    "bg-sky-650 text-sky-50",
    "bg-rose-650 text-rose-50",
    "bg-amber-650 text-amber-50",
  ];

  const getAvatarStyle = (name) => {
    const code = name ? name.charCodeAt(0) : 0;
    return avatarColors[code % avatarColors.length];
  };

  return (
    <div className="space-y-4">
      {[...reviews]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((review, i) => (
          <div
            key={review._id || `${review.userId}-${review.date}`}
            className="rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 shadow-sm transition-all duration-200 hover:shadow text-left"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-sm ${getAvatarStyle(review.name)}`}>
                  {review.name?.charAt(0)?.toUpperCase() || "C"}
                </div>
                <div>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-none">{review.name}</p>
                  <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400 mt-1">
                    {new Date(review.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded-lg">
                {renderStars(review.rating)}
              </div>
            </div>

            <p className="mt-3.5 text-sm text-slate-700 dark:text-slate-350 leading-relaxed pl-1">{review.comment}</p>
          </div>
        ))}
    </div>
  );
};

export default CostomersReviews;

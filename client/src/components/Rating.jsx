import React from "react";
import { Star } from "lucide-react";

const Rating = ({ reviews = [] }) => {
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews
    : 0;

  const counts = [5, 4, 3, 2, 1].reduce((result, star) => {
    result[star] = reviews.filter((review) => Number(review.rating) === star).length;
    return result;
  }, {});

  // Helper to draw stars for score display
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    return (
      <div className="flex items-center gap-0.5 justify-center">
        {[1, 2, 3, 4, 5].map((index) => {
          const isFull = index <= fullStars;
          return (
            <Star
              key={index}
              size={13}
              className={`${
                isFull
                  ? "fill-amber-400 stroke-amber-400"
                  : "stroke-slate-200 dark:stroke-slate-700 fill-slate-100 dark:fill-slate-800"
              }`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Average Card */}
      <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Average Rating
        </p>

        <p className="mt-1 text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          {averageRating ? averageRating.toFixed(1) : "0.0"}
        </p>

        <div className="mt-1 flex justify-center">
          {renderStars(averageRating)}
        </div>

        <p className="mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
          Based on {totalReviews} {totalReviews === 1 ? "rating" : "ratings"}
        </p>
      </div>

      {/* Breakdown Bars */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const percent = totalReviews ? Math.round((counts[star] / totalReviews) * 100) : 0;
          return (
            <div
              key={star}
              className="grid grid-cols-[38px_1fr_35px] items-center gap-2.5 text-[11px] text-left"
            >
              <span className="font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {star} Star
              </span>

              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/40 dark:border-slate-800">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <span className="text-right font-extrabold text-slate-400 dark:text-slate-500">
                {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Rating;

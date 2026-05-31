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
    const hasHalf = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5 justify-center">
        {[1, 2, 3, 4, 5].map((index) => {
          const isFull = index <= fullStars;
          return (
            <Star
              key={index}
              size={18}
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
    <div className="grid gap-8 md:grid-cols-[280px_1fr] items-center">
      {/* Average Card */}
      <div className="border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6 text-center rounded-2xl shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Average Rating
        </p>

        <p className="mt-3.5 text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          {averageRating ? averageRating.toFixed(1) : "0.0"}
        </p>

        <div className="mt-3.5 flex justify-center">
          {renderStars(averageRating)}
        </div>

        <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Based on {totalReviews} {totalReviews === 1 ? "customer rating" : "customer ratings"}
        </p>
      </div>

      {/* Breakdown Bars */}
      <div className="space-y-3.5">
        <div className="text-left">
          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Rating breakdown</p>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
            Real feedback from verified purchasers.
          </p>
        </div>

        {[5, 4, 3, 2, 1].map((star) => {
          const percent = totalReviews ? Math.round((counts[star] / totalReviews) * 100) : 0;
          return (
            <div
              key={star}
              className="grid grid-cols-[40px_1fr_40px] items-center gap-4 text-xs text-left"
            >
              <span className="font-bold text-slate-700 dark:text-slate-350 whitespace-nowrap">
                {star} Star
              </span>

              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-250/30 dark:border-slate-800">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <span className="text-right font-extrabold text-slate-500 dark:text-slate-400">
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

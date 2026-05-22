import React from "react";
import { getStars } from "../utils/productRatings";

const Rating = ({ reviews = [] }) => {
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews
    : 0;

  const counts = [5, 4, 3, 2, 1].reduce((result, star) => {
    result[star] = reviews.filter((review) => Number(review.rating) === star).length;
    return result;
  }, {});

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">

      <div className="border border-gray-200 bg-white p-6 text-center rounded-lg">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Average rating
        </p>

        <p className="mt-3 text-6xl font-bold text-gray-950">
          {averageRating ? averageRating.toFixed(1) : "0.0"}
        </p>

        <div className="mt-3 text-2xl text-yellow-500" aria-label={`${averageRating.toFixed(1)} out of 5`}>
          {getStars(averageRating)}
        </div>

        <p className="mt-2 text-sm text-gray-500">
          {totalReviews} {totalReviews === 1 ? "customer rating" : "customer ratings"}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-base font-semibold text-gray-950">Rating breakdown</p>
          <p className="text-sm text-gray-500">
            See how shoppers rated this product.
          </p>
        </div>

        {[5, 4, 3, 2, 1].map((star) => (
          <div
            key={star}
            className="grid grid-cols-[44px_1fr_34px] items-center gap-3 text-sm"
          >
            <span className="font-medium text-gray-700">
              {star} ★
            </span>

            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-yellow-500 transition-all"
                style={{
                  width: totalReviews ? `${(counts[star] / totalReviews) * 100}%` : "0%",
                }}
              />
            </div>

            <span className="text-right text-gray-500">{counts[star]}</span>
          </div>
        ))}

      </div>

    </div>
  );
};

export default Rating;

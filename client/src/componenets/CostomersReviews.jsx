import React from "react";
import { getStars } from "../utils/productRatings";

const CostomersReviews = ({ reviews = [] }) => {
  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
        <p className="text-base font-semibold text-gray-900">No reviews yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Be the first to share your experience.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[...reviews]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((review) => (
          <div
            key={review._id || `${review.userId}-${review.date}`}
            className="rounded-lg border border-gray-200 bg-white p-5 text-sm shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white">
                  {review.name?.charAt(0)?.toUpperCase() || "C"}
                </div>
                <div>
                <p className="font-medium text-gray-900">{review.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(review.date).toLocaleDateString()}
                </p>
                </div>
              </div>
              <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 whitespace-nowrap">
                {getStars(review.rating)}
              </span>
            </div>

            <p className="mt-4 leading-6 text-gray-700">{review.comment}</p>
          </div>
        ))}
    </div>
  );
};

export default CostomersReviews;

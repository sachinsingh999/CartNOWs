import React, { useState } from "react";

const GiveReview = ({ onSubmit, loading }) => {
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!rating || !comment.trim()) {
      setError("Please add a rating and review.");
      return;
    }

    const success = await onSubmit({
      rating: Number(rating),
      comment,
    });

    if (success) {
      setRating("");
      setComment("");
    }
  };

  return (
    <div className="space-y-6">

      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-950">
            Write a Review
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Tell shoppers how it felt, fit, and held up.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Rating
          </label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 sm:w-64"
          >
            <option value="">Select</option>
            <option value="5">★★★★★ Excellent</option>
            <option value="4">★★★★☆ Good</option>
            <option value="3">★★★☆☆ Average</option>
            <option value="2">★★☆☆☆ Poor</option>
            <option value="1">★☆☆☆☆ Bad</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Review
          </label>
          <textarea
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience"
            className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm resize-none outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-md bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60 sm:w-auto"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-3 text-center text-xs sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          🚚
          <p className="font-medium mt-1">Free Delivery</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          🔄
          <p className="font-medium mt-1">Easy Returns</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          🔒
          <p className="font-medium mt-1">Secure Pay</p>
        </div>
      </div>

    </div>
  );
};

export default GiveReview;

import React from "react";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import { getAverageRating, getReviewCount, getStars } from "../utils/productRatings";

const ProductCard = ({ product, compact = false }) => {
  const navigate = useNavigate();
  const averageRating = getAverageRating(product);
  const reviewCount = getReviewCount(product);
  const productImage = product.images?.[0] || product.image;
  const imageSrc = productImage?.startsWith("http")
    ? productImage
    : `${backendUrl}/${productImage}`;

  const handleBuyNow = () => {
    navigate(`/product/${product._id}`);
  };
  const handleDetails = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl">
      <div className={`${compact ? "h-52" : "h-60"} relative w-full overflow-hidden bg-gray-50`}>
        <img
          src={imageSrc}
          alt={product.name}
          className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800 shadow-sm">
          {product.category}
        </span>
        <button
          onClick={handleDetails}
          className="absolute bottom-3 left-3 right-3 translate-y-4 rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100"
        >
          Quick View
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {product.subCategory || "Curated pick"}
          </span>
          <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
            {averageRating ? `${averageRating.toFixed(1)} ★` : "New"}
          </span>
        </div>

        <h3 className="min-h-12 text-base font-semibold leading-6 text-gray-950 line-clamp-2">
          {product.name}
        </h3>

        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {[product.brand, product.collection].filter(Boolean).join(" · ") || "Thoughtful design for everyday use."}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <div>
            <p className="text-xl font-bold text-gray-950">
            ₹{product.price}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Premium selection
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm tracking-wide text-yellow-600">
              {getStars(averageRating)}
            </p>
            <p className="text-xs text-gray-500">
              {averageRating ? averageRating.toFixed(1) : "No rating"} ({reviewCount})
            </p>
          </div>
        </div>

        <div className="mt-auto flex gap-2 pt-5">
          <button
            onClick={handleDetails}
            className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
          >
            Details
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 rounded-md bg-black py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

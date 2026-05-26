import React, { useState, useEffect } from "react";
import { getAverageRating } from "../utils/productRatings";

const CategoryFilterSidebar = ({ productList, setFilteredList }) => {
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState(200000);
  const [rating, setRating] = useState(0);
  const maxPrice = 200000;

  // Dynamically compute the categories from the products in the collection
  const categories = React.useMemo(() => {
    return [
      "all",
      ...new Set(
        productList
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ];
  }, [productList]);

  const applyFilter = (cat, pr, rat) => {
    let data = [...productList];

    // Category filter
    if (cat !== "all") {
      data = data.filter((item) =>
        item.category?.toLowerCase() === cat.toLowerCase()
      );
    }

    // Price filter
    data = data.filter((item) => item.price <= pr);

    // Rating filter
    if (rat > 0) {
      data = data.filter((item) => getAverageRating(item) >= rat);
    }

    setFilteredList(data);
  };

  // Re-apply filter when productList changes (e.g., initial fetch finishes)
  useEffect(() => {
    applyFilter(category, price, rating);
  }, [productList]);

  const handleReset = () => {
    setCategory("all");
    setPrice(maxPrice);
    setRating(0);
    setFilteredList(productList);
  };

  return (
    <div className="w-full h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <p className="text-xs text-gray-500">Refine by category, budget, and rating.</p>
        </div>
        <button
          onClick={handleReset}
          className="rounded-md px-2 py-1 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          Reset
        </button>
      </div>

      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-gray-800">Category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                applyFilter(cat, price, rating);
              }}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition
                ${category === cat
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {cat === "all"
                ? "All"
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="my-5 border-t border-gray-100" />

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">Price Range</p>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-900">
            ₹{price.toLocaleString("en-IN")}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={price}
          onChange={(e) => {
            const value = Number(e.target.value);
            setPrice(value);
            applyFilter(category, value, rating);
          }}
          className="w-full"
        />
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>₹0</span>
          <span>₹2,00,000</span>
        </div>
      </div>

      <div className="my-5 border-t border-gray-100" />

      <div>
        <p className="mb-3 text-sm font-semibold text-gray-800">Rating</p>
        <div className="flex flex-col gap-2">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRating(r);
                applyFilter(category, price, r);
              }}
              className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm transition
                ${rating === r
                  ? "bg-black text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
            >
              <span>★ {r} and up</span>
              <span className={`text-xs ${rating === r ? "text-white/75" : "text-gray-400"}`}>
                Reviews
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilterSidebar;

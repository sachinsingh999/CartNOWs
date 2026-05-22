import React from "react";

const FilterSidebar = ({
  categories,
  collections,
  category,
  collection,
  price,
  rating,
  maxPrice,
  onCategoryChange,
  onCollectionChange,
  onPriceChange,
  onRatingChange,
  onReset,
}) => {
  return (
    <div className="w-full h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <p className="text-xs text-gray-500">Refine what you want to browse.</p>
        </div>
        <button
          onClick={onReset}
          className="rounded-md px-2 py-1 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          Reset
        </button>
      </div>

      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-gray-800">Department</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => onCategoryChange(item)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                category === item
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item === "all" ? "All" : item}
            </button>
          ))}
        </div>
      </div>

      <div className="my-5 border-t border-gray-100" />

      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-gray-800">Collection</p>
        <div className="flex flex-wrap gap-2">
          {collections.map((item) => (
            <button
              key={item}
              onClick={() => onCollectionChange(item)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                collection === item
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item === "all" ? "All" : item}
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
          onChange={(e) => onPriceChange(Number(e.target.value))}
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
          {[4, 3, 2].map((item) => (
            <button
              key={item}
              onClick={() => onRatingChange(item)}
              className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm transition ${
                rating === item
                  ? "bg-black text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>★ {item} and up</span>
              <span className={`text-xs ${rating === item ? "text-white/75" : "text-gray-400"}`}>
                Reviews
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;

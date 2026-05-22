import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../pages/ProductCard";
import FilterSidebar from "../componenets/FilterSidebar";
import { backendUrl } from "../config";
import { getAverageRating } from "../utils/productRatings";

const Product = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productList, setProductList] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [category, setCategory] = useState("all");
  const [collection, setCollection] = useState("all");
  const [price, setPrice] = useState(200000);
  const [rating, setRating] = useState(0);
  const maxPrice = 200000;
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    let active = true;

    axios
      .get(`${backendUrl}/api/product/list`)
      .then((response) => {
        if (!active) return;

        if (response.data.success) {
          setProductList(response.data.products);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        if (active) {
          toast.error(error.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ["all", ...new Set(productList.map((item) => item.category).filter(Boolean))],
    [productList]
  );

  const collections = useMemo(() => {
    const base = productList.filter((item) =>
      category === "all" ? true : item.category === category
    );
    return ["all", ...new Set(base.map((item) => item.collection).filter(Boolean))];
  }, [productList, category]);

  const categorySummary = useMemo(
    () =>
      categories
        .filter((item) => item !== "all")
        .map((item) => ({
          category: item,
          count: productList.filter((product) => product.category === item).length,
        })),
    [categories, productList]
  );

  const filteredList = useMemo(() => {
    let data = [...productList];

    if (category !== "all") {
      data = data.filter((item) => item.category === category);
    }

    if (collection !== "all") {
      data = data.filter((item) => item.collection === collection);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      data = data.filter((item) =>
        [
          item.name,
          item.category,
          item.subCategory,
          item.collection,
          item.brand,
          ...(item.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    data = data.filter((item) => Number(item.price) <= price);

    if (rating > 0) {
      data = data.filter((item) => getAverageRating(item) >= rating);
    }

    return data.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [productList, category, collection, price, rating, sortBy, searchQuery]);

  const activeCategoryLabel = category === "all" ? "All Departments" : category;

  const handleCategoryChange = (value) => {
    setCategory(value);
    setCollection("all");
  };

  const handleReset = () => {
    setCategory("all");
    setCollection("all");
    setPrice(maxPrice);
    setRating(0);
    setSortBy("featured");
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("q");
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <section className="border-b border-gray-200 bg-white shadow-sm">
        <div className="bg-[#1f2b3d] text-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition ${
                category === "all"
                  ? "bg-white text-[#1f2b3d]"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              All
            </button>
            {categorySummary.map((item) => (
              <button
                key={item.category}
                onClick={() => handleCategoryChange(item.category)}
                className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition ${
                  category === item.category
                    ? "bg-white text-[#1f2b3d]"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                {item.category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-7xl px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">Currently browsing</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-950">
              {activeCategoryLabel}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredList.length} {filteredList.length === 1 ? "product" : "products"} available
            </p>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                Showing results for <span className="font-semibold text-gray-950">"{searchQuery}"</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="sort-products" className="text-sm font-medium text-gray-700">
              Sort by
            </label>
            <select
              id="sort-products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
          <FilterSidebar
            categories={categories}
            collections={collections}
            category={category}
            collection={collection}
            price={price}
            rating={rating}
            maxPrice={maxPrice}
            onCategoryChange={handleCategoryChange}
            onCollectionChange={setCollection}
            onPriceChange={setPrice}
            onRatingChange={setRating}
            onReset={handleReset}
          />

          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredList.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>

            {filteredList.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 shadow-sm">
                <p className="text-lg font-semibold text-gray-900">No products match these filters.</p>
                <p className="mt-2 text-sm text-gray-500">
                  Try another department, collection, or wider budget range.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;

import React, { useEffect, useState } from "react";
import ProductCard from "../pages/ProductCard";
import FilterSidebar from "../components/FilterSidebar";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

const Product = () => {
  const [productList, setProductList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    let active = true;

    axios.get(`${backendUrl}/api/product/list`)
      .then((response) => {
        if (!active) return;

        if (response.data.success) {
          setProductList(response.data.products);
          setFilteredList(response.data.products);
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

  const displayList = [...filteredList].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 md:p-10">
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Shop</p>
              <h1 className="mt-3 text-4xl font-bold text-gray-950 md:text-5xl">
                Discover products worth adding to cart.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
                Browse curated styles from your store database, compare live customer ratings, and filter by category, budget, and review quality.
              </p>

              <div className="mt-8 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ["Live", "ratings"],
                  ["Fast", "checkout"],
                  ["Easy", "tracking"],
                  ["Smart", "filters"],
                ].map(([top, bottom]) => (
                  <div key={top} className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xl font-bold text-gray-950">{top}</p>
                    <p className="text-sm text-gray-500">{bottom}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-h-[280px]">
              <img
                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=80"
                alt="Fashion collection"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <div className="mt-10 flex flex-col justify-between gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">Showing collection</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-950">
              {displayList.length} {displayList.length === 1 ? "product" : "products"}
            </h2>
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

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
          <FilterSidebar
            productList={productList}
            setFilteredList={setFilteredList}
          />

          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {displayList.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
            {displayList.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 shadow-sm">
                <p className="text-lg font-semibold text-gray-900">No products match these filters.</p>
                <p className="mt-2 text-sm text-gray-500">
                  Try a wider price range or change the rating and category filters.
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

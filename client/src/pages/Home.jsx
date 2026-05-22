import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import ProductCard from "./ProductCard";

const categories = [
  {
    name: "Men",
    path: "/product/men",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e",
  },
  {
    name: "Women",
    path: "/product/women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
  },
  {
    name: "Kids",
    path: "/product/kid",
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    let active = true;

    axios
      .get(`${backendUrl}/api/product/list`)
      .then((response) => {
        if (active && response.data.success) {
          setFeaturedProducts(response.data.products.slice(0, 4));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white">
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1445205170230-053b83016050"
          alt="Curated clothing collection"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-6">
          <div className="max-w-3xl py-16 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
              CartNOW collections
            </p>
            <h1 className="mt-5 text-5xl font-extrabold leading-tight md:text-7xl">
              Style that feels easy to choose.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              Browse polished collections, compare real customer ratings, and move from product discovery to checkout without friction.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/product")}
                className="rounded-md bg-white px-7 py-3 font-semibold text-black transition hover:bg-gray-100"
              >
                Shop Collection
              </button>

              <button
                onClick={() => navigate("/product/women")}
                className="rounded-md border border-white/70 px-7 py-3 font-semibold text-white transition hover:bg-white hover:text-black"
              >
                Explore New Looks
              </button>
            </div>

            <div className="mt-12 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/20 pt-6">
              <div>
                <h2 className="text-3xl font-bold">Fast</h2>
                <p className="text-sm text-white/65">Checkout flow</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold">Live</h2>
                <p className="text-sm text-white/65">Customer ratings</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold">Easy</h2>
                <p className="text-sm text-white/65">Order tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Shop by category
              </p>
              <h2 className="mt-2 text-4xl font-bold text-gray-950">
                Find your lane
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-gray-500">
              Jump into curated sections and discover products with real review data.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => navigate(category.path)}
                className="group relative min-h-80 overflow-hidden rounded-lg text-left"
              >
                <img
                  src={category.image}
                  alt={`${category.name} collection`}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/45 transition group-hover:bg-black/35" />
                <div className="relative z-10 flex h-full min-h-80 flex-col justify-end p-6 text-white">
                  <p className="text-sm uppercase tracking-wide text-white/70">
                    Collection
                  </p>
                  <h3 className="mt-2 text-3xl font-bold">{category.name}</h3>
                  <p className="mt-2 text-sm text-white/75">View products</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="bg-gray-50 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Featured
                </p>
                <h2 className="mt-2 text-4xl font-bold text-gray-950">
                  Fresh from the store
                </h2>
              </div>
              <button
                onClick={() => navigate("/product")}
                className="rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                View All Products
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            ["Verified reviews", "Ratings come from reviews saved with each product."],
            ["Smooth checkout", "Cart, checkout, orders, and tracking share one consistent flow."],
            ["Better browsing", "Category pages use your backend products and live review averages."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="font-semibold text-gray-950">{title}</p>
              <p className="mt-2 text-sm leading-6 text-gray-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

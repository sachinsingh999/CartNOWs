import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import Rating from "../componenets/Rating";
import CostomersReviews from "../componenets/CostomersReviews";
import GiveReview from "../componenets/GiveReview";
import ProductCard from "./ProductCard";
import { getAverageRating, getReviewCount, getStars } from "../utils/productRatings";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [mainImg, setMainImg] = useState("");
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/product/single/${id}`);
        const data = await res.json();
        
        if (data.success && data.product) {
          setProduct(data.product);
          setMainImg(data.product.images[0]);

          const listRes = await axios.get(`${backendUrl}/api/product/list`);
          if (listRes.data.success) {
            const related = listRes.data.products
              .filter(
                (item) =>
                  item._id !== data.product._id &&
                  item.category?.toLowerCase() === data.product.category?.toLowerCase()
              )
              .slice(0, 3);
            setRelatedProducts(related);
          }
        } else {
          setProduct(false);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (product === null) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Loading product...
      </div>
    );
  }

  if (product === false) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Product not found
      </div>
    );
  }

  const averageRating = getAverageRating(product);
  const reviewCount = getReviewCount(product);

  const handleBuyNow = () => {
    if (!size) return alert("Please select size");
    navigate("/placeorder", {
      state: { product, qty, size, total: product.price * qty },
    });
  };

  const handleCart = async () => {
    if (!size) return alert("Please select size");

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    await axios.post(
      `${backendUrl}/api/cart/add`,
      { itemId: product._id, size, qty },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    navigate("/cart");
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return false;
    }

    try {
      setReviewLoading(true);
      const res = await axios.post(
        `${backendUrl}/api/product/review/${product._id}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setProduct(res.data.product);
        return true;
      }

      alert(res.data.message || "Review failed");
      return false;
    } catch (error) {
      alert(error.response?.data?.message || "Review failed");
      return false;
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Back
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex min-h-[520px] items-center justify-center rounded-lg bg-gray-50">
              <img
                src={
                  mainImg.startsWith("http")
                    ? mainImg
                    : `${backendUrl}/${mainImg}`
                }
                alt={product.name}
                className="max-h-[500px] w-full object-contain p-6"
              />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImg(img)}
                  className={`rounded-lg border p-2 transition ${
                    mainImg === img
                      ? "border-black bg-gray-100"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <img
                    src={img.startsWith("http") ? img : `${backendUrl}/${img}`}
                    className="h-20 w-full object-contain"
                    alt={`${product.name} thumbnail ${i + 1}`}
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="h-fit rounded-lg border border-gray-200 bg-white p-7 shadow-sm lg:sticky lg:top-28">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              {product.category}
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-950">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">
                {getStars(averageRating)}
              </span>
              <span className="text-sm text-gray-500">
                {averageRating ? averageRating.toFixed(1) : "No rating yet"} ({reviewCount} reviews)
              </span>
            </div>

            <p className="mt-5 text-4xl font-bold text-gray-950">
              ₹{product.price}
            </p>

            <p className="mt-5 leading-7 text-gray-600">
              {product.description}
            </p>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-950">Select Size</p>
                {!size && <span className="text-xs text-gray-500">Required</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.sizes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSize(s)}
                    className={`min-w-14 rounded-md border px-4 py-3 text-sm font-semibold transition ${
                      size === s
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="font-semibold text-gray-950">Quantity</p>
              <div className="mt-3 inline-flex items-center rounded-md border border-gray-200">
                <button
                  onClick={() => qty > 1 && setQty(qty - 1)}
                  className="px-4 py-3 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="min-w-12 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-4 py-3 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleCart}
                className="rounded-md border border-gray-300 bg-white py-3.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
              >
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="rounded-md bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-3">Free delivery</div>
              <div className="rounded-lg bg-gray-50 p-3">Easy returns</div>
              <div className="rounded-lg bg-gray-50 p-3">Secure pay</div>
            </div>
          </section>
        </div>

        <section className="mt-16 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Reviews
              </p>
              <h2 className="mt-1 text-3xl font-bold text-gray-950">
                What customers say
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-gray-500">
              Ratings update as shoppers share their experience.
            </p>
          </div>

          <div className="space-y-8">
            <Rating reviews={product.reviews || []} />

            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-950">
                    Customer Reviews
                  </h3>
                  <span className="text-sm text-gray-500">
                    {(product.reviews || []).length} total
                  </span>
                </div>
                <CostomersReviews reviews={product.reviews || []} />
              </div>

              <GiveReview onSubmit={handleReviewSubmit} loading={reviewLoading} />
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Keep shopping
                </p>
                <h2 className="mt-1 text-3xl font-bold text-gray-950">
                  More from {product.category}
                </h2>
              </div>
              <button
                onClick={() => navigate(`/product/${product.category?.toLowerCase()}`)}
                className="rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
              >
                View Category
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

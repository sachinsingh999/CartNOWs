import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import ProductCard from "./ProductCard";
import { getAverageRating } from "../utils/productRatings";
import {
  ArrowRight,
  Sparkles,
  Truck,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  ShoppingBag
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch product list
  useEffect(() => {
    axios.get(`${backendUrl}/api/product/list`)
      .then(res => {
        if (res.data.success) {
          setAllProducts(res.data.products || []);
        }
      })
      .catch((err) => console.log("Failed to fetch products:", err))
      .finally(() => setLoading(false));
  }, []);

  const trendingProducts = useMemo(() => {
    return [...allProducts]
      .filter(p => p.stock > 0)
      .sort((a, b) => getAverageRating(b) - getAverageRating(a))
      .slice(0, 4);
  }, [allProducts]);

  const newArrivals = useMemo(() => {
    return [...allProducts].slice(-4).reverse();
  }, [allProducts]);

  // Premium Curated Testimonials Data
  const staticReviews = useMemo(() => [
    {
      id: 1,
      name: "Aarav Sharma",
      rating: 5,
      comment: "Absolutely in love with the quality of their organic cotton hoodies. They are so soft, durable, and look extremely high-end. Free shipping is an added bonus!",
      product: "Organic Heavyweight Hoodie",
      date: "2 days ago",
      initials: "AS"
    },
    {
      id: 2,
      name: "Priya Patel",
      rating: 5,
      comment: "The contemporary cuts on the women's jackets fit perfectly. The dark mode theme of this website and premium checkout experience is top-notch.",
      product: "Structured Denim Blazer",
      date: "1 week ago",
      initials: "PP"
    },
    {
      id: 3,
      name: "Vikram Malhotra",
      rating: 4,
      comment: "Fast delivery, and returns were super smooth. The technical joggers are my absolute favorite for everyday wear now. Will definitely buy again.",
      product: "Technical Everyday Joggers",
      date: "3 days ago",
      initials: "VM"
    },
    {
      id: 4,
      name: "Sneha Reddy",
      rating: 5,
      comment: "Excellent support! Had an issue with sizes, and customer support resolved it instantly. Kids collection is so adorable and gentle on skin.",
      product: "Kids Organic Cotton Set",
      date: "5 days ago",
      initials: "SR"
    }
  ], []);

  const [appReviews, setAppReviews] = useState([]);

  // Fetch real application reviews on load
  useEffect(() => {
    axios.get(`${backendUrl}/api/user/app-reviews`)
      .then(res => {
        if (res.data.success && res.data.reviews) {
          setAppReviews(res.data.reviews);
        }
      })
      .catch(err => console.log("Failed to fetch application reviews:", err));
  }, []);

  // Combine real user reviews with static fallbacks to guarantee 4 items for page layout symmetry
  const reviews = useMemo(() => {
    const combined = [...appReviews];
    if (combined.length < 4) {
      staticReviews.forEach(staticRev => {
        if (combined.length < 4 && !combined.some(r => r.comment === staticRev.comment)) {
          combined.push(staticRev);
        }
      });
    }
    return combined.slice(0, 4);
  }, [appReviews, staticReviews]);

  // Intersection Observer to trigger entrance animations on scroll
  const [reviewsInView, setReviewsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReviewsInView(true);
        }
      },
      { threshold: 0.1 }
    );
    const element = document.getElementById("community-reviews-section");
    if (element) {
      observer.observe(element);
    }
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Aesthetic Social Media Showcase Data
  const socialPosts = useMemo(() => [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
      username: "@neha_vibe",
      likes: "1.4k",
      comments: "42",
      tags: "Urban Chic Look"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600",
      username: "@priya.fits",
      likes: "852",
      comments: "18",
      tags: "Summer Linen Coordinate"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600",
      username: "@rohit_malhotra",
      likes: "2.1k",
      comments: "56",
      tags: "Everyday Technical Fit"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600",
      username: "@kartik_street",
      likes: "1.1k",
      comments: "29",
      tags: "Streetwear Cargo Style"
    }
  ], []);

  const categoryCards = [
    {
      name: "Men's Collection",
      path: "/product?category=men",
      image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600",
      desc: "Architectural lines & premium technical styles"
    },
    {
      name: "Women's Collection",
      path: "/product?category=women",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
      desc: "Contemporary cuts & elegant modern silhouettes"
    },
    {
      name: "Kids' Collection",
      path: "/product?category=kid",
      image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600",
      desc: "Playful designs in ultra-soft organic cotton"
    },
  ];

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen text-slate-700 dark:text-slate-300 font-sans pb-16 transition-colors duration-300 text-left">

      {/* ── SIMPLE PREMIUM HERO BANNER ── */}
      <section className="relative h-[calc(100vh-52px)] min-h-[550px] w-full overflow-hidden flex items-center bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent z-10" />

        <div className="relative z-20 mx-auto max-w-7xl px-6 w-full">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[9px] font-black tracking-widest text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 rounded-full uppercase">
              <Sparkles size={11} className="animate-pulse" />
              NEW ARRIVALS IN STORE
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              Elevating Everyday <br />Essentials
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-light max-w-md">
              Discover a curated collection of modern apparel, lifestyle accessories, and interactive fashion designed around you.
            </p>
            <div className="pt-2">
              <button
                id="btn-shop-collection"
                onClick={() => navigate("/product")}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 text-xs font-bold tracking-wider uppercase hover:bg-slate-100 transition active:scale-95 cursor-pointer shadow-md"
              >
                <span>Shop The Collection</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── BROWSE BY CATEGORY ── */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6">
          <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block">
            Curated Collections
          </span>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
            Browse By Category
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryCards.map((cat, index) => (
            <div
              key={cat.name}
              id={`cat-card-${index}`}
              onClick={() => navigate(cat.path)}
              className="group relative h-64 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-lg transition duration-300"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent z-10" />

              <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                <h3 className="text-lg font-black tracking-tight">{cat.name}</h3>
                <p className="text-[10px] font-semibold text-slate-300 mt-1 leading-snug">{cat.desc}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 mt-3 group-hover:text-indigo-300 transition">
                  <span>Shop Collection</span>
                  <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRENDING PRODUCTS ── */}
      {trendingProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block">
                Most Popular
              </span>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
                Trending Items
              </h2>
            </div>
            <button
              id="btn-see-all-trending"
              onClick={() => navigate("/product")}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition"
            >
              <span>See All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS ── */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-4">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block">
                Just Released
              </span>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
                New Arrivals
              </h2>
            </div>
            <button
              id="btn-see-all-arrivals"
              onClick={() => navigate("/product")}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition"
            >
              <span>See All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── SOCIAL SPOTLIGHT ── */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 text-left">
          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block">
              Seen on Socials
            </span>
            <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
              Style Spotlight
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Share your fit with <span className="font-bold text-indigo-600 dark:text-indigo-400">#CartNowStyle</span> to get featured.
            </p>
          </div>
          <button
            id="btn-view-all-styles"
            onClick={() => navigate("/product")}
            className="group text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition"
          >
            <span>View All Styles</span>
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {socialPosts.map((post, index) => (
            <div
              key={post.id}
              id={`social-post-card-${index}`}
              className="group relative aspect-square rounded-3xl overflow-hidden border border-slate-200/40 dark:border-slate-800/80 shadow-sm cursor-pointer"
            >
              {/* Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${post.image})` }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-300 flex flex-col justify-between p-4.5 z-10 text-white" />

              {/* Overlay Content */}
              <div className="absolute inset-0 z-20 flex flex-col justify-between p-4.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="text-left">
                  <span className="text-[10px] font-black text-indigo-300 block">{post.username}</span>
                  <span className="text-[11px] font-bold text-white mt-0.5 block leading-tight">{post.tags}</span>
                </div>

                <div className="flex items-center justify-between w-full mt-4">
                  <div className="flex gap-3 text-[10px] font-extrabold text-slate-200">
                    <span className="flex items-center gap-1">
                      ❤️ {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {post.comments}
                    </span>
                  </div>
                  <button
                    id={`btn-shop-fit-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/product");
                    }}
                    className="pointer-events-auto px-3 py-1.5 rounded-lg bg-white/95 dark:bg-slate-900 text-[9px] font-black uppercase tracking-wider text-slate-900 dark:text-white transition transform active:scale-95 shadow-xs hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 cursor-pointer"
                  >
                    Shop Fit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMMUNITY REVIEWS ── */}
      <section
        id="community-reviews-section"
        className="mx-auto max-w-7xl px-6 py-12 overflow-hidden"
      >
        <div className="mb-10 text-center">
          <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block">
            What Our Customers Say
          </span>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
            Loved by our Community
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Real stories from verified customers around the globe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

          {/* Left Columns - floats/slides in from left */}
          <div className="space-y-6 flex flex-col justify-between">
            {reviews.slice(0, 2).map((rev, idx) => (
              <div
                key={rev.id}
                id={`reviews-card-${rev.id}`}
                className={`transform transition-all duration-1000 ease-out ${reviewsInView
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-24 opacity-0"
                  }`}
              >
                <div className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[28px] p-6 shadow-xs relative hover:shadow-md hover:border-indigo-500/20 text-left ${idx % 2 === 0 ? "animate-float-slow" : "animate-float-slow [animation-delay:2s]"
                  }`}>
                  {/* Quote Decor */}
                  <div className="absolute top-4 right-6 text-slate-100 dark:text-slate-800/80 font-serif text-6xl leading-none select-none pointer-events-none">
                    “
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-750'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-light italic pr-6">
                    "{rev.comment}"
                  </p>

                  <div className="mt-5 flex items-center gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {rev.initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        {rev.name}
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[7px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full uppercase">
                          ✓ Verified
                        </span>
                      </h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Purchased: <span className="font-semibold text-slate-500 dark:text-slate-400">{rev.product}</span> · {rev.date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Columns - floats/slides in from right */}
          <div className="space-y-6 flex flex-col justify-between">
            {reviews.slice(2, 4).map((rev, idx) => (
              <div
                key={rev.id}
                id={`reviews-card-${rev.id}`}
                className={`transform transition-all duration-1000 ease-out ${reviewsInView
                    ? "translate-x-0 opacity-100"
                    : "translate-x-24 opacity-0"
                  }`}
              >
                <div className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[28px] p-6 shadow-xs relative hover:shadow-md hover:border-indigo-500/20 text-left ${idx % 2 === 0 ? "animate-float-slow [animation-delay:1s]" : "animate-float-slow [animation-delay:3s]"
                  }`}>
                  {/* Quote Decor */}
                  <div className="absolute top-4 right-6 text-slate-100 dark:text-slate-800/80 font-serif text-6xl leading-none select-none pointer-events-none">
                    “
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-750'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-light italic pr-6">
                    "{rev.comment}"
                  </p>

                  <div className="mt-5 flex items-center gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {rev.initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        {rev.name}
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[7px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full uppercase">
                          ✓ Verified
                        </span>
                      </h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Purchased: <span className="font-semibold text-slate-500 dark:text-slate-400">{rev.product}</span> · {rev.date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── TRUST INDICATORS ── */}
      <section className="border-t border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/10 py-10 mt-12">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-indigo-900/30">
              <Truck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Free Shipping</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">On orders above ₹999</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100/50 dark:border-emerald-900/30">
              <RotateCcw size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">30 Day Returns</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Easy, hassle-free returns</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100/50 dark:border-amber-900/30">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Secure Checkout</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">SSL secure checkout</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-100/50 dark:border-sky-900/30">
              <HelpCircle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">24/7 Support</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Dedicated customer help</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;

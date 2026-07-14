import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, CheckCircle, ThumbsUp, MessageSquare, ShieldCheck } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../../config";

const TestimonialCard = ({ item, idx, direction }) => {
  const isLeftCard = idx === 0;
  const exitX = isLeftCard
    ? (direction === "next" ? "-120%" : "120%")
    : (direction === "next" ? "120%" : "-120%");
  const exitRotate = isLeftCard
    ? (direction === "next" ? -5 : 5)
    : (direction === "next" ? 5 : -5);

  const starContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.45 // Animate after card entry completes
      }
    }
  };

  const starVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    }
  };

  const badgeVariants = {
    hidden: { scale: 0.85, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4, delay: 0.8, ease: "easeOut" } // Fades in last
    }
  };

  const [helpfulCount, setHelpfulCount] = useState(item.helpfulCount || 0);
  const [hasClickedHelpful, setHasClickedHelpful] = useState(false);

  const handleHelpful = (e) => {
    e.stopPropagation();
    if (hasClickedHelpful) {
      setHelpfulCount(prev => prev - 1);
      setHasClickedHelpful(false);
    } else {
      setHelpfulCount(prev => prev + 1);
      setHasClickedHelpful(true);
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95, x: 0 },
        visible: { 
          opacity: 1, 
          scale: 1, 
          x: 0,
          transition: { duration: 0.6, ease: [0.645, 0.045, 0.355, 1] } 
        },
        exit: { 
          opacity: 0, 
          scale: 0.9, 
          x: exitX,
          rotate: exitRotate,
          boxShadow: "0 30px 60px -15px rgba(0,0,0,0.15)",
          transition: { duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }
        }
      }}
      whileHover={{
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.12)",
        borderColor: "rgba(59, 130, 246, 0.3)"
      }}
      className="bg-white/85 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.06] rounded-[24px] p-6 shadow-[0_15px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between text-left h-full min-h-[300px] w-full max-w-[550px] mx-auto transition-all duration-300 relative group overflow-hidden backdrop-blur-xl"
    >
      {/* Glass reflection effect inside card */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div>
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            {/* Customer avatar (56px circular) */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shadow-inner"
            >
              {item.avt ? (
                <img src={item.avt} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">{item.initials || item.name.charAt(0).toUpperCase()}</span>
              )}
            </motion.div>

            <div className="leading-tight">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-extrabold text-[14.5px] text-slate-800 dark:text-slate-200 tracking-tight">
                  {item.name}
                </h4>
                {/* Country flag */}
                {item.flag && <span className="text-sm select-none" title={`Verified purchase from ${item.flag}`}>{item.flag}</span>}
                
                {/* Top Reviewer badge */}
                {item.topReviewer && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-[8px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider scale-95 select-none">
                    Top Reviewer
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                {/* Animated Verified Buyer badge with green checkmark */}
                <motion.span
                  variants={badgeVariants}
                  className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide bg-emerald-500/10 dark:bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/20"
                >
                  <CheckCircle size={9} className="fill-emerald-500 stroke-white dark:stroke-slate-950 scale-110" />
                  <span>Verified Buyer</span>
                </motion.span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  {item.date}
                </span>
              </div>
            </div>
          </div>

          {/* 5-star rating aligned right */}
          <motion.div
            variants={starContainerVariants}
            className="flex gap-0.5 text-amber-500 shrink-0 mt-1"
          >
            {[...Array(5)].map((_, i) => {
              const isFilled = i < Math.round(item.rate || 5);
              return (
                <motion.div
                  key={i}
                  variants={starVariants}
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  className="transition-transform duration-200"
                >
                  <Star
                    size={13}
                    className={isFilled ? "fill-amber-400 stroke-none shimmer-star" : "fill-slate-200 dark:fill-slate-800 stroke-none"}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Review Content */}
        <div className="mb-4">
          <h5 className="font-extrabold text-[13.5px] text-slate-800 dark:text-slate-100 mb-1.5 tracking-tight">
            {item.title || "Highly Recommended"}
          </h5>
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-4 select-text">
            "{item.review}"
          </p>
        </div>

        {/* Product Information Section */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-white/[0.03] mb-4 group/prod relative">
          <div className="flex items-center gap-3">
            {/* Small product thumbnail */}
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-white shrink-0 relative">
              <img src={item.productThumbnail} alt={item.productName} className="w-full h-full object-cover" />
              
              {/* Product image preview on hover */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/prod:opacity-100 transition-opacity duration-200 pointer-events-none" />
            </div>
            
            <div className="leading-tight text-left">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {item.category}
              </span>
              <span className="font-bold text-[11.5px] text-slate-700 dark:text-slate-300 block truncate max-w-[180px] sm:max-w-[220px]">
                {item.productName}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-600 block">
              {item.orderNo || "#CN-0000"}
            </span>
          </div>
          
          {/* Hover large floating image preview tooltip */}
          <div className="absolute bottom-[110%] left-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xl w-36 h-36 opacity-0 scale-90 group-hover/prod:opacity-100 group-hover/prod:scale-100 pointer-events-none transition-all duration-350 z-30 overflow-hidden">
            <img src={item.productThumbnail} alt={item.productName} className="w-full h-full object-cover rounded-xl" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div>
        <div className="w-full h-[1px] bg-slate-100 dark:bg-white/[0.04] mb-3.5" />
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-3">
            {/* Helpful button with count */}
            <button
              onClick={handleHelpful}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 select-none cursor-pointer ${
                hasClickedHelpful
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-500 dark:text-blue-400"
                  : "bg-transparent border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              <ThumbsUp size={11} className={hasClickedHelpful ? "fill-blue-500" : ""} />
              <span>Helpful ({helpfulCount})</span>
            </button>

            {/* Reply Button */}
            <button className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer select-none">
              <MessageSquare size={11} />
              <span>Reply</span>
            </button>
          </div>

          <div className="flex items-center gap-1 select-none">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-500">
              Verified Purchase
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CustomerTestimonials = () => {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [direction, setDirection] = useState("next"); // "next" or "prev"
  const [isAnimating, setIsAnimating] = useState(false);

  const defaultTestimonials = [
    {
      name: "Aarav Sharma",
      title: "Premium materials & outstanding fit!",
      rate: 5,
      review: "Absolutely in love with the quality of the technical joggers. They fit beautifully, have spacious zipper pockets, and are so premium to touch.",
      date: "2 days ago",
      avt: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      flag: "🇮🇳",
      topReviewer: true,
      productThumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
      productName: "Premium Cotton Joggers v2",
      category: "Apparel",
      orderNo: "#CN-9821A",
      helpfulCount: 14
    },
    {
      name: "Priya Patel",
      title: "Unbelievably fast next-day transit",
      rate: 5,
      review: "Perfect checkout experience and next-day delivery on the sports sneakers! 100% genuine products, and they match the pictures perfectly.",
      date: "1 week ago",
      avt: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      flag: "🇮🇳",
      topReviewer: false,
      productThumbnail: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=150&auto=format&fit=crop&q=80",
      productName: "Speed Athletic Sneakers",
      category: "Footwear",
      orderNo: "#CN-4412B",
      helpfulCount: 28
    },
    {
      name: "Rohan Das",
      title: "Extremely accurate sound recommendation",
      rate: 4.8,
      review: "The AI Shopping Assistant recommended the exact earbuds I needed. Deep bass response, clear high notes, fast transit and excellent returns path.",
      date: "3 days ago",
      avt: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      flag: "🇺🇸",
      topReviewer: true,
      productThumbnail: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150&auto=format&fit=crop&q=80",
      productName: "TrueWireless Earbuds Pro",
      category: "Electronics",
      orderNo: "#CN-7761C",
      helpfulCount: 9
    },
    {
      name: "Sneha Reddy",
      title: "Excellent customer service sizing help",
      rate: 5,
      review: "Verified hub checked. Highly satisfied with customer support who helped resize my jacket immediately after checking sizing charts.",
      date: "5 days ago",
      avt: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      flag: "🇬🇧",
      topReviewer: false,
      productThumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      productName: "Winter Parka Coat Extreme",
      category: "Outerwear",
      orderNo: "#CN-2190D",
      helpfulCount: 31
    }
  ];

  const [testimonials, setTestimonials] = useState(defaultTestimonials);

  useEffect(() => {
    const fetchAppReviews = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/app-reviews`);
        if (response.data.success && response.data.reviews && response.data.reviews.length > 0) {
          const backendTestimonials = response.data.reviews.map((rev, index) => ({
            name: rev.name,
            title: rev.title || "Highly Satisfied Customer",
            rate: rev.rating,
            review: rev.comment,
            date: rev.date || "Just now",
            avt: rev.profilePhoto || "",
            initials: rev.initials || rev.name.charAt(0).toUpperCase(),
            flag: ["🇮🇳", "🇺🇸", "🇬🇧", "🇨🇦", "🇩🇪"][index % 5],
            topReviewer: index % 3 === 0,
            productThumbnail: rev.productImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80",
            productName: rev.productName || "CartNow Select Item",
            category: rev.category || "E-Commerce",
            orderNo: rev.orderId || `#CN-${Math.floor(1000 + Math.random() * 9000)}X`,
            helpfulCount: rev.helpfulCount || Math.floor(Math.random() * 15)
          }));
          setTestimonials([...backendTestimonials, ...defaultTestimonials]);
        }
      } catch (error) {
        console.error("Error fetching app reviews:", error);
      }
    };
    fetchAppReviews();
  }, []);

  const handlePrevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection("prev");
    setTestimonialIdx(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection("next");
    setTestimonialIdx(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="w-full px-6 sm:px-12 lg:px-20 py-2 select-none overflow-hidden">
      {/* Star Shimmer Animation CSS style */}
      <style>{`
        @keyframes star-shimmer {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08) rotate(3deg); opacity: 0.9; }
        }
        .shimmer-star {
          animation: star-shimmer 2.2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="text-left">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            Loved By Thousands Of Happy Customers
          </h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">
            Read verified feedback from global buyers checkout review hub.
          </p>
        </div>

        {/* Carousel Arrows */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handlePrevTestimonial}
            disabled={isAnimating}
            className={`h-9 w-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm transition duration-300 ${
              isAnimating ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNextTestimonial}
            disabled={isAnimating}
            className={`h-9 w-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm transition duration-300 ${
              isAnimating ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Carousel Slider Cards Container */}
      <div className="relative overflow-hidden w-full min-h-[340px]">
        <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(false)}>
          <motion.div
            key={testimonialIdx}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
          >
            {[
              testimonials[testimonialIdx],
              testimonials[(testimonialIdx + 1) % testimonials.length]
            ].filter(Boolean).map((item, idx) => (
              <TestimonialCard 
                key={idx} 
                item={item} 
                idx={idx} 
                direction={direction} 
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-1.5 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            disabled={isAnimating}
            onClick={() => {
              if (isAnimating || testimonialIdx === i) return;
              setIsAnimating(true);
              setDirection(i > testimonialIdx ? "next" : "prev");
              setTestimonialIdx(i);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              isAnimating ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            } ${testimonialIdx === i ? "w-6 bg-blue-600 dark:bg-blue-500" : "w-2 bg-slate-200 dark:bg-slate-800"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default CustomerTestimonials;

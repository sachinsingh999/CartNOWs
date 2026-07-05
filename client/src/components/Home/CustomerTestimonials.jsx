import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../../config";

const CustomerTestimonials = () => {
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const defaultTestimonials = [
    { name: "Aarav Sharma", rate: 5, review: "Absolutely in love with the quality of the technical joggers. They fit beautifully and are so premium to touch.", date: "Delhi / 2 days ago", avt: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
    { name: "Priya Patel", rate: 5, review: "Perfect checkout experience and next-day delivery on the sports sneakers! 100% genuine products.", date: "Mumbai / 1 week ago", avt: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
    { name: "Rohan Das", rate: 4.8, review: "The AI Shopping Assistant recommended the exact earbuds I needed. Fast transit and excellent returns path.", date: "Bangalore / 3 days ago", avt: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
    { name: "Sneha Reddy", rate: 5, review: "Verified hub checked. Highly satisfied with customer support who helped resize my jacket immediately.", date: "Hyderabad / 5 days ago", avt: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" }
  ];

  const [testimonials, setTestimonials] = useState(defaultTestimonials);

  useEffect(() => {
    const fetchAppReviews = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/app-reviews`);
        if (response.data.success && response.data.reviews && response.data.reviews.length > 0) {
          const backendTestimonials = response.data.reviews.map(rev => ({
            name: rev.name,
            rate: rev.rating,
            review: rev.comment,
            date: `Platform / ${rev.date}`,
            avt: rev.profilePhoto || "",
            initials: rev.initials || rev.name.charAt(0).toUpperCase()
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
    setTestimonialIdx(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  
  const handleNextTestimonial = () => {
    setTestimonialIdx(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="w-full px-6 sm:px-12 lg:px-20 py-6 select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
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
            className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 cursor-pointer transition shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNextTestimonial}
            className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 cursor-pointer transition shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Carousel Slider Cards Container */}
      <div className="relative overflow-hidden w-full min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={testimonialIdx}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[
              testimonials[testimonialIdx],
              testimonials[(testimonialIdx + 1) % testimonials.length]
            ].filter(Boolean).map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-[28px] p-6 shadow-xs flex flex-col justify-between text-left h-[200px]">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                      {item.avt ? (
                        <img src={item.avt} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm">{item.initials || item.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="leading-none">
                      <h4 className="font-extrabold text-[13px] text-slate-800 dark:text-slate-200">{item.name}</h4>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 block">{item.date}</span>
                    </div>
                  </div>

                  <div className="flex gap-0.5 text-amber-500 my-3">
                    {[...Array(5)].map((_, i) => {
                      const isFilled = i < Math.round(item.rate || 5);
                      return (
                        <Star
                          key={i}
                          size={11}
                          className={isFilled ? "fill-amber-500 stroke-none" : "fill-slate-200 dark:fill-slate-800 stroke-none"}
                        />
                      );
                    })}
                  </div>

                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed line-clamp-3">
                    "{item.review}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-auto flex items-center justify-between text-[8.5px] font-black tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                  <span>✓ Verified Buyer</span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-1.5 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setTestimonialIdx(i)}
            className={`h-2 rounded-full transition-all duration-300 ${ testimonialIdx === i ? "w-6 bg-blue-600 dark:bg-blue-500" : "w-2 bg-slate-200 dark:bg-slate-800" }`}
          />
        ))}
      </div>
    </section>
  );
};

export default CustomerTestimonials;

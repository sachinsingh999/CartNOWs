import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  ShieldCheck, 
  Package, 
  Truck, 
  Sparkles, 
  ArrowRight, 
  ShoppingBag,
  Clock
} from "lucide-react";
import confetti from "canvas-confetti";

// Web Audio API soft celebration chime
const playCelebrationChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    // Smooth pleasant major chord (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.65);
    });
  } catch (err) {
    // Graceful fallback if audio is blocked by browser policy
  }
};

const triggerConfettiBurst = () => {
  try {
    // Left cannon
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.65 },
      colors: ["#22c55e", "#f97316", "#3b82f6", "#eab308", "#a855f7"]
    });

    // Right cannon
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.65 },
      colors: ["#22c55e", "#f97316", "#3b82f6", "#eab308", "#a855f7"]
    });

    // Center star burst after slight delay
    setTimeout(() => {
      confetti({
        particleCount: 65,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        ticks: 200,
        gravity: 1.1,
        decay: 0.92,
        scalar: 1.1,
        colors: ["#10b981", "#f59e0b", "#6366f1", "#ec4899", "#38bdf8"]
      });
    }, 250);
  } catch (err) {
    // Ignore canvas errors in edge environments
  }
};

const OrderSuccessCelebrationModal = ({
  isOpen = true,
  orderId = "",
  orderTotal = 0,
  itemCount = 1,
  onComplete,
  duration = 3200
}) => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (!isOpen) return;

    // Trigger audio chime & confetti cannons
    playCelebrationChime();
    triggerConfettiBurst();

    // Step-by-step dispatch timeline progression
    const step2Timer = setTimeout(() => setActiveStep(2), 700);
    const step3Timer = setTimeout(() => setActiveStep(3), 1500);

    // Auto-advance to order receipt
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(completeTimer);
    };
  }, [isOpen, onComplete, duration]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-slate-950/85 backdrop-blur-xl select-none"
      >
        {/* Ambient Radial Background Glows */}
        <div className="absolute w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none -top-24 -left-24 animate-pulse" />
        <div className="absolute w-[450px] h-[450px] bg-orange-500/15 rounded-full blur-[120px] pointer-events-none -bottom-24 -right-24 animate-pulse" />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-none shadow-2xl p-6 sm:p-8 text-center overflow-hidden"
        >
          {/* Top Decorative Micro-Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-orange-500" />

          {/* Sparkles Top-Right Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-6 shadow-2xs">
            <Sparkles size={12} className="animate-spin" />
            <span>Order Confirmed & Placed</span>
          </div>

          {/* Hero Animated Checkmark Circle */}
          <div className="relative mx-auto mb-6 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
            {/* Outer Expanding Pulse Waves */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1.6], opacity: [0.6, 0.2, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-emerald-500/30 dark:bg-emerald-400/20"
            />
            
            {/* Inner Glowing Backdrop Circle */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/30 flex items-center justify-center" />

            {/* Animated SVG Path Checkmark */}
            <svg
              className="relative w-12 h-12 sm:w-14 sm:h-14 text-white"
              viewBox="0 0 52 52"
              fill="none"
            >
              {/* Checkmark Circle Ring Draw */}
              <motion.circle
                cx="26"
                cy="26"
                r="24"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="opacity-40"
              />
              {/* Checkmark Polyline Draw */}
              <motion.path
                d="M14 27 L22 35 L38 18"
                stroke="white"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
              />
            </svg>
          </div>

          {/* Title & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-1.5 mb-6"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Woohoo! You're All Set! 🎉
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Your order has been recorded and is being prepared with priority care.
            </p>
          </motion.div>

          {/* Order Details Micro-Pill */}
          {orderId && (
            <div className="inline-flex items-center justify-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 mb-6 w-full max-w-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Order ID:</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                #{orderId.slice(-8)}
              </span>
              {orderTotal > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    ₹{orderTotal.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Progressive 3-Step Live Dispatch Reel */}
          <div className="space-y-2 mb-6 text-left">
            {/* Step 1: Payment Verification */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`flex items-center gap-3 p-2.5 rounded-none border transition-all duration-300 ${
                activeStep >= 1
                  ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="w-7 h-7 rounded-none bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck size={14} className="stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Payment Authorized
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Verified ✓
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Protected with 256-Bit Bank-Grade Encryption
                </p>
              </div>
            </motion.div>

            {/* Step 2: Order Sent to Store */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className={`flex items-center gap-3 p-2.5 rounded-none border transition-all duration-300 ${
                activeStep >= 2
                  ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60"
              }`}
            >
              <div className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 shadow-2xs ${
                activeStep >= 2 ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
              }`}>
                <Package size={14} className="stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Items Allocated to Seller
                  </span>
                  {activeStep >= 2 && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Confirmed ✓
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Inventory reserved & invoice generated
                </p>
              </div>
            </motion.div>

            {/* Step 3: Courier Tracking */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className={`flex items-center gap-3 p-2.5 rounded-none border transition-all duration-300 ${
                activeStep >= 3
                  ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60"
              }`}
            >
              <div className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 shadow-2xs ${
                activeStep >= 3 ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
              }`}>
                <Truck size={14} className="stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Express Delivery Scheduled
                  </span>
                  {activeStep >= 3 && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Live
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Estimated 2-4 business days delivery
                </p>
              </div>
            </motion.div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => onComplete && onComplete()}
            className="w-full py-3 px-4 bg-slate-950 dark:bg-white hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-slate-950 hover:text-white dark:hover:text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md group"
          >
            <span>View Receipt & Tracking Details</span>
            <ArrowRight size={14} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderSuccessCelebrationModal;

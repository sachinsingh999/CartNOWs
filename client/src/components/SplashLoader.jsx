/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";

const SplashLoader = ({ stage, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2200; // 2.2s loading duration for high-end feel

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(1, elapsed / duration);
      // Quintic ease out for a luxury, decrescendo speed build-up
      const easeOutRatio = 1 - Math.pow(1 - progressRatio, 5);
      const computed = Math.min(100, Math.floor(easeOutRatio * 100));

      setProgress(computed);

      if (elapsed < duration) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500); // Polished delay
      }
    };

    requestAnimationFrame(updateProgress);
  }, [onComplete]);

  // Framer Motion premium layout transitions
  const containerVariants = {
    initial: {
      clipPath: "circle(150% at 50% 50%)",
      opacity: 1
    },
    exit: {
      clipPath: "circle(0% at 50% 50%)",
      opacity: 0,
      transition: {
        duration: 1.4,
        ease: [0.76, 0, 0.24, 1], // Custom slow-out bezier
      },
    },
  };

  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 15,
        mass: 1.0,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      exit="exit"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-slate-100 dark:text-white overflow-hidden select-none"
    >
      <style>{`
        .splash-logo-active .logo-wheel {
          animation: logo-spin 1s linear infinite;
        }
        .splash-logo-active .logo-wheel-1 {
          transform-origin: 46px 65.5px;
        }
        .splash-logo-active .logo-wheel-2 {
          transform-origin: 82px 65.5px;
        }
        .splash-logo-active .logo-trail-1 {
          animation: logo-slide 0.5s ease-in-out infinite alternate;
        }
        .splash-logo-active .logo-trail-2 {
          animation: logo-slide 0.5s ease-in-out infinite alternate 0.12s;
        }
        .splash-logo-active .logo-trail-3 {
          animation: logo-slide 0.5s ease-in-out infinite alternate 0.24s;
        }
        .splash-logo-active .logo-basket {
          animation: logo-bounce 0.7s ease-in-out infinite;
        }
        .splash-logo-active .logo-leash {
          animation: logo-dash 0.5s linear infinite;
        }
        .splash-logo-active .logo-runner-n {
          transform: skewX(-3deg) translateX(0.5px);
          transition: transform 0.3s ease;
        }

        @keyframes logo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes logo-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(5px); }
        }
        @keyframes logo-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes logo-dash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -8; }
        }
      `}</style>

      {/* Centered layout panel */}
      <div className="flex flex-col items-center justify-center z-10 w-full max-w-xs px-6 text-center">

        {/* Elastic Brand Logo with shared layoutId */}
        <motion.div
          layoutId="brand-logo"
          transition={{
            ease: [0.16, 1, 0.3, 1], // easeOutExpo
            duration: 0.7,
          }}
          variants={logoVariants}
          animate="animate"
          initial="initial"
          className="flex items-center justify-center relative z-10"
        >
          <Logo 
            forceWhite={true}
            className="h-13 sm:h-15 w-auto text-slate-100 dark:text-white splash-logo-active" 
          />
        </motion.div>

        {/* Minimalist horizontal progress bar */}
        <div className={`mt-8 flex flex-col items-center justify-center w-full transition-all duration-550 ${stage === "splash-move" ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100" }`}>
          <div className="w-36 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute left-0 top-0 h-full bg-white dark:bg-slate-900"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-slate-400 mt-2.5 select-none">
            {progress}%
          </span>
        </div>
      </div>

      {/* Clean low-profile bottom branding */}
      <div className={`absolute bottom-8 left-0 right-0 text-center pointer-events-none transition-opacity duration-550 ${stage === "splash-move" ? "opacity-0" : "opacity-35" }`}>
        <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-slate-500">
          CARTNOW PREMIUM RETAIL
        </span>
      </div>
    </motion.div>
  );
};

export default SplashLoader;

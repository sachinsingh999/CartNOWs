import React, { useState, useRef, useEffect } from "react";

const BeforeAfterSlider = ({ beforeImage, afterImage }) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage (0 to 100)
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full h-[450px] sm:h-[500px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 select-none group cursor-ew-resize"
    >
      {/* Before Image (Background) */}
      <img 
        src={beforeImage} 
        alt="Original Model" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none p-4"
      />
      <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-slate-100 dark:text-white uppercase tracking-wider">
        Original
      </div>

      {/* After Image (Foreground, clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
      >
        <img 
          src={afterImage} 
          alt="AI Try-On Result" 
          className="absolute inset-0 w-full h-full object-contain pointer-events-none p-4"
          style={{ width: containerRef.current?.getBoundingClientRect().width }}
        />
        <div className="absolute top-4 right-4 z-20 bg-indigo-600/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-slate-100 dark:text-white uppercase tracking-wider">
          Try-On Result
        </div>
      </div>

      {/* Slide Handle bar */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white dark:bg-slate-900 shadow-xl z-30"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Handle Button indicator */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 shadow-2xl flex items-center justify-center pointer-events-none z-40 transition-transform group-hover:scale-105">
          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 9l-4 4 4 4m8 0l4-4-4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;

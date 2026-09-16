import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, MoveHorizontal } from "lucide-react";

const BeforeAfterSlider = ({ beforeImage, afterImage, title = "Virtual Fitting Comparison" }) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage (0 to 100)
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState("split"); // "split" | "before" | "after"
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, handleMove]);

  const effectivePos = viewMode === "before" ? 100 : viewMode === "after" ? 0 : sliderPos;

  return (
    <div className="space-y-2 select-none">
      {/* View Switcher Controls */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles size={11} className="text-orange-500 animate-pulse" />
          <span>{title}</span>
        </span>

        <div className="flex items-center gap-1 p-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase">
          <button
            onClick={() => setViewMode("before")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              viewMode === "before"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setViewMode("split")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              viewMode === "split"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode("after")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              viewMode === "after"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            AI Result
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className="relative w-full aspect-[3/4] sm:h-[440px] rounded-lg overflow-hidden shadow-md border border-slate-200/80 dark:border-slate-800 bg-slate-950 cursor-ew-resize group"
      >
        {/* Background Layer: After (AI Generation) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={afterImage}
            alt="AI Try-On Result"
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* Foreground Layer: Before (Original Model, clipped) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${effectivePos}% 0, ${effectivePos}% 100%, 0 100%)` }}
        >
          <img
            src={beforeImage}
            alt="Original Model"
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase text-white tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Original Photo</span>
        </div>

        <div className="absolute top-3 right-3 z-20 pointer-events-none flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600/90 backdrop-blur-md border border-indigo-400/30 text-[9px] font-black uppercase text-white tracking-wider">
          <Sparkles size={9} className="text-amber-300 animate-pulse" />
          <span>AI Fitted Result</span>
        </div>

        {/* Draggable Divider Handle */}
        {viewMode === "split" && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-30"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-md bg-slate-950 border border-white shadow-xl flex items-center justify-center pointer-events-none">
              <MoveHorizontal size={13} className="text-white" />
            </div>
          </div>
        )}

        {/* Bottom Hint */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-2.5 py-0.5 rounded bg-slate-950/70 backdrop-blur-md border border-white/10 text-[8.5px] font-bold text-slate-300">
          Drag slider left or right to compare
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;

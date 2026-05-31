import React, { useState } from "react";
import { useComparison } from "../context/ComparisonContext";
import ComparisonModal from "./ComparisonModal";
import { X, ArrowRight, BarChart2 } from "lucide-react";
import { backendUrl } from "../config";

const ComparisonTray = () => {
  const { compareList, removeFromCompare, clearCompare } = useComparison();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (compareList.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
        <div className="flex flex-col gap-3 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-2xl w-80 md:w-96 text-left transition-all duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <BarChart2 size={16} />
              <span className="font-extrabold text-xs uppercase tracking-wider">
                Compare Products ({compareList.length}/3)
              </span>
            </div>
            <button 
              onClick={clearCompare}
              className="text-[10px] font-bold text-slate-450 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Product list preview grid */}
          <div className="flex gap-2.5 overflow-x-auto py-1">
            {compareList.map((product) => {
              const imgUrl = product.images?.[0]?.startsWith("http")
                ? product.images[0]
                : `${backendUrl}/${product.images?.[0]}`;
              return (
                <div 
                  key={product._id}
                  className="relative flex flex-col items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 group select-none flex-shrink-0 w-[80px]"
                >
                  <button
                    onClick={() => removeFromCompare(product._id)}
                    className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 bg-slate-200 hover:bg-rose-500 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer shadow-sm transition-all"
                  >
                    <X size={10} />
                  </button>
                  <div className="h-10 w-10 flex items-center justify-center overflow-hidden bg-white rounded-lg p-0.5 border border-slate-100">
                    <img src={imgUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-650 dark:text-slate-400 mt-1.5 truncate max-w-full block">
                    {product.name.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-150/40 dark:shadow-slate-950 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <span>Compare Now</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

        </div>
      </div>

      {isModalOpen && (
        <ComparisonModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default ComparisonTray;

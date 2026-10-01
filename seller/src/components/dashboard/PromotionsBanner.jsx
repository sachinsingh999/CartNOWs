import React from "react";
import { Gift, ArrowRight, Tag } from "lucide-react";

const PromotionsBanner = ({ onOpenOfferModal }) => {
  return (
    <div className="rounded-xl bg-[#0B132B] text-white p-2.5 sm:p-3 shadow-xs border border-amber-500/30 text-left transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Gift size={16} />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                Special Event
              </span>
              <h4 className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Festive Super Sale is Live!</span>
                <span className="text-amber-400">🎉</span>
              </h4>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              Join the platform campaign to get up to <strong className="text-amber-400 font-bold">3x more store visibility</strong> and boost sales.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onOpenOfferModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 transition shadow-xs cursor-pointer shrink-0 active:scale-95"
        >
          <Tag size={13} className="text-slate-950" />
          <span>Create Offer</span>
          <ArrowRight size={12} className="text-slate-950" />
        </button>
      </div>
    </div>
  );
};

export default PromotionsBanner;

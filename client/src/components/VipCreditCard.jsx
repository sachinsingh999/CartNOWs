import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Wifi,
  Star,
  Gift,
  ChevronRight,
  Crown,
  Truck,
  Tag,
  Lock,
  Unlock,
  ShieldAlert,
  Copy,
  Check,
  Eye,
  EyeOff
} from "lucide-react";
import VipSecurityModal from "./VipSecurityModal";
import VipCodeSettingsModal from "./VipCodeSettingsModal";

/**
 * VIP Membership Card Component for CartNow
 * Features:
 * - Double-click on card (desktop) / Accessible action button (mobile)
 * - Protected MEMBERSHIP ID (hidden until 5-minute security verification succeeds)
 * - Server-authoritative VIP status, cashback rates, points multiplier
 * - Motion animations respecting prefers-reduced-motion
 */
const VipCreditCard = ({ user = {}, token = "" }) => {
  const [unmaskedId, setUnmaskedId] = useState(null);
  const [remainingUnlockSeconds, setRemainingUnlockSeconds] = useState(0);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsMode, setSettingsMode] = useState("change");
  const [cardScale, setCardScale] = useState(1);
  const [copied, setCopied] = useState(false);

  const touchTimerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const m = user.membership || {};
  const levelName = m.levelName || "Member";
  const cashbackRatePct = m.cashbackRate ? (m.cashbackRate * 100).toFixed(1) + "%" : "1.0%";
  const pointsMult = m.pointsMultiplier ? m.pointsMultiplier + "×" : "1×";
  const cardId = user._id ? user._id.slice(-4).toUpperCase() : "B5D5";
  const expires = "08/29";

  const maskedMembershipId = `4532 •••• •••• ${cardId}`;
  const displayedMembershipId = unmaskedId ? unmaskedId : maskedMembershipId;

  // 5-minute countdown timer for unlocked memory state
  useEffect(() => {
    let timer;
    if (remainingUnlockSeconds > 0) {
      timer = setInterval(() => {
        setRemainingUnlockSeconds((prev) => {
          if (prev <= 1) {
            setUnmaskedId(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [remainingUnlockSeconds]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Handle Double Click (Desktop)
  const handleDoubleClick = () => {
    if (!shouldReduceMotion) {
      setCardScale(1.02);
      setTimeout(() => setCardScale(1), 300);
    }
    setIsSecurityModalOpen(true);
  };

  // Handle Touch Start (Mobile Long Press)
  const handleTouchStart = () => {
    touchTimerRef.current = setTimeout(() => {
      handleDoubleClick();
    }, 600);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
  };

  const handleUnlockSuccess = ({ unmaskedId: returnedId, expiresInSeconds }) => {
    setUnmaskedId(returnedId);
    setRemainingUnlockSeconds(expiresInSeconds || 300);
    if (!shouldReduceMotion) {
      setCardScale(1.03);
      setTimeout(() => setCardScale(1), 400);
    }
  };

  const handleCopyId = (e) => {
    e.stopPropagation();
    const cleanId = displayedMembershipId.replace(/\s+/g, "");
    navigator.clipboard.writeText(cleanId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.div
        animate={{ scale: cardScale }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full rounded-xl p-4 sm:p-5 text-white shadow-2xl overflow-hidden select-none border border-cyan-500/30 bg-[#070b14] transition-all duration-300 hover:border-cyan-400/50 flex flex-col justify-between space-y-3 sm:space-y-3.5 cursor-pointer"
        title="Double-click to unlock VIP Security"
      >
        {/* Background Crystal Wireframe Mesh & Glow Effects */}
        <div
          className="absolute inset-0 bg-cover bg-right opacity-30 mix-blend-screen pointer-events-none"
          style={{ backgroundImage: `url('/diamond_card_crystal_mesh.jpg')` }}
        />
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-600/10 blur-3xl pointer-events-none" />

        {/* TOP HEADER BAR */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-black text-base min-[380px]:text-lg sm:text-xl tracking-tight text-white drop-shadow-md whitespace-nowrap">
              Cart<span className="text-orange-500">Now</span>
            </span>

            {/* DIAMOND VIP GLOWING BADGE */}
            <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 text-slate-950 font-black text-[9px] min-[380px]:text-[10px] sm:text-[11px] shadow-md tracking-wide uppercase whitespace-nowrap">
              <Sparkles size={11} className="fill-slate-950 text-slate-950 shrink-0" />
              <span>{levelName.toUpperCase()}</span>
            </div>

            <Wifi className="rotate-90 text-slate-300 hidden min-[360px]:block shrink-0" size={14} />
          </div>


        </div>

        {/* MIDDLE ROW: CHIP & GLASS STATS BOX */}
        <div className="relative z-10 my-auto flex items-center gap-2.5 sm:gap-4">
          {/* Metallic 3D Gold Chip */}
          <div className="h-8 w-11 min-[380px]:h-9 min-[380px]:w-13 rounded-lg bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500 border border-yellow-200/80 shadow-lg p-1 flex flex-col justify-between relative overflow-hidden shrink-0">
            <div className="w-full h-[1px] bg-amber-900/40 my-auto" />
            <div className="w-full h-[1px] bg-amber-900/40 my-auto" />
            <div className="absolute inset-x-1.5 inset-y-1 border-x border-amber-900/40" />
          </div>

          {/* FLOATING DARK GLASS STATS PILL BOX */}
          <div className="flex-1 rounded-xl bg-[#0d1627]/85 border border-slate-700/60 p-1.5 min-[380px]:p-2 sm:p-2.5 flex items-center justify-around backdrop-blur-md shadow-inner overflow-hidden">
            <div className="flex items-center gap-1.5 min-[380px]:gap-2">
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border border-cyan-400/40 bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black text-[10px] sm:text-[11px] shrink-0">
                %
              </div>
              <div className="text-left">
                <p className="text-[6.5px] sm:text-[7.5px] font-black uppercase text-slate-400 tracking-wider leading-none whitespace-nowrap">
                  CASHBACK RATE
                </p>
                <p className="text-[11px] sm:text-xs font-mono font-black text-cyan-400 mt-0.5 leading-none whitespace-nowrap">
                  {cashbackRatePct}
                </p>
              </div>
            </div>

            <div className="h-5 sm:h-6 w-[1px] bg-slate-800 shrink-0 mx-1" />

            <div className="flex items-center gap-1.5 min-[380px]:gap-2">
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border border-purple-400/40 bg-purple-500/10 flex items-center justify-center text-purple-300 shrink-0">
                <Star size={11} className="fill-purple-400 text-purple-400 sm:w-3.5 sm:h-3.5" />
              </div>
              <div className="text-left">
                <p className="text-[6.5px] sm:text-[7.5px] font-black uppercase text-slate-400 tracking-wider leading-none whitespace-nowrap">
                  POINTS MULTIPLIER
                </p>
                <p className="text-[11px] sm:text-xs font-mono font-black text-purple-300 mt-0.5 leading-none whitespace-nowrap">
                  {pointsMult}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MEMBERSHIP ID ROW (EXPLICIT LOYALTY IDENTIFIER LABEL) */}
        <div className="relative z-10 space-y-0.5 my-auto">
          <div className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-widest text-slate-400">
            <span>MEMBERSHIP ID</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="font-mono text-sm min-[360px]:text-base sm:text-lg md:text-xl font-black tracking-normal min-[360px]:tracking-wider sm:tracking-[0.18em] text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis">
              {displayedMembershipId}
            </div>
          </div>
        </div>

        {/* BOTTOM METADATA ROW */}
        <div className="relative z-10 pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs gap-2">
          <div className="text-left shrink-0">
            <p className="text-[7px] sm:text-[7.5px] font-black uppercase text-slate-400 tracking-widest leading-none">
              CARDHOLDER
            </p>
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white mt-0.5 truncate max-w-[110px] sm:max-w-[180px]">
              {user.name || "MEMBER"}
            </p>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              setSettingsMode("change");
              setIsSettingsModalOpen(true);
            }}
            className="flex items-center gap-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 px-2 py-1 rounded-lg cursor-pointer transition shrink-0"
            title="VIP Security Settings"
          >
            <div className="h-5 w-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
              <Gift size={11} />
            </div>
            <div className="text-left">
              <p className="text-[6.5px] sm:text-[7px] font-black uppercase text-slate-400 leading-none">
                VIP PERKS
              </p>
              <p className="text-[9px] sm:text-[9.5px] font-black text-cyan-400 mt-0.5 leading-none flex items-center gap-0.5 whitespace-nowrap">
                Security Config <ChevronRight size={9} />
              </p>
            </div>
          </div>

          <div className="text-right font-mono shrink-0">
            <p className="text-[7px] sm:text-[7.5px] font-black uppercase text-slate-400 tracking-widest leading-none">
              VALID THRU
            </p>
            <p className="text-[11px] sm:text-xs font-bold text-slate-100 mt-0.5 whitespace-nowrap">
              {expires}
            </p>
          </div>
        </div>

        {/* INTEGRATED FULL-WIDTH VIP BENEFITS BAR */}
        <div className="relative z-10 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 mt-2 border-t border-slate-800/80 bg-[#050810]/95 rounded-b-xl px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="grid grid-cols-2 min-[480px]:grid-cols-4 gap-1.5 sm:gap-2 text-left">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="h-5.5 w-5.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Crown size={11} className="text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[7px] min-[380px]:text-[7.5px] sm:text-[8px] font-black uppercase text-white leading-tight whitespace-nowrap">
                  24/7 SUPPORT
                </p>
                <p className="text-[6.5px] min-[380px]:text-[7px] sm:text-[7.5px] font-bold text-cyan-400 leading-tight mt-0.5 whitespace-nowrap">
                  Priority Help
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <div className="h-5.5 w-5.5 rounded-md bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                <Truck size={11} className="text-teal-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[7px] min-[380px]:text-[7.5px] sm:text-[8px] font-black uppercase text-white leading-tight whitespace-nowrap">
                  FREE SHIPPING
                </p>
                <p className="text-[6.5px] min-[380px]:text-[7px] sm:text-[7.5px] font-semibold text-slate-300 leading-tight mt-0.5 whitespace-nowrap">
                  All Orders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <div className="h-5.5 w-5.5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Tag size={11} className="text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[7px] min-[380px]:text-[7.5px] sm:text-[8px] font-black uppercase text-white leading-tight whitespace-nowrap">
                  VIP DEALS
                </p>
                <p className="text-[6.5px] min-[380px]:text-[7px] sm:text-[7.5px] font-semibold text-slate-300 leading-tight mt-0.5 whitespace-nowrap">
                  Members Only
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <div className="h-5.5 w-5.5 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Sparkles size={11} className="text-purple-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[7px] min-[380px]:text-[7.5px] sm:text-[8px] font-black uppercase text-white leading-tight whitespace-nowrap">
                  EARLY ACCESS
                </p>
                <p className="text-[6.5px] min-[380px]:text-[7px] sm:text-[7.5px] font-bold text-cyan-400 leading-tight mt-0.5 whitespace-nowrap">
                  Top Offers
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* VERIFICATION MODAL */}
      <VipSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onSuccessUnlock={handleUnlockSuccess}
        token={token}
        onOpenForgotModal={() => {
          setSettingsMode("reset");
          setIsSettingsModalOpen(true);
        }}
      />

      {/* CODE SETTINGS & RESET MODAL */}
      <VipCodeSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        mode={settingsMode}
        token={token}
      />
    </>
  );
};

export default VipCreditCard;


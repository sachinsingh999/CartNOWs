import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, X, AlertCircle, KeyRound, ArrowRight } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

/**
 * VIP Security Verification Modal
 * Supports password input (4-6 digits), Enter, Escape, Focus Trap, Shake Animation & Lockout Handling.
 */
const VipSecurityModal = ({
  isOpen,
  onClose,
  onSuccessUnlock,
  token,
  onOpenForgotModal
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const [isConfigured, setIsConfigured] = useState(true);

  const getHeaders = () => {
    const rawToken = token || localStorage.getItem("token") || "";
    const cleanToken = rawToken.replace(/^Bearer\s+/i, "");
    return {
      Authorization: `Bearer ${cleanToken}`,
      token: cleanToken
    };
  };

  useEffect(() => {
    if (isOpen) {
      setCode("");
      setErrorMsg("");
      setShake(false);
      
      // Check status to see if user has configured a code yet
      axios
        .get(`${backendUrl}/api/user/vip-security/status`, { headers: getHeaders() })
        .then((res) => {
          if (res.data?.success) {
            setIsConfigured(!!res.data.enabled);
          }
        })
        .catch(() => setIsConfigured(true));

      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, token]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!code || code.length < 4 || code.length > 6) {
      setErrorMsg("Security code must be 4 to 6 numeric digits");
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      if (!isConfigured) {
        // First-time setup for new users
        const setRes = await axios.post(
          `${backendUrl}/api/user/vip-security/set-code`,
          { code },
          { headers: getHeaders() }
        );

        if (setRes.data?.success) {
          toast.success("VIP Security Code Created!");
          setIsConfigured(true);
          // Now verify to unlock
          const verifyRes = await axios.post(
            `${backendUrl}/api/user/vip-security/verify`,
            { code },
            { headers: getHeaders() }
          );

          if (verifyRes.data?.success) {
            onSuccessUnlock({
              unmaskedId: verifyRes.data.unmaskedMembershipId,
              expiresInSeconds: verifyRes.data.expiresInSeconds || 300
            });
            onClose();
            return;
          }
        }
      }

      const response = await axios.post(
        `${backendUrl}/api/user/vip-security/verify`,
        { code },
        { headers: getHeaders() }
      );

      if (response.data?.success) {
        toast.success("VIP Card Unlocked (5-min session)");
        onSuccessUnlock({
          unmaskedId: response.data.unmaskedMembershipId,
          expiresInSeconds: response.data.expiresInSeconds || 300
        });
        onClose();
      } else {
        setErrorMsg(response.data?.message || "Incorrect security code.");
        triggerShake();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Incorrect security code.";
      setErrorMsg(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#09101d] border border-cyan-500/30 rounded-2xl p-6 text-white shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vip-security-modal-title"
        >
          {/* Subtle Ambient Light Ray */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />

          {/* Header Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-1.5 rounded-full transition cursor-pointer border-none"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          {/* Modal Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Lock size={22} />
            </div>
            <h3 id="vip-security-modal-title" className="text-lg font-black tracking-wide text-white uppercase">
              {isConfigured ? "🔐 VIP SECURITY" : "🔒 CREATE VIP SECURITY CODE"}
            </h3>
            <p className="text-xs text-slate-400">
              {isConfigured
                ? "Enter your 4–6 digit VIP security code to unlock protected membership card details."
                : "Create a 4–6 digit PIN to secure your VIP membership card for the first time."}
            </p>
          </div>

          {/* Code Form */}
          <form onSubmit={handleVerify} className="mt-6 space-y-4">
            <div>
              <label htmlFor="vip-code-input" className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 text-center">
                {isConfigured ? "SECURITY CODE" : "NEW SECURITY CODE (4-6 DIGITS)"}
              </label>
              <input
                ref={inputRef}
                id="vip-code-input"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setCode(val);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="• • • •"
                className="w-full text-center font-mono text-2xl tracking-[0.4em] bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl py-3 px-4 text-cyan-300 focus:outline-none transition shadow-inner"
                autoComplete="off"
              />
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 py-2 px-3 rounded-lg text-center"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-black uppercase transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || code.length < 4}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50 cursor-pointer border-none flex items-center justify-center gap-1.5"
              >
                {loading ? (isConfigured ? "Verifying..." : "Creating...") : (isConfigured ? "Verify" : "Create & Unlock")}
              </button>
            </div>

            {/* Forgot Code Helper */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenForgotModal) onOpenForgotModal();
                }}
                className="text-[11px] font-semibold text-cyan-400 hover:underline bg-transparent border-none cursor-pointer inline-flex items-center gap-1"
              >
                <KeyRound size={12} />
                <span>Forgot Security Code?</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VipSecurityModal;

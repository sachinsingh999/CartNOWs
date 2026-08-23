import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, AlertCircle, KeyRound, Lock, CheckCircle } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

/**
 * VIP Security Code Settings Modal
 * Supports:
 * - Setting code if not enabled
 * - Changing code (Current, New, Confirm)
 * - Forgot / Reset code (Account Password, New, Confirm)
 */
const VipCodeSettingsModal = ({
  isOpen,
  onClose,
  mode = "change", // "set", "change", or "reset"
  token,
  onStatusUpdated
}) => {
  const [currentCode, setCurrentCode] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmNewCode, setConfirmNewCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCurrentCode("");
      setAccountPassword("");
      setNewCode("");
      setConfirmNewCode("");
      setErrorMsg("");
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newCode || newCode.length < 4 || newCode.length > 6) {
      setErrorMsg("New security code must be 4 to 6 numeric digits");
      return;
    }

    if (newCode !== confirmNewCode) {
      setErrorMsg("New security code and confirmation do not match");
      return;
    }

    try {
      setLoading(true);
      let endpoint = "/api/user/vip-security/set-code";
      let payload = { code: newCode };

      if (mode === "change") {
        endpoint = "/api/user/vip-security/change-code";
        payload = { currentCode, newCode, confirmNewCode };
      } else if (mode === "reset") {
        endpoint = "/api/user/vip-security/reset-code";
        payload = { password: accountPassword, newCode, confirmNewCode };
      }

      const rawToken = token || localStorage.getItem("token") || "";
      const cleanToken = rawToken.replace(/^Bearer\s+/i, "");

      const response = await axios.post(`${backendUrl}${endpoint}`, payload, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          token: cleanToken
        }
      });

      if (response.data?.success) {
        toast.success(response.data.message || "VIP Security Code saved successfully!");
        if (onStatusUpdated) onStatusUpdated();
        onClose();
      } else {
        setErrorMsg(response.data?.message || "Operation failed");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update security code";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-[#09101d] border border-cyan-500/30 rounded-2xl p-6 text-white shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-1.5 rounded-full transition cursor-pointer border-none"
          >
            <X size={16} />
          </button>

          {/* Modal Header */}
          <div className="text-center space-y-1.5">
            <div className="mx-auto h-12 w-12 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-lg font-black tracking-wide text-white uppercase">
              {mode === "set" ? "Create VIP Security Code" : mode === "reset" ? "Reset VIP Security Code" : "Change VIP Security Code"}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === "set"
                ? "Protect your VIP membership card with a 4–6 digit PIN."
                : mode === "reset"
                ? "Re-authenticate using your account password to create a new code."
                : "Enter your current code and specify your new VIP security code."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 text-left">
            {mode === "change" && (
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  CURRENT SECURITY CODE
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Current 4-6 digit code"
                  className="w-full text-center font-mono text-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-cyan-300 focus:outline-none transition"
                  required
                />
              </div>
            )}

            {mode === "reset" && (
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  ACCOUNT PASSWORD (RE-AUTHENTICATION)
                </label>
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder="Enter CartNow account password"
                  className="w-full text-center font-sans text-sm bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-white focus:outline-none transition"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                NEW SECURITY CODE (4-6 DIGITS)
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • •"
                className="w-full text-center font-mono text-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-cyan-300 focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                CONFIRM NEW SECURITY CODE
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={confirmNewCode}
                onChange={(e) => setConfirmNewCode(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • •"
                className="w-full text-center font-mono text-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-cyan-300 focus:outline-none transition"
                required
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 py-2 px-3 rounded-lg">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-black uppercase transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || newCode.length < 4}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50 cursor-pointer border-none"
              >
                {loading ? "Saving..." : mode === "set" ? "Create Code" : "Update Code"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VipCodeSettingsModal;

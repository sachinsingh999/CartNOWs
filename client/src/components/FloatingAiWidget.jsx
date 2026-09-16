import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  Bot,
  Shirt,
  Flame,
  Zap,
  Package,
  ArrowRight,
  ExternalLink
} from "lucide-react";

const QUICK_SUGGESTIONS = [
  { label: "🔥 Top Deals", prompt: "What are the best deals and discounts today?", icon: Flame },
  { label: "👗 Virtual Try-On", prompt: "How does the AI Virtual Try-On work?", icon: Shirt },
  { label: "⚡ Trending Styles", prompt: "Recommend the most trending clothing styles right now.", icon: Zap },
  { label: "📦 Track Orders", prompt: "How can I track my order or request returns?", icon: Package }
];

const FloatingAiWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      msg: "Hi! 👋 I am **CartNow AI** — your intelligent shopping & style assistant.\n\nAsk me about catalog products, deals, sizing, or tap a quick idea below! 👇"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, isLoading, isOpen]);

  // Handle clickable markdown links in messages
  const handleMessageClick = (e) => {
    const target = e.target.closest("a");
    if (target) {
      const href = target.getAttribute("href");
      if (href) {
        e.preventDefault();
        setIsOpen(false);
        if (href.startsWith("http")) {
          window.open(href, "_blank");
        } else {
          navigate(href);
        }
      }
    }
  };

  // Send message to Gemini backend endpoint
  const handleSend = async (overridePrompt = "") => {
    const query = (overridePrompt || inputVal).trim();
    if (!query || isLoading) return;

    const newMsgs = [...messages, { role: "user", msg: query }];
    setMessages(newMsgs);
    setInputVal("");
    setIsLoading(true);

    const formattedHistory = messages.map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.msg
    }));

    try {
      const res = await axios.post(`${backendUrl}/api/ai/chat`, {
        message: query,
        history: formattedHistory
      });

      if (res.data && res.data.success) {
        setMessages((prev) => [...prev, { role: "bot", msg: res.data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", msg: res.data.reply || "I couldn't process that request right now. Please try again." }
        ]);
      }
    } catch (err) {
      console.error("AI Assistant error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", msg: "I'm temporarily having trouble connecting. Feel free to browse our [Catalog](/tryon) or try asking again in a moment! ⚡" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Safe markdown formatting
  const formatText = (text) => {
    if (!text) return "";
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold formatting
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, (_, p1) => {
      return `<strong class="font-bold text-orange-600 dark:text-orange-400">${p1}</strong>`;
    });

    // Markdown links
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, (_, label, url) => {
      return `<a href="${url}" class="inline-flex items-center gap-0.5 font-bold text-orange-500 hover:text-orange-600 underline underline-offset-2 transition-colors">${label}</a>`;
    });

    const lines = formatted.split("\n");
    let inList = false;
    const out = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (!inList) {
          out.push('<ul class="list-disc pl-4 my-1.5 space-y-1 text-slate-700 dark:text-slate-300">');
          inList = true;
        }
        out.push(`<li class="leading-relaxed text-[11.5px]">${trimmed.substring(2)}</li>`);
      } else {
        if (inList) {
          out.push("</ul>");
          inList = false;
        }
        if (trimmed === "") {
          out.push('<div class="h-1.5"></div>');
        } else {
          out.push(`<p class="leading-relaxed text-[11.5px] my-0.5">${line}</p>`);
        }
      }
    });

    if (inList) out.push("</ul>");
    return out.join("");
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[120] font-sans flex flex-col items-center pointer-events-none pb-0">
      {/* Floating Modal / Drawer - Centered directly above the bottom-middle trigger */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="pointer-events-auto mb-2 w-[calc(100vw-24px)] sm:w-[420px] h-[520px] max-h-[80vh] rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden text-left"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-500/15 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-orange-500 text-white shadow-xs">
                  <Sparkles size={16} className="animate-pulse" />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>CartNow AI</span>
                    <span className="px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[8.5px] font-black">
                      Smart Assistant
                    </span>
                  </h4>
                  <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-semibold">
                    Always ready to help you style & shop
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        role: "bot",
                        msg: "Conversation refreshed! How can I help you today? ✨"
                      }
                    ])
                  }
                  title="Reset Chat"
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant"
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div
              onClick={handleMessageClick}
              className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40 text-left scrollbar-thin"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[88%] ${
                    m.role === "bot" ? "self-start items-start" : "self-end items-end ml-auto"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-md text-[11.5px] leading-relaxed shadow-2xs ${
                      m.role === "bot"
                        ? "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                        : "bg-orange-500 text-white font-medium"
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatText(m.msg) }}
                  />
                  <span className="text-[8.5px] mt-1 text-slate-400 dark:text-slate-500 font-bold px-1 uppercase tracking-wider">
                    {m.role === "bot" ? "CartNow AI" : "You"}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="self-start flex flex-col max-w-[85%] items-start">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3 py-2.5 rounded-md shadow-2xs">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 flex gap-1.5 overflow-x-auto scrollbar-none">
              {QUICK_SUGGESTIONS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(item.prompt)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 text-[10px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap transition cursor-pointer shrink-0"
                  >
                    <Icon size={10} className="text-orange-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Bar */}
            <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask CartNow AI anything..."
                className="flex-1 px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition shadow-2xs"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputVal.trim() || isLoading}
                className={`p-2 rounded-md text-white transition-all shadow-xs cursor-pointer ${
                  inputVal.trim() && !isLoading
                    ? "bg-orange-500 hover:bg-orange-600 active:scale-95"
                    : "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Send size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Tab (Touching bottom screen edge, simple neutral color, icon-only) */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close CartNow AI" : "Open CartNow AI"}
        title={isOpen ? "Close CartNow AI" : "Open CartNow AI"}
        className="pointer-events-auto group relative flex items-center justify-center w-12 h-7 sm:w-14 sm:h-8 rounded-t-xl rounded-b-none bg-slate-900/90 dark:bg-slate-800/95 hover:bg-slate-950 dark:hover:bg-slate-700 text-slate-300 hover:text-white shadow-[0_-2px_12px_rgba(0,0,0,0.15)] border-t border-x border-slate-700/60 dark:border-slate-600/60 backdrop-blur-md transition-all duration-200 cursor-pointer select-none"
      >
        {/* Animated Chevron / Arrow Icon */}
        <div className="relative flex items-center justify-center text-slate-300 group-hover:text-white transition-colors">
          {isOpen ? (
            <svg
              className="w-4 h-4 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          )}
        </div>
      </motion.button>
    </div>
  );
};

export default FloatingAiWidget;

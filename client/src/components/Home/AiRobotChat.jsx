import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../config";
import { Send, Sparkles, RotateCcw, Laptop, Camera, Headphones, Gift } from "lucide-react";

const AiRobotChat = () => {
  const navigate = useNavigate();
  const [aiVal, setAiVal] = useState("");
  const [aiChat, setAiChat] = useState([
    {
      role: "bot",
      msg: "Hey there! 👋 I am **CartNow's Smart AI Assistant**.\n\nI can help you browse catalog items, search for deals, or recommend styles.\n\nAsk me anything, or tap one of the ideas below! 👇"
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Handle clicking on links inside AI messages to navigate smoothly
  const handleMessageClick = (e) => {
    const target = e.target.closest("a");
    if (target) {
      const href = target.getAttribute("href");
      if (href && href.startsWith("/product/")) {
        e.preventDefault();
        navigate(href);
      }
    }
  };

  // Auto-scroll inside the container only (preventing main page scrolling)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [aiChat, aiLoading]);

  // Handle messages and call the backend /api/ai/chat
  const handleAISend = async (customPrompt = "") => {
    const query = customPrompt || aiVal;
    if (!query.trim()) return;

    // Add user message to state
    const newChat = [...aiChat, { role: "user", msg: query }];
    setAiChat(newChat);
    setAiVal("");
    setAiLoading(true);

    // Format chat history for Gemini API
    const formattedHistory = aiChat.map((chat) => ({
      role: chat.role === "bot" ? "assistant" : "user",
      content: chat.msg
    }));

    try {
      const response = await axios.post(`${backendUrl}/api/ai/chat`, {
        message: query,
        history: formattedHistory
      });

      if (response.data && response.data.success) {
        setAiChat((prev) => [...prev, { role: "bot", msg: response.data.reply }]);
      } else {
        setAiChat((prev) => [
          ...prev,
          { role: "bot", msg: response.data.reply || "Sorry, I ran into an issue. Please try again." }
        ]);
      }
    } catch (err) {
      console.error("AI Chat error:", err);
      setAiChat((prev) => [
        ...prev,
        { role: "bot", msg: "Oops! My circuits got a bit crossed. Let me try that again in a moment. 🤖⚡️" }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Helper to parse basic markdown (**bold**, [Text](URL), bullet lists, linebreaks)
  const formatMessageText = (text) => {
    if (!text) return "";

    // Escape basic HTML tags to avoid XSS from dynamic inputs, but keep safe ones
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Format bold markdown (**text**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, (_, p1) => {
      return `<strong class="font-bold text-indigo-600 dark:text-indigo-400">${p1}</strong>`;
    });

    // Format markdown links [Text](URL)
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, (_, linkText, url) => {
      return `<a href="${url}" class="font-black underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">${linkText}</a>`;
    });

    // Split lines to handle bullets
    const lines = formatted.split("\n");
    let inList = false;
    const result = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (!inList) {
          result.push('<ul class="list-disc pl-5 my-2 space-y-1 text-slate-700 dark:text-slate-350 font-normal">');
          inList = true;
        }
        const itemText = trimmed.substring(2);
        result.push(`<li class="leading-relaxed text-xs md:text-sm">${itemText}</li>`);
      } else {
        if (inList) {
          result.push("</ul>");
          inList = false;
        }
        if (trimmed === "") {
          result.push('<div class="h-2"></div>');
        } else {
          result.push(`<p class="leading-relaxed text-xs md:text-sm my-1">${line}</p>`);
        }
      }
    });

    if (inList) {
      result.push("</ul>");
    }

    return result.join("");
  };

  const suggestions = [
    { text: "Laptop Under ₹50k", value: "Laptop Under ₹50000", icon: Laptop },
    { text: "Best Vlog Camera", value: "Best Camera For Vlogging", icon: Camera },
    { text: "Buds Under ₹2k", value: "Wireless Earbuds Under ₹2000", icon: Headphones },
    { text: "Gift Under ₹1k", value: "Gift Under ₹1000", icon: Gift }
  ];

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-[32px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.25)] flex flex-col min-h-[500px] transition-all duration-300 hover:shadow-[0_16px_48px_rgba(99,102,241,0.05)] text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/50 text-left">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100/50 dark:border-indigo-900/50 shadow-sm">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-slate-900"></span>
            </span>
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              CartNow AI
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
              Assistant Online
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setAiChat([
              {
                role: "bot",
                msg: "Hey there! 👋 I am **CartNow's Smart AI Assistant**.\n\nI can help you browse catalog items, search for deals, or recommend styles.\n\nAsk me anything, or tap one of the ideas below! 👇"
              }
            ]);
          }}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 rounded-xl transition-all cursor-pointer"
          title="Reset conversation"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Chat Messages Frame */}
      <div
        ref={chatContainerRef}
        data-lenis-prevent
        onClick={handleMessageClick}
        className="flex-1 my-4 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100/80 dark:border-slate-800/40 rounded-2xl p-4 overflow-y-auto max-h-[350px] flex flex-col gap-4 scroll-smooth scrollbar-thin"
      >
        <AnimatePresence initial={false}>
          {aiChat.map((chat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col max-w-[85%] ${chat.role === "bot" ? "self-start text-left" : "self-end text-right"}`}
            >
              <div
                className={`rounded-[20px] px-3.5 py-2.5 text-xs md:text-sm leading-relaxed shadow-sm transition-all duration-200 ${chat.role === "bot"
                    ? "bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-[4px]"
                    : "bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-tr-[4px] shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                  }`}
                dangerouslySetInnerHTML={{ __html: formatMessageText(chat.msg) }}
              />
              <span className="text-[9px] mt-1.5 text-slate-400 dark:text-slate-500 px-1 font-bold tracking-wider">
                {chat.role === "bot" ? "ASSISTANT" : "YOU"}
              </span>
            </motion.div>
          ))}

          {aiLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="self-start flex flex-col max-w-[85%]"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-[20px] rounded-tl-[4px] px-4 py-3 shadow-sm">
                <div className="flex gap-1.5 items-center justify-center py-1">
                  <span
                    className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
              <span className="text-[9px] mt-1.5 text-slate-400 dark:text-slate-500 px-1 font-bold tracking-wider">
                THINKING
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Prompts Chips */}
      <div className="flex gap-2 flex-wrap mb-4 select-none">
        {suggestions.map((chip, i) => {
          const IconComponent = chip.icon;
          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAISend(chip.value)}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-350 font-black rounded-xl cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
            >
              <IconComponent size={11} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
              <span>{chip.text}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Form Input */}
      <div className="relative flex gap-2 mt-auto">
        <input
          type="text"
          value={aiVal}
          onChange={(e) => setAiVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAISend()}
          placeholder="Ask AI assistant..."
          disabled={aiLoading}
          className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl pl-4 pr-12 py-3 text-xs md:text-sm outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => handleAISend()}
          disabled={aiLoading || !aiVal.trim()}
          className="absolute right-2 top-1.5 h-8 w-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800/60 text-slate-100 disabled:text-slate-400 dark:disabled:text-slate-550 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 shrink-0 border-none shadow-[0_4px_10px_rgba(99,102,241,0.2)] disabled:shadow-none"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
};

export default AiRobotChat;

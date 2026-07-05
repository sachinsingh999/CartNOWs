import React, { useState } from "react";
import { Send, Sparkle } from "lucide-react";

const AiRobotChat = () => {
  const [aiVal, setAiVal] = useState("");
  const [aiChat, setAiChat] = useState([
    { role: "bot", msg: "Hey there! I am CartNow's Smart AI Assistant. Need recommendations or reviews? Ask me anything!" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAISend = (customPrompt = "") => {
    const query = customPrompt || aiVal;
    if (!query.trim()) return;

    const newChat = [...aiChat, { role: "user", msg: query }];
    setAiChat(newChat);
    setAiVal("");
    setAiLoading(true);

    setTimeout(() => {
      let reply = "I found some great options for you in our catalogs. Tap the CTA buttons to browse real-time inventory and deals!";
      const lower = query.toLowerCase();
      if (lower.includes("laptop") || lower.includes("50000")) {
        reply = "Here's the perfect match: MacBook Air M2 is currently on sale for ₹89,990! Or you can explore Lenovo Ideapads starting at ₹42,000 under our Electronics collection. Search 'laptop' to explore!";
      } else if (lower.includes("camera") || lower.includes("vlog")) {
        reply = "The Canon M50 Mark II is an excellent choice for vlogging, featuring tracking autofocus and clean HDMI out. Search 'Canon' in our search bar to see deals!";
      } else if (lower.includes("earbuds") || lower.includes("2000")) {
        reply = "I highly recommend the boAt Airdopes 141 wireless earbuds. They have active noise suppression support and are priced at just ₹1,299 today! Grab them from the flash sale shelf!";
      } else if (lower.includes("gift") || lower.includes("1000")) {
        reply = "For gifts under ₹1,000, consider our Signature Blue Premium Parfum at ₹999 or check out our high-quality Books category starting at just ₹299!";
      }
      setAiChat(prev => [...prev, { role: "bot", msg: reply }]);
      setAiLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col min-h-[500px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg overflow-hidden bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1589254065878-42c9da997008?w=80&auto=format&fit=crop&q=80"
            alt="Robot"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          CartNow AI Robot
        </h3>
      </div>

      {/* Chat Messages Frame */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-4.5 overflow-y-auto max-h-[250px] flex flex-col gap-3">
        {aiChat.map((chat, idx) => (
          <div
            key={idx}
            className={`max-w-[85%] rounded-2xl p-3 text-xs leading-normal font-bold ${ chat.role === "bot" ? "bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/30 text-indigo-950 dark:text-indigo-200 text-left self-start" : "bg-blue-600 text-slate-100 dark:text-white text-right self-end" }`}
          >
            {chat.msg}
          </div>
        ))}
        {aiLoading && (
          <div className="text-xs text-slate-400 dark:text-slate-500 font-black italic self-start flex items-center gap-1">
            <Sparkle size={12} className="animate-spin text-indigo-600 dark:text-indigo-400" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {/* AI Prompts Chips */}
      <div className="flex gap-1.5 flex-wrap my-3.5 select-none">
        {[
          { text: "Laptop Under ₹50k", value: "Laptop Under ₹50000" },
          { text: "Best Vlog Camera", value: "Best Camera For Vlogging" },
          { text: "Buds Under ₹2k", value: "Wireless Earbuds Under ₹2000" },
          { text: "Gift Under ₹1k", value: "Gift Under ₹1000" }
        ].map((chip, i) => (
          <button
            key={i}
            onClick={() => handleAISend(chip.value)}
            className="px-2.5 py-1 text-[9px] bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-black rounded-lg cursor-pointer transition active:scale-95"
          >
            {chip.text}
          </button>
        ))}
      </div>

      {/* Form Input */}
      <div className="flex gap-2 mt-auto">
        <input
          type="text"
          value={aiVal}
          onChange={(e) => setAiVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAISend()}
          placeholder="Search or ask AI robot..."
          className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        />
        <button
          type="button"
          onClick={() => handleAISend()}
          className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-slate-100 dark:text-white rounded-xl flex items-center justify-center cursor-pointer transition active:scale-95 shrink-0 border-none"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default AiRobotChat;

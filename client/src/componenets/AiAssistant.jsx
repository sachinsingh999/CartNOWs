import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";

const SUGGESTIONS = [
  "Show me men's clothing under ₹2000",
  "Best rated women's collection",
  "What sizes are available?",
  "Suggest a gift for ₹5000",
  "Show kids' products in stock",
];

const TypingDots = () => (
  <div style={{ display: "flex", gap: 4, padding: "12px 14px", alignItems: "center" }}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: "50%", background: "#94a3b8",
        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
    <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.7);opacity:.5} 40%{transform:scale(1);opacity:1} }`}</style>
  </div>
);

const Bubble = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10, animation: "fadeSlideIn 0.25s ease" }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginRight: 8, marginTop: 2 }}>🤖</div>
      )}
      <div style={{
        maxWidth: "78%", padding: "10px 14px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#f1f5f9",
        color: isUser ? "#fff" : "#0f172a",
        fontSize: 13, lineHeight: 1.55,
        boxShadow: isUser ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {msg.content}
      </div>
    </div>
  );
};

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const IconBtn = ({ onClick, title, children }) => (
  <button onClick={onClick} title={title} style={{
    background: "rgba(255,255,255,0.15)", border: "none",
    borderRadius: 7, width: 28, height: 28,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "rgba(255,255,255,0.9)", cursor: "pointer",
    transition: "background 0.15s", flexShrink: 0,
  }}
    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
  >
    {children}
  </button>
);

// ─── Main Widget ──────────────────────────────────────────────────────────────
const AiAssistant = () => {
  const [open, setOpen] = useState(false);       // chat window visible
  const [minimized, setMinimized] = useState(false); // collapsed to header only
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm your CartNOW shopping assistant 🛍️\nAsk me anything — find products, compare prices, check availability, or get outfit suggestions!",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 150); }, [open, minimized]);
  useEffect(() => { if (open) setPulse(false); }, [open]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/ai/chat`, { message: userMsg, history: newMessages.slice(-8) });
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Sorry, I couldn't get a response." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue. Please try again! 🔌" }]);
    } finally { setLoading(false); }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const clearChat = () => setMessages([{ role: "assistant", content: "Chat cleared! How can I help you today? 🛍️" }]);

  const handleOpen = () => { setOpen(true); setMinimized(false); };
  const handleMinimize = () => setMinimized(m => !m);
  const handleClose = () => { setOpen(false); setMinimized(false); };  // hides window, keeps FAB

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:.6} 70%,100%{transform:scale(1.5);opacity:0} }
        @keyframes chatSlideUp { from{opacity:0;transform:translateY(16px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        .ai-fab:hover { transform: scale(1.1) !important; box-shadow: 0 6px 28px rgba(99,102,241,.55) !important; }
        .ai-suggestion:hover { background:#eef2ff!important; border-color:#a5b4fc!important; color:#4338ca!important; }
        .ai-send:hover:not(:disabled) { opacity:.85; transform:scale(1.06); }
        .ai-send:disabled { opacity:.4; cursor:not-allowed; }
        .ai-messages::-webkit-scrollbar { width:4px; }
        .ai-messages::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
      `}</style>

      {/* ── FAB ── */}
      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999 }}>
        {pulse && !open && (
          <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "3px solid #6366f1", animation: "pulseRing 1.8s ease-out infinite", pointerEvents: "none" }} />
        )}
        <button
          className="ai-fab"
          onClick={open ? handleClose : handleOpen}
          title="AI Shopping Assistant"
          style={{
            width: 56, height: 56, borderRadius: "50%",
            background: open ? "linear-gradient(135deg,#374151,#111827)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 20px rgba(99,102,241,.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, transition: "all 0.25s cubic-bezier(.22,1,.36,1)",
          }}
        >
          {open ? "✕" : "🤖"}
        </button>
      </div>

      {/* ── Chat Window ── */}
      {open && (
        <div style={{
          position: "fixed", bottom: 96, right: 28, zIndex: 9998,
          width: 370,
          height: minimized ? "auto" : 540,
          background: "#fff", borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.16), 0 4px 20px rgba(99,102,241,.14)",
          border: "1px solid #e9eaec",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "chatSlideUp 0.28s cubic-bezier(.22,1,.36,1)",
          fontFamily: "'Inter', sans-serif",
          transition: "height 0.3s cubic-bezier(.22,1,.36,1)",
        }}>

          {/* ── Header ── */}
          <div style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            padding: "12px 14px",
            display: "flex", alignItems: "center", gap: 10,
            flexShrink: 0,
            cursor: minimized ? "pointer" : "default",
          }}
            onClick={minimized ? handleMinimize : undefined}
          >
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            }}>🤖</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>CartNOW AI</p>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,.75)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                Shopping Assistant · Online
              </p>
            </div>

            {/* Header action buttons */}
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {/* Clear */}
              {!minimized && (
                <IconBtn onClick={clearChat} title="Clear chat">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                  </svg>
                </IconBtn>
              )}

              {/* Minimize / Expand */}
              <IconBtn onClick={handleMinimize} title={minimized ? "Expand" : "Minimize"}>
                {minimized ? (
                  // Expand icon (chevron up)
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                ) : (
                  // Minimize icon (dash/line)
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                )}
              </IconBtn>

              {/* Close (hides window, keeps FAB) */}
              <IconBtn onClick={handleClose} title="Close">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </IconBtn>


            </div>
          </div>

          {/* ── Body (hidden when minimized) ── */}
          {!minimized && (
            <>
              {/* Messages */}
              <div className="ai-messages" style={{ flex: 1, overflowY: "auto", padding: "14px 12px 6px" }}>
                {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
                {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🤖</div>
                    <div style={{ background: "#f1f5f9", borderRadius: "18px 18px 18px 4px" }}><TypingDots /></div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions */}
              {messages.length === 1 && (
                <div style={{ padding: "4px 12px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="ai-suggestion" onClick={() => sendMessage(s)} style={{
                      padding: "5px 10px", fontSize: 11, fontWeight: 600,
                      border: "1.5px solid #e2e8f0", borderRadius: 20,
                      background: "#fafafa", color: "#475569", cursor: "pointer",
                      transition: "all 0.15s", whiteSpace: "nowrap",
                    }}>{s}</button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div style={{ padding: "10px 12px 12px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about products, sizes, prices…"
                  rows={1}
                  style={{
                    flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 12,
                    padding: "9px 12px", fontSize: 13, fontFamily: "inherit",
                    resize: "none", outline: "none", color: "#0f172a", background: "#fafafa",
                    lineHeight: 1.5, maxHeight: 80, overflowY: "auto", transition: "border-color 0.15s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#6366f1"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
                <button
                  className="ai-send"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(99,102,241,.35)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AiAssistant;

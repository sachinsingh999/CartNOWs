import React, { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Trash2,
  WrapText,
  Sliders,
  AlignLeft
} from "lucide-react";
import { toast } from "react-toastify";

export default function MonacoTextEditor({
  value,
  onChange,
  onLoadSample,
  height = "400px"
}) {
  const editorRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState("on");
  const [showMinimap, setShowMinimap] = useState(true);

  // Metrics
  const wordsCount = value && value.trim() ? value.trim().split(/\s+/).length : 0;
  const linesCount = value ? value.split("\n").length : 0;
  const charsCount = value ? value.length : 0;

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleCopy = () => {
    if (!value || !value.trim()) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.info("Document text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onChange("");
    toast.info("Document editor cleared");
  };

  const handleCleanLines = () => {
    if (!value || !value.trim()) return;
    // Remove extra trailing whitespace and collapse consecutive empty lines
    const cleaned = value
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    onChange(cleaned);
    toast.success("Text cleaned and organized!");
  };

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden border border-slate-700/80 bg-[#1e1e1e] shadow-xl text-left">
      {/* VS CODE TITLEBAR & TABS */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#333333] select-none">
        {/* Left: Window Dots + Active Tab */}
        <div className="flex items-center gap-3">
          {/* macOS traffic light window controls */}
          <div className="flex items-center gap-1.5 pl-1">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shadow-2xs" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block shadow-2xs" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block shadow-2xs" />
          </div>

          {/* Active File Tab */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] text-slate-200 text-xs font-mono rounded-t-md border-t-2 border-violet-500 border-x border-x-[#333333] -mb-2 z-10 shadow-xs">
            <FileText size={12} className="text-violet-400" />
            <span className="font-semibold text-[11px] text-slate-200">product-specs.md</span>
            {value && value.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400/80 ml-0.5" title="Unsaved edits" />
            )}
          </div>
        </div>

        {/* Right: Quick Toolbar Actions */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={handleCleanLines}
            title="Clean whitespace & organize lines"
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-slate-300 hover:text-white bg-[#2d2d2d] hover:bg-[#383838] border border-[#3e3e3e] rounded-md transition cursor-pointer"
          >
            <AlignLeft size={12} className="text-violet-400" />
            <span>Format</span>
          </button>

          <button
            type="button"
            onClick={() => setWordWrap((prev) => (prev === "on" ? "off" : "on"))}
            title={`Toggle Word Wrap (${wordWrap === "on" ? "Enabled" : "Disabled"})`}
            className={`p-1.5 rounded-md border text-[11px] transition cursor-pointer ${
              wordWrap === "on"
                ? "bg-violet-500/20 text-violet-400 border-violet-500/40"
                : "bg-[#2d2d2d] text-slate-400 border-[#3e3e3e] hover:text-white"
            }`}
          >
            <WrapText size={13} />
          </button>

          <button
            type="button"
            onClick={() => setShowMinimap((prev) => !prev)}
            title={`Toggle Minimap (${showMinimap ? "Visible" : "Hidden"})`}
            className={`p-1.5 rounded-md border text-[11px] transition cursor-pointer ${
              showMinimap
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                : "bg-[#2d2d2d] text-slate-400 border-[#3e3e3e] hover:text-white"
            }`}
          >
            <Sliders size={13} />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy Text to Clipboard"
            className="p-1.5 bg-[#2d2d2d] hover:bg-[#383838] text-slate-300 hover:text-white border border-[#3e3e3e] rounded-md transition cursor-pointer"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>

          <button
            type="button"
            onClick={handleClear}
            title="Clear Document"
            className="p-1.5 bg-[#2d2d2d] hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-[#3e3e3e] hover:border-red-500/40 rounded-md transition cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* MONACO EDITOR CONTAINER */}
      <div className="relative w-full bg-[#1e1e1e]" style={{ height }}>
        <Editor
          height={height}
          defaultLanguage="markdown"
          language="markdown"
          value={value}
          theme="vs-dark"
          onChange={(val) => onChange(val || "")}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            lineHeight: 20,
            fontFamily:
              "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Menlo, Monaco, Consolas, 'Courier New', monospace",
            fontLigatures: true,
            minimap: { enabled: showMinimap, maxColumn: 40, renderCharacters: false },
            lineNumbers: "on",
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap,
            renderLineHighlight: "all",
            padding: { top: 12, bottom: 12 },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            overviewRulerBorder: false,
            scrollbar: {
              vertical: "visible",
              horizontal: "auto",
              verticalScrollbarSize: 9,
              horizontalScrollbarSize: 9
            }
          }}
          loading={
            <div className="h-full w-full bg-[#1e1e1e] flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
              <span className="text-xs font-mono text-slate-400">Loading Monaco Editor Engine...</span>
            </div>
          }
        />

        {/* Watermark when empty */}
        {(!value || !value.trim()) && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-500/60 p-6 text-center select-none">
            <Sparkles size={42} className="mb-2 opacity-30 text-violet-400" />
            <p className="text-xs font-mono font-bold text-slate-400/80 mb-1">
              # Paste product specifications, brochures, or features here
            </p>
            <p className="text-[11px] font-mono text-slate-500 max-w-sm">
              Press "Load Sample Info" below or paste any supplier description or unformatted text.
            </p>
          </div>
        )}
      </div>

      {/* VS CODE BOTTOM STATUS BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#5b21b6] text-white text-[11px] font-mono font-medium select-none">
        {/* Left Status */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold">
            {wordsCount > 0 ? (
              <span className="flex items-center gap-1 text-white">
                <Sparkles size={12} className="text-violet-200" />
                <span>AI Ready</span>
              </span>
            ) : (
              <span className="text-white/80">Ready</span>
            )}
          </span>

          <span className="text-white/60">|</span>
          <span>{wordsCount} words</span>
          <span className="text-white/60">|</span>
          <span>{linesCount} {linesCount === 1 ? "line" : "lines"}</span>
          <span className="text-white/60">|</span>
          <span>{charsCount} chars</span>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-3 text-white/90">
          <span>UTF-8</span>
          <span className="text-white/60">|</span>
          <span className="font-bold bg-black/20 px-1.5 py-0.5 rounded text-[10px]">Markdown</span>
        </div>
      </div>
    </div>
  );
}

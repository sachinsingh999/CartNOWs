import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Code,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileCode2,
  WrapText,
  Eye,
  Sliders
} from "lucide-react";
import { toast } from "react-toastify";

export default function MonacoJsonEditor({
  value,
  onChange,
  error,
  onLoadSample,
  height = "420px"
}) {
  const editorRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState("on");
  const [showMinimap, setShowMinimap] = useState(true);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Calculate lines and character metrics
  const linesCount = value ? value.split("\n").length : 0;
  const charsCount = value ? value.length : 0;

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // Configure JSON language defaults for schema validation if available
    if (monaco?.languages?.json) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        schemas: [],
        enableSchemaRequest: false
      });
    }
  };

  const handleFormat = () => {
    if (!value || !value.trim()) return;

    if (editorRef.current) {
      try {
        editorRef.current.getAction("editor.action.formatDocument")?.run();
        toast.success("JSON formatted cleanly!");
        return;
      } catch (e) {
        // Fallback to manual parse/stringify if action unavailable
      }
    }

    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
      toast.success("JSON formatted cleanly!");
    } catch (err) {
      toast.error("Cannot format: Fix syntax error first");
    }
  };

  const handleCopy = () => {
    if (!value || !value.trim()) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.info("JSON copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onChange("");
    toast.info("Editor cleared");
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
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] text-slate-200 text-xs font-mono rounded-t-md border-t-2 border-orange-500 border-x border-x-[#333333] -mb-2 z-10 shadow-xs">
            <span className="text-amber-400 font-bold text-[11px]">{`{ }`}</span>
            <span className="font-semibold text-[11px] text-slate-200">product-schema.json</span>
            {value && value.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400/80 ml-0.5" title="Unsaved edits" />
            )}
          </div>
        </div>

        {/* Right: Quick Toolbar Actions */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={handleFormat}
            title="Prettify / Format Document (Shift+Alt+F)"
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-slate-300 hover:text-white bg-[#2d2d2d] hover:bg-[#383838] border border-[#3e3e3e] rounded-md transition cursor-pointer"
          >
            <Sparkles size={12} className="text-amber-400" />
            <span>Format</span>
          </button>

          <button
            type="button"
            onClick={() => setWordWrap((prev) => (prev === "on" ? "off" : "on"))}
            title={`Toggle Word Wrap (${wordWrap === "on" ? "Enabled" : "Disabled"})`}
            className={`p-1.5 rounded-md border text-[11px] transition cursor-pointer ${
              wordWrap === "on"
                ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
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
            title="Copy JSON to Clipboard"
            className="p-1.5 bg-[#2d2d2d] hover:bg-[#383838] text-slate-300 hover:text-white border border-[#3e3e3e] rounded-md transition cursor-pointer"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>

          <button
            type="button"
            onClick={handleClear}
            title="Clear Editor"
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
          defaultLanguage="json"
          language="json"
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
            formatOnPaste: true,
            formatOnType: true,
            renderLineHighlight: "all",
            bracketPairColorization: { enabled: true },
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
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
              <span className="text-xs font-mono text-slate-400">Loading Monaco Editor Engine...</span>
            </div>
          }
        />

        {/* Empty state hint watermark if no content */}
        {(!value || !value.trim()) && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-500/60 p-6 text-center select-none">
            <Code size={42} className="mb-2 opacity-30 text-indigo-400" />
            <p className="text-xs font-mono font-bold text-slate-400/80 mb-1">
              // Paste your CartNOW product JSON schema here
            </p>
            <p className="text-[11px] font-mono text-slate-500 max-w-sm">
              Press "Load Sample JSON" below or paste any supplier, API, or catalog JSON document.
            </p>
          </div>
        )}
      </div>

      {/* ERROR NOTICE BAR IF SYNTAX ERROR */}
      {error && (
        <div className="px-3.5 py-2 bg-red-950/80 border-t border-red-800/60 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400 shrink-0" />
            <span className="font-mono text-[11px] font-medium truncate">{error}</span>
          </div>
          <button
            type="button"
            onClick={handleFormat}
            className="text-[10px] font-mono font-bold text-red-300 underline hover:text-white shrink-0 ml-2"
          >
            Attempt Auto-fix
          </button>
        </div>
      )}

      {/* VS CODE BOTTOM STATUS BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#007acc] text-white text-[11px] font-mono font-medium select-none">
        {/* Left Status */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold">
            {error ? (
              <span className="flex items-center gap-1 text-red-200">
                <span className="w-2 h-2 rounded-full bg-red-300 animate-ping inline-block" />
                <span>Syntax Error</span>
              </span>
            ) : value && value.trim() ? (
              <span className="flex items-center gap-1 text-white">
                <CheckCircle2 size={12} className="text-emerald-300" />
                <span>Valid JSON</span>
              </span>
            ) : (
              <span className="text-white/80">Ready</span>
            )}
          </span>

          <span className="text-white/60">|</span>

          <span>{linesCount} {linesCount === 1 ? "line" : "lines"}</span>
          <span className="text-white/60">|</span>
          <span>{charsCount} chars</span>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-3 text-white/90">
          <span>Spaces: 2</span>
          <span className="text-white/60">|</span>
          <span>UTF-8</span>
          <span className="text-white/60">|</span>
          <span className="font-bold bg-black/20 px-1.5 py-0.5 rounded text-[10px]">JSON</span>
        </div>
      </div>
    </div>
  );
}

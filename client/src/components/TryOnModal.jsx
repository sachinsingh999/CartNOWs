import React, { useState, useEffect } from "react";
import { X, Sparkles, Upload, CheckCircle2, AlertCircle, RefreshCw, Download, ArrowLeftRight, Camera, UserSquare2, Eye, ShieldCheck, Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useTryOnStore from "../store/tryOnStore";
import useSocketProgress from "../hooks/useSocketProgress";
import BeforeAfterSlider from "./BeforeAfterSlider";
import TryOnHistory from "./TryOnHistory";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

const MOCK_ACCESSORIES = [
  { name: "Urban Leather Bag", price: "₹2,499", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=150&auto=format&fit=crop&q=60" },
  { name: "Chrono Classic Watch", price: "₹4,999", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=150&auto=format&fit=crop&q=60" },
  { name: "Classic Sneakers", price: "₹3,299", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150&auto=format&fit=crop&q=60" }
];

const TryOnModal = ({ product, token, userId }) => {
  const {
    isOpen,
    closeTryOn,
    uploadedImage,
    setUploadedImage,
    selectedSize,
    setSelectedSize,
    status,
    setStatus,
    progress,
    setProgress,
    message,
    setMessage,
    generatedImage,
    setGeneratedImage,
    error,
    setError,
    reset
  } = useTryOnStore();

  const [activeTab, setActiveTab] = useState("tryon"); 
  const [localFile, setLocalFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activePose, setActivePose] = useState("front"); // front | side | dynamic

  useSocketProgress(userId);

  useEffect(() => {
    if (!isOpen) {
      setLocalFile(null);
      setLocalPreview(null);
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG/JPEG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }
    setLocalFile(file);
    setLocalPreview(URL.createObjectURL(file));
  };

  const handleUploadImage = async () => {
    if (!localFile) return null;
    setStatus("uploading");
    setProgress(5);
    setMessage("Uploading photo to secure cloud server...");

    const formData = new FormData();
    formData.append("image", localFile);

    try {
      const res = await axios.post(`${backendUrl}/api/tryon/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setUploadedImage(res.data.imageUrl);
        return res.data.imageUrl;
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      setError(err.message || "Failed to upload image.");
      toast.error(err.message || "Upload failed");
      return null;
    }
  };

  const handleStartGeneration = async () => {
    let currentUploadUrl = uploadedImage;
    if (!currentUploadUrl) {
      currentUploadUrl = await handleUploadImage();
      if (!currentUploadUrl) return;
    }

    setStatus("processing");
    setProgress(30);
    setMessage("Queuing your generation request...");

    try {
      const res = await axios.post(
        `${backendUrl}/api/tryon/generate`,
        {
          productId: product._id,
          uploadedImage: currentUploadUrl,
          selectedSize
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        setStatus("processing");
        setProgress(35);
        setMessage("Request placed in queue. Awaiting GPU processor allocation...");
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Generation request failed");
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const downloadResult = () => {
    if (!generatedImage) return;
    toast.info("Preparing download...");
    fetch(generatedImage)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tryon-${product.name}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => toast.error("Download failed"));
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Dimmed Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeTryOn}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Main Modal Panel */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden z-10"
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-100">
                AI FITTING STUDIO
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                Target Model: <span className="capitalize text-slate-700 dark:text-slate-300">{product.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Tabs Selector */}
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800">
              <button
                onClick={() => setActiveTab("tryon")}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition cursor-pointer ${ activeTab === "tryon" ? "bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-100 shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-700" }`}
              >
                Fitting Studio
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition cursor-pointer ${ activeTab === "history" ? "bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-100 shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-700" }`}
              >
                Try-On History
              </button>
            </div>

            <button
              onClick={closeTryOn}
              className="rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 text-slate-400 dark:text-slate-500 transition active:scale-95 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === "history" ? (
            <div className="p-6 md:p-8">
              <TryOnHistory token={token} onSelectLook={(look) => {
                setUploadedImage(look.uploadedImage);
                setGeneratedImage(look.generatedImage);
                setSelectedSize(look.selectedSize);
                setActiveTab("tryon");
              }} />
            </div>
          ) : (
            <div className="h-full grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
              
              {/* LEFT PANEL: User Upload & Controls */}
              <div className="p-5 space-y-6 overflow-y-auto text-left">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Pose & Upload</h4>
                  <p className="text-[10.5px] text-slate-400 leading-relaxed font-semibold">Upload your photo or select preset target poses.</p>
                </div>

                {/* Drag & Drop Upload Deck */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all ${ isDragging ? "border-orange-500 bg-orange-50/20 dark:bg-orange-950/10 scale-102" : localPreview ? "border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20" : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-700" }`}
                >
                  {localPreview ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <img src={localPreview} className="w-full h-full object-contain p-1" alt="Model Preview" />
                      <button 
                        onClick={() => { setLocalFile(null); setLocalPreview(null); setUploadedImage(null); }}
                        className="absolute bottom-3 right-3 bg-rose-600 hover:bg-rose-700 text-slate-100 dark:text-white rounded-full p-2 shadow hover:scale-105 transition cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <Upload className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-3 animate-bounce" />
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">Drag & Drop Image</span>
                      <span className="text-[9px] text-slate-400 mt-1 font-bold">Or click to browse</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                {/* Quick Camera & Avatar Options */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                  <button className="flex items-center justify-center gap-1.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 transition cursor-pointer text-slate-700 dark:text-slate-300">
                    <Camera size={13} />
                    <span>Camera</span>
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 transition cursor-pointer text-slate-700 dark:text-slate-300">
                    <UserSquare2 size={13} />
                    <span>Pose Preset</span>
                  </button>
                </div>

                {/* Pose presets */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Multiple Poses</span>
                  <div className="flex gap-1.5">
                    {["front", "side", "dynamic"].map(ps => (
                      <button 
                        key={ps}
                        onClick={() => setActivePose(ps)}
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase border transition cursor-pointer ${activePose === ps ? "bg-slate-900 text-slate-100 dark:text-white border-slate-900" : "bg-slate-50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-600"}`}
                      >
                        {ps}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CENTER PANEL: Interactive Preview Canvas */}
              <div className="p-6 bg-slate-50/50 dark:bg-slate-900/10 flex flex-col items-center justify-center min-h-[300px]">
                {status === "idle" && (
                  <div className="w-full max-w-md aspect-[3/4] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-xs">
                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4">
                      <ArrowLeftRight size={20} />
                    </div>
                    <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide">AI Canvas Preview</h5>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1 max-w-[240px] leading-relaxed">
                      Please upload a model photo, select your sizing parameter, and generate your virtual styling layout.
                    </p>
                  </div>
                )}

                {(status === "uploading" || status === "validating" || status === "processing") && (
                  <div className="w-full max-w-md aspect-[3/4] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-6 shadow-xs">
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-4 border-slate-200/50 border-t-orange-500 animate-spin" />
                      <span className="absolute text-[10px] font-black text-slate-900 dark:text-slate-100">{progress}%</span>
                    </div>
                    <div className="space-y-1 max-w-[240px]">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">{status} Active</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold animate-pulse leading-relaxed">
                        {message}
                      </p>
                    </div>
                  </div>
                )}

                {status === "failed" && (
                  <div className="w-full max-w-md aspect-[3/4] border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                      <AlertCircle size={20} />
                    </div>
                    <div className="space-y-2 max-w-[240px]">
                      <h5 className="text-xs font-black uppercase tracking-wider text-rose-600">Generation Failed</h5>
                      <p className="text-[10px] text-rose-500 dark:text-rose-400/80 font-bold leading-relaxed">
                        {error || "An unexpected error occurred during fitting pipeline."}
                      </p>
                    </div>
                    <button 
                      onClick={() => reset()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-[10px] font-black text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      <RefreshCw size={11} />
                      <span>Retry Session</span>
                    </button>
                  </div>
                )}

                {status === "completed" && generatedImage && (
                  <div className="w-full max-w-md space-y-4">
                    <BeforeAfterSlider 
                      beforeImage={localPreview || uploadedImage} 
                      afterImage={generatedImage} 
                    />
                    
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={downloadResult}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 text-[10px] font-black text-slate-700 dark:text-slate-200 cursor-pointer transition shadow-xs"
                      >
                        <Download size={12} />
                        <span>Download Look</span>
                      </button>
                      <button 
                        onClick={() => reset()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 text-[10px] font-black text-slate-700 dark:text-slate-200 cursor-pointer transition shadow-xs"
                      >
                        <RefreshCw size={12} />
                        <span>Try Another</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT PANEL: Product Parameters & Accessories Recommendations */}
              <div className="p-5 space-y-6 overflow-y-auto text-left">
                <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Garment Parameters</span>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white capitalize">{product.name}</h4>
                  <p className="font-extrabold text-xs text-orange-500">₹{product.price}</p>
                </div>

                {/* Sizing Selectors */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Fit Size Parameter</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["S", "M", "L", "XL"].map((sz) => {
                      const isActive = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`h-8 w-12 rounded-lg border text-xs font-black transition-all cursor-pointer ${ isActive ? "border-slate-950 dark:border-orange-500 bg-slate-950 dark:bg-orange-500 text-white" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300" }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generate Studio Action CTA */}
                <button
                  onClick={handleStartGeneration}
                  disabled={!localFile || status === "uploading" || status === "processing"}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 dark:bg-orange-500 dark:hover:bg-orange-600 py-3 text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
                >
                  <Sparkles size={13} className="animate-pulse" />
                  <span>Generate AI Fitting</span>
                </button>

                {/* ACCESSORIES STYLE SUGGESTIONS */}
                <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800 pt-5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Complete The Look</span>
                  <div className="space-y-2.5">
                    {MOCK_ACCESSORIES.map((acc, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800 hover:border-slate-300 transition duration-150">
                        <img src={acc.img} className="h-9 w-9 rounded-lg object-cover bg-slate-100" alt={acc.name} />
                        <div className="min-w-0 flex-1 text-xs">
                          <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate">{acc.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{acc.price}</p>
                        </div>
                        <button className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition cursor-pointer">
                          <Heart size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TryOnModal;

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  ArrowLeftRight,
  Camera,
  UserSquare2,
  Eye,
  ShieldCheck,
  Heart,
  Zap
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useTryOnStore from "../store/tryOnStore";
import useSocketProgress from "../hooks/useSocketProgress";
import BeforeAfterSlider from "./BeforeAfterSlider";
import TryOnHistory from "./TryOnHistory";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

import tryonDemo1Before from "../assets/tryon_demo1_before.jpg";
import tryonDemo2Before from "../assets/tryon_demo2_before.jpg";
import tryonDemo3Before from "../assets/tryon_demo3_before.jpg";

const MOCK_ACCESSORIES = [
  { name: "Urban Leather Bag", price: "₹2,499", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=150&auto=format&fit=crop&q=60" },
  { name: "Chrono Classic Watch", price: "₹4,999", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=150&auto=format&fit=crop&q=60" },
  { name: "Classic Low Sneakers", price: "₹3,299", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150&auto=format&fit=crop&q=60" }
];

const SAMPLE_MODEL_PRESETS = [
  {
    id: "sample-f",
    label: "Female Model",
    url: tryonDemo1Before
  },
  {
    id: "sample-m",
    label: "Male Model",
    url: tryonDemo2Before
  },
  {
    id: "sample-u",
    label: "Festive Model",
    url: tryonDemo3Before
  }
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
      toast.error("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be smaller than 8MB.");
      return;
    }
    setLocalFile(file);
    setLocalPreview(URL.createObjectURL(file));
  };

  const handleSelectSampleModel = async (preset) => {
    setLocalPreview(preset.url);
    toast.success(`Selected ${preset.label} preset`);
    try {
      const response = await fetch(preset.url);
      const blob = await response.blob();
      const file = new File([blob], `${preset.id}.jpg`, { type: "image/jpeg" });
      setLocalFile(file);
      setUploadedImage(null);
    } catch (e) {
      setLocalFile(null);
      setUploadedImage(preset.url);
    }
  };

  const handleUploadImage = async () => {
    if (!localFile && uploadedImage) return uploadedImage;
    if (!localFile) return null;

    setStatus("uploading");
    setProgress(10);
    setMessage("Uploading photo to secure neural cluster...");

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
        throw new Error(res.data.message || "Upload failed");
      }
    } catch (err) {
      setError(err.message || "Failed to upload image.");
      toast.error(err.message || "Upload failed");
      return null;
    }
  };

  const handleStartGeneration = async () => {
    let currentUploadUrl = uploadedImage;
    if (localFile) {
      currentUploadUrl = await handleUploadImage();
      if (!currentUploadUrl) return;
    } else if (!currentUploadUrl && localPreview) {
      currentUploadUrl = localPreview;
      setUploadedImage(localPreview);
    }

    if (!currentUploadUrl) {
      toast.warn("Please upload a photo or select a sample model.");
      return;
    }

    setStatus("processing");
    setProgress(30);
    setMessage("Analyzing posture geometry and mapping fabric tensors...");

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
        setMessage("Request allocated to GPU cluster. Rendering photorealistic drape...");
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
    toast.info("Preparing high-res download...");
    fetch(generatedImage)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cartnow-tryon-${product.name?.replace(/\s+/g, "-").toLowerCase() || "outfit"}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => toast.error("Download failed."));
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4">
      {/* Dimmed Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeTryOn}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
      />

      {/* Main Modal Panel */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0, y: 15 }}
        className="relative bg-white dark:bg-[#0C111D] border border-slate-200 dark:border-slate-800 rounded-lg w-full max-w-5xl h-[88vh] max-h-[800px] flex flex-col shadow-2xl overflow-hidden z-10"
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/30">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-500">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <div className="text-left">
              <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>AI VIRTUAL FITTING STUDIO</span>
                <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold">
                  V4.2
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                Target: <span className="capitalize text-slate-800 dark:text-slate-200 font-extrabold">{product.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tabs Selector */}
            <div className="flex p-0.5 bg-slate-200/80 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-[9.5px] font-black uppercase">
              <button
                onClick={() => setActiveTab("tryon")}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  activeTab === "tryon"
                    ? "bg-white dark:bg-slate-950 text-slate-950 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Fitting Room
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  activeTab === "history"
                    ? "bg-white dark:bg-slate-950 text-slate-950 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Saved Fits
              </button>
            </div>

            <button
              onClick={closeTryOn}
              className="rounded-md bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition active:scale-95 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === "history" ? (
            <div className="p-4 sm:p-6">
              <TryOnHistory
                token={token}
                onSelectLook={(look) => {
                  setUploadedImage(look.uploadedImage);
                  setGeneratedImage(look.generatedImage);
                  setSelectedSize(look.selectedSize);
                  setActiveTab("tryon");
                }}
              />
            </div>
          ) : (
            <div className="h-full grid grid-cols-1 lg:grid-cols-[270px_1fr_270px] divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
              
              {/* LEFT PANEL: User Upload & Controls */}
              <div className="p-4 space-y-4 overflow-y-auto text-left">
                <div className="space-y-0.5">
                  <h4 className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Step 1: Your Photo
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    Upload a portrait or choose a model preset.
                  </p>
                </div>

                {/* Drag & Drop Upload Deck */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative aspect-[3/4] rounded-md border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all ${
                    isDragging
                      ? "border-orange-500 bg-orange-50/20 dark:bg-orange-950/10 scale-102"
                      : localPreview
                      ? "border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30"
                      : "border-slate-300 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/20 hover:border-orange-400 dark:hover:border-orange-500/50"
                  }`}
                >
                  {localPreview ? (
                    <div className="relative w-full h-full rounded overflow-hidden">
                      <img src={localPreview} className="w-full h-full object-cover" alt="Model Preview" />
                      <button
                        onClick={() => {
                          setLocalFile(null);
                          setLocalPreview(null);
                          setUploadedImage(null);
                        }}
                        className="absolute bottom-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded p-1.5 shadow-md hover:scale-105 transition active:scale-95 cursor-pointer"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer group">
                      <div className="w-9 h-9 rounded-md bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Upload size={16} className="animate-bounce" />
                      </div>
                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                        Drag & Drop Photo
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5 font-semibold">
                        PNG/JPG up to 8MB
                      </span>
                      <span className="mt-2 px-2.5 py-1 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-2xs">
                        Browse Files
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Sample Model Presets Quick Bar */}
                <div className="space-y-1.5">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400">
                    Or Try Sample Models:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {SAMPLE_MODEL_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectSampleModel(preset)}
                        className="flex flex-col items-center p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500 bg-white dark:bg-slate-900 transition-all cursor-pointer group"
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-8 h-8 rounded object-cover bg-slate-100 dark:bg-slate-800"
                        />
                        <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                          {preset.label.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Posture Guidance Note */}
                <div className="p-2.5 rounded-md bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  <span className="font-black text-slate-700 dark:text-slate-300">💡 Tip:</span> Standing torso shot gives optimal results.
                </div>
              </div>

              {/* CENTER PANEL: Interactive Preview Canvas */}
              <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col items-center justify-center min-h-[320px]">
                {status === "idle" && (
                  <div className="w-full max-w-sm aspect-[3/4] border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 rounded-lg flex flex-col items-center justify-center p-6 text-center shadow-2xs">
                    <div className="h-10 w-10 rounded-md bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
                      <Sparkles size={18} className="animate-pulse" />
                    </div>
                    <h5 className="font-black text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      AI Canvas Ready
                    </h5>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium mt-1 max-w-[220px] leading-relaxed">
                      Upload your portrait on the left, pick your size on the right, and generate.
                    </p>
                  </div>
                )}

                {(status === "uploading" || status === "validating" || status === "processing") && (
                  <div className="w-full max-w-sm aspect-[3/4] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg flex flex-col items-center justify-center p-6 text-center space-y-4 shadow-xl">
                    <div className="relative flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full border-3 border-slate-200 dark:border-slate-800 border-t-orange-500 animate-spin" />
                      <span className="absolute text-[11px] font-black text-slate-900 dark:text-white">
                        {progress}%
                      </span>
                    </div>
                    <div className="space-y-1 max-w-[220px]">
                      <h5 className="text-[10.5px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                        {status} Active
                      </h5>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold animate-pulse leading-relaxed">
                        {message}
                      </p>
                    </div>
                  </div>
                )}

                {status === "failed" && (
                  <div className="w-full max-w-sm aspect-[3/4] border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 rounded-lg flex flex-col items-center justify-center p-6 text-center space-y-3.5">
                    <div className="h-10 w-10 rounded-md bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                      <AlertCircle size={18} />
                    </div>
                    <div className="space-y-1 max-w-[240px]">
                      <h5 className="text-[11px] font-black uppercase tracking-wider text-rose-600">
                        {error?.includes("credits") || error?.includes("402") ? "GPU Credits Required" : "Fitting Error"}
                      </h5>
                      <p className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold leading-relaxed">
                        {error || "An unexpected error occurred during fitting pipeline."}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full max-w-[220px]">
                      <button
                        onClick={() => {
                          handleSelectSampleModel(SAMPLE_MODEL_PRESETS[0]);
                          reset();
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-2xs"
                      >
                        <Sparkles size={11} />
                        <span>Test Studio Preset</span>
                      </button>
                      <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-50 text-[10px] font-black text-slate-700 dark:text-slate-200 transition cursor-pointer"
                      >
                        <RefreshCw size={11} />
                        <span>Retry Session</span>
                      </button>
                    </div>
                  </div>
                )}

                {status === "completed" && generatedImage && (
                  <div className="w-full max-w-sm space-y-3">
                    <BeforeAfterSlider
                      beforeImage={localPreview || uploadedImage}
                      afterImage={generatedImage}
                      title="AI Outfit Alignment"
                    />

                    <div className="flex gap-2 justify-center pt-0.5">
                      <button
                        onClick={downloadResult}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition shadow-2xs"
                      >
                        <Download size={11} />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => reset()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-wider cursor-pointer transition shadow-2xs"
                      >
                        <RefreshCw size={11} />
                        <span>Try Another</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT PANEL: Product Parameters & Accessories Recommendations */}
              <div className="p-4 space-y-4 overflow-y-auto text-left">
                
                {/* Garment Details Card */}
                <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Step 2: Selected
                  </span>
                  <h4 className="font-black text-xs text-slate-900 dark:text-white capitalize leading-tight">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="font-black text-xs text-orange-500">₹{product.price}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      {product.category || "Fashion"}
                    </span>
                  </div>
                </div>

                {/* Sizing Selectors */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Fit Size Parameter
                    </span>
                    <span className="text-[9px] font-bold text-orange-500">True-to-Fit</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["S", "M", "L", "XL"].map((sz) => {
                      const isActive = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`h-7 rounded border text-[11px] font-black transition-all cursor-pointer ${
                            isActive
                              ? "border-orange-500 bg-orange-500 text-white shadow-2xs"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                          }`}
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
                  disabled={(!localFile && !localPreview && !uploadedImage) || status === "uploading" || status === "processing"}
                  className="w-full flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-orange-500/25 disabled:from-slate-200 disabled:to-slate-300 dark:disabled:from-slate-800 dark:disabled:to-slate-850 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles size={12} className="animate-pulse" />
                  <span>Generate AI Virtual Try-On</span>
                </button>

                {/* ACCESSORIES STYLE SUGGESTIONS */}
                <div className="space-y-2 border-t border-slate-200/80 dark:border-slate-800 pt-3">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400">
                    Complete The Outfit
                  </span>
                  <div className="space-y-1.5">
                    {MOCK_ACCESSORIES.map((acc, aIdx) => (
                      <div
                        key={aIdx}
                        className="flex items-center gap-2 bg-slate-50/60 dark:bg-slate-900/40 p-2 rounded-md border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 transition-all duration-150"
                      >
                        <img src={acc.img} className="h-8 w-8 rounded object-cover bg-slate-100 dark:bg-slate-800" alt={acc.name} />
                        <div className="min-w-0 flex-1 text-xs">
                          <p className="font-black text-slate-800 dark:text-slate-200 truncate text-[11px]">{acc.name}</p>
                          <p className="text-[9.5px] text-slate-400 font-bold">{acc.price}</p>
                        </div>
                        <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition cursor-pointer">
                          <Heart size={11} />
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

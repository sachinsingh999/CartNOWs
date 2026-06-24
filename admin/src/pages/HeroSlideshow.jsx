import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import {
  Megaphone,
  Upload,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  Image as ImageIcon,
  Pencil,
  X
} from "lucide-react";

// Utility: Convert base64 dataUrl to Blob file
const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Utility: Flood-fill starting from borders to detect & remove solid white/gray and fake checkerboards
const removeBackgroundFromImage = (imageElement) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  ctx.drawImage(imageElement, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const width = canvas.width;
  const height = canvas.height;

  const visited = new Uint8Array(width * height);
  const queue = [];

  // Sample corner pixel colors (only if they are not already transparent)
  const corners = [];
  const sampleCorner = (x, y) => {
    const idx = (y * width + x) * 4;
    const a = data[idx + 3];
    if (a > 15) {
      corners.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2]
      });
    }
  };

  // Sample multiple points near the corners for a better baseline (handles compression noise near absolute edges)
  sampleCorner(0, 0);
  sampleCorner(5, 5);
  sampleCorner(width - 1, 0);
  sampleCorner(width - 6, 5);
  sampleCorner(0, height - 1);
  sampleCorner(5, height - 6);
  sampleCorner(width - 1, height - 1);
  sampleCorner(width - 6, height - 6);

  // Helper to check color distance from sampled corners
  const isColorCloseToCorners = (r, g, b) => {
    if (corners.length === 0) return false;
    for (const c of corners) {
      // Manhattan distance
      const dist = Math.abs(r - c.r) + Math.abs(g - c.g) + Math.abs(b - c.b);
      // Tolerance of 75 accommodates compression noise and gradients
      if (dist < 75) return true;
    }
    return false;
  };

  // Add all border pixels to queue (Top, Bottom, Left, Right edges)
  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
    visited[x] = 1;
    visited[x + (height - 1) * width] = 1;
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
    visited[y * width] = 1;
    visited[(width - 1) + y * width] = 1;
  }

  // Helper to identify if a pixel color is a background color
  const isBgPixel = (r, g, b, a) => {
    if (a < 15) return true; // Already transparent

    // Check match against sampled corner colors
    if (isColorCloseToCorners(r, g, b)) return true;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    // Saturation check for gray checkerboard squares (darker squares)
    if (diff < 28 && max > 85) return true;

    // Solid white/near-white backgrounds with compression noise
    if (max > 220 && diff < 35) return true;

    return false;
  };

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    if (isBgPixel(r, g, b, a)) {
      // Clear the background pixel (fully transparent)
      data[idx] = 0;
      data[idx + 1] = 0;
      data[idx + 2] = 0;
      data[idx + 3] = 0;

      // Check 4-connected neighbors
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = ny * width + nx;
          if (!visited[nidx]) {
            visited[nidx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
};

const HeroSlideshow = ({ token }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [tagline, setTagline] = useState("");

  // Image and processing states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [autoCleanBg, setAutoCleanBg] = useState(true);
  const [cleanedPreview, setCleanedPreview] = useState("");
  const [cleanedBlob, setCleanedBlob] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [editingAsset, setEditingAsset] = useState(null);

  const startEdit = (asset) => {
    setEditingAsset(asset);
    setName(asset.name);
    setCategory(asset.category);
    setTagline(asset.tagline);
    setImagePreview(asset.imageUrl.startsWith("http") ? asset.imageUrl : `${backendUrl}${asset.imageUrl}`);
    setCleanedPreview(asset.imageUrl.startsWith("http") ? asset.imageUrl : `${backendUrl}${asset.imageUrl}`);
    setImageFile(null);
    setCleanedBlob(null);
  };

  const cancelEdit = () => {
    setEditingAsset(null);
    setName("");
    setCategory("Fashion");
    setTagline("");
    setImagePreview("");
    setCleanedPreview("");
    setImageFile(null);
    setCleanedBlob(null);
  };

  const handleToggleActive = async (asset) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/system/hero-assets/${asset._id}`,
        { isActive: !asset.isActive },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`Branding asset ${!asset.isActive ? "activated" : "deactivated"} successfully!`);
        fetchAssets();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleAiGenerate = async () => {
    setGeneratingAi(true);
    const toastMsg = aiPrompt.trim()
      ? "Generating custom campaign model using AI... 🪄"
      : `Generating a premium campaign model for ${category} using AI... 🪄`;
    toast.info(toastMsg);

    try {
      const response = await axios.post(
        `${backendUrl}/api/system/hero-assets/generate`,
        { category, prompt: aiPrompt },
        { headers: { token } }
      );

      if (response.data?.success && response.data?.imageUrl) {
        const generatedUrl = response.data.imageUrl;
        const isAlreadyTransparent = response.data.isTransparent;

        toast.success("AI model generated successfully! Loading image...");
        setProcessing(true);

        const img = new Image();
        img.crossOrigin = "anonymous"; // CRITICAL to avoid tainted canvas!
        img.src = generatedUrl;

        img.onload = async () => {
          try {
            const blobResponse = await fetch(generatedUrl);
            const blob = await blobResponse.blob();
            setCleanedBlob(blob);
            setImageFile(new File([blob], `${category.toLowerCase()}_ai.png`, { type: "image/png" }));

            const localUrl = URL.createObjectURL(blob);
            setImagePreview(localUrl);
            setCleanedPreview(localUrl);
            toast.success("AI model loaded successfully!");
          } catch (err) {
            console.error("Load generated image failed:", err);
            setImagePreview(generatedUrl);
            setCleanedPreview(generatedUrl);
            setCleanedBlob(null);
            setImageFile(new File([], `${category.toLowerCase()}_ai.png`, { type: "image/png" })); // dummy
          } finally {
            setProcessing(false);
          }
        };

        img.onerror = () => {
          setProcessing(false);
          toast.error("Failed to load generated AI image.");
        };

      } else {
        toast.error(response.data?.message || "Failed to generate image");
      }
    } catch (error) {
      console.error("AI Generation error:", error);
      toast.error(error.response?.data?.message || "AI image generation failed");
    } finally {
      setGeneratingAi(false);
    }
  };

  const categoriesList = [
    "Fashion",
    "Footwear",
    "Electronics",
    "Beauty",
    "Fitness",
    "Accessories",
    "Home & Lifestyle",
    "Kids Collection"
  ];

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/system/hero-assets?admin=true`, { headers: { token } });
      if (response.data.success) {
        setAssets(response.data.assets);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Fetch hero assets error:", error);
      toast.error(error.response?.data?.message || "Failed to load hero assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const fileType = file.type;
    if (
      fileType !== "image/png" &&
      fileType !== "image/webp" &&
      fileType !== "image/jpeg" &&
      fileType !== "image/jpg"
    ) {
      toast.error("Only JPEG, PNG, or WebP formats are allowed.");
      e.target.value = null;
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = async () => {
      setImagePreview(reader.result);

      if (autoCleanBg) {
        setProcessing(true);
        toast.info("Applying professional AI background removal... 🪄");
        try {
          const formData = new FormData();
          formData.append("image", file);

          const response = await axios.post(
            `${backendUrl}/api/system/hero-assets/remove-bg`,
            formData,
            {
              headers: {
                token,
                "Content-Type": "multipart/form-data"
              }
            }
          );

          if (response.data.success) {
            const transparentUrl = response.data.imageUrl;

            // Fetch the transparent image as blob
            const responseBlob = await fetch(transparentUrl);
            const blob = await responseBlob.blob();
            setCleanedBlob(blob);

            const localUrl = URL.createObjectURL(blob);
            setCleanedPreview(localUrl);
            toast.success("AI Background removed successfully!");
          } else {
            toast.error(response.data.message || "Failed to remove background");
            setCleanedPreview(reader.result);
            setCleanedBlob(null);
          }
        } catch (err) {
          console.error("AI background cleaning error:", err);
          toast.warning("Failed to run AI background removal. Fallback to original.");
          setCleanedPreview(reader.result);
          setCleanedBlob(null);
        } finally {
          setProcessing(false);
        }
      } else {
        setCleanedPreview(reader.result);
        setCleanedBlob(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warning("Asset Name/Title is required");
    if (!imageFile && !editingAsset) return toast.warning("Please select a transparent image file");

    setUploading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("tagline", tagline);

    // Determine whether to use cleaned file or original, only if new image was selected
    if (imageFile) {
      if (autoCleanBg && cleanedBlob) {
        formData.append("image", cleanedBlob, `${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_cleaned.png`);
      } else {
        formData.append("image", imageFile);
      }
    }

    try {
      const url = editingAsset
        ? `${backendUrl}/api/system/hero-assets/${editingAsset._id}`
        : `${backendUrl}/api/system/hero-assets`;

      const method = editingAsset ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          token,
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        toast.success(editingAsset ? "Hero branding asset updated successfully!" : "Hero branding asset uploaded successfully!");
        cancelEdit();
        fetchAssets();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign asset?")) return;

    try {
      const response = await axios.delete(
        `${backendUrl}/api/system/hero-assets/${id}`,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Asset deleted successfully");
        fetchAssets();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Deletion failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Campaign Presentation
          </p>
          <div className="flex items-center gap-2.5 mt-1">
            <Megaphone size={18} className="text-indigo-500" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Hero Asset Slideshow</h2>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Manage transparent branding campaign cutout assets live on homepage hero
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Upload Panel */}
        <div className="bg-white dark:bg-[#172033] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingAsset ? "Edit Branding Asset" : "Add Branding Asset"}
              </h3>
            </div>
            {editingAsset && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 border-none bg-transparent cursor-pointer flex items-center justify-center"
                title="Cancel Edit"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Image Upload Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Transparent PNG / WebP Image
              </label>

              {imagePreview ? (
                <div className="relative group rounded-xl border border-dashed border-slate-300 dark:border-white/[0.1] overflow-hidden flex flex-col items-center justify-center p-4 min-h-[220px]">
                  {/* Checkerboard Background Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] bg-slate-50 dark:bg-slate-900 dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] z-0" />

                  {processing ? (
                    <div className="relative z-10 flex flex-col items-center gap-1.5 text-[11px] text-slate-400 font-bold bg-white/80 dark:bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
                      <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Processing background...</span>
                    </div>
                  ) : (
                    <img
                      src={autoCleanBg && cleanedPreview ? cleanedPreview : imagePreview}
                      alt="Preview"
                      className="relative z-10 max-h-[160px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] animate-fade-in"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      setCleanedPreview("");
                      setCleanedBlob(null);
                    }}
                    className="absolute top-2 right-2 z-20 bg-rose-500 hover:bg-rose-650 text-white rounded-full p-1.5 shadow-md transition-all active:scale-95 border-none cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 size={14} />
                  </button>

                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-350 dark:border-white/[0.08] hover:border-indigo-500 dark:hover:border-indigo-500/80 rounded-xl cursor-pointer py-8 px-4 text-center bg-slate-50 dark:bg-slate-900/50 transition duration-200 min-h-[170px]">
                    <Upload size={24} className="text-slate-450 dark:text-slate-500 animate-pulse" />
                    <span className="mt-2.5 text-xs font-bold text-slate-800 dark:text-slate-205">Click to upload file</span>
                    <span className="mt-0.5 text-[9.5px] text-slate-400 dark:text-slate-500">JPEG / PNG / WebP</span>
                    <input
                      type="file"
                      accept="image/png, image/webp, image/jpeg, image/jpg"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {/* AI Generation Prompt Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Custom AI Prompt (Optional)
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. A futuristic model posing in a black neon cyberpunk jacket"
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition focus:border-indigo-500 dark:focus:border-indigo-500/80 font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={generatingAi || processing}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={13} className={generatingAi ? "animate-spin text-indigo-500" : "animate-pulse"} />
                    {generatingAi ? "Generating AI Model..." : "Generate Model with AI"}
                  </button>
                </div>
              )}

              {/* Auto-Remove Background Toggle Checkbox (Always visible) */}
              <div className="flex items-center gap-2 mt-2.5 py-1">
                <input
                  type="checkbox"
                  id="autoCleanBg"
                  checked={autoCleanBg}
                  onChange={(e) => setAutoCleanBg(e.target.checked)}
                  className="w-3.5 h-3.5 text-indigo-650 border-slate-300 dark:border-white/[0.08] rounded-xs focus:ring-indigo-500 accent-indigo-650 cursor-pointer"
                />
                <label htmlFor="autoCleanBg" className="text-[10px] font-bold text-slate-500 dark:text-slate-450 select-none cursor-pointer">
                  Auto-Remove Background (Removes white/grays & fake checkerboards)
                </label>
              </div>
            </div>

            {/* Title / Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Asset Name / Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Urban Streetwear Model"
                className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition focus:border-indigo-500 dark:focus:border-indigo-500/80 font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition focus:border-indigo-500 dark:focus:border-indigo-500/80 font-bold"
              >
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tagline */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Tagline / Subtext (Optional)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Modern Minimalist Silhouette"
                className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition focus:border-indigo-500 dark:focus:border-indigo-500/80 font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={uploading || processing}
                className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-650 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 transition-all duration-200 border-none cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{editingAsset ? "Saving Changes..." : "Uploading Campaign..."}</span>
                  </>
                ) : (
                  <span>{editingAsset ? "Save Changes" : "Publish Asset"}</span>
                )}
              </button>

              {editingAsset && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider transition-all duration-200 border-none cursor-pointer flex items-center justify-center"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {/* Guidelines */}
          <div className="bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl p-3.5 space-y-2 text-[10px] leading-relaxed text-indigo-700 dark:text-indigo-400 font-medium">
            <div className="flex gap-1.5 items-center font-black uppercase tracking-wider text-[9px]">
              <AlertCircle size={12} />
              <span>Asset Requirements</span>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li>Must have a **pure transparent background** when published.</li>
              <li>Supports **JPEG**, **PNG**, and **WebP** upload formats.</li>
              <li>Integrated **AI background remover** ensures clean edges.</li>
              <li>High-resolution professional photography only.</li>
            </ul>
          </div>
        </div>

        {/* Assets List Grid */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#172033] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Branding Campaigns</h3>
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 px-3.5 py-1">
                {assets.length} Assets Published
              </span>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-bold">Fetching campaign listings...</span>
              </div>
            ) : assets.length === 0 ? (
              <div className="flex-1 border border-dashed border-slate-200 dark:border-white/[0.06] rounded-xl flex flex-col items-center justify-center text-center p-12 text-xs text-slate-400">
                <div className="h-10 w-10 rounded-full bg-slate-105 dark:bg-slate-900/80 flex items-center justify-center text-slate-450 border border-slate-200 dark:border-slate-800 mb-3">
                  <ImageIcon size={18} />
                </div>
                <p className="font-black text-slate-800 dark:text-slate-200">No Custom Campaign Assets Uploaded</p>
                <p className="max-w-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-normal">
                  The homepage slider will fall back to using default premium design assets automatically. Upload custom transparent cutout assets on the left to personalize your store!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {assets.map((asset) => (
                  <div
                    key={asset._id}
                    className="group bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/[0.05] rounded-xl overflow-hidden hover:border-slate-350 dark:hover:border-slate-700 transition duration-200 flex flex-col"
                  >
                    {/* Image Preview with checkered background */}
                    <div className="relative h-[160px] flex items-center justify-center border-b border-slate-100 dark:border-white/[0.05] overflow-hidden p-3 shrink-0">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:12px_12px] bg-[position:0_0,0_6px,6px_-6px,-6px_0] bg-white dark:bg-slate-950 dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)]" />
                      <img
                        src={asset.imageUrl.startsWith("http") ? asset.imageUrl : `${backendUrl}${asset.imageUrl}`}
                        alt={asset.name}
                        className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => startEdit(asset)}
                          className="bg-indigo-550 hover:bg-indigo-600 text-white rounded-lg p-1.5 shadow-sm border-none cursor-pointer flex items-center justify-center"
                          title="Edit asset"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset._id)}
                          className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg p-1.5 shadow-sm border-none cursor-pointer flex items-center justify-center"
                          title="Delete asset"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Details Info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest border border-indigo-500/10">
                            {asset.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2 tracking-tight truncate">
                          {asset.name}
                        </h4>
                        {asset.tagline && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1 line-clamp-2">
                            {asset.tagline}
                          </p>
                        )}
                      </div>
                      <div className="text-[10px] border-t border-slate-100 dark:border-white/[0.04] pt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={11} className={asset.isActive ? "text-emerald-500" : "text-slate-350 dark:text-slate-600"} />
                          <span className={asset.isActive ? "text-slate-700 dark:text-slate-300 font-bold" : "text-slate-400 dark:text-slate-500"}>
                            {asset.isActive ? "Active Campaign" : "Inactive"}
                          </span>
                        </div>
                        <label className="flex items-center gap-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!asset.isActive}
                            onChange={() => handleToggleActive(asset)}
                            className="w-3.5 h-3.5 text-indigo-650 border-slate-300 dark:border-white/[0.08] rounded-xs focus:ring-indigo-500 accent-indigo-650 cursor-pointer"
                          />
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">Show on Live</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlideshow;

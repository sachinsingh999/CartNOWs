import React, { useState, useRef } from "react";
import {
  Star,
  X,
  UploadCloud,
  Plus,
  AlertCircle,
  ShieldCheck,
  Check,
  ThumbsUp,
  ThumbsDown,
  Film,
  Eye,
  EyeOff,
  Send,
  Loader2,
  Package
} from "lucide-react";

const SUGGESTED_PROS = [
  "Great Quality",
  "Fast Delivery",
  "Value for Money",
  "Comfortable",
  "True to Size",
  "Premium Finish"
];

const SUGGESTED_CONS = [
  "Slow Delivery",
  "Size Runs Small",
  "Packaging Issue",
  "Color Differs",
  "Average Build"
];

const RATING_CONFIG = {
  1: {
    label: "Poor • Disappointed",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50"
  },
  2: {
    label: "Fair • Needs improvement",
    badgeBg: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50"
  },
  3: {
    label: "Average • Decent product",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50"
  },
  4: {
    label: "Good • Very satisfied",
    badgeBg: "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/50"
  },
  5: {
    label: "Excellent • Highly recommended!",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
  }
};

const WriteReviewModal = ({ isOpen, onClose, onSubmit, loading, product }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  // Pros & Cons tags
  const [proInput, setProInput] = useState("");
  const [pros, setPros] = useState([]);
  const [conInput, setConInput] = useState("");
  const [cons, setCons] = useState([]);

  // Media attachments
  const [mediaList, setMediaList] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleAddPro = (text) => {
    const val = (typeof text === "string" ? text : proInput).trim();
    if (val && !pros.includes(val)) {
      setPros([...pros, val]);
      setProInput("");
    }
  };

  const handleTogglePro = (tag) => {
    if (pros.includes(tag)) {
      setPros(pros.filter((item) => item !== tag));
    } else {
      setPros([...pros, tag]);
    }
  };

  const handleAddCon = (text) => {
    const val = (typeof text === "string" ? text : conInput).trim();
    if (val && !cons.includes(val)) {
      setCons([...cons, val]);
      setConInput("");
    }
  };

  const handleToggleCon = (tag) => {
    if (cons.includes(tag)) {
      setCons(cons.filter((item) => item !== tag));
    } else {
      setCons([...cons, tag]);
    }
  };

  const handleRemovePro = (index) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleRemoveCon = (index) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const processFiles = (files) => {
    const fileArray = Array.from(files);
    if (mediaList.length + fileArray.length > 6) {
      setError("You can attach up to 6 photos or videos.");
      return;
    }

    const newMedia = fileArray.map((file) => ({
      name: file.name,
      type: file.type.startsWith("video/") ? "video" : "image",
      url: URL.createObjectURL(file),
      file
    }));

    setMediaList((prev) => [...prev, ...newMedia]);
    setError("");
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveMedia = (index) => {
    const item = mediaList[index];
    if (item?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    mediaList.forEach((m) => {
      if (m?.url?.startsWith("blob:")) URL.revokeObjectURL(m.url);
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select an overall star rating.");
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      setError("Please write at least 10 characters describing your experience.");
      return;
    }

    const success = await onSubmit({
      rating,
      comment,
      pros,
      cons,
      media: mediaList,
      anonymous
    });

    if (success) {
      mediaList.forEach((m) => {
        if (m?.url?.startsWith("blob:")) URL.revokeObjectURL(m.url);
      });
      setRating(0);
      setComment("");
      setPros([]);
      setCons([]);
      setMediaList([]);
      setAnonymous(false);
      onClose();
    }
  };

  const activeRating = hoverRating || rating;
  const currentRatingInfo = RATING_CONFIG[activeRating];
  const charCount = comment.trim().length;
  const isCommentValid = charCount >= 10;
  const productImage = product?.image
    ? Array.isArray(product.image)
      ? product.image[0]
      : product.image
    : null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-5 transition-all duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-[scale-up_0.2s_ease-out]">
        
        {/* Compact Horizontal Header */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {product && (
              <div className="w-10 h-10 rounded-md overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                {productImage ? (
                  <img src={productImage} alt={product.name || "Product"} className="w-full h-full object-cover" />
                ) : (
                  <Package size={18} className="text-slate-400" />
                )}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40">
                  <ShieldCheck size={12} className="stroke-[2.5]" />
                  Verified Review
                </span>
                {product?.name && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[280px] sm:max-w-md">
                    • {product.name}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Write a Customer Review
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            type="button"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wide 2-Column Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 flex-1 scrollbar-thin text-left">
          {error && (
            <div className="rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-3 mb-4 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-400 animate-in fade-in">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* LEFT COLUMN: Rating & Highlights */}
            <div className="space-y-4">
              {/* Overall Rating Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Overall Rating <span className="text-rose-500">*</span>
                  </label>
                  {activeRating > 0 && (
                    <span className="text-xs font-bold text-amber-500 dark:text-amber-400">
                      {activeRating}.0 / 5.0
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-md bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/80">
                  <div
                    className="flex items-center gap-1.5"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= activeRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          className="h-8.5 w-8.5 flex items-center justify-center rounded-md transition-transform duration-150 hover:scale-115 active:scale-90 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                          <Star
                            size={22}
                            className={`transition-all duration-200 ${
                              isFilled
                                ? "fill-amber-400 stroke-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.45)]"
                                : "stroke-slate-300 dark:stroke-slate-700 fill-transparent hover:stroke-amber-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Sentiment Badge */}
                  <div className="flex-1 min-w-0">
                    {currentRatingInfo ? (
                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border transition-all duration-200 ${currentRatingInfo.badgeBg}`}
                      >
                        <span>{currentRatingInfo.label}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        Click a star to rate
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pros Card */}
              <div className="rounded-md bg-emerald-50/30 dark:bg-emerald-950/15 border border-emerald-100/70 dark:border-emerald-900/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <ThumbsUp size={13} className="stroke-[2.5]" />
                    Pros (Highlights)
                  </label>
                  <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-bold">
                    {pros.length} added
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={proInput}
                    onChange={(e) => setProInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPro();
                      }
                    }}
                    placeholder="e.g. Fast delivery, Great fabric"
                    className="w-full bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/40 rounded-md pl-2.5 pr-8 py-1.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPro()}
                    disabled={!proInput.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white flex items-center justify-center transition cursor-pointer"
                    aria-label="Add Pro"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {SUGGESTED_PROS.slice(0, 4).map((tag) => {
                    const isSelected = pros.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTogglePro(tag)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white/80 dark:bg-slate-900/80 text-emerald-800 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100/50"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* Added Pros Tags */}
                {pros.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-emerald-100 dark:border-emerald-900/30">
                    {pros.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10.5px] font-medium animate-in fade-in"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePro(idx)}
                          className="hover:text-emerald-950 dark:hover:text-white p-0.5 cursor-pointer rounded"
                          aria-label={`Remove ${item}`}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cons Card */}
              <div className="rounded-md bg-rose-50/30 dark:bg-rose-950/15 border border-rose-100/70 dark:border-rose-900/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    <ThumbsDown size={13} className="stroke-[2.5]" />
                    Cons (Improvements)
                  </label>
                  <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 font-bold">
                    {cons.length} added
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={conInput}
                    onChange={(e) => setConInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCon();
                      }
                    }}
                    placeholder="e.g. Short cable, Size runs big"
                    className="w-full bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-800/40 rounded-md pl-2.5 pr-8 py-1.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCon()}
                    disabled={!conInput.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-rose-600 hover:bg-rose-700 disabled:opacity-30 text-white flex items-center justify-center transition cursor-pointer"
                    aria-label="Add Con"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {SUGGESTED_CONS.slice(0, 4).map((tag) => {
                    const isSelected = cons.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleCon(tag)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-rose-600 text-white border-rose-600"
                            : "bg-white/80 dark:bg-slate-900/80 text-rose-800 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40 hover:bg-rose-100/50"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* Added Cons Tags */}
                {cons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-rose-100 dark:border-rose-900/30">
                    {cons.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 px-2 py-0.5 text-[10.5px] font-medium animate-in fade-in"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCon(idx)}
                          className="hover:text-rose-950 dark:hover:text-white p-0.5 cursor-pointer rounded"
                          aria-label={`Remove ${item}`}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Comments & Media & Privacy */}
            <div className="space-y-4">
              {/* Detailed Comment Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Detailed Comments <span className="text-rose-500">*</span>
                  </label>
                  <div className="text-[11px] font-medium flex items-center gap-1.5">
                    {isCommentValid ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                        <Check size={13} className="stroke-[3]" />
                        {charCount} chars
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">
                        {Math.max(0, 10 - charCount)} more chars needed
                      </span>
                    )}
                  </div>
                </div>

                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike? How does it fit or perform in daily use?"
                  className={`w-full bg-slate-50/50 dark:bg-slate-950/40 border rounded-md p-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-none outline-none transition-all duration-200 focus:bg-white dark:focus:bg-slate-950 ${
                    isCommentValid
                      ? "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      : charCount > 0
                      ? "border-amber-300 dark:border-amber-700/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
              </div>

              {/* Attach Photos or Videos */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Attach Photos or Videos
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {mediaList.length} / 6 attached
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {mediaList.length === 0 ? (
                  /* Empty state: full drag-and-drop zone */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-md p-3.5 flex items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
                      <UploadCloud size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">
                        Photos (JPG, PNG, WEBP) or short video clip
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Attached media preview gallery */
                  <div className="p-2.5 rounded-md bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-2">
                      {mediaList.map((item, index) => (
                        <div
                          key={index}
                          className="relative w-13 h-13 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 group shadow-xs"
                        >
                          {item.type === "image" ? (
                            <img
                              src={item.url}
                              alt="preview"
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-1">
                              <Film size={16} className="text-indigo-400 mb-0.5" />
                              <span className="text-[8px] font-bold uppercase tracking-wider">Video</span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(index)}
                            className="absolute top-1 right-1 w-4 h-4 bg-black/75 hover:bg-rose-600 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Remove attachment"
                          >
                            <X size={8} />
                          </button>
                        </div>
                      ))}

                      {mediaList.length < 6 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-13 h-13 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer bg-white dark:bg-slate-900"
                        >
                          <Plus size={15} />
                          <span className="text-[8.5px] font-bold uppercase tracking-wider mt-0.5">Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Anonymous Privacy Card */}
              <div
                onClick={() => setAnonymous(!anonymous)}
                className={`p-2.5 rounded-md border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
                  anonymous
                    ? "bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60"
                    : "bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-900/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7.5 h-7.5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                      anonymous
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {anonymous ? <EyeOff size={14} /> : <Eye size={14} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {anonymous ? "Posting Anonymously" : "Post with Your Name"}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">
                      {anonymous
                        ? "Identity hidden as 'CartNow Verified Shopper'"
                        : "Profile name visible with review"}
                    </p>
                  </div>
                </div>

                {/* Custom Pill Toggle */}
                <div
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                    anonymous ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                      anonymous ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Sticky Modal Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 w-full sm:w-auto justify-center sm:justify-start">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span>Spam-protected genuine buyer feedback</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-md border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || rating === 0 || !isCommentValid}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-black tracking-wide transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={12} className="stroke-[2.5]" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewModal;

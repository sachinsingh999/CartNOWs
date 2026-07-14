import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { backendUrl } from "../config";

const CreatePostModal = ({
  isOpen,
  onClose,
  mediaPreview,
  setMediaPreview,
  setMediaFile,
  taggedProducts,
  setTaggedProducts,
  caption,
  setCaption,
  submitting,
  onSubmit,
  handleFileChange,
  handleImageClick,
  removeTag,
  imagePreviewRef,
  purchasedProducts = [],
  selectedProduct,
  setSelectedProduct,
  currentUser
}) => {
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagSuggestionsRef = useRef(null);

  // Clear query and suggestions on open/close
  useEffect(() => {
    if (!isOpen) {
      setTagSearchQuery("");
      setShowTagSuggestions(false);
    }
  }, [isOpen]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tagSuggestionsRef.current && !tagSuggestionsRef.current.contains(e.target)) {
        setShowTagSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products strictly from purchasedProducts
  const filteredTagProducts = useMemo(() => {
    const q = tagSearchQuery.toLowerCase().trim();
    if (!q) return [];
    return purchasedProducts
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [tagSearchQuery, purchasedProducts]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-lg w-full max-w-[850px] max-h-[90vh] md:max-h-[620px] overflow-hidden shadow-2xl flex flex-col md:flex-row p-0 animate-scale-up text-left">
        
        {/* Left Side: Media Upload / Preview */}
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 p-6 flex flex-col justify-center min-h-[300px] md:min-h-0">
          {!mediaPreview ? (
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/80 rounded-lg h-full min-h-[260px] flex flex-col items-center justify-center cursor-pointer transition-all duration-350 p-6 bg-white dark:bg-slate-900 group shadow-xs">
              <div className="p-4 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 mb-3 shadow-inner">
                <ImageIcon size={28} className="stroke-1.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Select Post Photo</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1.5">Drag & drop or browse</span>
              <span className="text-[8px] text-slate-400/80 dark:text-slate-600 uppercase tracking-widest mt-1">JPEG or PNG format</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          ) : (
            <div className="relative h-full flex flex-col justify-between">
              {/* Photo Area */}
              <div className="relative flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-950 rounded-md border border-slate-200/50 dark:border-slate-800/50 overflow-hidden min-h-[240px] md:min-h-0">
                <img 
                  ref={imagePreviewRef}
                  src={mediaPreview} 
                  onClick={handleImageClick}
                  alt="Post preview" 
                  className="max-w-full max-h-[360px] object-contain cursor-crosshair rounded-md transition-all duration-300 hover:brightness-95" 
                />
                
                {/* Overlay Tags */}
                {taggedProducts.map(t => (
                  <div 
                    key={t.productId}
                    style={{ left: `${t.x}%`, top: `${t.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-black/75 backdrop-blur-xs text-white rounded-full flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider select-none cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all"
                    title="Click to remove tag"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(t.productId);
                    }}
                  >
                    <span>{t.name}</span>
                    <span className="text-rose-450 font-bold ml-0.5">×</span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview("");
                    setTaggedProducts([]);
                  }}
                  className="absolute top-3.5 right-3.5 h-7 w-7 bg-black/60 hover:bg-black text-white rounded-full transition cursor-pointer border-none flex items-center justify-center shadow-md hover:scale-105"
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-center mt-3 select-none flex items-center justify-center gap-1">
                <span>🎯</span> Tap on photo to pin the selected product tag
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Details & Composer */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between max-h-[85vh] md:max-h-none overflow-y-auto" data-lenis-prevent>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/60 mb-4.5">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Create New Post</h2>
            <button 
              type="button"
              onClick={onClose}
              className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-white transition cursor-pointer border-none bg-transparent"
            >
              <X size={15} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="flex-1 flex flex-col justify-between gap-4">
            <div className="space-y-4 text-left">
              {/* User details */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#ff3f6c] to-rose-600 text-white font-black flex items-center justify-center text-xs shadow-sm">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} className="h-full w-full object-cover rounded-full" alt="" />
                  ) : (
                    currentUser?.name?.[0]?.toUpperCase() || "C"
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-wide capitalize">
                    {currentUser?.name || "Member"}
                  </p>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                    Posting publicly
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <textarea
                  placeholder="Write a caption... What did you think of the product?"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows="4"
                  className="w-full border-none bg-transparent text-xs md:text-sm outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-550 transition-all duration-200 resize-none leading-relaxed font-semibold focus:outline-none"
                />
              </div>

              {/* Tagging section */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-4">
                
                {/* Search Input Box */}
                <div ref={tagSuggestionsRef} className="space-y-2 relative text-left">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                    Tag a Purchased Product
                  </label>
                  
                  {purchasedProducts.length > 0 ? (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search your purchased items..."
                        value={tagSearchQuery}
                        onChange={(e) => {
                          setTagSearchQuery(e.target.value);
                          setShowTagSuggestions(true);
                        }}
                        onFocus={() => setShowTagSuggestions(true)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
                      />
                      
                      {/* Autocomplete list dropdown */}
                      {showTagSuggestions && tagSearchQuery.trim().length >= 1 && (
                        <div className="absolute bottom-[calc(100%+4px)] md:top-[calc(100%+4px)] md:bottom-auto left-0 right-0 z-50 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg divide-y divide-slate-100 dark:divide-slate-900 scrollbar-thin">
                          {filteredTagProducts.length === 0 ? (
                            <p className="text-[10px] text-slate-400 p-3 italic">No matching purchases found</p>
                          ) : (
                            filteredTagProducts.map(p => (
                              <button
                                key={p._id}
                                type="button"
                                onClick={() => {
                                  setSelectedProduct(p._id);
                                  setTagSearchQuery(p.name);
                                  setShowTagSuggestions(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer border-none bg-transparent"
                              >
                                <div className="h-6.5 w-6.5 shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                  <img 
                                    src={p.images?.[0]?.startsWith("http") ? p.images[0] : `${backendUrl}/${p.images?.[0]}`} 
                                    className="h-full w-full object-contain" 
                                    alt="" 
                                  />
                                </div>
                                <div className="truncate flex-1">
                                  <span className="block truncate text-slate-850 dark:text-slate-150">{p.name}</span>
                                  <span className="block text-[8px] text-slate-400 font-bold">₹{p.price.toLocaleString("en-IN")}</span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-center">
                      <p className="text-xs font-bold text-slate-750 dark:text-slate-250">
                        No purchased items available to tag
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                        You can only tag products you have purchased. Buy some styles to start tagging them in your posts!
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick suggestions from Purchases */}
                {purchasedProducts.length > 0 && (
                  <div className="space-y-1.5 text-left">
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">
                      Quick Suggestions (Your Purchases)
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {purchasedProducts.map(p => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => {
                            setSelectedProduct(p._id);
                            setTagSearchQuery(p.name);
                          }}
                          className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border transition cursor-pointer ${
                            selectedProduct === p._id
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900"
                              : "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-600 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-850"
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected active tag notification helper */}
                {selectedProduct && (
                  <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 select-none animate-pulse">
                    ✨ Product selected. Now tap anywhere on the photo preview to place the tag pin!
                  </p>
                )}

                {/* List of active tag chips */}
                {taggedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                    {taggedProducts.map(t => (
                      <span 
                        key={t.productId} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-wider border border-indigo-100/50 dark:border-indigo-900/30 shadow-2xs"
                      >
                        <span>{t.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeTag(t.productId)}
                          className="text-indigo-600 hover:text-indigo-850 dark:hover:text-indigo-300 border-none bg-transparent cursor-pointer flex items-center justify-center p-0"
                        >
                          <X size={9} className="stroke-[3.5]" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-150 dark:disabled:bg-slate-850 disabled:text-slate-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 border-none cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-white" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Share post</span>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default CreatePostModal;

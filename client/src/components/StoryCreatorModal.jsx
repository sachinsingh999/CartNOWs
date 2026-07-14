import React from "react";
import { Sparkles, Upload, Loader2, Send } from "lucide-react";

const StoryCreatorModal = ({
  isOpen,
  onClose,
  storyMediaFiles,
  storyMediaPreviews,
  storyActiveIndex,
  setStoryActiveIndex,
  removeStoryFile,
  onAddMoreFiles,
  storyTaggedProductId,
  setStoryTaggedProductId,
  storyCaption,
  setStoryCaption,
  storyLocation,
  setStoryLocation,
  storyPrivacy,
  setStoryPrivacy,
  storyUploading,
  storyUploadProgress,
  allProducts,
  onSubmit
}) => {
  React.useEffect(() => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in text-left text-slate-800 dark:text-slate-200">
      <div className="absolute inset-0 -z-10" onClick={onClose} />
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-lg w-full max-w-[460px] overflow-hidden flex flex-col p-6 animate-scale-up max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4.5 border-b border-slate-100 dark:border-slate-800/60 mb-5 shrink-0">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-500" />
            <span>Create New Story</span>
          </h2>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-white transition-all duration-200 border-none bg-transparent cursor-pointer font-black text-xs"
          >
            ✕
          </button>
        </div>

        {/* Modal Body Scroll Area (Strictly Constrained) */}
        <div style={{ maxHeight: "calc(90vh - 170px)" }} className="overflow-y-auto pr-1.5 space-y-5 scrollbar-thin" data-lenis-prevent>
          
          {/* Media Selection / Preview Area */}
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">
              Media Attachments ({storyMediaPreviews.length} selected)
            </label>
            
            {storyMediaPreviews.length > 0 ? (
              <div className="space-y-3">
                {/* Big Active Preview */}
                <div className="relative aspect-[9/16] w-full max-w-[200px] mx-auto rounded-lg overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-md p-1 bg-slate-50 dark:bg-slate-950">
                  {storyMediaFiles[storyActiveIndex]?.type.startsWith("video/") ? (
                    <video src={storyMediaPreviews[storyActiveIndex]} controls className="h-full w-full object-cover rounded-md" />
                  ) : (
                    <img src={storyMediaPreviews[storyActiveIndex]} alt="Preview" className="h-full w-full object-cover rounded-md" />
                  )}
                  <button 
                    type="button"
                    onClick={() => removeStoryFile(storyActiveIndex)}
                    className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center border-none cursor-pointer text-xs font-bold transition duration-150"
                    title="Remove this file"
                  >
                    ✕
                  </button>
                </div>

                {/* Horizontal Thumbnails row */}
                <div className="flex gap-2 items-center overflow-x-auto scrollbar-thin py-1" data-lenis-prevent>
                  {storyMediaPreviews.map((url, index) => {
                    const isVideo = storyMediaFiles[index]?.type.startsWith("video/");
                    return (
                      <div 
                        key={url}
                        onClick={() => setStoryActiveIndex(index)}
                        className={`relative h-14 w-10 shrink-0 rounded-md border-2 overflow-hidden cursor-pointer transition ${
                          storyActiveIndex === index 
                            ? "border-indigo-600 scale-105" 
                            : "border-slate-205 hover:border-slate-300 dark:border-slate-800"
                        }`}
                      >
                        {isVideo ? (
                          <div className="h-full w-full bg-slate-950 flex items-center justify-center text-[7px] text-white">Video</div>
                        ) : (
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStoryFile(index);
                          }}
                          className="absolute top-0.5 right-0.5 h-3.5 w-3.5 bg-black/75 hover:bg-black text-white rounded-full flex items-center justify-center text-[7px] border-none font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  
                  {/* Add more button */}
                  <button
                    type="button"
                    onClick={onAddMoreFiles}
                    className="h-14 w-10 shrink-0 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition cursor-pointer gap-1"
                  >
                    <span className="text-[12px] font-black">+</span>
                    <span className="text-[6px] font-black uppercase">Add</span>
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={onAddMoreFiles}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800/80 hover:border-indigo-500 dark:hover:border-indigo-500/80 rounded-lg p-6.5 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 dark:bg-slate-950/30 transition-all duration-200 group"
              >
                <div className="h-11 w-11 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-all duration-200">
                  <Upload size={18} />
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Upload Photos or Videos</span>
                  <span className="text-[8.5px] text-slate-400 block mt-1 uppercase tracking-wide">Supports JPG, PNG, WEBP, MP4, MOV (Multiple Files)</span>
                </div>
              </div>
            )}
          </div>

          {/* Tag Product Selector */}
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">Tag a Product</label>
            <select
              value={storyTaggedProductId}
              onChange={(e) => setStoryTaggedProductId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 hover:bg-slate-50/80 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-md text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 cursor-pointer appearance-none"
            >
              <option value="">No Product Tagged</option>
              {allProducts.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} (Rs. {p.price?.toLocaleString("en-IN")})
                </option>
              ))}
            </select>
          </div>

          {/* Caption & Location Form Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">Caption</label>
              <input
                type="text"
                placeholder="Enter caption..."
                value={storyCaption}
                onChange={(e) => setStoryCaption(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 hover:bg-slate-50/80 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-md text-xs outline-none focus:border-indigo-500 focus:bg-white placeholder-slate-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">Location</label>
              <input
                type="text"
                placeholder="Enter location..."
                value={storyLocation}
                onChange={(e) => setStoryLocation(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 hover:bg-slate-50/80 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-md text-xs outline-none focus:border-indigo-500 focus:bg-white placeholder-slate-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Story Privacy Option */}
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">Privacy Settings</label>
            <div className="grid grid-cols-3 gap-2.5">
              {["Public", "Friends", "Only Me"].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setStoryPrivacy(mode)}
                  className={`py-2.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer border ${
                    storyPrivacy === mode 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs" 
                      : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800/80"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4.5 mt-5 border-t border-slate-100 dark:border-slate-800/60 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 rounded-md text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={storyUploading || storyMediaFiles.length === 0}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-md text-xs font-black uppercase tracking-widest transition-all duration-200 border-none cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99]"
          >
            {storyUploading ? (
              <>
                <Loader2 size={12} className="animate-spin text-white" />
                <span>Uploading ({storyUploadProgress}%)</span>
              </>
            ) : (
              <>
                <Send size={12} className="text-white" />
                <span>Publish Story</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryCreatorModal;

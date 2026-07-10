import React from "react";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";

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
  purchasedProducts,
  selectedProduct,
  setSelectedProduct
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[32px] w-full max-w-[460px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col p-6 animate-scale-up text-left">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4.5 border-b border-slate-100 dark:border-slate-800/60 mb-5">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Create New Post</h2>
          <button 
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all duration-200 border-none bg-transparent cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Media Upload */}
          {!mediaPreview ? (
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-800/80 hover:border-indigo-500 dark:hover:border-indigo-500/80 rounded-3xl h-56 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 p-6 bg-slate-50/50 dark:bg-slate-950/30 group">
              <ImageIcon size={28} className="text-slate-400 dark:text-slate-600 group-hover:scale-105 transition-all duration-200 mb-2.5 stroke-1.5" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-350">Select Post Photo</span>
              <span className="text-[8.5px] text-slate-400 uppercase tracking-wide mt-1">JPEG or PNG format</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          ) : (
            <div className="space-y-2">
              <div className="relative w-full max-h-[340px] rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group select-none flex items-center justify-center p-1.5">
                <img 
                  ref={imagePreviewRef}
                  src={mediaPreview} 
                  onClick={handleImageClick}
                  alt="" 
                  className="w-full h-auto max-h-[320px] object-contain rounded-2xl cursor-crosshair" 
                />
                
                {taggedProducts.map(t => (
                  <div 
                    key={t.productId}
                    style={{ left: `${t.x}%`, top: `${t.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-indigo-600 border-2 border-white rounded-full flex items-center justify-center text-[7px] text-white font-bold select-none cursor-pointer shadow-sm hover:scale-110 transition duration-150"
                    title={t.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(t.productId);
                    }}
                  >
                    ×
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview("");
                    setTaggedProducts([]);
                  }}
                  className="absolute top-4.5 right-4.5 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition cursor-pointer border-none flex items-center justify-center"
                >
                  <X size={10} />
                </button>
              </div>
              <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-widest text-center select-none">🎯 Tap on photo to pin the selected product tag</p>
            </div>
          )}

          {/* Tag Selection dropdown */}
          {purchasedProducts.length > 0 && (
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">1. Tag a purchase</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 hover:bg-slate-50/80 dark:bg-slate-950 rounded-2xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 focus:bg-white cursor-pointer transition-all duration-200"
              >
                <option value="">-- Choose from your purchases --</option>
                {purchasedProducts.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                ))}
              </select>
            </div>
          )}

          {/* List of active tags */}
          {taggedProducts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {taggedProducts.map(t => (
                <span 
                  key={t.productId} 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-[8.5px] font-black uppercase tracking-widest border border-indigo-100/60 dark:border-indigo-900/30 shadow-2xs"
                >
                  <span>{t.name}</span>
                  <button 
                    type="button" 
                    onClick={() => removeTag(t.productId)}
                    className="text-indigo-600 hover:text-indigo-850 dark:hover:text-indigo-300 border-none bg-transparent cursor-pointer flex items-center justify-center p-0"
                  >
                    <X size={8} className="stroke-[3.5]" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Caption */}
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">2. Review Caption</label>
            <textarea
              placeholder="What did you think of this product? Write your caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="3.5"
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 hover:bg-slate-50/80 dark:bg-slate-950 rounded-2xl text-xs outline-none focus:border-indigo-500 focus:bg-white text-slate-800 dark:text-slate-200 placeholder-slate-500 transition-all duration-200 resize-none leading-relaxed font-medium"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-200 border-none cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Loader2 size={12} className="animate-spin text-white" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>Publish Post</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;

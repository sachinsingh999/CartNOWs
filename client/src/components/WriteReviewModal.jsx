import React, { useState } from "react";
import { Star, X, Upload, Plus, AlertCircle, Shield, Check } from "lucide-react";

const WriteReviewModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  
  // Pros and Cons tags
  const [proInput, setProInput] = useState("");
  const [pros, setPros] = useState([]);
  const [conInput, setConInput] = useState("");
  const [cons, setCons] = useState([]);
  
  // Media uploads states
  const [mediaList, setMediaList] = useState([]);
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAddPro = () => {
    if (proInput.trim() && !pros.includes(proInput.trim())) {
      setPros([...pros, proInput.trim()]);
      setProInput("");
    }
  };

  const handleAddCon = () => {
    if (conInput.trim() && !cons.includes(conInput.trim())) {
      setCons([...cons, conInput.trim()]);
      setConInput("");
    }
  };

  const handleRemovePro = (index) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleRemoveCon = (index) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map((file) => ({
      name: file.name,
      type: file.type.startsWith("video/") ? "video" : "image",
      url: URL.createObjectURL(file),
      file
    }));
    setMediaList([...mediaList, ...newMedia]);
  };

  const handleRemoveMedia = (index) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      setError("Please write a review comment (minimum 10 characters).");
      return;
    }

    // Pass data back to parent
    const success = await onSubmit({
      rating,
      comment,
      pros,
      cons,
      media: mediaList,
      anonymous
    });

    if (success) {
      // Reset state and close modal
      setRating(0);
      setComment("");
      setPros([]);
      setCons([]);
      setMediaList([]);
      setAnonymous(false);
      onClose();
    }
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 5: return "Excellent! Highly recommended.";
      case 4: return "Good! Satisfied with the purchase.";
      case 3: return "Average. Decent product.";
      case 2: return "Poor. Could be much better.";
      case 1: return "Terrible. Disliked it completely.";
      default: return "Select your rating";
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-[fade-in_0.25s_ease-out]">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-[scale-up_0.25s_ease-out] scrollbar-thin">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 text-left">
          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded">
            Share Experience
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-2">
            Write a Customer Review
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your feedback directly guides thousands of other shoppers. Thank you for sharing!
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left">
          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/25 border border-rose-100 dark:border-rose-900/30 p-3 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Stars Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">
              Overall Rating *
            </label>
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 px-3 py-1.5 rounded-2xl"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="h-8 w-8 flex items-center justify-center active:scale-90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  >
                    <Star
                      size={20}
                      className={`transition-all duration-150 origin-center cursor-pointer hover:scale-125 hover:rotate-6 ${ star <= (hoverRating || rating) ? "fill-amber-400 stroke-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" : "stroke-slate-300 dark:stroke-slate-700 fill-transparent hover:stroke-slate-400" }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-500">
                {getRatingLabel(hoverRating || rating)}
              </span>
            </div>
          </div>

          {/* Pros & Cons Tag Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pros */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Pros (What did you love?)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={proInput}
                  onChange={(e) => setProInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPro())}
                  placeholder="e.g., Fast delivery, Premium feel"
                  className="flex-1 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs bg-transparent outline-none dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddPro}
                  className="h-9 w-9 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {pros.map((pro, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400"
                  >
                    <span>{pro}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePro(idx)}
                      className="hover:text-emerald-900 dark:hover:text-emerald-200"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Cons */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                Cons (Any improvements?)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={conInput}
                  onChange={(e) => setConInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCon())}
                  placeholder="e.g., Short cable, Heavy"
                  className="flex-1 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs bg-transparent outline-none dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddCon}
                  className="h-9 w-9 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {cons.map((con, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400"
                  >
                    <span>{con}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCon(idx)}
                      className="hover:text-rose-900 dark:hover:text-rose-200"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Review Text Area */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">
              Detailed Comments *
            </label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the design, fit, delivery speed, or performance. How are you using this product?"
              className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm resize-none outline-none transition duration-200 dark: dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Min 10 characters</span>
              <span>{comment.length} chars</span>
            </div>
          </div>

          {/* Media Attachments Dropzone */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">
              Attach Photos or Videos
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Fake Dropzone wrapper */}
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/70 dark:hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/20 dark:bg-slate-950/20 select-none">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload size={18} className="text-slate-400 dark:text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 mt-1 uppercase tracking-wider">Upload Files</span>
                <span className="text-[8.5px] text-slate-400 dark:text-slate-500 mt-0.5">Images and short videos</span>
              </label>

              {/* Uploaded Files previews */}
              <div className="flex flex-wrap gap-2 content-start border border-slate-100 dark:border-slate-800/80 rounded-2xl p-2.5 bg-slate-50/10 dark:bg-slate-950/10 min-h-[90px]">
                {mediaList.length > 0 ? (
                  mediaList.map((media, index) => (
                    <div key={index} className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group">
                      {media.type === "image" ? (
                        <img src={media.url} alt="upload" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-100 dark:text-white text-[8px] font-black uppercase">
                          Video
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute -top-1 -right-1 bg-rose-600 text-slate-100 dark:text-white rounded-full p-0.5 shadow hover:scale-110 transition cursor-pointer"
                      >
                        <X size={8} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 m-auto">No files attached</p>
                )}
              </div>
            </div>
          </div>

          {/* Anonymous toggle & Submit buttons */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="rounded text-indigo-600 border-slate-300 h-4.5 w-4.5 dark:bg-slate-950 dark:border-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Post Anonymously</span>
                <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block">Your real name won't show</span>
              </div>
            </label>

            <div className="flex gap-2.5 shrink-0 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-50 text-slate-100 dark:text-white text-xs font-black uppercase tracking-wider rounded-xl transition active:scale-95 flex items-center gap-1.5 shadow cursor-pointer"
              >
                {loading ? "Posting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </form>

        {/* trust indicator banner at the bottom */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 flex items-center gap-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <Shield size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-snug">
            We employ automated security filters to identify and prevent spam, fraud, or commercial review uploads.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewModal;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Trash2, Download, Calendar, Sparkles, Tag, Eye, ArrowRight } from "lucide-react";

const TryOnHistory = ({ token, onSelectLook }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    axios.get(`${backendUrl}/api/tryon/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      if (res.data.success) {
        setHistory(res.data.history || []);
      }
    })
    .catch((err) => console.log("Failed to fetch history:", err))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this look?")) return;

    axios.delete(`${backendUrl}/api/tryon/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      if (res.data.success) {
        toast.success("Look deleted");
        setHistory(prev => prev.filter(item => item._id !== id));
      }
    })
    .catch((err) => toast.error(err.message));
  };

  const downloadImage = (url, name, e) => {
    e.stopPropagation();
    toast.info("Preparing download...");
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobURL = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobURL;
        a.download = `tryon-${name || "look"}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobURL);
      })
      .catch(() => toast.error("Download failed. Direct image link copy."));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
    } catch (e) {
      return "Recently";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-orange-500 animate-spin" />
          <Sparkles className="absolute text-orange-500 animate-pulse" size={14} />
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Loading fitting history...
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/10 backdrop-blur-md p-8 text-center max-w-xl mx-auto space-y-6 shadow-sm">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
          <Sparkles size={20} className="animate-pulse" />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Your Dressing Room is Empty
          </h3>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm mx-auto">
            Ready to design your first custom fit? Explore our premium selection above, upload a picture, and watch the AI seamlessly map garments to your pose.
          </p>
        </div>

        <button 
          onClick={() => document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-650 hover:bg-slate-850 text-[10px] font-black text-white uppercase tracking-wider transition active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
        >
          <span>Browse the Catalog</span>
          <ArrowRight size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5 text-left">
      {history.map((item) => (
        <div 
          key={item._id}
          onClick={() => onSelectLook(item)}
          className="break-inside-avoid relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-2 cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          {/* Output Visual Frame */}
          <div className="relative rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/60 aspect-[3/4]">
            <img 
              src={item.generatedImage || item.uploadedImage} 
              alt={item.productId?.name || "Garment fitting"} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Status indicators */}
            {item.status !== "completed" ? (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 rounded-full border-[1.5px] border-white/20 border-t-white animate-spin" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">
                  {item.status || "processing"}
                </span>
              </div>
            ) : (
              /* Hover Overlay tools */
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                <div className="flex justify-end">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-[8.5px] font-black uppercase text-white tracking-wider">
                    <Sparkles size={9} className="text-orange-400" />
                    <span>AI Look</span>
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-white/90">
                    <Eye size={11} />
                    <span>Click to view</span>
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {item.generatedImage && (
                      <button 
                        onClick={(e) => downloadImage(item.generatedImage, item.productId?.name, e)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 border border-white/25 text-white transition-all active:scale-90"
                        title="Download look"
                      >
                        <Download size={12} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => handleDelete(item._id, e)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/25 text-red-200 hover:text-white transition-all active:scale-90"
                      title="Delete look"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Details footer */}
          <div className="mt-2.5 px-1 pb-1 space-y-1">
            <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate capitalize">
              {item.productId?.name || "Product Deleted"}
            </h4>
            <div className="flex items-center justify-between text-[9.5px] text-slate-450 dark:text-slate-500 font-bold border-t border-slate-100 dark:border-slate-850/60 pt-1.5 mt-1.5">
              <span className="inline-flex items-center gap-1">
                <Tag size={10} className="text-indigo-500" />
                <span>Size: {item.selectedSize || "Default"}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={10} />
                <span>{formatDate(item.createdAt)}</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TryOnHistory;

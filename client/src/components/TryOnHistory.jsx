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
    axios
      .get(`${backendUrl}/api/tryon/history`, {
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

    axios
      .delete(`${backendUrl}/api/tryon/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        if (res.data.success) {
          toast.success("Look deleted");
          setHistory((prev) => prev.filter((item) => item._id !== id));
        }
      })
      .catch((err) => toast.error(err.message));
  };

  const downloadImage = (url, name, e) => {
    e.stopPropagation();
    toast.info("Preparing download...");
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobURL = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobURL;
        a.download = `tryon-${name || "look"}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobURL);
      })
      .catch(() => toast.error("Download failed."));
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
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-orange-500 animate-spin" />
          <Sparkles className="absolute text-orange-500 animate-pulse" size={12} />
        </div>
        <p className="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Loading fitting history...
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-dashed border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/10 p-6 text-center max-w-lg mx-auto space-y-3 shadow-2xs">
        <div className="mx-auto w-10 h-10 rounded-md bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
          <Sparkles size={18} className="animate-pulse" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Your Dressing Room is Empty
          </h3>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm mx-auto">
            Explore our fashion selection above, upload a picture, and watch the AI seamlessly drape garments on you.
          </p>
        </div>

        <button
          onClick={() => document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" })}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 text-[9.5px] font-black text-white uppercase tracking-wider transition active:scale-95 cursor-pointer"
        >
          <span>Browse the Catalog</span>
          <ArrowRight size={11} />
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 text-left">
      {history.map((item) => (
        <div
          key={item._id}
          onClick={() => onSelectLook(item)}
          className="relative overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-2 cursor-pointer group shadow-2xs hover:border-orange-500/40 transition-all duration-200"
        >
          {/* Output Visual Frame */}
          <div className="relative rounded-md overflow-hidden bg-slate-50 dark:bg-slate-950/60 aspect-[3/4]">
            <img
              src={item.generatedImage || item.uploadedImage}
              alt={item.productId?.name || "Garment fitting"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
            />

            {/* Status indicators */}
            {item.status !== "completed" ? (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5">
                <div className="w-5 h-5 rounded-full border-[1.5px] border-white/20 border-t-white animate-spin" />
                <span className="text-[8.5px] font-black text-white uppercase tracking-widest">
                  {item.status || "processing"}
                </span>
              </div>
            ) : (
              /* Hover Overlay tools */
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
                <div className="flex justify-end">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 backdrop-blur-md border border-white/20 text-[8px] font-black uppercase text-white tracking-wider">
                    <Sparkles size={8} className="text-orange-400" />
                    <span>AI Look</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[8.5px] font-black text-white/90">
                    <Eye size={10} />
                    <span>View</span>
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {item.generatedImage && (
                      <button
                        onClick={(e) => downloadImage(item.generatedImage, item.productId?.name, e)}
                        className="p-1 rounded bg-white/15 hover:bg-white/30 text-white transition-all active:scale-90"
                        title="Download look"
                      >
                        <Download size={11} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(item._id, e)}
                      className="p-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-white transition-all active:scale-90"
                      title="Delete look"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Details footer */}
          <div className="mt-2 px-0.5 space-y-1">
            <h4 className="text-[10.5px] font-black text-slate-800 dark:text-slate-200 truncate capitalize">
              {item.productId?.name || "Product Deleted"}
            </h4>
            <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold border-t border-slate-100 dark:border-slate-800/60 pt-1 mt-1">
              <span className="inline-flex items-center gap-0.5">
                <Tag size={9} className="text-indigo-500" />
                <span>Size: {item.selectedSize || "Default"}</span>
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Calendar size={9} />
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

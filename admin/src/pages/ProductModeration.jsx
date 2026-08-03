import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  Box, Check, X, ShieldAlert, AlertTriangle, MessageSquare, Trash2, RefreshCw, Search, CheckCircle2, Clock, EyeOff, AlertOctagon, Star
} from "lucide-react";

const ProductModeration = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchProducts = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/products`, { headers: { token } });
      if (data.success) {
        setProducts(data.products);
      }
    } catch {
      toast.error("Failed to load products listing");
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const fetchImages = async () => {
        setImagesLoading(true);
        try {
          const { data } = await axios.get(`${backendUrl}/api/admin/product/${selectedProduct._id}/images`, { headers: { token } });
          if (data.success) {
            setProductImages(data.images);
          }
        } catch {
          setProductImages([]);
        } finally {
          setImagesLoading(false);
        }
      };
      fetchImages();
    } else {
      setProductImages([]);
    }
  }, [selectedProduct, token]);

  const handleImageDelete = async (imageId) => {
    if (!window.confirm("Are you sure you want to remove this image?")) return;
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/images/moderate`, { imageId, action: "delete" }, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        setProductImages(prev => prev.filter(img => img._id !== imageId));
        fetchProducts();
      }
    } catch {
      toast.error("Failed to moderate/delete image");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/product/status`, { id, status }, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        fetchProducts();
        if (selectedProduct?._id === id) {
          setSelectedProduct({ ...selectedProduct, status });
        }
      }
    } catch {
      toast.error("Failed to update product status");
    }
  };

  const handleFlagFake = async (id, isFake) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/product/fake`, { id, isFake }, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        fetchProducts();
        if (selectedProduct?._id === id) {
          setSelectedProduct({ ...selectedProduct, isFake, status: isFake ? "disabled" : "approved" });
        }
      }
    } catch {
      toast.error("Failed to flag/unflag product listing");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Remove this customer review?")) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/review/delete`,
        { productId: selectedProduct._id, reviewId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setSelectedProduct({
          ...selectedProduct,
          reviews: selectedProduct.reviews.filter((r) => r._id !== reviewId),
        });
        fetchProducts();
      }
    } catch {
      toast.error("Failed to delete review");
    }
  };

  // Filter products reactively
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Status filter
      if (statusFilter === "approved" && p.status !== "approved") return false;
      if (statusFilter === "pending" && p.status !== "pending") return false;
      if (statusFilter === "disabled" && p.status !== "disabled") return false;
      if (statusFilter === "fake" && !p.isFake) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const inName = p.name?.toLowerCase().includes(q);
        const inShop = p.sellerId?.shopName?.toLowerCase().includes(q);
        const inCat = p.category?.toLowerCase().includes(q);
        const inId = p._id?.toLowerCase().includes(q);
        return inName || inShop || inCat || inId;
      }

      return true;
    });
  }, [products, statusFilter, searchQuery]);

  // Derived statistics
  const totalCount = products.length;
  const approvedCount = products.filter(p => p.status === "approved").length;
  const pendingCount = products.filter(p => p.status === "pending").length;
  const fakeCount = products.filter(p => p.isFake).length;

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Stats & Search Bar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500/10 text-white dark:text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/10 shadow-xs shrink-0">
              <Box size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Merchandise & Product Moderation</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Moderate catalog listings, flag counterfeit items, and moderate reviews</p>
            </div>
          </div>

          <button
            onClick={fetchProducts}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin text-blue-500" : ""} />
            <span>Refresh Catalog</span>
          </button>
        </div>

        {/* Middle: Product Moderation Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: "all", label: "Total Catalog", val: totalCount, sub: "Merchandise items", icon: Box, color: "text-blue-500 bg-blue-500/10" },
            { key: "approved", label: "Approved Items", val: approvedCount, sub: "Live on storefront", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
            { key: "pending", label: "Pending Review", val: pendingCount, sub: "Requires approval", icon: Clock, color: "text-amber-500 bg-amber-500/10" },
            { key: "fake", label: "Flagged Counterfeit", val: fakeCount, sub: "Security flagged", icon: ShieldAlert, color: "text-rose-500 bg-rose-500/10" }
          ].map(card => {
            const isSelected = statusFilter === card.key;
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                onClick={() => setStatusFilter(card.key)}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group relative overflow-hidden ${ isSelected ? "bg-slate-950 border-slate-950 text-slate-100 dark:text-white dark:bg-blue-600 dark:border-blue-500 shadow-xs" : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80" }`}
              >
                <div className="space-y-1 relative z-10 text-left">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${ isSelected ? "text-slate-300 dark:text-blue-100" : "text-slate-400 dark:text-slate-500" }`}>
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black tracking-tight">{card.val}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider block ${ isSelected ? "text-slate-300 dark:text-blue-200" : "text-slate-400 dark:text-slate-500" }`}>
                    {card.sub}
                  </span>
                </div>
                <div className={`p-2 rounded-lg border ${card.color} border-slate-200/50 dark:border-slate-800 transition-transform duration-200 group-hover:scale-105 relative z-10`}>
                  <Icon size={14} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom: Filter Pills & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: "all", label: "All Items" },
              { id: "approved", label: "Approved" },
              { id: "pending", label: "Pending" },
              { id: "disabled", label: "Disabled" },
              { id: "fake", label: "Flagged Fake" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  statusFilter === tab.id 
                    ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs" 
                    : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input Box */}
          <div className="relative flex items-center w-full sm:w-80 shrink-0">
            <Search size={13} className="absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search product name, shop, category, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

      </div>

      {/* Main Product Directory & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Merchandise Directory */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col space-y-3 min-h-[450px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Box size={14} className="text-blue-500" />
              <span>Catalog Directory</span>
            </h2>
            <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-950 px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
              {filteredProducts.length} Listings Filtered
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
              <Box size={28} className="text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">No matching product listings found.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredProducts.map((prod) => (
                <div
                  key={prod._id}
                  onClick={() => setSelectedProduct(prod)}
                  className={`p-3 rounded-xl flex items-center justify-between gap-4 border transition-all duration-200 cursor-pointer ${ selectedProduct?._id === prod._id ? "bg-slate-950 text-white dark:bg-blue-600 dark:border-blue-500 shadow-xs" : "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700" }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {prod.images && prod.images.length > 0 && prod.images[0] ? (
                      <img
                        src={prod.images[0].startsWith('http') ? prod.images[0] : `${backendUrl}/${prod.images[0]}`}
                        alt={prod.name}
                        className="h-10 w-10 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                        <Box size={16} className="text-slate-400" />
                      </div>
                    )}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-black text-xs truncate max-w-[200px] ${selectedProduct?._id === prod._id ? "text-white" : "text-slate-900 dark:text-white"}`}>{prod.name}</span>
                        {prod.isFake && (
                          <span className="px-1.5 py-0.5 text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black uppercase tracking-wider rounded-md">
                            Fake
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border ${ prod.status === "approved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : prod.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" }`}>
                          {prod.status}
                        </span>
                      </div>
                      <p className={`text-[10px] font-medium truncate ${selectedProduct?._id === prod._id ? "text-slate-300 dark:text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>Shop: {prod.sellerId?.shopName || "Platform"} · Stock: {prod.stock}</p>
                    </div>
                  </div>

                  <span className={`text-xs font-black shrink-0 ${selectedProduct?._id === prod._id ? "text-white" : "text-slate-900 dark:text-white"}`}>₹{parseFloat(prod.price || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Product Inspector Drawer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
          {selectedProduct ? (
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
              {/* Header details */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 space-y-2">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Product Inspector</span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">{selectedProduct.description}</p>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Gallery & Media</span>
                  {imagesLoading ? (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">Loading gallery...</p>
                  ) : productImages.length === 0 ? (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No media loaded.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {productImages.map((img) => (
                        <div key={img._id} className="relative group border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden p-0.5 bg-slate-50 dark:bg-slate-950">
                          <img src={img.imageUrl} alt="" className="h-12 w-full object-cover rounded" />
                          {img.isCover && (
                            <span className="absolute top-1 left-1 px-1 py-0.2 text-[7px] bg-blue-600 text-white font-bold rounded">Cover</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleImageDelete(img._id)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded hover:bg-rose-700 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            title="Delete Image"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Moderation Controls */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Moderation Status</span>
                <div className="flex gap-2 flex-wrap">
                  {selectedProduct.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedProduct._id, "approved")}
                        className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase tracking-wider font-black transition shadow-xs cursor-pointer active:scale-95"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedProduct._id, "rejected")}
                        className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] uppercase tracking-wider font-black transition shadow-xs cursor-pointer active:scale-95"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedProduct.status === "approved" && (
                    <button
                      onClick={() => handleStatusChange(selectedProduct._id, "disabled")}
                      className="w-full py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider font-black transition cursor-pointer active:scale-95"
                    >
                      Disable Listing
                    </button>
                  )}
                  {selectedProduct.status === "disabled" && (
                    <button
                      onClick={() => handleStatusChange(selectedProduct._id, "approved")}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase tracking-wider font-black transition shadow-xs cursor-pointer active:scale-95"
                    >
                      Enable Listing
                    </button>
                  )}
                </div>
              </div>

              {/* Security Flag */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Security Flag</span>
                <button
                  onClick={() => handleFlagFake(selectedProduct._id, !selectedProduct.isFake)}
                  className={`w-full py-2 rounded-lg border text-[10px] uppercase tracking-wider font-black transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${ selectedProduct.isFake ? "border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40" : "border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40" }`}
                >
                  <ShieldAlert size={14} />
                  <span>{selectedProduct.isFake ? "Clear Fake Flag" : "Flag as Counterfeit"}</span>
                </button>
              </div>

              {/* Reviews moderation */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <MessageSquare size={12} className="text-blue-500" />
                  <span>Customer Reviews ({selectedProduct.reviews?.length || 0})</span>
                </div>

                {(!selectedProduct.reviews || selectedProduct.reviews.length === 0) ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">No reviews submitted.</p>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedProduct.reviews.map((rev) => (
                      <div key={rev._id} className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 text-xs space-y-1 relative bg-slate-50/50 dark:bg-slate-950/40">
                        <div className="flex justify-between items-center pr-6">
                          <span className="font-bold text-slate-900 dark:text-white">{rev.name}</span>
                          <span className="text-amber-500 font-black flex items-center gap-0.5 text-[11px]"><Star size={10} fill="currentColor" />{rev.rating}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">{rev.comment}</p>
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 transition cursor-pointer p-0.5"
                          title="Delete Review"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
              <Box className="text-slate-400 dark:text-slate-600" size={28} />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Product Selected</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center max-w-[200px]">Click any item in the catalog directory to moderate status, images & reviews.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModeration;

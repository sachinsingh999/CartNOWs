import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Box, Check, X, ShieldAlert, AlertTriangle, MessageSquare, Trash2 } from "lucide-react";

const ProductModeration = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/products`, { headers: { token } });
      if (data.success) {
        setProducts(data.products);
      }
    } catch {
      toast.error("Failed to load products listing");
    }
    setLoading(false);
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
        }
        setImagesLoading(false);
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

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-lg flex items-center justify-center">
          <Box size={16} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Product Moderation</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Moderate merchant listings, flag fake inventory, and filter customer reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Products List Directory */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4.5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Merchandise Directory</h2>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold animate-pulse">Loading catalog listings...</div>
          ) : products.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-6 text-center">No products found in catalog.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {products.map((prod) => (
                <div
                  key={prod._id}
                  onClick={() => setSelectedProduct(prod)}
                  className={`py-3 px-3 -mx-3 rounded-lg flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition ${ selectedProduct?._id === prod._id ? "bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.04]" : "" }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {prod.images && prod.images.length > 0 && (
                      <img src={prod.images[0]} alt="" className="h-9 w-9 object-cover rounded-lg border border-slate-200/60 dark:border-white/[0.08]" />
                    )}
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{prod.name}</span>
                        {prod.isFake && (
                          <span className="px-1.5 py-0.5 text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold uppercase tracking-wider rounded">
                            Fake Listing
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border ${ prod.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : prod.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20" }`}>
                          {prod.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Shop: {prod.sellerId?.shopName || "Platform"} · Stock: {prod.stock}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0">₹{prod.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Panel for Selected Product (Sticky on Large viewports) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4.5 shadow-xs space-y-4 lg:sticky lg:top-[20px] self-start">
          {selectedProduct ? (
            <>
              {/* Product Header details */}
              <div className="border-b border-slate-100 dark:border-white/[0.06] pb-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Product Info</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">{selectedProduct.description}</p>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Gallery & Media</span>
                  {imagesLoading ? (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">Loading gallery...</p>
                  ) : productImages.length === 0 ? (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No media loaded.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {productImages.map((img) => (
                        <div key={img._id} className="relative group border border-slate-200/60 dark:border-white/[0.08] rounded-lg overflow-hidden p-0.5 bg-slate-50 dark:bg-slate-900">
                          <img src={img.imageUrl} alt="" className="h-12 w-full object-cover rounded" />
                          {img.isCover && (
                            <span className="absolute top-1 left-1 px-1 py-0.2 text-[7px] bg-blue-600 text-slate-100 dark:text-white font-bold rounded">Cover</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleImageDelete(img._id)}
                            className="absolute top-1 right-1 p-0.5 bg-rose-500 text-slate-100 dark:text-white rounded hover:bg-rose-600 opacity-0 group-hover:opacity-100 transition cursor-pointer"
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

              {/* Status and moderation buttons */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Moderation Status</span>
                <div className="flex gap-2 flex-wrap">
                  {selectedProduct.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedProduct._id, "approved")}
                        className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-100 dark:text-white text-xs font-bold transition cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedProduct._id, "rejected")}
                        className="flex-1 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-slate-100 dark:text-white text-xs font-bold transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedProduct.status === "approved" && (
                    <button
                      onClick={() => handleStatusChange(selectedProduct._id, "disabled")}
                      className="w-full py-2 rounded-lg border border-slate-300 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      Disable Listing
                    </button>
                  )}
                  {selectedProduct.status === "disabled" && (
                    <button
                      onClick={() => handleStatusChange(selectedProduct._id, "approved")}
                      className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-100 dark:text-white text-xs font-bold transition cursor-pointer"
                    >
                      Enable Listing
                    </button>
                  )}
                </div>
              </div>

              {/* Flag as fake/prohibited */}
              <div className="border-t border-slate-200 dark:border-white/[0.06] pt-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Security Flag</span>
                <button
                  onClick={() => handleFlagFake(selectedProduct._id, !selectedProduct.isFake)}
                  className={`w-full py-2 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${ selectedProduct.isFake ? "border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-500" : "border-rose-500/20 hover:bg-rose-500/10 text-rose-500" }`}
                >
                  <ShieldAlert size={14} />
                  <span>{selectedProduct.isFake ? "Clear Fake Flag" : "Flag as Fake"}</span>
                </button>
              </div>

              {/* Reviews moderation */}
              <div className="border-t border-slate-200 dark:border-white/[0.06] pt-3 space-y-2.5">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <MessageSquare size={12} />
                  <span>Reviews ({selectedProduct.reviews?.length || 0})</span>
                </div>

                {(!selectedProduct.reviews || selectedProduct.reviews.length === 0) ? (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No reviews submitted.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedProduct.reviews.map((rev) => (
                      <div key={rev._id} className="border border-slate-200 dark:border-white/[0.06] rounded-lg p-2.5 text-xs space-y-1 relative bg-slate-50/50 dark:bg-slate-900/40">
                        <div className="flex justify-between items-center pr-6">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{rev.name}</span>
                          <span className="text-amber-500 font-bold">{rev.rating}★</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">{rev.comment}</p>
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
              <AlertTriangle className="mx-auto text-slate-300 dark:text-slate-600" size={28} />
              <p className="text-xs font-bold text-slate-500">No Product Selected</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Click any product listing from the directory to moderate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModeration;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import {
  Flame,
  Upload,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Pencil,
  X,
  Calendar,
  Search,
  Star,
  Eye
} from "lucide-react";

const DealOfTheDay = ({ token }) => {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Search & Select Product
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productId, setProductId] = useState("");

  // Campaign Fields
  const [title, setTitle] = useState(""); // Promotional Heading
  const [subtitle, setSubtitle] = useState(""); // Promotional Description
  const [discountLabel, setDiscountLabel] = useState(""); // Discount Badge
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [isActive, setIsActive] = useState(true);

  // Model image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleRemoveBg = async () => {
    if (!imageFile) return toast.warning("Please upload an image first");
    setProcessing(true);
    toast.info("Applying remove.bg background removal... 🪄");
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

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
        const responseBlob = await fetch(transparentUrl);
        const blob = await responseBlob.blob();
        setImageFile(new File([blob], `deal_of_the_day_no_bg.png`, { type: "image/png" }));

        const localUrl = URL.createObjectURL(blob);
        setImagePreview(localUrl);
        toast.success("Background removed successfully!");
      } else {
        toast.error(response.data.message || "Failed to remove background");
      }
    } catch (err) {
      console.error("Background cleaning error:", err);
      toast.error("Failed to run background removal.");
    } finally {
      setProcessing(false);
    }
  };

  const [editingDeal, setEditingDeal] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewingDeal, setPreviewingDeal] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products list");
    }
  };

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/admin/dealofday?admin=true`, { headers: { token } });
      if (response.data.success) {
        setDeals(response.data.deals || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Fetch deals error:", error);
      toast.error(error.response?.data?.message || "Failed to load deals of the day");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDeals();
  }, []);

  const getDealImageUrl = (deal) => {
    if (!deal) return "";
    const img = deal.modelImage || "";
    if (!img) return "";
    if (img.startsWith("http")) return img;
    const path = img.startsWith("/") ? img : `/${img}`;
    return `${backendUrl}${path}`;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!productId) return toast.warning("Please select a catalog product");
    if (!title.trim()) return toast.warning("Promotional heading is required");
    if (!startDate) return toast.warning("Start Date is required");
    if (!endDate) return toast.warning("End Date is required");
    if (!imageFile && !editingDeal) return toast.warning("Please upload a model image");

    setUploading(true);
    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("discountLabel", discountLabel);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("isActive", isActive);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      let url = `${backendUrl}/api/admin/dealofday`;
      let method = "post";
      if (editingDeal) {
        url = `${backendUrl}/api/admin/dealofday/${editingDeal._id}`;
        method = "put";
      }

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
        toast.success(editingDeal ? "Deal of the Day updated!" : "Deal of the Day published!");
        cancelEdit();
        fetchDeals();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting deal:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (deal) => {
    setEditingDeal(deal);

    // Bind product
    const boundProductId = deal.productId?._id || deal.productId || "";
    setProductId(boundProductId);
    const prod = products.find(p => p._id === boundProductId);
    setSelectedProduct(prod || null);
    setSearchProductQuery(prod ? prod.name : "");

    setTitle(deal.title);
    setSubtitle(deal.subtitle || "");
    setDiscountLabel(deal.discountLabel || "");

    // Dates
    if (deal.startDate) {
      setStartDate(new Date(deal.startDate).toISOString().split("T")[0]);
    }
    if (deal.endDate) {
      setEndDate(new Date(deal.endDate).toISOString().split("T")[0]);
    }

    setIsActive(deal.isActive);
    setImagePreview(getDealImageUrl(deal));
    setImageFile(null);
  };

  const cancelEdit = () => {
    setEditingDeal(null);
    setProductId("");
    setSelectedProduct(null);
    setSearchProductQuery("");
    setTitle("");
    setSubtitle("");
    setDiscountLabel("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setIsActive(true);
    setImagePreview("");
    setImageFile(null);
  };

  const handleDeleteDeal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Deal of the Day?")) return;
    try {
      const response = await axios.delete(`${backendUrl}/api/admin/dealofday/${id}`, { headers: { token } });
      if (response.data.success) {
        toast.success("Deal of the Day removed successfully");
        fetchDeals();
        if (editingDeal?._id === id) {
          cancelEdit();
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Delete deal error:", error);
      toast.error(error.response?.data?.message || "Failed to delete Deal of the Day");
    }
  };

  const openPreview = (deal) => {
    setPreviewingDeal(deal);
    setShowPreviewModal(true);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500 fill-orange-500" size={24} />
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Deal of the Day Campaign
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Configure a dedicated high-conversion promotional banner, accessible via storefront Hero slider action.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        {/* Form Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingDeal ? "Edit Campaign" : "New Daily Campaign"}
              </h3>
            </div>
            {editingDeal && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-none bg-transparent cursor-pointer flex items-center justify-center"
                title="Cancel Edit"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">

            {/* Step 1: Select Product */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Step 1: Select Catalog Product *
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={14} />
                </div>
                <input
                  type="text"
                  value={searchProductQuery}
                  onChange={(e) => {
                    setSearchProductQuery(e.target.value);
                    if (selectedProduct && e.target.value !== selectedProduct.name) {
                      setSelectedProduct(null);
                      setProductId("");
                    }
                  }}
                  placeholder="Search catalog products..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition dark: font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />

                {searchProductQuery && !selectedProduct && (
                  <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/[0.1] rounded-xl z-30 shadow-lg divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {products
                      .filter(p =>
                        p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
                        (p.brand || "").toLowerCase().includes(searchProductQuery.toLowerCase())
                      )
                      .slice(0, 10)
                      .map(p => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => {
                            setSelectedProduct(p);
                            setProductId(p._id);
                            setSearchProductQuery(p.name);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-900 dark:text-white flex items-center gap-2 border-none bg-transparent cursor-pointer font-bold transition"
                        >
                          <img
                            src={p.images?.[0]?.startsWith("http") ? p.images[0] : `${backendUrl}/${p.images?.[0]}`}
                            alt=""
                            className="w-8 h-8 object-contain bg-white dark:bg-slate-900 rounded border border-slate-200/50"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-slate-800 dark:text-slate-200">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">₹{p.price} | {p.brand || "Generic"}</p>
                          </div>
                        </button>
                      ))
                    }
                    {products.filter(p =>
                      p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
                      (p.brand || "").toLowerCase().includes(searchProductQuery.toLowerCase())
                    ).length === 0 && (
                        <p className="p-3 text-[10px] text-slate-400 font-bold text-center">No products found</p>
                      )}
                  </div>
                )}
              </div>

              {/* Selected Product Details */}
              {selectedProduct && (
                <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] flex items-center gap-3 animate-fade-in">
                  <img
                    src={selectedProduct.images?.[0]?.startsWith("http") ? selectedProduct.images[0] : `${backendUrl}/${selectedProduct.images?.[0]}`}
                    alt={selectedProduct.name}
                    className="w-12 h-12 object-contain bg-white dark:bg-slate-900 rounded border border-slate-200/60 p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedProduct.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{selectedProduct.category}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">{selectedProduct.brand}</span>
                    </div>
                    <p className="text-xs font-black text-orange-500 mt-1">₹{selectedProduct.price}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Upload Model Image */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Step 2: Upload Model Photo *
              </label>

              {imagePreview ? (
                <div className="space-y-2">
                  <div className="relative group rounded-xl border border-dashed border-slate-300 dark:border-white/[0.1] overflow-hidden flex flex-col items-center justify-center p-2 min-h-[160px] bg-slate-900/20">
                    <img
                      src={imagePreview}
                      alt="Model Preview"
                      className="relative z-10 max-h-[140px] max-w-full object-contain animate-fade-in"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="absolute top-2 right-2 z-20 bg-rose-500 hover:bg-rose-600 text-slate-100 dark:text-white rounded-full p-1.5 shadow-md transition-all active:scale-95 border-none cursor-pointer flex items-center justify-center"
                      title="Remove Image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleRemoveBg}
                    className="w-full py-1.5 rounded-lg border border-orange-500/30 dark:border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/15 text-orange-500 disabled:opacity-50 text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {processing ? (
                      <>
                        <span className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        <span>Removing Background...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} />
                        <span>Remove Background</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-white/[0.08] hover:border-orange-500 dark:hover:border-orange-500/80 rounded-xl cursor-pointer py-8 px-4 text-center bg-slate-50 dark:bg-slate-900/50 transition duration-200 min-h-[140px]">
                    <Upload size={24} className="text-slate-400 dark:text-slate-500" />
                    <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">Click to upload model photo</span>
                    <span className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-500 max-w-[200px]">Transparent PNG preferred. Large editorial commercial photo.</span>
                    <input
                      type="file"
                      accept="image/png, image/webp, image/jpeg, image/jpg"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Campaign Promotional Content */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Step 3: Promotional Content
              </label>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">Promotional Heading *</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unleash Next-Gen Power"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none dark: font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-500">Promotional Description</span>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Brief high-conversion description copy..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none dark: font-bold resize-none leading-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-500">Discount Badge Label</span>
                <input
                  type="text"
                  value={discountLabel}
                  onChange={(e) => setDiscountLabel(e.target.value)}
                  placeholder="e.g. Save 40% or Limited Deal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none dark: font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>
            </div>

            {/* Deal Date */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider block">Campaign Date *</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setEndDate(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none dark: font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              />
            </div>

            {/* Campaign Options */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Campaign Active Status
              </span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-slate-300 dark:border-white/[0.08] rounded accent-orange-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
                <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">Active Campaign</span>
              </label>
            </div>

            {/* Submit Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={uploading || processing}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-100 dark:text-white font-extrabold text-xs uppercase tracking-widest cursor-pointer shadow-md transition-all active:scale-98 border-none flex items-center justify-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/10 dark:border-slate-800 border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>{editingDeal ? "Save Deal" : "Publish Deal"}</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* List Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06] mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Campaign Logs & Scheduler
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 px-3.5 py-1">
              {deals.length} Campaigns
            </span>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-xs text-slate-400 animate-pulse">
              <span className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-bold">Fetching deals database...</span>
            </div>
          ) : deals.length === 0 ? (
            <div className="flex-1 border border-dashed border-slate-200 dark:border-white/[0.06] rounded-xl flex flex-col items-center justify-center text-center p-12 text-xs text-slate-400">
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900/80 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-800 mb-3">
                <Flame size={18} />
              </div>
              <p className="font-black text-slate-800 dark:text-slate-200">No Deal of the Day Campaigns</p>
              <p className="max-w-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-normal font-medium">
                Bind a catalog product and upload model photography to configure high-conversion daily deals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 text-left">
              {deals.map((deal) => {
                const productObj = deal.productId || {};
                const isCurrent = new Date(deal.startDate) <= new Date() && new Date(deal.endDate) >= new Date();
                const isActuallyActive = deal.isActive && isCurrent;

                return (
                  <div
                    key={deal._id}
                    className="group bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/[0.04] rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition duration-200 flex flex-col shadow-xs"
                  >
                    {/* Image preview box */}
                    <div className="relative h-[180px] flex items-center justify-center overflow-hidden shrink-0 border-b border-slate-100 dark:border-white/[0.05] bg-gradient-to-r from-slate-900 to-indigo-950">
                      <div className="absolute left-4 top-4 text-slate-100 dark:text-white z-0 max-w-[50%] space-y-1">
                        {deal.discountLabel && (
                          <span className="text-[7px] bg-white/20 backdrop-blur-xs px-1.5 py-0.5 rounded-full font-black block w-fit">
                            {deal.discountLabel}
                          </span>
                        )}
                        <p className="text-[10px] font-black tracking-tight leading-tight truncate">{deal.title}</p>
                        <p className="text-[8px] text-slate-300 truncate leading-none">{deal.subtitle}</p>
                      </div>

                      <img
                        src={getDealImageUrl(deal)}
                        alt={deal.title}
                        className="absolute right-2 bottom-0 h-[120%] w-auto object-contain object-bottom select-none z-10 transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Floating Product Indicator */}
                      {productObj.images?.[0] && (
                        <div className="absolute left-4 bottom-4 z-10 bg-white/10 backdrop-blur-md border border-white/15 p-1 rounded-lg flex items-center gap-1.5">
                          <img
                            src={productObj.images[0].startsWith("http") ? productObj.images[0] : `${backendUrl}/${productObj.images[0]}`}
                            alt=""
                            className="w-5 h-5 object-contain bg-white dark:bg-slate-900 rounded-md"
                          />
                          <div className="text-slate-100 dark:text-white text-[7px] font-black uppercase tracking-wider pr-1">
                            ₹{productObj.price}
                          </div>
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => openPreview(deal)}
                          className="bg-slate-900/85 hover:bg-slate-950 text-slate-100 dark:text-white rounded-lg p-1.5 border-none cursor-pointer flex items-center justify-center transition"
                          title="Preview Deal Banner"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => startEdit(deal)}
                          className="bg-orange-500 hover:bg-orange-600 text-slate-100 dark:text-white rounded-lg p-1.5 border-none cursor-pointer flex items-center justify-center transition"
                          title="Edit Deal"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteDeal(deal._id)}
                          className="bg-rose-500 hover:bg-rose-600 text-slate-100 dark:text-white rounded-lg p-1.5 border-none cursor-pointer flex items-center justify-center transition"
                          title="Delete Deal"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Content info */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white dark:bg-[#151c2c]">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white tracking-tight truncate leading-normal">
                          {deal.title}
                        </h4>
                        {productObj.name ? (
                          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/[0.04] min-w-0">
                            <img
                              src={productObj.images?.[0]?.startsWith("http") ? productObj.images[0] : `${backendUrl}/${productObj.images?.[0]}`}
                              alt=""
                              className="w-7 h-7 object-contain bg-white dark:bg-slate-900 rounded border border-slate-200/50 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[9px] font-black text-slate-800 dark:text-slate-200 truncate leading-tight">{productObj.name}</p>
                              <p className="text-[8px] text-slate-400 font-semibold leading-none mt-0.5">{productObj.brand} | {productObj.category}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] text-rose-500 font-bold">
                            <AlertCircle size={12} />
                            <span>Linked Product Deleted</span>
                          </div>
                        )}

                        {/* Durations */}
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-2">
                          <Calendar size={11} className="text-orange-500" />
                          <span>
                            {new Date(deal.startDate).toLocaleDateString()}
                          </span>
                          {!isCurrent && (
                            <span className="rounded bg-rose-500/10 text-rose-500 px-1 py-0.2 text-[8px] font-black border border-rose-500/20 uppercase tracking-widest ml-1">
                              Out of bounds
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Toggle status footer */}
                      <div className="text-[10px] border-t border-slate-100 dark:border-white/[0.04] pt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={11} className={isActuallyActive ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"} />
                          <span className={isActuallyActive ? "text-slate-700 dark:text-slate-300 font-black" : "text-slate-400 dark:text-slate-500 font-semibold"}>
                            {isActuallyActive ? "Active Deal" : deal.isActive ? "Inactive (Time)" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal: Premium Magazine Deal of the Day Banner Mock */}
      {showPreviewModal && previewingDeal && previewingDeal.productId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-left">
          <div className="relative bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-orange-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Live Deal of the Day Editorial Mockup</h3>
              </div>
              <button
                onClick={() => { setShowPreviewModal(false); setPreviewingDeal(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-10 md:p-14 bg-slate-100 dark:bg-slate-950/85 flex items-center justify-center overflow-visible select-none">

              {/* Banner Box */}
              <div className="relative w-full h-[300px] md:h-[340px] rounded-[28px] overflow-visible shadow-2xl flex flex-row items-center border border-white/10 text-slate-100 dark:text-white bg-gradient-to-r from-amber-950 via-stone-900 to-slate-950">

                {/* Accent glow backdrop */}
                <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[1px] rounded-[28px] pointer-events-none" />
                <div className="absolute left-[-20px] top-[10%] w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Left Side (60%) */}
                <div className="w-full lg:w-3/5 h-full flex flex-col justify-center p-8 z-10 space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[8px] font-black uppercase tracking-widest w-fit animate-pulse">
                    🔥 DEAL OF THE DAY
                  </span>

                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 block">{previewingDeal.productId?.brand}</span>
                    <h2 className="text-sm md:text-base font-black truncate max-w-[90%] opacity-90">{previewingDeal.productId?.name}</h2>
                  </div>

                  <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight uppercase text-orange-400">{previewingDeal.title}</h1>
                    <p className="text-[10px] md:text-xs text-slate-300 font-semibold leading-relaxed line-clamp-2 max-w-[90%]">
                      {previewingDeal.subtitle || "No description provided."}
                    </p>
                  </div>

                  {/* Pricing and Stats */}
                  <div className="flex items-center gap-4 pt-1 flex-wrap">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 font-black">Deal Price</span>
                      <span className="text-base md:text-lg font-black text-orange-400">₹{previewingDeal.productId?.price}</span>
                    </div>

                    {previewingDeal.productId?.originalPrice > previewingDeal.productId?.price && (
                      <>
                        <div className="flex flex-col opacity-65">
                          <span className="text-[8px] uppercase tracking-widest text-slate-400 font-black">M.R.P.</span>
                          <span className="text-xs font-bold line-through">₹{previewingDeal.productId?.originalPrice}</span>
                        </div>

                        <span className="bg-red-500 text-slate-100 dark:text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                          {Math.round(((previewingDeal.productId?.originalPrice - previewingDeal.productId?.price) / previewingDeal.productId?.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Progress bar mock */}
                  <div className="w-[80%] space-y-1">
                    <div className="flex justify-between text-[8px] font-bold text-slate-300">
                      <span>Limited Stock</span>
                      <span>83% Claimed</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: "83%" }} />
                    </div>
                  </div>
                </div>

                {/* Right Side (40%) */}
                <div className="hidden lg:flex w-2/5 h-full relative overflow-visible items-center justify-center">
                  <span className="absolute text-[60px] font-black text-white/[0.03] uppercase tracking-tighter select-none pointer-events-none z-0 rotate-[-15deg]">
                    LIMITED
                  </span>

                  <img
                    src={getDealImageUrl(previewingDeal)}
                    alt="Model"
                    className="absolute top-[-70px] md:top-[-90px] right-[-15px] h-[135%] w-auto object-contain object-bottom select-none z-10 drop-shadow-2xl transition"
                  />

                  {previewingDeal.discountLabel && (
                    <div className="absolute top-6 right-8 z-20 bg-orange-500 text-slate-100 dark:text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border border-white/20 rotate-[10deg] animate-pulse">
                      {previewingDeal.discountLabel}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500 dark:text-slate-400 font-bold border-t border-slate-100 dark:border-white/[0.04]">
              Campaign Date: <code className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded font-mono font-black">{new Date(previewingDeal.startDate).toLocaleDateString()}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealOfTheDay;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { 
  Megaphone, 
  Upload, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Image as ImageIcon,
  Pencil,
  X,
  Plus,
  Eye,
  Calendar,
  Search,
  Tag,
  Star,
  Hourglass
} from "lucide-react";

const themes = [
  { value: "bg-gradient-to-r from-slate-900 to-indigo-950", label: "Midnight Obsidian" },
  { value: "bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950", label: "Crimson Velvet" },
  { value: "bg-gradient-to-r from-emerald-950 to-teal-950", label: "Emerald Glass" },
  { value: "bg-gradient-to-r from-amber-950 via-stone-900 to-slate-950", label: "Royal Gold" },
  { value: "bg-gradient-to-r from-blue-950 to-slate-950", label: "Apple Space Gray" }
];

const Banners = ({ token }) => {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Search & Select Product
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productId, setProductId] = useState("");

  // Banner Campaign Fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [ctaText, setCtaText] = useState("Shop Now");
  const [backgroundTheme, setBackgroundTheme] = useState("bg-gradient-to-r from-slate-900 to-indigo-950");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  // Model image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [editingBanner, setEditingBanner] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewingBanner, setPreviewingBanner] = useState(null);

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

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/banners?admin=true`, { headers: { token } });
      if (response.data.success) {
        setBanners(response.data.banners || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Fetch banners error:", error);
      toast.error(error.response?.data?.message || "Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBanners();
  }, []);

  const getBannerImageUrl = (banner) => {
    if (!banner) return "";
    const img = banner.modelImage || banner.image || "";
    if (!img) return "";
    if (img.startsWith("http")) return img;
    const path = img.startsWith("/") ? img : `/${img}`;
    return `${backendUrl}${path}`;
  };

  const safeFormatDate = (dateVal) => {
    if (!dateVal) return "N/A";
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
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
    if (!productId) return toast.warning("Please select a product");
    if (!title.trim()) return toast.warning("Promotional title is required");
    if (!startDate) return toast.warning("Start Date is required");
    if (!endDate) return toast.warning("End Date is required");
    if (!imageFile && !editingBanner) return toast.warning("Please upload a model image");

    setUploading(true);
    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("badge", badge);
    formData.append("ctaText", ctaText);
    formData.append("backgroundTheme", backgroundTheme);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("displayOrder", displayOrder);
    formData.append("isActive", isActive);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      let url = `${backendUrl}/api/admin/banners`;
      let method = "post";
      if (editingBanner) {
        url = `${backendUrl}/api/admin/banners/${editingBanner._id}`;
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
        toast.success(editingBanner ? "Premium banner updated!" : "Premium banner published!");
        cancelEdit();
        fetchBanners();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting banner:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (banner) => {
    setEditingBanner(banner);
    
    // Bind product
    const boundProductId = banner.productId?._id || banner.productId || "";
    setProductId(boundProductId);
    const prod = products.find(p => p._id === boundProductId);
    setSelectedProduct(prod || null);
    setSearchProductQuery(prod ? prod.name : "");

    setTitle(banner.title);
    setSubtitle(banner.subtitle || "");
    setBadge(banner.badge || "");
    setCtaText(banner.ctaText || "Shop Now");
    setBackgroundTheme(banner.backgroundTheme || "bg-gradient-to-r from-slate-900 to-indigo-950");
    
    // Dates
    if (banner.startDate) {
      const d = new Date(banner.startDate);
      if (!isNaN(d.getTime())) {
        setStartDate(d.toISOString().split("T")[0]);
      }
    }
    if (banner.endDate) {
      const d = new Date(banner.endDate);
      if (!isNaN(d.getTime())) {
        setEndDate(d.toISOString().split("T")[0]);
      }
    }

    setDisplayOrder(String(banner.displayOrder || 0));
    setIsActive(banner.isActive);

    const imgUrl = getBannerImageUrl(banner);
    setImagePreview(imgUrl);
    setImageFile(null);
  };

  const cancelEdit = () => {
    setEditingBanner(null);
    setProductId("");
    setSelectedProduct(null);
    setSearchProductQuery("");
    setTitle("");
    setSubtitle("");
    setBadge("");
    setCtaText("Shop Now");
    setBackgroundTheme("bg-gradient-to-r from-slate-900 to-indigo-950");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setDisplayOrder("0");
    setIsActive(true);
    setImagePreview("");
    setImageFile(null);
  };

  const handleToggleActive = async (banner) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/admin/banners/${banner._id}`,
        { isActive: !banner.isActive },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`Banner ${!banner.isActive ? "activated" : "deactivated"} successfully!`);
        fetchBanners();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this advertisement banner?")) return;

    try {
      const response = await axios.delete(
        `${backendUrl}/api/admin/banners/${id}`,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Banner deleted successfully");
        fetchBanners();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Delete banner error:", error);
      toast.error(error.response?.data?.message || "Deletion failed");
    }
  };

  const openPreview = (banner) => {
    // Populate linked product information fully for modal preview
    let fullBanner = { ...banner };
    if (typeof banner.productId === "string") {
      const p = products.find(prod => prod._id === banner.productId);
      if (p) fullBanner.productId = p;
    }
    setPreviewingBanner(fullBanner);
    setShowPreviewModal(true);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Luxury Campaign Manager
          </p>
          <div className="flex items-center gap-2.5 mt-1">
            <Megaphone size={18} className="text-orange-500" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Premium Advertisement Banners</h2>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Create high-end editorial campaigns binding model photography to catalog products
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        {/* Form Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingBanner ? "Edit Luxury Campaign" : "New Editorial Campaign"}
              </h3>
            </div>
            {editingBanner && (
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
                Step 1: Select Product *
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

              {/* Selected Product Live Feed Card */}
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
              ) : (
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-white/[0.08] hover:border-orange-500 dark:hover:border-orange-500/80 rounded-xl cursor-pointer py-8 px-4 text-center bg-slate-50 dark:bg-slate-900/50 transition duration-200 min-h-[140px]">
                    <Upload size={24} className="text-slate-500 dark:text-slate-500" />
                    <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">Click to upload model photo</span>
                    <span className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-500 max-w-[200px]">Transparent PNG preferred. High-res photoshoot.</span>
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

            {/* Step 3: Enter Advertisement Details */}
            <div className="space-y-3 border-t border-slate-100 dark:border-white/[0.06] pt-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Step 3: Enter Campaign Details
              </label>

              {/* Title */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Main Heading (e.g. Next-Gen Performance)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition dark: font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Sub Heading / Slogan..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition dark: font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>

              {/* Campaign Badge & CTA Text */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Badge (e.g. 🔥 DEAL OF THE DAY)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition dark: font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="CTA Text (Shop Now)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition dark: font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  />
                </div>
              </div>

              {/* Background Theme Selector */}
              <div className="space-y-1">
                <select
                  value={backgroundTheme}
                  onChange={(e) => setBackgroundTheme(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition dark: font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  {themes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {/* Micro Theme Preview */}
                <div className={`h-2.5 w-full rounded-full mt-1.5 border border-white/5 shadow-inner ${backgroundTheme}`} />
              </div>

              {/* Date Ranges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Display Order & Active */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                />
              </div>

              <div className="flex items-end pb-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-slate-300 dark:border-white/[0.08] rounded-xs accent-orange-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Campaign Active</span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-slate-100 dark:text-white text-xs font-black uppercase tracking-wider shadow-md shadow-orange-500/10 active:scale-98 transition-all duration-200 border-none cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/10 dark:border-slate-800 border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingBanner ? "Save Campaign" : "Publish Campaign"}</span>
                )}
              </button>
              
              {editingBanner && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider transition-all duration-200 border-none cursor-pointer flex items-center justify-center"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Banners Grid list */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-orange-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Advertisement Slots</h3>
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 px-3.5 py-1">
                {banners.length} Campaigns Listed
              </span>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-xs text-slate-400 animate-pulse">
                <span className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="font-bold">Fetching campaign listings...</span>
              </div>
            ) : banners.length === 0 ? (
              <div className="flex-1 border border-dashed border-slate-200 dark:border-white/[0.06] rounded-xl flex flex-col items-center justify-center text-center p-12 text-xs text-slate-400">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900/80 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-800 mb-3">
                  <ImageIcon size={18} />
                </div>
                <p className="font-black text-slate-800 dark:text-slate-200">No Editorial Campaigns Published</p>
                <p className="max-w-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-normal font-medium">
                  Bind a catalog product and upload model photography to display high-conversion hero banners with automatic timers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 text-left">
                {banners.map((banner) => {
                  const productObj = banner.productId || {};
                  const isCurrent = new Date(banner.startDate) <= new Date() && new Date(banner.endDate) >= new Date();
                  
                  return (
                    <div
                      key={banner._id}
                      className="group bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/[0.04] rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition duration-200 flex flex-col shadow-xs"
                    >
                      {/* Image preview box (Model photo overlayed on Theme background) */}
                      <div className={`relative h-[180px] flex items-center justify-center overflow-hidden shrink-0 border-b border-slate-100 dark:border-white/[0.05] ${banner.backgroundTheme || 'bg-slate-900'}`}>
                        {/* Mock structural elements to resemble the banner */}
                        <div className="absolute left-4 top-4 text-slate-100 dark:text-white z-0 max-w-[50%] space-y-1">
                          {banner.badge && <span className="text-[7px] bg-white/20 backdrop-blur-xs px-1.5 py-0.5 rounded-full font-black block w-fit">{banner.badge}</span>}
                          <p className="text-[10px] font-black tracking-tight leading-tight truncate">{banner.title}</p>
                          <p className="text-[8px] text-slate-300 truncate leading-none">{banner.subtitle}</p>
                        </div>

                        <img
                          src={getBannerImageUrl(banner)}
                          alt={banner.title}
                          className="absolute right-2 bottom-0 h-[120%] w-auto object-contain object-bottom select-none z-10 transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Floating Product Indicator */}
                        {productObj.images?.[0] && (
                          <div className="absolute left-4 bottom-4 z-10 bg-white/10 backdrop-blur-md border border-white/15 p-1 rounded-lg flex items-center gap-1.5">
                            <img 
                              src={productObj.images?.[0]?.startsWith("http") ? productObj.images[0] : `${backendUrl}/${productObj.images?.[0] || ""}`} 
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
                            onClick={() => openPreview(banner)}
                            className="bg-slate-900/85 hover:bg-slate-950 text-slate-100 dark:text-white rounded-lg p-1.5 border-none cursor-pointer flex items-center justify-center transition"
                            title="Preview banner"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => startEdit(banner)}
                            className="bg-orange-500 hover:bg-orange-600 text-slate-100 dark:text-white rounded-lg p-1.5 border-none cursor-pointer flex items-center justify-center transition"
                            title="Edit banner"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner._id)}
                            className="bg-rose-500 hover:bg-rose-600 text-slate-100 dark:text-white rounded-lg p-1.5 border-none cursor-pointer flex items-center justify-center transition"
                            title="Delete banner"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Sort Order Badge */}
                        <div className="absolute bottom-2 right-2 z-10 bg-black/60 backdrop-blur-xs text-slate-100 dark:text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded border border-white/10">
                          SORT: {banner.displayOrder}
                        </div>
                      </div>

                      {/* Content info */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white dark:bg-[#151c2c]">
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white tracking-tight truncate leading-normal">
                            {banner.title}
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

                          {/* Time durations */}
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-2">
                            <Calendar size={11} className="text-orange-500" />
                            <span>
                              {safeFormatDate(banner.startDate)} – {safeFormatDate(banner.endDate)}
                            </span>
                            {!isCurrent && (
                              <span className="rounded bg-rose-500/10 text-rose-500 px-1 py-0.2 text-[8px] font-black border border-rose-500/20 uppercase tracking-widest ml-1">
                                Out of bounds
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Toggle active footer */}
                        <div className="text-[10px] border-t border-slate-100 dark:border-white/[0.04] pt-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={11} className={banner.isActive && isCurrent ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"} />
                            <span className={banner.isActive && isCurrent ? "text-slate-700 dark:text-slate-300 font-black" : "text-slate-400 dark:text-slate-500 font-semibold"}>
                              {banner.isActive && isCurrent ? "Active Campaign" : banner.isActive ? "Inactive (Time)" : "Disabled"}
                            </span>
                          </div>
                          <label className="flex items-center gap-1 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!banner.isActive}
                              onChange={() => handleToggleActive(banner)}
                              className="w-3.5 h-3.5 text-orange-500 border-slate-300 dark:border-white/[0.08] rounded-xs accent-orange-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            />
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">Live Status</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal: Render the luxury magazine horizontal banner mock */}
      {showPreviewModal && previewingBanner && previewingBanner.productId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-left">
          <div className="relative bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-orange-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Live Editorial Banner Mockup</h3>
              </div>
              <button
                onClick={() => { setShowPreviewModal(false); setPreviewingBanner(null); }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* The Premium Editorial Banner Outer Container with padding to support overflow */}
            <div className="p-10 md:p-14 bg-slate-100 dark:bg-slate-950/80 flex items-center justify-center overflow-visible select-none">
              
              {/* Banner Base Box */}
              <div className={`relative w-full h-[280px] md:h-[320px] rounded-[24px] overflow-visible shadow-2xl flex flex-row items-center border border-white/10 text-slate-100 dark:text-white ${previewingBanner.backgroundTheme || 'bg-slate-900'}`}>
                
                {/* Glassmorphism gradient accents inside the banner */}
                <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[1px] rounded-[24px] pointer-events-none" />
                <div className="absolute left-[-20px] top-[10%] w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                {/* Left Section (60%) */}
                <div className="w-full lg:w-3/5 h-full flex flex-col justify-center p-8 z-10 space-y-2 md:space-y-3">
                  {/* Badge */}
                  {previewingBanner.badge && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-400 text-[8px] font-black uppercase tracking-widest shadow-sm w-fit">
                      <Sparkles size={8} className="animate-pulse" />
                      <span>{previewingBanner.badge}</span>
                    </span>
                  )}

                  {/* Brand & Name */}
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 block">{previewingBanner.productId?.brand || "Brand"}</span>
                    <h2 className="text-sm md:text-base font-black truncate max-w-[90%] opacity-90">{previewingBanner.productId?.name}</h2>
                  </div>

                  {/* Heading & Subtitle */}
                  <div className="space-y-1">
                    <h1 className="text-xl md:text-3xl font-extrabold tracking-tight leading-tight uppercase font-sans">{previewingBanner.title}</h1>
                    {previewingBanner.subtitle && (
                      <p className="text-[10px] md:text-xs text-slate-300 font-semibold leading-relaxed line-clamp-2 max-w-[90%]">
                        {previewingBanner.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Rating, Price & Discount */}
                  <div className="flex items-center gap-4 pt-1 flex-wrap">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 font-black">Deal Price</span>
                      <span className="text-base md:text-xl font-black text-orange-400">₹{previewingBanner.productId?.price}</span>
                    </div>

                    {previewingBanner.productId?.originalPrice > previewingBanner.productId?.price && (
                      <>
                        <div className="flex flex-col opacity-60">
                          <span className="text-[8px] uppercase tracking-widest text-slate-400 font-black">M.R.P.</span>
                          <span className="text-xs font-bold line-through">₹{previewingBanner.productId?.originalPrice}</span>
                        </div>

                        <span className="bg-red-500 text-slate-100 dark:text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/20 shadow-md">
                          {Math.round(((previewingBanner.productId?.originalPrice - previewingBanner.productId?.price) / previewingBanner.productId?.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}

                    {/* Ratings */}
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-[9px] font-black text-slate-200">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span>{previewingBanner.productId?.averageRating || previewingBanner.productId?.rating?.average || 4.5}</span>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-slate-100 dark:text-white text-[9px] font-black uppercase tracking-widest shadow-md border-none cursor-pointer">
                      <span>{previewingBanner.ctaText || "Shop Now"}</span>
                    </span>
                  </div>
                </div>

                {/* Right Section (40%) */}
                <div className="hidden lg:flex w-2/5 h-full relative overflow-visible items-center justify-center">
                  
                  {/* Slogan Backlight text */}
                  <span className="absolute text-[60px] font-black text-white/[0.03] uppercase tracking-tighter leading-none select-none pointer-events-none z-0 rotate-[-15deg]">
                    LUXURY
                  </span>

                  {/* Overflowing Model Image */}
                  <img
                    src={getBannerImageUrl(previewingBanner)}
                    alt="Model"
                    className="absolute top-[-70px] md:top-[-90px] right-[-15px] h-[135%] w-auto object-contain object-bottom select-none z-10 drop-shadow-2xl transition"
                  />

                  {/* Floating Product Small Visual Badge */}
                  {previewingBanner.productId?.images?.[0] && (
                    <div className="absolute bottom-6 left-[-20px] z-20 bg-white/15 backdrop-blur-xl border border-white/20 p-1.5 rounded-xl flex items-center gap-2 shadow-lg">
                      <img 
                        src={previewingBanner.productId?.images?.[0]?.startsWith("http") ? previewingBanner.productId.images[0] : `${backendUrl}/${previewingBanner.productId?.images?.[0] || ""}`} 
                        alt="" 
                        className="w-8 h-8 object-contain bg-white dark:bg-slate-900 rounded-lg p-0.5 border"
                      />
                      <div className="text-slate-100 dark:text-white text-[8px] font-bold tracking-tight pr-1 flex flex-col justify-center">
                        <span className="opacity-70 text-[6px] uppercase font-black tracking-widest leading-none">Catalog Match</span>
                        <span className="leading-tight truncate max-w-[80px] font-black">{previewingBanner.productId.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Floating discount badge */}
                  {previewingBanner.productId?.originalPrice > previewingBanner.productId?.price && (
                    <div className="absolute top-6 right-8 z-20 bg-orange-500 text-slate-100 dark:text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border border-white/20 rotate-[10deg]">
                      Save {Math.round(((previewingBanner.productId?.originalPrice - previewingBanner.productId?.price) / previewingBanner.productId?.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500 dark:text-slate-400 font-bold border-t border-slate-100 dark:border-white/[0.04]">
              Campaign Duration: <code className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded font-mono font-black">{safeFormatDate(previewingBanner.startDate)}</code> to <code className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded font-mono font-black">{safeFormatDate(previewingBanner.endDate)}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;

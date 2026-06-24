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
  Eye
} from "lucide-react";

// Utility: Convert base64 dataUrl to Blob file
const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

const Banners = ({ token }) => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  // Image and processing states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [autoCleanBg, setAutoCleanBg] = useState(false);
  const [cleanedPreview, setCleanedPreview] = useState("");
  const [cleanedBlob, setCleanedBlob] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [editingBanner, setEditingBanner] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewingBanner, setPreviewingBanner] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/categories`, { headers: { token } });
      if (response.data.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
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
    fetchCategories();
    fetchBanners();
  }, []);

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
    reader.onloadend = async () => {
      setImagePreview(reader.result);
      
      if (autoCleanBg) {
        setProcessing(true);
        toast.info("Applying professional AI background removal... 🪄");
        try {
          const formData = new FormData();
          formData.append("image", file);
          
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
            setCleanedBlob(blob);
            
            const localUrl = URL.createObjectURL(blob);
            setCleanedPreview(localUrl);
            toast.success("AI Background removed successfully!");
          } else {
            toast.error(response.data.message || "Failed to remove background");
            setCleanedPreview(reader.result);
            setCleanedBlob(null);
          }
        } catch (err) {
          console.error("AI background cleaning error:", err);
          toast.warning("Failed to run AI background removal. Fallback to original.");
          setCleanedPreview(reader.result);
          setCleanedBlob(null);
        } finally {
          setProcessing(false);
        }
      } else {
        setCleanedPreview(reader.result);
        setCleanedBlob(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryCheckboxChange = (catId) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== catId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.warning("Title is required");
    if (!imageFile && !editingBanner) return toast.warning("Please upload a banner image");

    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("categoryIds", selectedCategoryIds.join(","));
    formData.append("displayOrder", displayOrder);
    formData.append("isActive", isActive);

    if (imageFile) {
      if (autoCleanBg && cleanedBlob) {
        formData.append("image", cleanedBlob, `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_cleaned.png`);
      } else {
        formData.append("image", imageFile);
      }
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
        toast.success(editingBanner ? "Hero banner updated successfully!" : "Hero banner created successfully!");
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
    setTitle(banner.title);
    setSubtitle(banner.subtitle || "");
    setSelectedCategoryIds(banner.categoryIds || []);
    setDisplayOrder(String(banner.displayOrder || 0));
    setIsActive(banner.isActive);
    setImagePreview(banner.image.startsWith("http") ? banner.image : `${backendUrl}${banner.image}`);
    setCleanedPreview(banner.image.startsWith("http") ? banner.image : `${backendUrl}${banner.image}`);
    setImageFile(null);
    setCleanedBlob(null);
  };

  const cancelEdit = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setSelectedCategoryIds([]);
    setDisplayOrder("0");
    setIsActive(true);
    setImagePreview("");
    setCleanedPreview("");
    setImageFile(null);
    setCleanedBlob(null);
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
    if (!window.confirm("Are you sure you want to delete this hero banner?")) return;

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
    setPreviewingBanner(banner);
    setShowPreviewModal(true);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Ad Space Management
          </p>
          <div className="flex items-center gap-2.5 mt-1">
            <Megaphone size={18} className="text-orange-500" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Hero Advertisement Banners</h2>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Manage clickable hero advertisement banners mapped to categories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Form Panel */}
        <div className="bg-white dark:bg-[#172033] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingBanner ? "Edit Hero Banner" : "Add Advertisement Banner"}
              </h3>
            </div>
            {editingBanner && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 border-none bg-transparent cursor-pointer flex items-center justify-center"
                title="Cancel Edit"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Image File Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Banner Image File
              </label>

              {imagePreview ? (
                <div className="relative group rounded-xl border border-dashed border-slate-350 dark:border-white/[0.1] overflow-hidden flex flex-col items-center justify-center p-2 min-h-[160px]">
                  {processing ? (
                    <div className="relative z-10 flex flex-col items-center gap-1.5 text-[11px] text-slate-400 font-bold bg-white/80 dark:bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
                      <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span>Processing background...</span>
                    </div>
                  ) : (
                    <img
                      src={autoCleanBg && cleanedPreview ? cleanedPreview : imagePreview}
                      alt="Banner Preview"
                      className="relative z-10 max-h-[140px] max-w-full object-contain animate-fade-in"
                    />
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      setCleanedPreview("");
                      setCleanedBlob(null);
                    }}
                    className="absolute top-2 right-2 z-20 bg-rose-500 hover:bg-rose-650 text-white rounded-full p-1.5 shadow-md transition-all active:scale-95 border-none cursor-pointer flex items-center justify-center"
                    title="Remove Image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-350 dark:border-white/[0.08] hover:border-orange-500 dark:hover:border-orange-500/80 rounded-xl cursor-pointer py-8 px-4 text-center bg-slate-50 dark:bg-slate-900/50 transition duration-200 min-h-[140px]">
                    <Upload size={24} className="text-slate-450 dark:text-slate-550" />
                    <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">Click to upload banner image</span>
                    <span className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-550">Landscape image recommended</span>
                    <input
                      type="file"
                      accept="image/png, image/webp, image/jpeg, image/jpg"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Background Clean Toggle */}
              <div className="flex items-center gap-2 mt-2 py-1">
                <input
                  type="checkbox"
                  id="autoCleanBannerBg"
                  checked={autoCleanBg}
                  onChange={(e) => setAutoCleanBg(e.target.checked)}
                  className="w-3.5 h-3.5 text-orange-500 border-slate-300 dark:border-white/[0.08] rounded-xs focus:ring-orange-500 accent-orange-500 cursor-pointer"
                />
                <label htmlFor="autoCleanBannerBg" className="text-[10px] font-bold text-slate-500 dark:text-slate-450 select-none cursor-pointer">
                  Auto-Remove Background (Use only for transparent ad-overlays)
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Banner Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Premium Winter Collection"
                className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition focus:border-orange-500 dark:focus:border-orange-500/80 font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Up to 50% Off Jackets & Hoodies"
                className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition focus:border-orange-500 dark:focus:border-orange-500/80 font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Multi-Select Category Checklist */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Map to Target Product Categories
              </label>
              <div className="max-h-[160px] overflow-y-auto border border-slate-200 dark:border-white/[0.08] rounded-xl p-3 bg-slate-50 dark:bg-slate-900/40 space-y-2">
                {categories.length === 0 ? (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">No categories available</p>
                ) : (
                  categories.map(cat => (
                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(cat._id)}
                        onChange={() => handleCategoryCheckboxChange(cat._id)}
                        className="w-3.5 h-3.5 text-orange-500 border-slate-350 dark:border-white/[0.08] rounded-xs focus:ring-orange-500 accent-orange-500 cursor-pointer"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{cat.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Order and Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition focus:border-orange-500 dark:focus:border-orange-500/80 font-bold"
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-slate-350 dark:border-white/[0.08] rounded-xs focus:ring-orange-500 accent-orange-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Banner</span>
                </label>
              </div>
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={uploading || processing}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-655 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-98 transition-all duration-200 border-none cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{editingBanner ? "Saving Changes..." : "Publishing Banner..."}</span>
                  </>
                ) : (
                  <span>{editingBanner ? "Save Changes" : "Publish Banner"}</span>
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
          <div className="bg-white dark:bg-[#172033] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-orange-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Advertisement Slots</h3>
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-650 dark:text-slate-400 px-3.5 py-1">
                {banners.length} Banners Listed
              </span>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-xs text-slate-400 animate-pulse">
                <span className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="font-bold">Fetching advertisement configurations...</span>
              </div>
            ) : banners.length === 0 ? (
              <div className="flex-1 border border-dashed border-slate-200 dark:border-white/[0.06] rounded-xl flex flex-col items-center justify-center text-center p-12 text-xs text-slate-400">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900/80 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-800 mb-3">
                  <ImageIcon size={18} />
                </div>
                <p className="font-black text-slate-800 dark:text-slate-200">No Hero Banners Published</p>
                <p className="max-w-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-normal font-medium">
                  Create and display landscape fashion banners mapped to custom categories. Banners will redirect buyers to category listings on click.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {banners.map((banner) => (
                  <div
                    key={banner._id}
                    className="group bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/[0.05] rounded-xl overflow-hidden hover:border-slate-350 dark:hover:border-slate-700 transition duration-200 flex flex-col"
                  >
                    {/* Image preview box */}
                    <div className="relative h-[180px] bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 border-b border-slate-100 dark:border-white/[0.05]">
                      <img
                        src={banner.image.startsWith("http") ? banner.image : `${backendUrl}${banner.image}`}
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />

                      {/* Overlays buttons */}
                      <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => openPreview(banner)}
                          className="bg-slate-900/80 hover:bg-slate-950 text-white rounded-lg p-1.5 shadow-sm border-none cursor-pointer flex items-center justify-center"
                          title="Preview full banner"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => startEdit(banner)}
                          className="bg-orange-550 hover:bg-orange-600 text-white rounded-lg p-1.5 shadow-sm border-none cursor-pointer flex items-center justify-center"
                          title="Edit banner"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner._id)}
                          className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg p-1.5 shadow-sm border-none cursor-pointer flex items-center justify-center"
                          title="Delete banner"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Display Order badge */}
                      <div className="absolute bottom-2 left-2 z-10 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-white/10">
                        Sort Order: {banner.displayOrder}
                      </div>
                    </div>

                    {/* Content metadata */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight truncate">
                          {banner.title}
                        </h4>
                        {banner.subtitle && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1 truncate">
                            {banner.subtitle}
                          </p>
                        )}

                        {/* Mapped Categories tag lists */}
                        <div className="flex flex-wrap gap-1 mt-3.5">
                          {banner.categoryIds && banner.categoryIds.length > 0 ? (
                            banner.categoryIds.map(catId => {
                              const found = categories.find(c => c._id === catId);
                              return (
                                <span key={catId} className="rounded bg-orange-500/10 text-orange-500 border border-orange-500/10 px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider">
                                  {found ? found.name : "Category"}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[9px] text-slate-400 dark:text-slate-600 italic font-bold">Unmapped (No Redirect Categories)</span>
                          )}
                        </div>
                      </div>

                      {/* Inline Active State Toggle Footer */}
                      <div className="text-[10px] border-t border-slate-100 dark:border-white/[0.04] pt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={11} className={banner.isActive ? "text-emerald-500" : "text-slate-350 dark:text-slate-600"} />
                          <span className={banner.isActive ? "text-slate-700 dark:text-slate-300 font-bold" : "text-slate-400 dark:text-slate-500"}>
                            {banner.isActive ? "Active Banner" : "Inactive"}
                          </span>
                        </div>
                        <label className="flex items-center gap-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!banner.isActive}
                            onChange={() => handleToggleActive(banner)}
                            className="w-3.5 h-3.5 text-orange-500 border-slate-300 dark:border-white/[0.08] rounded-xs focus:ring-orange-500 accent-orange-500 cursor-pointer"
                          />
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550">Show on Live</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Banner Preview</h3>
              <button
                onClick={() => { setShowPreviewModal(false); setPreviewingBanner(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="relative w-full aspect-[21/9] bg-slate-950">
              <img
                src={previewingBanner.image.startsWith("http") ? previewingBanner.image : `${backendUrl}${previewingBanner.image}`}
                alt={previewingBanner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white text-left">
                <h2 className="text-lg md:text-2xl font-black leading-tight drop-shadow-md">
                  {previewingBanner.title}
                </h2>
                {previewingBanner.subtitle && (
                  <p className="text-xs md:text-sm text-slate-200 font-bold mt-1 drop-shadow-sm">
                    {previewingBanner.subtitle}
                  </p>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500 dark:text-slate-400 font-bold">
              Clicking this banner directs the user to: <code className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded font-mono">/products?categories={previewingBanner.categoryIds?.join(",")}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;

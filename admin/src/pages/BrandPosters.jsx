import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import {
  Award,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  Tag,
  ShieldCheck,
  Flame,
  ArrowRight,
  Copy,
  ExternalLink,
  Layers,
  Clock,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  LayoutGrid,
  ListFilter,
  Wand2,
  SlidersHorizontal,
  HelpCircle,
  Store,
  Zap,
  Image as ImageIcon
} from "lucide-react";

const getFullImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
    return img;
  }
  return `${backendUrl}${img.startsWith("/") ? "" : "/"}${img}`;
};

const POPULAR_BRANDS = [
  { name: "Apple", domain: "apple.com" },
  { name: "Samsung", domain: "samsung.com" },
  { name: "Nike", domain: "nike.com" },
  { name: "Sony", domain: "sony.com" },
  { name: "boAt", domain: "boat-lifestyle.com" },
  { name: "Puma", domain: "puma.com" },
  { name: "Adidas", domain: "adidas.com" },
  { name: "Dell", domain: "dell.com" },
  { name: "Titan", domain: "titan.co.in" },
  { name: "JBL", domain: "jbl.com" }
];

const CAMPAIGN_PRESETS = [
  {
    label: "Festival Flagship",
    badge: "FLAT ₹5,000 OFF",
    sub: "With Leading Bank Cards + No Cost EMI",
    tag: "Festival Spotlight",
    perks: "Official Warranty, Instant Dispatch, Free Returns, No Cost EMI"
  },
  {
    label: "Super Brand Day",
    badge: "UP TO 40% OFF",
    sub: "Special Limited-Time Brand Carnival Offers",
    tag: "Super Brand Day",
    perks: "100% Genuine, Verified Partner, Express Delivery, 24/7 Support"
  },
  {
    label: "Mega Clearance Drop",
    badge: "UP TO 65% OFF",
    sub: "Lowest Price Guaranteed on Certified Models",
    tag: "Limited Stock Deal",
    perks: "Direct Manufacturer Stock, Easy Exchange, Fast Shipping"
  }
];

const BrandPosters = () => {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // "general" | "offers" | "media"

  // Form State
  const [formData, setFormData] = useState({
    brand: "",
    brandDomain: "",
    headline: "",
    subheadline: "",
    offerBadge: "FLAT ₹5,000 OFF",
    offerSub: "With Leading Bank Cards + No Cost EMI",
    couponCode: "BRANDPRO",
    dealTag: "Limited Window Deal",
    rating: "4.9★",
    warrantyText: "Official Brand Warranty",
    perks: "100% Genuine, Instant Dispatch, Free Returns, Manufacturer Warranty",
    order: 0,
    isActive: true,
    imageUrl: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  // Fetch all posters for admin
  const fetchPosters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const { data } = await axios.get(`${backendUrl}/api/brand-posters/admin/all`, {
        headers: { token }
      });
      if (data.success) {
        setPosters(data.posters || []);
      } else {
        toast.error(data.message || "Failed to fetch brand posters");
      }
    } catch (err) {
      console.error("Error fetching brand posters:", err);
      toast.error(err.response?.data?.message || "Failed to load brand posters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosters();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setActiveTab("general");
    setFormData({
      brand: "",
      brandDomain: "",
      headline: "",
      subheadline: "",
      offerBadge: "FLAT ₹5,000 OFF",
      offerSub: "With Leading Bank Cards + No Cost EMI",
      couponCode: "BRANDPRO",
      dealTag: "Limited Window Deal",
      rating: "4.9★",
      warrantyText: "Official Brand Warranty",
      perks: "100% Genuine, Instant Dispatch, Free Returns, Manufacturer Warranty",
      order: posters.length,
      isActive: true,
      imageUrl: ""
    });
    setImageFile(null);
    setImagePreview("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (poster) => {
    setIsEditing(true);
    setEditingId(poster._id);
    setActiveTab("general");
    setFormData({
      brand: poster.brand || "",
      brandDomain: poster.brandDomain || "",
      headline: poster.headline || "",
      subheadline: poster.subheadline || "",
      offerBadge: poster.offerBadge || "EXCLUSIVE OFFER",
      offerSub: poster.offerSub || "Direct Brand Warranty",
      couponCode: poster.couponCode || "PROMO",
      dealTag: poster.dealTag || "Official Flagship",
      rating: poster.rating || "4.9★",
      warrantyText: poster.warrantyText || "Official Brand Warranty",
      perks: Array.isArray(poster.perks) ? poster.perks.join(", ") : poster.perks || "",
      order: poster.order || 0,
      isActive: poster.isActive !== undefined ? poster.isActive : true,
      imageUrl: poster.imageUrl || ""
    });
    setImageFile(null);
    setImagePreview(getFullImageUrl(poster.imageUrl));
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBrandSelect = (bName, bDomain = "") => {
    const slug = bName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const domain = bDomain || `${slug}.com`;
    const coupon = (bName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "BRAND") + "PRO";

    setFormData((prev) => ({
      ...prev,
      brand: bName,
      brandDomain: domain,
      couponCode: prev.couponCode === "BRANDPRO" || prev.couponCode.endsWith("PRO") ? coupon : prev.couponCode,
      headline: prev.headline ? prev.headline : `${bName} Official Brand Days`,
      subheadline: prev.subheadline ? prev.subheadline : `Discover official authentic collections from ${bName} with certified manufacturer warranty.`
    }));
  };

  const applyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      offerBadge: preset.badge,
      offerSub: preset.sub,
      dealTag: preset.tag,
      perks: preset.perks
    }));
    toast.info(`Applied template: "${preset.label}"`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand.trim() || !formData.headline.trim()) {
      toast.error("Brand Name and Campaign Headline are required");
      setActiveTab("general");
      return;
    }

    if (!isEditing && !imageFile && !formData.imageUrl) {
      toast.error("Please upload a poster image");
      setActiveTab("media");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token") || "";
      const postData = new FormData();
      postData.append("brand", formData.brand.trim());
      postData.append("brandDomain", formData.brandDomain.trim());
      postData.append("headline", formData.headline.trim());
      postData.append("subheadline", formData.subheadline.trim());
      postData.append("offerBadge", formData.offerBadge.trim());
      postData.append("offerSub", formData.offerSub.trim());
      postData.append("couponCode", formData.couponCode.trim());
      postData.append("dealTag", formData.dealTag.trim());
      postData.append("rating", formData.rating.trim());
      postData.append("warrantyText", formData.warrantyText.trim());
      postData.append("perks", formData.perks);
      postData.append("order", formData.order);
      postData.append("isActive", formData.isActive);

      if (imageFile) {
        postData.append("image", imageFile);
      } else if (formData.imageUrl) {
        postData.append("imageUrl", formData.imageUrl);
      }

      let res;
      if (isEditing) {
        res = await axios.put(`${backendUrl}/api/brand-posters/${editingId}`, postData, {
          headers: { token, "Content-Type": "multipart/form-data" }
        });
      } else {
        res = await axios.post(`${backendUrl}/api/brand-posters`, postData, {
          headers: { token, "Content-Type": "multipart/form-data" }
        });
      }

      if (res.data.success) {
        toast.success(isEditing ? "Brand poster updated successfully!" : "Brand poster created successfully!");
        setIsModalOpen(false);
        fetchPosters();
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Error submitting brand poster:", err);
      toast.error(err.response?.data?.message || "Failed to save brand poster");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token") || "";
      const { data } = await axios.patch(`${backendUrl}/api/brand-posters/${id}/toggle`, {}, {
        headers: { token }
      });
      if (data.success) {
        toast.success(data.message);
        setPosters((prev) =>
          prev.map((p) => (p._id === id ? { ...p, isActive: data.isActive } : p))
        );
      }
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id, brandName, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete the campaign poster for "${brandName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token") || "";
      const { data } = await axios.delete(`${backendUrl}/api/brand-posters/${id}`, {
        headers: { token }
      });
      if (data.success) {
        toast.success("Brand poster deleted successfully");
        setPosters((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete poster");
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const newPosters = [...posters];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newPosters.length) return;

    const temp = newPosters[index];
    newPosters[index] = newPosters[targetIndex];
    newPosters[targetIndex] = temp;

    setPosters(newPosters);

    try {
      const token = localStorage.getItem("token") || "";
      const orderedIds = newPosters.map((p) => p._id);
      await axios.put(
        `${backendUrl}/api/brand-posters/reorder`,
        { orderedIds },
        { headers: { token } }
      );
    } catch (err) {
      console.error("Failed to save reorder:", err);
      fetchPosters();
    }
  };

  // Filtered Posters
  const filteredPosters = posters.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.couponCode && p.couponCode.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterActive === "active") return p.isActive;
    if (filterActive === "inactive") return !p.isActive;
    return true;
  });

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-3 max-w-7xl mx-auto select-none">
      
      {/* ── COMBINED COMPACT HEADER & STATS ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 sm:p-3.5 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Title + Integrated Status Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200/80 dark:border-blue-800/80 shadow-xs">
            <Award size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Brand Page Posters
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-black bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {posters.length} Total
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{posters.filter((p) => p.isActive).length} Live</span>
              </span>
              {posters.some((p) => !p.isActive) && (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-black bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  {posters.filter((p) => !p.isActive).length} Inactive
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Official Brand Showcase banner campaigns • Connected to client Brands page
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchPosters}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>Add Brand Poster</span>
          </button>
        </div>
      </div>

      {/* ── UNIFIED SLIM SEARCH & CONTROLS TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand name, headline, coupon..."
            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">All Status ({posters.length})</option>
            <option value="active">Active Only ({posters.filter((p) => p.isActive).length})</option>
            <option value="inactive">Inactive Only ({posters.filter((p) => !p.isActive).length})</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
              title="Grid Card View"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1 rounded transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
              title="List View"
            >
              <ListFilter size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── POSTERS LIST / GRID ── */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw size={28} className="animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-xs font-bold">Loading brand posters...</p>
        </div>
      ) : filteredPosters.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
          <Award size={40} className="mx-auto text-slate-400" />
          <h3 className="text-base font-black text-slate-800 dark:text-white">No Brand Posters Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? "No posters match your search criteria."
              : "Start by adding your first brand campaign poster to feature it on the client Brands page."}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>Create First Poster</span>
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosters.map((poster, index) => (
            <div
              key={poster._id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-2xs group ${
                poster.isActive
                  ? "border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-600"
                  : "border-slate-200/50 dark:border-slate-800/50 opacity-70 bg-slate-50/50 dark:bg-slate-950/50"
              }`}
            >
              {/* Card Top: Image Showcase */}
              <div className="relative h-52 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center overflow-hidden border-b border-slate-200/80 dark:border-slate-800 p-3">
                {/* Ambient Blur */}
                <img
                  src={getFullImageUrl(poster.imageUrl)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-25 scale-125 pointer-events-none"
                />
                
                {/* Foreground Full Image */}
                <img
                  src={getFullImageUrl(poster.imageUrl)}
                  alt={poster.headline}
                  className="relative z-10 max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Left Tag */}
                <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 text-[9.5px] font-black uppercase tracking-wider bg-slate-950/85 text-amber-400 backdrop-blur-md rounded border border-white/20 shadow-xs">
                    {poster.brand}
                  </span>
                  <span className="px-2 py-1 text-[9.5px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 backdrop-blur-md rounded border border-slate-200 dark:border-slate-700">
                    {poster.rating}
                  </span>
                </div>

                {/* Top Right Order & Status */}
                <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1">
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-slate-950/75 text-white backdrop-blur-md rounded">
                    #{index + 1}
                  </span>
                  <button
                    onClick={(e) => handleToggleActive(poster._id, e)}
                    className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded transition cursor-pointer shadow-xs ${
                      poster.isActive
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {poster.isActive ? "Live" : "Off"}
                  </button>
                </div>

                {/* Bottom Overlay Offer Badge */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-1.5">
                  <span className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white px-2.5 py-1 rounded text-[10px] font-black tracking-tight border border-slate-200 dark:border-slate-700 shadow-xs">
                    {poster.offerBadge}
                  </span>
                  <span className="font-mono text-[10px] font-black px-2 py-1 bg-amber-500/90 text-slate-950 rounded shadow-xs">
                    {poster.couponCode}
                  </span>
                </div>
              </div>

              {/* Card Body: Details */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="text-[10.5px] font-bold text-slate-400 flex items-center justify-between">
                    <span>@{poster.brandDomain || `${poster.slug}.com`}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[10px]">
                      {poster.warrantyText}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                    {poster.headline}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {poster.subheadline}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, -1)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Left/Up"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      disabled={index === posters.length - 1}
                      onClick={() => handleMoveOrder(index, 1)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Right/Down"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(poster)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={(e) => handleDelete(poster._id, poster.brand, e)}
                      className="p-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg transition cursor-pointer border border-rose-200 dark:border-rose-800"
                      title="Delete poster"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="space-y-2.5">
          {filteredPosters.map((poster, index) => (
            <div
              key={poster._id}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-3.5 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5 shadow-2xs ${
                poster.isActive
                  ? "border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700"
                  : "border-slate-200/40 dark:border-slate-800/40 opacity-70 bg-slate-50/50 dark:bg-slate-950/40"
              }`}
            >
              {/* Left Column: Reorder + Thumbnail + Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, -1)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    disabled={index === posters.length - 1}
                    onClick={() => handleMoveOrder(index, 1)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Poster Thumbnail */}
                <div className="w-14 h-18 sm:w-16 sm:h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center p-1">
                  <img
                    src={getFullImageUrl(poster.imageUrl)}
                    alt={poster.headline}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Campaign Details */}
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/60">
                      {poster.brand}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      @{poster.brandDomain || `${poster.slug}.com`}
                    </span>
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      {poster.rating}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {poster.headline}
                  </h3>

                  <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {poster.offerBadge}
                    </span>
                    <span className="text-[10px] font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <Tag size={10} />
                      <span>{poster.couponCode}</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck size={11} />
                      <span>{poster.warrantyText}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions & Toggle */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                <button
                  onClick={(e) => handleToggleActive(poster._id, e)}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 border ${
                    poster.isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${poster.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  <span>{poster.isActive ? "Active" : "Inactive"}</span>
                </button>

                <button
                  onClick={() => handleOpenEditModal(poster)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition cursor-pointer"
                >
                  <Edit size={14} />
                </button>

                <button
                  onClick={(e) => handleDelete(poster._id, poster.brand, e)}
                  className="p-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg transition cursor-pointer border border-rose-200 dark:border-rose-800"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE / EDIT SPLIT-SCREEN MODAL WITH LIVE PREVIEW ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Award size={18} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {isEditing ? "Edit Brand Poster Campaign" : "Add Brand Poster Campaign"}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Live client banner presentation settings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
                  activeTab === "general"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                1. Brand & Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("offers")}
                className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
                  activeTab === "offers"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                2. Offers & Vouchers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
                  activeTab === "media"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                3. Poster Image & Preview
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* ═══ TAB 1: BRAND & GENERAL INFO ═══ */}
              {activeTab === "general" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Quick Pick Brand Chips */}
                  <div className="space-y-1.5 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-900 dark:text-blue-300">
                      <Sparkles size={14} className="text-blue-600" />
                      <span>Quick Select Brand:</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {POPULAR_BRANDS.map((b) => (
                        <button
                          key={b.name}
                          type="button"
                          onClick={() => handleBrandSelect(b.name, b.domain)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg border transition cursor-pointer ${
                            formData.brand.toLowerCase() === b.name.toLowerCase()
                              ? "bg-blue-600 text-white border-blue-600 font-black shadow-xs"
                              : "bg-white dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Brand Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Brand Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.brand}
                        onChange={(e) => handleBrandSelect(e.target.value)}
                        placeholder="e.g. Apple, Nike, Samsung, Zara, etc."
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Brand Domain */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Official Domain (For Logo API)
                      </label>
                      <input
                        type="text"
                        value={formData.brandDomain}
                        onChange={(e) => setFormData({ ...formData, brandDomain: e.target.value })}
                        placeholder="e.g. apple.com, nike.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Campaign Headline */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Campaign Headline *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.headline}
                        onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                        placeholder="e.g. Apple Official Brand Days 2025"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Subheadline */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Campaign Subheadline / Product Pitch
                      </label>
                      <textarea
                        rows={2}
                        value={formData.subheadline}
                        onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                        placeholder="e.g. Titanium Craftsmanship. Pro-Grade M-Series Performance & Certified Accessories."
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Spotlight Deal Tag */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Deal Spotlight Pill
                      </label>
                      <input
                        type="text"
                        value={formData.dealTag}
                        onChange={(e) => setFormData({ ...formData, dealTag: e.target.value })}
                        placeholder="e.g. Limited Window Deal, Trending Flagship"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Store Rating */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Store Rating
                      </label>
                      <input
                        type="text"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        placeholder="e.g. 4.9★"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ TAB 2: OFFERS & VOUCHERS ═══ */}
              {activeTab === "offers" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Presets */}
                  <div className="space-y-1.5 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/40">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-300">
                      <Wand2 size={14} className="text-amber-600" />
                      <span>Quick Apply Offer Templates:</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {CAMPAIGN_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyPreset(p)}
                          className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-amber-100 text-slate-800 dark:text-slate-200 rounded-lg border border-amber-200 dark:border-amber-800 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Flame size={12} className="text-amber-500" />
                          <span>{p.label} ({p.badge})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Offer Badge */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Offer Highlight Badge
                      </label>
                      <input
                        type="text"
                        value={formData.offerBadge}
                        onChange={(e) => setFormData({ ...formData, offerBadge: e.target.value })}
                        placeholder="e.g. FLAT ₹5,000 OFF or UP TO 40% OFF"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Offer Subtext */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Offer Subtext
                      </label>
                      <input
                        type="text"
                        value={formData.offerSub}
                        onChange={(e) => setFormData({ ...formData, offerSub: e.target.value })}
                        placeholder="e.g. With Leading Bank Cards + No Cost EMI"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Promo Coupon Code */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Promo Coupon Code (1-Click Copy on Client)
                      </label>
                      <input
                        type="text"
                        value={formData.couponCode}
                        onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. APPLE5K"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-black outline-none focus:border-blue-500 uppercase tracking-wider"
                      />
                    </div>

                    {/* Warranty Assurance */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Warranty / Trust Guarantee
                      </label>
                      <input
                        type="text"
                        value={formData.warrantyText}
                        onChange={(e) => setFormData({ ...formData, warrantyText: e.target.value })}
                        placeholder="e.g. 2-Yr Official Brand Warranty"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Perks */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Key Perks & Highlights (Comma-Separated)
                      </label>
                      <input
                        type="text"
                        value={formData.perks}
                        onChange={(e) => setFormData({ ...formData, perks: e.target.value })}
                        placeholder="100% Genuine, Instant Dispatch, Free Returns, Manufacturer Warranty"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ TAB 3: MEDIA & LIVE PREVIEW ═══ */}
              {activeTab === "media" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    
                    {/* Left: Upload Controls */}
                    <div className="lg:col-span-6 space-y-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Poster / Model Image Asset *
                        </label>
                        
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-2.5"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />

                          {imagePreview ? (
                            <div className="relative w-40 h-52 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center shadow-md">
                              <img
                                src={imagePreview}
                                alt="Poster Preview"
                                className="max-h-full max-w-full object-contain"
                              />
                              <span className="absolute bottom-2 bg-slate-950/85 text-white text-[9.5px] font-black px-2.5 py-0.5 rounded shadow">
                                Click to Change
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                                <Upload size={22} />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                                  Click or drag poster file here
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  PNG, WebP, JPG supported (Uncropped 100% full view)
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Display Order & Active status */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Display Order Priority
                          </label>
                          <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-1 flex flex-col justify-end">
                          <label className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.isActive}
                              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                            <span className="text-xs font-black text-slate-800 dark:text-white">
                              Active & Live
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right: Live Interactive Mini Replica Preview */}
                    <div className="lg:col-span-6 space-y-2 bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Eye size={13} className="text-blue-500" />
                          <span>Live Banner Preview</span>
                        </span>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-black">
                          Real-Time
                        </span>
                      </div>

                      {/* Mini Client Banner Replica */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                        <div className="grid grid-cols-12 min-h-[220px]">
                          
                          {/* Mini Side A (Image) */}
                          <div className="col-span-5 bg-slate-100 dark:bg-slate-800/90 relative flex items-center justify-center p-2 border-r border-slate-200 dark:border-slate-800 overflow-hidden">
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-full max-w-full object-contain drop-shadow"
                              />
                            ) : (
                              <div className="text-center text-slate-400 text-[10px] font-bold">
                                <ImageIcon size={24} className="mx-auto mb-1 opacity-50" />
                                <span>No image selected</span>
                              </div>
                            )}

                            <span className="absolute top-1.5 left-1.5 bg-slate-950/80 text-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded">
                              {formData.brand || "Brand"}
                            </span>
                          </div>

                          {/* Mini Side B (Details) */}
                          <div className="col-span-7 p-3 flex flex-col justify-between space-y-2 text-slate-900 dark:text-white">
                            <div className="space-y-1">
                              <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                <span>{formData.brand || "Official Partner"} Store</span>
                                <span className="text-amber-500 font-bold">{formData.rating}</span>
                              </div>
                              <h4 className="text-xs font-black leading-tight line-clamp-1">
                                {formData.headline || "Campaign Headline"}
                              </h4>
                              <p className="text-[9.5px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                                {formData.subheadline || "Campaign subheadline..."}
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[9px] font-black">
                                  {formData.offerBadge}
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded text-[9px] font-mono font-black text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                  <Tag size={9} />
                                  <span>{formData.couponCode}</span>
                                </div>
                              </div>

                              <div className="text-[8.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <ShieldCheck size={10} />
                                <span>{formData.warrantyText}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-400">
                  Step {activeTab === "general" ? "1/3" : activeTab === "offers" ? "2/3" : "3/3"}
                </div>

                <div className="flex items-center gap-2.5">
                  {activeTab !== "general" && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(activeTab === "media" ? "offers" : "general")
                      }
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Back
                    </button>
                  )}

                  {activeTab !== "media" ? (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(activeTab === "general" ? "offers" : "media")
                      }
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Next</span>
                      <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      {submitting && <RefreshCw size={14} className="animate-spin" />}
                      <span>{isEditing ? "Save Changes" : "Create Poster"}</span>
                    </button>
                  )}
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default BrandPosters;

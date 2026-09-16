import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { useAuth } from "../context/AuthContext";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Upload,
  Link as LinkIcon,
  Eye,
  X,
  Search,
  Tag,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Image as ImageIcon,
  LayoutTemplate,
  Truck,
  ShieldCheck,
  RotateCcw,
  Palette,
  Check,
  Wand2,
  Scissors,
  Loader2,
  Flame,
  Trophy,
  Gift,
  Award,
  LayoutGrid
} from "lucide-react";
import { removeImageBackground } from "../utils/removeBackground";

const POPULAR_CATEGORIES = [
  { name: "Fashion", slug: "fashion", icon: "👗" },
  { name: "Electronics", slug: "electronics", icon: "⚡" },
  { name: "Beauty", slug: "beauty", icon: "💄" },
  { name: "Home & Kitchen", slug: "home-kitchen", icon: "🍳" },
  { name: "Furniture", slug: "furniture", icon: "🛋️" },
  { name: "Sports", slug: "sports", icon: "⚽" },
  { name: "Accessories", slug: "accessories", icon: "👜" },
  { name: "Gaming", slug: "gaming", icon: "🎮" },
  { name: "Books", slug: "books", icon: "📚" },
  { name: "Groceries", slug: "groceries", icon: "🥦" },
  { name: "Footwear", slug: "footwear", icon: "👟" },
  { name: "Jewellery", slug: "jewellery", icon: "💍" }
];

const BG_COLOR_PRESETS = [
  { label: "Soft Lavender", value: "#F6F4FF", textColor: "dark" },
  { label: "Clean White", value: "#FFFFFF", textColor: "dark" },
  { label: "Ice Blue", value: "#F0F9FF", textColor: "dark" },
  { label: "Warm Sand", value: "#FFFBEB", textColor: "dark" },
  { label: "Pastel Mint", value: "#F0FDF4", textColor: "dark" },
  { label: "Light Rose", value: "#FFF1F2", textColor: "dark" }
];

export const PLACEMENTS = [
  {
    id: "homepage",
    label: "Homepage Promo Ad",
    badgeLabel: "Homepage",
    badgeColor: "bg-blue-600/90 text-white",
    filterBadge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
    icon: Megaphone,
    description: "Main store homepage promotional banner.",
    defaults: {
      title: "Upgrade Your Digital Life",
      subtitle: "Top brands. Latest gadgets. Great prices.",
      tagline: "TECH FOR A BETTER TOMORROW",
      discountTag: "UP TO 50% OFF",
      ctaText: "Shop Electronics",
      linkUrl: "/product?category=electronics"
    }
  },
  {
    id: "trending_hero",
    label: "Trending Now Poster",
    badgeLabel: "Trending Now",
    badgeColor: "bg-amber-600/90 text-white",
    filterBadge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
    icon: Flame,
    description: "Hero poster for /catalog/collection/trending-now.",
    defaults: {
      title: "TRENDING NOW",
      subtitle: "Most wanted catalog items right now. Curated live from real-time customer views & order velocity.",
      tagline: "VIRAL SELECTION CAPSULE",
      discountTag: "HOT VIRAL DROPS",
      ctaText: "Explore Trending Drops",
      linkUrl: "/catalog/collection/trending-now"
    }
  },
  {
    id: "new_arrivals_hero",
    label: "New Arrivals Poster",
    badgeLabel: "New Arrivals",
    badgeColor: "bg-emerald-600/90 text-white",
    filterBadge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
    icon: Sparkles,
    description: "Hero poster for /catalog/collection/new-arrivals.",
    defaults: {
      title: "NEW ARRIVALS",
      subtitle: "Fresh styles & modern vibes. Explore handpicked weekly drops straight from verified designer catalogs.",
      tagline: "JUST RELEASED",
      discountTag: "FRESH DROPS",
      ctaText: "Explore Drops",
      linkUrl: "/catalog/collection/new-arrivals"
    }
  },
  {
    id: "best_sellers_hero",
    label: "Best Sellers Poster",
    badgeLabel: "Best Sellers",
    badgeColor: "bg-purple-600/90 text-white",
    filterBadge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40",
    icon: Trophy,
    description: "Hero poster for /catalog/collection/best-sellers.",
    defaults: {
      title: "BEST SELLERS",
      subtitle: "Top-rated, crowd-favorite essentials trusted and loved by thousands of verified shoppers.",
      tagline: "CUSTOMER FAVORITES",
      discountTag: "MOST LOVED",
      ctaText: "Shop Best Sellers",
      linkUrl: "/catalog/collection/best-sellers"
    }
  },
  {
    id: "festival_offers_hero",
    label: "Festival Offers Poster",
    badgeLabel: "Festival Offers",
    badgeColor: "bg-rose-600/90 text-white",
    filterBadge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40",
    icon: Gift,
    description: "Celebration deals poster for /catalog/collection/festival-offers.",
    defaults: {
      title: "FESTIVAL MEGA OFFERS",
      subtitle: "Celebrate big with extra discounts, exclusive gift bundles, and lightning fast delivery.",
      tagline: "SPECIAL CELEBRATION",
      discountTag: "FLAT 50% OFF",
      ctaText: "Claim Festival Deals",
      linkUrl: "/catalog/collection/festival-offers"
    }
  },
  {
    id: "categories_hero",
    label: "Categories Hero Model",
    badgeLabel: "Categories",
    badgeColor: "bg-indigo-600/90 text-white",
    filterBadge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40",
    icon: LayoutTemplate,
    description: "Top hero slideshow for /categories catalog page.",
    defaults: {
      title: "Shop by Category",
      subtitle: "Discover a wide range of products in your favorite categories. From everyday essentials to latest trends.",
      tagline: "EXPLORE. SHOP. BELONG.",
      discountTag: "",
      ctaText: "Start Shopping",
      linkUrl: "/categories"
    }
  },
  {
    id: "brands_hero",
    label: "Brands Spotlight Hero",
    badgeLabel: "Brands",
    badgeColor: "bg-cyan-600/90 text-white",
    filterBadge: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/40",
    icon: Award,
    description: "Spotlight header poster for the official /brands page.",
    defaults: {
      title: "Shop Official Brand Stores",
      subtitle: "Explore dedicated official partner storefronts with direct manufacturer warranties & verified catalogs.",
      tagline: "AUTHORIZED BRAND NETWORK",
      discountTag: "100% GENUINE",
      ctaText: "Explore Brands",
      linkUrl: "/brands"
    }
  },
  {
    id: "collections_hero",
    label: "Collections Hero Poster",
    badgeLabel: "Collections",
    badgeColor: "bg-teal-600/90 text-white",
    filterBadge: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/40",
    icon: LayoutGrid,
    description: "Header banner for the /collections showcase catalog.",
    defaults: {
      title: "Curated Collections",
      subtitle: "Explore handpicked capsules and seasonal aesthetics tailored for every occasion.",
      tagline: "EXCLUSIVE CURATIONS",
      discountTag: "LIMITED DROPS",
      ctaText: "Explore Collections",
      linkUrl: "/collections"
    }
  }
];

const PromoBanners = ({ token: propToken }) => {
  const { token: contextToken } = useAuth();
  const token = propToken || contextToken || localStorage.getItem("token") || "";

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [previewModalBanner, setPreviewModalBanner] = useState(null);
  const [previewModalImgIndex, setPreviewModalImgIndex] = useState(0);

  const handleOpenPreview = (banner) => {
    setPreviewModalBanner(banner);
    setPreviewModalImgIndex(0);
  };

  // Form state
  const [placement, setPlacement] = useState("homepage");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive"
  const [title, setTitle] = useState("Upgrade Your Digital Life");
  const [subtitle, setSubtitle] = useState("Top brands. Latest gadgets. Great prices.");
  const [tagline, setTagline] = useState("TECH FOR A BETTER TOMORROW");
  const [discountTag, setDiscountTag] = useState("UP TO 50% OFF");
  const [ctaText, setCtaText] = useState("Shop Electronics");
  const [linkUrl, setLinkUrl] = useState("/catalog/collection/festival-offers");
  const [displayMode, setDisplayMode] = useState("overlay"); // "overlay" | "full_image"
  const [theme, setTheme] = useState("dark"); // "dark" = dark text, "light" = light text
  const [bgColor, setBgColor] = useState("#F6F4FF");
  const [showPerks, setShowPerks] = useState(true);
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Multi-image state: support adding 1 or more images for the ad banner
  const [imageFiles, setImageFiles] = useState([]); // File[]
  const [existingImages, setExistingImages] = useState([]); // string[]
  const [previewImages, setPreviewImages] = useState([]); // Array<{ type: "file" | "url", src: string, file?: File, hasBgRemoved?: boolean }>
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // AI Background Removal state
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovalProgress, setBgRemovalProgress] = useState(0);
  const [bgRemovalStage, setBgRemovalStage] = useState("");
  const [removingIndex, setRemovingIndex] = useState(null);

  // Fetch all promo banners for admin
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/promo-banners`, {
        headers: { token }
      });
      if (res.data?.success) {
        setBanners(res.data.banners || []);
      } else {
        toast.error(res.data?.message || "Failed to load promo banners");
      }
    } catch (err) {
      console.error("Fetch banners error:", err);
      toast.error(err.response?.data?.message || "Error fetching promo banners");
    } finally {
      setLoading(false);
    }
  };

  const [dbCategories, setDbCategories] = useState([]);

  // Fetch categories for destination selector
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/categories`, {
          headers: { token }
        });
        if (res.data?.success && Array.isArray(res.data.categories)) {
          setDbCategories(res.data.categories);
        }
      } catch (err) {
        console.warn("Categories fetch error in PromoBanners:", err);
      }
    };
    if (token) {
      fetchCategories();
    }
  }, [token]);

  // Merge predefined popular categories with custom categories from DB
  const mergedCategories = useMemo(() => {
    const seen = new Set();
    const list = [];

    POPULAR_CATEGORIES.forEach((cat) => {
      const key = cat.name.toLowerCase().trim();
      seen.add(key);
      list.push(cat);
    });

    dbCategories.forEach((cat) => {
      if (cat && cat.name) {
        const key = cat.name.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            name: cat.name,
            slug: (cat.slug || cat.name).toLowerCase().replace(/\s+/g, "-"),
            icon: cat.icon || "🏷️"
          });
        }
      }
    });

    return list;
  }, [dbCategories]);

  useEffect(() => {
    if (token) {
      fetchBanners();
    }
  }, [token]);

  const handlePlacementChange = (targetPlacement) => {
    setPlacement(targetPlacement);
    const meta = PLACEMENTS.find((p) => p.id === targetPlacement);
    if (meta && !editingBanner) {
      setTitle(meta.defaults.title);
      setSubtitle(meta.defaults.subtitle);
      setTagline(meta.defaults.tagline);
      setDiscountTag(meta.defaults.discountTag);
      setCtaText(meta.defaults.ctaText);
      setLinkUrl(meta.defaults.linkUrl);
      setAutoRemoveBg(targetPlacement === "categories_hero");
    }
  };

  const openAddModal = (targetPlacement = "homepage") => {
    setEditingBanner(null);
    setPlacement(targetPlacement);
    const meta = PLACEMENTS.find((p) => p.id === targetPlacement) || PLACEMENTS[0];
    setTitle(meta.defaults.title);
    setSubtitle(meta.defaults.subtitle);
    setTagline(meta.defaults.tagline);
    setDiscountTag(meta.defaults.discountTag);
    setCtaText(meta.defaults.ctaText);
    setLinkUrl(meta.defaults.linkUrl);
    setAutoRemoveBg(targetPlacement === "categories_hero");
    setDisplayMode("overlay");
    setTheme("dark");
    setBgColor("#F6F4FF");
    setShowPerks(true);
    setOrder(0);
    setIsActive(true);
    setImageFiles([]);
    setExistingImages([]);
    setPreviewImages([]);
    setActivePreviewIndex(0);
    setImageUrlInput("");
    setIsRemovingBg(false);
    setBgRemovalProgress(0);
    setBgRemovalStage("");
    setRemovingIndex(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setPlacement(banner.placement || "homepage");
    setTitle(banner.title || "");
    setSubtitle(banner.subtitle || "");
    setTagline(banner.tagline || "");
    setDiscountTag(banner.discountTag || "");
    setCtaText(banner.ctaText || "Shop Electronics");
    setLinkUrl(banner.linkUrl || "/catalog/collection/festival-offers");
    setDisplayMode(banner.displayMode || "overlay");
    setTheme(banner.theme || "dark");
    setBgColor(banner.bgColor || "#F6F4FF");
    setShowPerks(banner.showPerks !== false);
    setOrder(banner.order || 0);
    setIsActive(Boolean(banner.isActive));
    setAutoRemoveBg(false);

    const bannerImgs = banner.images && Array.isArray(banner.images) && banner.images.length > 0
      ? banner.images
      : (banner.imageUrl ? [banner.imageUrl] : []);

    setImageFiles([]);
    setExistingImages(bannerImgs);
    setPreviewImages(bannerImgs.map((src) => ({ type: "url", src })));
    setActivePreviewIndex(0);
    setImageUrlInput("");
    setIsRemovingBg(false);
    setBgRemovalProgress(0);
    setBgRemovalStage("");
    setRemovingIndex(null);
    setIsModalOpen(true);
  };

  const handleImageChange = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    if (autoRemoveBg) {
      setIsRemovingBg(true);
      setBgRemovalProgress(0);
      setBgRemovalStage("Initializing on-device AI background remover...");

      const newFiles = [];
      const newPreviews = [];

      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];
        setBgRemovalStage(`Processing image ${i + 1} of ${selected.length}: ${file.name}...`);
        try {
          const { file: transparentFile, previewUrl } = await removeImageBackground(file, (pct, stage) => {
            setBgRemovalProgress(pct);
            if (stage) setBgRemovalStage(`[${i + 1}/${selected.length}] ${stage}`);
          });
          newFiles.push(transparentFile);
          newPreviews.push({
            type: "file",
            file: transparentFile,
            src: previewUrl,
            hasBgRemoved: true
          });
          toast.success(`Background removed: ${file.name} ✨`);
        } catch (err) {
          console.error("Auto BG removal failed for file, using original:", err);
          toast.warning(`Could not auto-remove BG for ${file.name}, using original.`);
          newFiles.push(file);
          newPreviews.push({
            type: "file",
            file,
            src: URL.createObjectURL(file),
            hasBgRemoved: false
          });
        }
      }

      setImageFiles((prev) => [...prev, ...newFiles]);
      setPreviewImages((prev) => [...prev, ...newPreviews]);
      setIsRemovingBg(false);
      setBgRemovalProgress(0);
      setBgRemovalStage("");
      e.target.value = "";
    } else {
      const newItems = selected.map((file) => ({
        type: "file",
        file,
        src: URL.createObjectURL(file),
        hasBgRemoved: false
      }));
      setImageFiles((prev) => [...prev, ...selected]);
      setPreviewImages((prev) => [...prev, ...newItems]);
      e.target.value = "";
    }
  };

  const handleRemoveBgForSingleImage = async (index) => {
    const target = previewImages[index];
    if (!target) return;

    setRemovingIndex(index);
    setIsRemovingBg(true);
    setBgRemovalProgress(0);
    setBgRemovalStage("AI stripping background to transparent PNG...");

    try {
      const source = target.type === "file" ? target.file : target.src;
      const { file: transparentFile, previewUrl } = await removeImageBackground(source, (pct, stage) => {
        setBgRemovalProgress(pct);
        if (stage) setBgRemovalStage(stage);
      });

      // Update previewImages
      setPreviewImages((prev) => {
        const copy = [...prev];
        copy[index] = {
          type: "file",
          file: transparentFile,
          src: previewUrl,
          hasBgRemoved: true
        };
        return copy;
      });

      // Update file lists
      if (target.type === "file") {
        setImageFiles((files) =>
          files.map((f) => (f === target.file ? transparentFile : f))
        );
      } else {
        setExistingImages((urls) => urls.filter((u) => u !== target.src));
        setImageFiles((files) => [...files, transparentFile]);
      }

      toast.success("Background stripped successfully! ✨ Transparent PNG cutout ready.");
    } catch (err) {
      console.error("Single image BG removal failed:", err);
      toast.error("Background removal failed. Please check image format or CORS.");
    } finally {
      setIsRemovingBg(false);
      setRemovingIndex(null);
      setBgRemovalProgress(0);
      setBgRemovalStage("");
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const itemToRemove = previewImages[indexToRemove];
    if (itemToRemove?.type === "file") {
      setImageFiles((files) => files.filter((f) => f !== itemToRemove.file));
    } else if (itemToRemove?.type === "url") {
      setExistingImages((urls) => urls.filter((u) => u !== itemToRemove.src));
    }
    setPreviewImages((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (activePreviewIndex >= next.length) {
        setActivePreviewIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const handleMoveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= previewImages.length) return;

    setPreviewImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, item);
      return copy;
    });

    setActivePreviewIndex(targetIndex);
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setExistingImages((prev) => [...prev, url]);
    setPreviewImages((prev) => [...prev, { type: "url", src: url }]);
    setImageUrlInput("");
  };

  const handleAddImageUrlWithBgRemoval = async () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setIsRemovingBg(true);
    setBgRemovalProgress(0);
    setBgRemovalStage("Fetching image & stripping background with AI...");
    try {
      const { file: transparentFile, previewUrl } = await removeImageBackground(url, (pct, stage) => {
        setBgRemovalProgress(pct);
        if (stage) setBgRemovalStage(stage);
      });
      setImageFiles((prev) => [...prev, transparentFile]);
      setPreviewImages((prev) => [
        ...prev,
        { type: "file", file: transparentFile, src: previewUrl, hasBgRemoved: true }
      ]);
      setImageUrlInput("");
      toast.success("Image added & background stripped to transparent PNG! ✨");
    } catch (err) {
      console.error("URL BG removal error:", err);
      toast.error("Could not remove BG from URL. Adding original image instead.");
      handleAddImageUrl();
    } finally {
      setIsRemovingBg(false);
      setBgRemovalProgress(0);
      setBgRemovalStage("");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.warning("Please provide a title for the banner");
      return;
    }

    if (previewImages.length === 0) {
      toast.warning("Please upload at least one image for the banner");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("subtitle", subtitle.trim());
      formData.append("tagline", tagline.trim());
      formData.append("discountTag", discountTag.trim());
      formData.append("ctaText", ctaText.trim());
      formData.append("linkUrl", linkUrl.trim());
      formData.append("placement", placement);
      formData.append("displayMode", displayMode);
      formData.append("theme", theme);
      formData.append("bgColor", bgColor);
      formData.append("showPerks", String(showPerks));
      formData.append("order", String(order));
      formData.append("isActive", String(isActive));

      // Append newly uploaded files
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Append clean existing image URLs (exclude client-local blob/data URLs)
      const cleanExistingImages = existingImages.filter(
        (url) => typeof url === "string" && !url.startsWith("blob:") && !url.startsWith("data:")
      );
      formData.append("existingImages", JSON.stringify(cleanExistingImages));

      // Set primary image URL if it is a permanent URL
      if (
        previewImages[0]?.src &&
        !previewImages[0].src.startsWith("blob:") &&
        !previewImages[0].src.startsWith("data:")
      ) {
        formData.append("imageUrl", previewImages[0].src);
      }

      const headers = { token };
      let res;
      if (editingBanner) {
        res = await axios.put(
          `${backendUrl}/api/promo-banners/${editingBanner._id}`,
          formData,
          { headers }
        );
      } else {
        res = await axios.post(
          `${backendUrl}/api/promo-banners`,
          formData,
          { headers }
        );
      }

      if (res.data?.success) {
        toast.success(editingBanner ? "Banner updated successfully" : "Banner created successfully");
        setIsModalOpen(false);
        fetchBanners();
      } else {
        toast.error(res.data?.message || "Failed to save banner");
      }
    } catch (err) {
      console.error("Save banner error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to save promotional banner");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (banner) => {
    // Optimistic UI update
    setBanners((prev) =>
      prev.map((b) => (b._id === banner._id ? { ...b, isActive: !b.isActive } : b))
    );

    try {
      const res = await axios.patch(
        `${backendUrl}/api/promo-banners/${banner._id}/status`,
        {},
        { headers: { token } }
      );
      if (res.data?.success) {
        toast.success(`Banner is now ${res.data.banner.isActive ? "active" : "inactive"}`);
      } else {
        toast.error(res.data?.message || "Could not toggle status");
        fetchBanners();
      }
    } catch (err) {
      console.error("Toggle banner error:", err);
      toast.error("Failed to update status");
      fetchBanners();
    }
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`Are you sure you want to delete banner "${banner.title}"?`)) {
      return;
    }

    try {
      const res = await axios.delete(`${backendUrl}/api/promo-banners/${banner._id}`, {
        headers: { token }
      });
      if (res.data?.success) {
        toast.success("Banner deleted successfully");
        setBanners((prev) => prev.filter((b) => b._id !== banner._id));
      } else {
        toast.error(res.data?.message || "Failed to delete banner");
      }
    } catch (err) {
      console.error("Delete banner error:", err);
      toast.error(err.response?.data?.message || "Failed to delete banner");
    }
  };

  const filteredBanners = useMemo(() => {
    let list = banners;
    if (placementFilter !== "all") {
      list = list.filter((b) => (b.placement || "homepage") === placementFilter);
    }
    if (statusFilter === "active") {
      list = list.filter((b) => b.isActive);
    } else if (statusFilter === "inactive") {
      list = list.filter((b) => !b.isActive);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.subtitle?.toLowerCase().includes(q) ||
        b.tagline?.toLowerCase().includes(q) ||
        b.discountTag?.toLowerCase().includes(q) ||
        b.placement?.toLowerCase().includes(q)
    );
  }, [banners, placementFilter, statusFilter, searchQuery]);

  const activeCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="space-y-4">
      {/* ── UNIFIED COMMAND HEADER WITH INTEGRATED METRICS & PRIMARY ACTION ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
              <Megaphone size={18} />
            </span>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Promotional Posters & Banners
            </h1>

            {/* Quick Live Stats Pills */}
            <div className="flex items-center gap-1.5 flex-wrap ml-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                <Layers size={11} className="text-slate-400" />
                <span>{banners.length} Total</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{activeCount} Live</span>
              </span>
              {banners.length - activeCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/40">
                  <Clock size={11} />
                  <span>{banners.length - activeCount} Draft</span>
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Manage promotional ads, seasonal sale hero posters, and catalog models across all pages from one unified studio.
          </p>
        </div>

        {/* Combined Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchBanners}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
            title="Refresh list"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-blue-600" : ""} />
          </button>

          <button
            onClick={() => openAddModal(placementFilter === "all" ? "homepage" : placementFilter)}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>Create Banner</span>
          </button>
        </div>
      </div>

      {/* ── UNIFIED FILTER TABS & SEARCH TOOLBAR ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Placement Filter Pill Tabs */}
        <div 
          className="flex flex-wrap items-center gap-1.5 no-scrollbar scrollbar-none max-w-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <button
            type="button"
            onClick={() => setPlacementFilter("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              placementFilter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <Layers size={13} className="shrink-0" />
            <span>All Placements</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                placementFilter === "all"
                  ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {banners.length}
            </span>
          </button>

          {PLACEMENTS.map((p) => {
            const count = banners.filter((b) => (b.placement || "homepage") === p.id).length;
            const Icon = p.icon;
            const isSelected = placementFilter === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlacementFilter(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                    : "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Icon size={13} className="shrink-0" />
                <span>{p.badgeLabel}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Status Filter & Search */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer shrink-0"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search banners..."
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 border border-slate-200 dark:border-slate-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Banner Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw size={28} className="animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading promotional banners...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <ImageIcon size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No banners found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
            {searchQuery
              ? "Try searching for a different keyword or clear your filters."
              : `Get started by creating your first banner for ${placementFilter !== "all" ? PLACEMENTS.find((p) => p.id === placementFilter)?.label || placementFilter : "your store"}.`}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => openAddModal(placementFilter === "all" ? "homepage" : placementFilter)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus size={15} />
              <span>Create {placementFilter !== "all" ? PLACEMENTS.find((p) => p.id === placementFilter)?.badgeLabel : ""} Banner</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredBanners.map((banner) => (
            <div
              key={banner._id}
              className={`bg-white dark:bg-slate-900 border ${
                banner.isActive
                  ? "border-slate-200/90 dark:border-slate-800"
                  : "border-slate-200/40 dark:border-slate-800/40 opacity-75"
              } rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
            >
              {/* Image Preview & Badges */}
              <div
                style={{ backgroundColor: banner.bgColor || "#F6F4FF" }}
                className="relative group overflow-hidden aspect-[21/9] sm:aspect-[24/9] flex items-center justify-between"
              >
                {banner.displayMode === "full_image" ? (
                  <img
                    src={(banner.images && banner.images[0]) || banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => handleOpenPreview(banner)}
                  />
                ) : (
                  <>
                    <div className="relative z-10 p-4 w-7/12 space-y-1">
                      {banner.tagline && (
                        <p className="text-[9px] font-black tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                          {banner.tagline}
                        </p>
                      )}
                      <h4
                        className={`text-sm sm:text-base font-black tracking-tight leading-tight ${
                          banner.theme === "light" ? "text-white" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {banner.title}
                      </h4>
                      {banner.subtitle && (
                        <p
                          className={`text-[10px] line-clamp-1 ${
                            banner.theme === "light" ? "text-slate-300" : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {banner.subtitle}
                        </p>
                      )}
                      <div className="pt-1">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold">
                          {banner.ctaText || "Shop Now"} &rarr;
                        </span>
                      </div>
                    </div>
                    <div className="w-5/12 h-full flex items-center justify-end overflow-hidden p-1">
                      <img
                        src={(banner.images && banner.images[0]) || banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-contain object-right group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => handleOpenPreview(banner)}
                      />
                    </div>
                  </>
                )}

                {/* Status Badges on Top */}
                <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 flex-wrap max-w-[80%]">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 backdrop-blur-md shadow-xs ${
                      banner.isActive
                        ? "bg-emerald-500/90 text-white"
                        : "bg-slate-800/90 text-slate-300"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        banner.isActive ? "bg-white animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    {banner.isActive ? "Live" : "Inactive"}
                  </span>

                  {(() => {
                    const placeMeta = PLACEMENTS.find((p) => p.id === (banner.placement || "homepage")) || PLACEMENTS[0];
                    return (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs ${placeMeta.badgeColor}`}
                      >
                        {placeMeta.badgeLabel}
                      </span>
                    );
                  })()}

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600/90 text-white backdrop-blur-md shadow-xs">
                    {banner.displayMode === "full_image" ? "Full Image" : "Text Overlay"}
                  </span>

                  {banner.discountTag && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600/90 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
                      <Tag size={9} />
                      {banner.discountTag}
                    </span>
                  )}

                  {banner.images && banner.images.length > 1 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-600/90 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
                      <Layers size={9} />
                      {banner.images.length} Images
                    </span>
                  )}
                </div>

                {/* Order badge */}
                <div className="absolute top-2.5 right-2.5 z-20">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-md">
                    #{banner.order ?? 0}
                  </span>
                </div>

                {/* Hover Quick Zoom Button */}
                <button
                  onClick={() => handleOpenPreview(banner)}
                  className="absolute bottom-2.5 right-2.5 z-20 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                  title="Full Preview"
                >
                  <Eye size={14} />
                </button>
              </div>

              {/* Banner Details Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      {banner.title}
                    </h3>
                  </div>

                  {banner.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {banner.subtitle}
                    </p>
                  )}

                  <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      <LinkIcon size={11} className="text-slate-400" />
                      <span className="truncate max-w-[180px]">{banner.linkUrl || "/product"}</span>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold">
                      <Sparkles size={11} />
                      <span>CTA: "{banner.ctaText || "Shop Now"}"</span>
                    </div>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={banner.isActive}
                        onChange={() => handleToggle(banner)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {banner.isActive ? "Active" : "Disabled"}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(banner)}
                      className="p-1.5 rounded-xl text-rose-600 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 transition cursor-pointer"
                      title="Delete banner"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Megaphone size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingBanner
                      ? `Edit ${PLACEMENTS.find((p) => p.id === placement)?.label || "Promotional Banner"}`
                      : `Create ${PLACEMENTS.find((p) => p.id === placement)?.label || "Promotional Banner"}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {PLACEMENTS.find((p) => p.id === placement)?.description || "Add background graphics, customize titles, perks, and promotional badges."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
              {/* Placement Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Banner Target Page / Location
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PLACEMENTS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = placement === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handlePlacementChange(p.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-2.5 ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {p.label}
                          </h4>
                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Display Mode Switcher */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Banner Presentation Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDisplayMode("overlay")}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                      displayMode === "overlay"
                        ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${displayMode === "overlay" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                      <LayoutTemplate size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dynamic Text Overlay</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Upload model/background image; CartNOW overlays live typography, button, badges, and perks.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setDisplayMode("full_image")}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                      displayMode === "full_image"
                        ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${displayMode === "full_image" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                      <ImageIcon size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Full Graphic Image</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Image already has all text and artwork embedded inside (pre-designed flyer).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Graphic Images Multi-Upload Area */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Banner Images ({previewImages.length}) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Add 1 or more model/product images &bull; Transparent PNGs blend with banner background
                    </span>
                  </div>

                  {/* AI Auto-Remove BG Switch */}
                  <button
                    type="button"
                    onClick={() => setAutoRemoveBg(!autoRemoveBg)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer select-none ${
                      autoRemoveBg
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                    title="Automatically remove background from uploaded photos using on-device AI"
                  >
                    <Sparkles size={13} className={autoRemoveBg ? "animate-pulse text-amber-300" : ""} />
                    <span>✨ AI Auto-Remove BG: {autoRemoveBg ? "ON" : "OFF"}</span>
                  </button>
                </div>

                {/* AI Progress Notification Bar */}
                {isRemovingBg && (
                  <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800/60 shadow-xs space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Loader2 size={15} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                          {bgRemovalStage || "AI is stripping background to transparent PNG..."}
                        </span>
                      </div>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {bgRemovalProgress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-indigo-100 dark:bg-indigo-900/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.max(5, bgRemovalProgress)}%` }}
                      />
                    </div>
                  </div>
                )}

                {previewImages.length > 0 ? (
                  <div className="space-y-3">
                    {/* Live Active Preview Frame (Seamless PNG Stage) */}
                    <div
                      style={{ backgroundColor: bgColor }}
                      className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[24/8] flex items-stretch justify-between shadow-inner p-3 sm:p-4"
                    >
                      {/* Left: Text copy preview */}
                      <div className="w-[50%] flex flex-col justify-center text-left z-10 space-y-1">
                        {tagline && (
                          <span className="inline-block text-[9px] font-black uppercase text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-slate-800 px-2 py-0.5 rounded w-fit">
                            ✨ {tagline}
                          </span>
                        )}
                        <h4 className="text-sm sm:text-base font-black text-slate-950 dark:text-white leading-tight truncate">
                          {title || "Main Headline"}
                        </h4>
                        {subtitle && (
                          <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                            {subtitle}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-black">
                            {ctaText || "Shop Now"} &rarr;
                          </span>
                          {discountTag && (
                            <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[9px] font-black uppercase">
                              🔥 {discountTag}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Seamless Model/PNG Cutout Stage */}
                      <div className="w-[48%] h-full flex items-end justify-center overflow-hidden gap-2">
                        {previewImages.slice(0, 4).map((img, pIdx) => (
                          <div
                            key={pIdx}
                            className="relative h-full flex items-end justify-center"
                            style={{
                              maxWidth:
                                previewImages.length === 1
                                  ? "90%"
                                  : previewImages.length === 2
                                  ? "48%"
                                  : previewImages.length === 3
                                  ? "32%"
                                  : "24%"
                            }}
                          >
                            <img
                              src={img.src}
                              alt={`Preview ${pIdx + 1}`}
                              className="max-h-full w-auto object-contain object-bottom select-none filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Badge showing active image count */}
                      <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
                        {previewImages[activePreviewIndex]?.hasBgRemoved && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white backdrop-blur-md flex items-center gap-1">
                            <Sparkles size={10} />
                            <span>Transparent Cutout</span>
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-md">
                          {previewImages.length} {previewImages.length === 1 ? "Image" : "Images"} Seamless
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail Gallery & Management Bar */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Click thumbnail to preview &bull; Use ✨ button to remove BG &bull; Arrows to reorder</span>
                        <span>{previewImages.length} {previewImages.length === 1 ? "image" : "images"}</span>
                      </div>

                      <div className="flex flex-wrap gap-2.5 items-center">
                        {previewImages.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActivePreviewIndex(idx)}
                            className={`relative group/thumb w-28 h-20 rounded-md overflow-hidden border-2 cursor-pointer transition-all bg-white dark:bg-slate-800 flex items-center justify-center p-1 ${
                              activePreviewIndex === idx
                                ? "border-blue-500 ring-2 ring-blue-500/30 shadow-md scale-105"
                                : "border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-90 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={img.src}
                              alt={`Thumb ${idx + 1}`}
                              className="max-w-full max-h-full w-auto h-auto object-contain object-center"
                            />

                            {/* Processing Spinner Overlay */}
                            {removingIndex === idx && (
                              <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center text-white z-20 gap-1 p-1 text-center">
                                <Loader2 size={16} className="animate-spin text-blue-400" />
                                <span className="text-[9px] font-bold text-blue-200">{bgRemovalProgress}%</span>
                              </div>
                            )}

                            {idx === 0 && (
                              <span className="absolute bottom-0 inset-x-0 bg-blue-600/90 text-white text-[8px] font-black uppercase text-center py-0.5 pointer-events-none">
                                Primary
                              </span>
                            )}

                            {/* Remove Background Action Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveBgForSingleImage(idx);
                              }}
                              disabled={isRemovingBg}
                              className="absolute top-0.5 left-0.5 px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] font-black opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:from-violet-700 hover:to-indigo-700 shadow cursor-pointer z-10 flex items-center gap-0.5"
                              title="Strip background using AI"
                            >
                              <Wand2 size={9} />
                              <span>Remove BG</span>
                            </button>

                            {/* Left / Right Reorder Controls */}
                            <div className="absolute inset-x-1 bottom-1 flex items-center justify-between opacity-0 group-hover/thumb:opacity-100 transition-opacity z-10">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveImage(idx, -1);
                                  }}
                                  className="w-5 h-5 rounded bg-slate-900/80 hover:bg-black text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-xs"
                                  title="Move Left"
                                >
                                  &larr;
                                </button>
                              )}
                              {idx < previewImages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveImage(idx, 1);
                                  }}
                                  className="w-5 h-5 rounded bg-slate-900/80 hover:bg-black text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-xs ml-auto"
                                  title="Move Right"
                                >
                                  &rarr;
                                </button>
                              )}
                            </div>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              className="absolute top-0.5 right-0.5 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-rose-700 shadow cursor-pointer z-10"
                              title="Remove this image"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}

                        {/* Add More Files Button */}
                        <label className="w-28 h-20 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 flex flex-col items-center justify-center gap-1 cursor-pointer bg-white dark:bg-slate-800/60 hover:bg-blue-50/20 text-slate-500 hover:text-blue-600 transition-colors">
                          <Plus size={16} />
                          <span className="text-[10px] font-bold">Add Image</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-950/50 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all">
                    <Upload size={24} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Click to upload banner image(s) (PNG, JPG, WebP)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {autoRemoveBg
                        ? "✨ AI Auto-Remove BG is active: solid backgrounds will be stripped automatically"
                        : "You can select multiple images at once (wide ratio recommended)"}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Add Image via URL */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">Or add via Image URL:</span>
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    placeholder="https://res.cloudinary.com/..."
                    className="flex-1 px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={!imageUrlInput.trim() || isRemovingBg}
                    className="px-3 py-1 text-xs font-bold rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white cursor-pointer transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={handleAddImageUrlWithBgRemoval}
                    disabled={!imageUrlInput.trim() || isRemovingBg}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white cursor-pointer transition-all shadow-xs"
                    title="Fetch URL and strip background to transparent PNG"
                  >
                    <Sparkles size={11} />
                    <span>Strip BG & Add</span>
                  </button>
                </div>
              </div>

              {/* Title & Tagline Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Main Headline <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Upgrade Your Digital Life"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Overline Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. TECH FOR A BETTER TOMORROW"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Subtitle / Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Subtitle / Subtext
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Top brands. Latest gadgets. Great prices."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Discount Tag & CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Discount Badge Tag
                  </label>
                  <input
                    type="text"
                    value={discountTag}
                    onChange={(e) => setDiscountTag(e.target.value)}
                    placeholder="e.g. UP TO 50% OFF"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Shop Electronics"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category / Destination Selection & Display Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Tag size={13} className="text-blue-600 dark:text-blue-400" />
                      <span>Category Selection / Destination</span>
                    </label>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Link banner to a category or collection
                    </span>
                  </div>

                  {/* Dual Selectors: Category Dropdown & Collection/Hub Dropdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Select Store Category
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setLinkUrl(`/product?category=${encodeURIComponent(e.target.value)}`);
                          }
                        }}
                        value={
                          linkUrl.startsWith("/product?category=")
                            ? decodeURIComponent(linkUrl.replace("/product?category=", ""))
                            : ""
                        }
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                      >
                        <option value="">-- Choose Category --</option>
                        {mergedCategories.map((cat) => (
                          <option key={cat.slug || cat.name} value={cat.slug || cat.name.toLowerCase()}>
                            {cat.icon ? `${cat.icon} ` : "🏷️ "}{cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Select Collection / Hub
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setLinkUrl(e.target.value);
                          }
                        }}
                        value={
                          [
                            "/catalog/collection/festival-offers",
                            "/catalog/collection/trending-now",
                            "/catalog/collection/new-arrivals",
                            "/catalog/collection/best-sellers",
                            "/categories",
                            "/brands",
                            "/collections",
                            "/product"
                          ].includes(linkUrl)
                            ? linkUrl
                            : ""
                        }
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                      >
                        <option value="">-- Choose Collection / Hub --</option>
                        <option value="/catalog/collection/festival-offers">🎁 Festival Offers</option>
                        <option value="/catalog/collection/trending-now">🔥 Trending Now</option>
                        <option value="/catalog/collection/new-arrivals">✨ New Arrivals</option>
                        <option value="/catalog/collection/best-sellers">🏆 Best Sellers</option>
                        <option value="/categories">📂 All Categories Hub</option>
                        <option value="/brands">🏢 All Brands Hub</option>
                        <option value="/collections">📦 All Collections Hub</option>
                        <option value="/product">🛍️ All Products Catalog</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Category Selection Chips */}
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Quick Category Selection:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {mergedCategories.map((cat) => {
                        const targetPath = `/product?category=${encodeURIComponent(cat.slug || cat.name.toLowerCase())}`;
                        const isSelected = linkUrl.toLowerCase() === targetPath.toLowerCase();
                        return (
                          <button
                            key={cat.name}
                            type="button"
                            onClick={() => setLinkUrl(targetPath)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-xs scale-105 ring-2 ring-blue-400"
                                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                            }`}
                          >
                            <span>{cat.icon || "🏷️"}</span>
                            <span>{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target URL Path Preview / Manual Override */}
                  <div className="pt-0.5">
                    <label className="block text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Target URL Path
                    </label>
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="/product?category=fashion"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Display Priority Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Background Color & Styling Options */}
              {displayMode === "overlay" && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Palette size={14} />
                      <span>Background Color Tone</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {BG_COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => {
                            setBgColor(preset.value);
                            setTheme(preset.textColor);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                            bgColor === preset.value
                              ? "border-blue-600 ring-2 ring-blue-500/20"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-slate-300"
                            style={{ backgroundColor: preset.value }}
                          />
                          <span className="text-slate-700 dark:text-slate-300">{preset.label}</span>
                          {bgColor === preset.value && <Check size={12} className="text-blue-600 ml-0.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">Show Feature Perks</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Displays "Free Delivery", "Secure Payments", and "Easy Returns" beside the button.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPerks}
                        onChange={(e) => setShowPerks(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Publish Live on Homepage</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    If active, this banner will be displayed to all shoppers on CartNOW.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white text-xs font-bold shadow-xs hover:shadow transition cursor-pointer"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving Banner...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>{editingBanner ? "Update Banner" : "Create Banner"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PREVIEW MODAL */}
      {previewModalBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewModalBanner(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalBanner(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/80 text-white hover:bg-slate-950 cursor-pointer shadow-lg"
            >
              <X size={18} />
            </button>
            {(() => {
              const modalImgs = previewModalBanner.images && previewModalBanner.images.length > 0
                ? previewModalBanner.images
                : [previewModalBanner.imageUrl].filter(Boolean);
              const activeImg = modalImgs[previewModalImgIndex] || modalImgs[0];
              return (
                <div className="space-y-3">
                  <div className="relative bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center min-h-[260px] max-h-[65vh]">
                    <img
                      src={activeImg}
                      alt={previewModalBanner.title}
                      className="max-h-[65vh] w-auto max-w-full object-contain"
                    />
                    {modalImgs.length > 1 && (
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-white">
                        Image {previewModalImgIndex + 1} of {modalImgs.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Row for Multiple Images */}
                  {modalImgs.length > 1 && (
                    <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-950/60 rounded-xl">
                      {modalImgs.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPreviewModalImgIndex(idx)}
                          className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            previewModalImgIndex === idx
                              ? "border-blue-500 ring-2 ring-blue-500/40 scale-105"
                              : "border-slate-700 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="p-4 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base">{previewModalBanner.title}</h4>
                <p className="text-xs text-slate-400">{previewModalBanner.tagline} &bull; {previewModalBanner.subtitle}</p>
              </div>
              <a
                href={previewModalBanner.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition"
              >
                <span>Test Link ({previewModalBanner.linkUrl})</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoBanners;

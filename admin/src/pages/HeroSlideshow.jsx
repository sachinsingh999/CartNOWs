import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import {
  Megaphone,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Image as ImageIcon,
  Pencil,
  X,
  GripVertical,
  Sparkles,
  Wand2,
  Loader2
} from "lucide-react";

// Inline axios definition to avoid any typos
const axiosClient = axios;

// Utility: Flood-fill starting from borders to detect & remove solid white/gray and fake checkerboards
const removeBackgroundFromImage = (imageElement) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  ctx.drawImage(imageElement, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const width = canvas.width;
  const height = canvas.height;

  const visited = new Uint8Array(width * height);
  const queue = [];

  // Sample corner pixel colors (only if they are not already transparent)
  const corners = [];
  const sampleCorner = (x, y) => {
    const idx = (y * width + x) * 4;
    const a = data[idx + 3];
    if (a > 15) {
      corners.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2]
      });
    }
  };

  // Sample multiple points near the top and side borders to build a comprehensive background color palette
  sampleCorner(0, 0);
  sampleCorner(5, 5);
  sampleCorner(width - 1, 0);
  sampleCorner(width - 6, 5);
  sampleCorner(0, 10);
  sampleCorner(width - 1, 10);

  // Sample points at 25%, 50%, and 75% height on the left and right edges
  const h25 = Math.floor(height * 0.25);
  const h50 = Math.floor(height * 0.50);
  const h75 = Math.floor(height * 0.75);
  sampleCorner(0, h25);
  sampleCorner(width - 1, h25);
  sampleCorner(0, h50);
  sampleCorner(width - 1, h50);
  sampleCorner(0, h75);
  sampleCorner(width - 1, h75);

  // Sample bottom corners as well, avoiding the middle area where the model stands
  sampleCorner(0, height - 1);
  sampleCorner(5, height - 6);
  sampleCorner(width - 1, height - 1);
  sampleCorner(width - 6, height - 6);

  // Sample points along the top edge
  const w25 = Math.floor(width * 0.25);
  const w50 = Math.floor(width * 0.50);
  const w75 = Math.floor(width * 0.75);
  sampleCorner(w25, 0);
  sampleCorner(w50, 0);
  sampleCorner(w75, 0);

  // Helper to check color distance from sampled corners
  const isColorCloseToCorners = (r, g, b) => {
    if (corners.length === 0) return false;
    for (const c of corners) {
      // Manhattan distance
      const dist = Math.abs(r - c.r) + Math.abs(g - c.g) + Math.abs(b - c.b);
      // Tolerance of 75 accommodates compression noise and gradients safely without bleeding
      if (dist < 75) return true;
    }
    return false;
  };

  // Add top, left, and right border pixels to queue fully
  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    visited[x] = 1;
  }
  
  for (let y = 1; y < height - 1; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
    visited[y * width] = 1;
    visited[(width - 1) + y * width] = 1;
  }

  // Add the bottom border partially (left 15% and right 15%) to avoid model foot/torso seeding
  const bottomMargin = Math.floor(width * 0.15);
  for (let x = 0; x < bottomMargin; x++) {
    const idxLeft = x + (height - 1) * width;
    if (!visited[idxLeft]) {
      queue.push(x, height - 1);
      visited[idxLeft] = 1;
    }
    const rightX = width - 1 - x;
    const idxRight = rightX + (height - 1) * width;
    if (!visited[idxRight]) {
      queue.push(rightX, height - 1);
      visited[idxRight] = 1;
    }
  }

  // Helper to identify if a pixel color matches our background color profile
  const isBgPixel = (r, g, b, a) => {
    if (a < 15) return true; // Already transparent

    // Check match against sampled corner colors
    if (isColorCloseToCorners(r, g, b)) return true;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    // Saturation check for gray checkerboard squares (darker squares)
    if (diff < 28 && max > 85) return true;

    // Solid white/near-white backgrounds with compression noise
    if (max > 220 && diff < 35) return true;

    return false;
  };

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    if (isBgPixel(r, g, b, a)) {
      // Clear the background pixel (fully transparent)
      data[idx] = 0;
      data[idx + 1] = 0;
      data[idx + 2] = 0;
      data[idx + 3] = 0;

      // Check 4-connected neighbors
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = ny * width + nx;
          if (!visited[nidx]) {
            visited[nidx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
};

const HeroSlideshow = ({ token }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [sortBy, setSortBy] = useState("dateNewest"); // default sort is date-wise (newest first)

  // Compute sorted list of campaign assets based on active sort selector
  const sortedAssets = useMemo(() => {
    const list = [...assets];
    if (sortBy === "dateNewest") {
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (sortBy === "dateOldest") {
      return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    // "custom" - sort by order index, then by creation date descending
    return list.sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [assets, sortBy]);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (index) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const reorderedAssets = [...sortedAssets];
    const [removed] = reorderedAssets.splice(draggedIndex, 1);
    reorderedAssets.splice(index, 0, removed);

    setAssets(reorderedAssets);
    setDraggedIndex(null);

    try {
      const orderIds = reorderedAssets.map((asset) => asset._id);
      const response = await axiosClient.put(
        `${backendUrl}/api/system/hero-assets/reorder`,
        { orderIds },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Slides reordered successfully! 🚀");
      } else {
        toast.error(response.data.message || "Failed to save slide order");
        fetchAssets();
      }
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("Failed to reorder slide list");
      fetchAssets();
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [tagline, setTagline] = useState("");
  const [dbCategories, setDbCategories] = useState([]);

  // Image and processing states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [editingAsset, setEditingAsset] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [aiTitleLoading, setAiTitleLoading] = useState(false);

  const handleAIGenerateTitle = async () => {
    setAiTitleLoading(true);
    try {
      const response = await axiosClient.post(
        `${backendUrl}/api/system/hero-assets/ai-generate-title`,
        { category, currentTitle: name, currentTagline: tagline },
        { headers: { token } }
      );

      if (response.data.success) {
        if (response.data.title) {
          setName(response.data.title);
        }
        if (response.data.tagline && (!tagline || tagline.trim() === "")) {
          setTagline(response.data.tagline);
        }
        toast.success(`✨ Generated Title: "${response.data.title}"`);
      } else {
        toast.error(response.data.message || "Failed to generate AI title");
      }
    } catch (error) {
      console.error("AI Title generation error:", error);
      const localPresets = {
        "Fashion": [
          { title: "Pastel Summer Silhouette", tagline: "Effortless grace for the sun-kissed season." },
          { title: "Urban Streetwear Edge", tagline: "Contemporary aesthetic crafted for city rhythms." },
          { title: "Modern Minimalist Silhouette", tagline: "Clean lines and understated luxury." },
          { title: "Haute Couture Evening Edit", tagline: "Elevate your signature presence with timeless charm." }
        ],
        "Men's Fashion": [
          { title: "Sharp Tailored Essentials", tagline: "Refined sartorial precision for the modern gentleman." },
          { title: "Urban Utility Streetwear", tagline: "Durable performance meets effortless contemporary style." }
        ],
        "Women's Fashion": [
          { title: "Ethereal Flora Bloom", tagline: "Breezy silhouettes woven with delicate grace." },
          { title: "Luxe Evening Radiance", tagline: "Sophisticated glam engineered to captivate every room." }
        ],
        "Kids Collection": [
          { title: "Playful Explorer Fits", tagline: "Ultra-comfy, vibrant styles crafted for non-stop adventure." },
          { title: "Tiny Trendsetters Edit", tagline: "Adorable, durable fashion for little dreamers." }
        ],
        "Footwear": [
          { title: "AeroGlide Runner Pro", tagline: "Next-gen responsiveness engineered for every stride." },
          { title: "Urban Street High-Tops", tagline: "Iconic court legacy refined for everyday dominance." },
          { title: "Crafted Leather Loafers", tagline: "Timeless artisanal silhouette for effortless sophistication." }
        ],
        "Sneakers & Athletic": [
          { title: "HyperBoost Stride Elite", tagline: "Engineered cushioning for high-intensity movement." },
          { title: "Retro Court High-Top", tagline: "Vintage hoops aesthetic reimagined for modern streets." }
        ],
        "Electronics": [
          { title: "Next-Gen Pro Flagship", tagline: "Uncompromised performance engineered for tomorrow." },
          { title: "Acoustic Noise-Cancelling Pro", tagline: "Studio-master sound with immersive spatial depth." },
          { title: "Ultra-Slim OLED Horizon", tagline: "Hyper-vivid colors and cinematic infinite contrast." }
        ],
        "Smartphones & Mobile": [
          { title: "Titanium Cyber Flagship", tagline: "Computational photography and blazing all-day power." },
          { title: "Foldable Horizon Pro", tagline: "Expansive multitasking in an ultra-sleek form factor." }
        ],
        "Audio & Headphones": [
          { title: "Studio Spatial Pro ANC", tagline: "Zero distractions with high-fidelity lossless sound." },
          { title: "True Wireless Pulse Pods", tagline: "Pocket-sized acoustics built for all-day commutes." }
        ],
        "Smartwatches & Wearables": [
          { title: "BioSync Pro Health Titan", tagline: "Precision telemetry tracking every milestone 24/7." },
          { title: "Sapphire Smart Chrono", tagline: "Elegance on the wrist with next-gen connected intelligence." }
        ],
        "Gaming & Consoles": [
          { title: "Ray-Tracing Console Beast", tagline: "Ultra-fluid 120fps gaming with Tempest 3D immersion." },
          { title: "Mechanical RGB Battlestation", tagline: "Ultra-fast actuation and tactile mastery." }
        ],
        "Beauty": [
          { title: "Radiant Dew Glow Serum", tagline: "Infused with botanical botanicals for a flawless natural finish." },
          { title: "Velvet Matte Luxe Palette", tagline: "High-pigment shades that stay vibrant from dusk till dawn." }
        ],
        "Beauty & Cosmetics": [
          { title: "Golden Hour Glow Edit", tagline: "Luminous, glass-skin radiance powered by active nutrients." },
          { title: "Silk Touch Hydration Elixir", tagline: "Deep cellular moisture with a weightless velvety texture." }
        ],
        "Perfumes & Fragrances": [
          { title: "Oud Royale Extrait", tagline: "Rich amber, smoky cedar, and royal vanilla projection." },
          { title: "Oceanic Breeze Pure Parfum", tagline: "Crisp bergamot and Mediterranean sea salt freshness." }
        ],
        "Fitness": [
          { title: "Endurance Pro Rig", tagline: "Heavy-duty construction built to break personal records." },
          { title: "Smart Kinetic Resistance", tagline: "Dynamic resistance technology for full-body conditioning." }
        ],
        "Sports & Outdoor": [
          { title: "All-Terrain Alpine Pack", tagline: "Weatherproof rugged gear engineered for the wild trail." },
          { title: "Pro Velocity Road Bike", tagline: "Ultralight carbon aerodynamics for maximum speed." }
        ],
        "Home & Lifestyle": [
          { title: "Scandinavian Oak Living", tagline: "Minimalist warmth crafted for mindful, serene spaces." },
          { title: "Smart Culinary Pro", tagline: "Precision temperature control for restaurant-grade cooking." }
        ],
        "Kitchen & Dining": [
          { title: "Chef Edition Cast Iron", tagline: "Superior heat retention built for generations of flavor." },
          { title: "Artisan Ceramic Tableware", tagline: "Handcrafted rustic textures elevating every meal." }
        ],
        "Accessories": [
          { title: "Handcrafted Italian Leather", tagline: "Full-grain vegetable-tanned luxury built to age gracefully." },
          { title: "Chrono Heritage Timepiece", tagline: "Automatic precision movement inside surgical stainless steel." }
        ],
        "Jewelry & Fine Accessories": [
          { title: "Luminescent Diamond Solitaire", tagline: "Brilliant cut perfection catching light at every angle." },
          { title: "18K Gold Sculptural Cuff", tagline: "Bold geometric modernism with an exquisite high-polish sheen." }
        ],
        "Luxury Watches": [
          { title: "Swiss Automatic Chronograph", tagline: "Master horology engineered with sapphire crystal clarity." },
          { title: "Ceramic Diver Pro 300M", tagline: "Indestructible nautical toughness with luminous markers." }
        ],
        "Bags, Backpacks & Luggage": [
          { title: "Nomad Carry-On Spinner", tagline: "Aerospace polycarbonate shell with whisper-quiet wheels." },
          { title: "Waterproof Commuter Rolltop", tagline: "Weatherproof urban utility with dedicated tech compartments." }
        ]
      };
      const list = localPresets[category] || localPresets["Fashion"];
      const pick = list[Math.floor(Math.random() * list.length)];
      setName(pick.title);
      if (!tagline) setTagline(pick.tagline);
      toast.success(`✨ Generated Title: "${pick.title}"`);
    } finally {
      setAiTitleLoading(false);
    }
  };

  const startEdit = (asset) => {
    setEditingAsset(asset);
    setName(asset.name);
    setCategory(asset.category);
    setTagline(asset.tagline);
    setImagePreview(asset.imageUrl.startsWith("http") ? asset.imageUrl : `${backendUrl}${asset.imageUrl}`);
    setImageFile(null);
  };

  const cancelEdit = () => {
    setEditingAsset(null);
    setName("");
    setCategory("Fashion");
    setIsCustomCategory(false);
    setTagline("");
    setImagePreview("");
    setImageFile(null);
  };

  const handleToggleActive = async (asset) => {
    try {
      const response = await axiosClient.put(
        `${backendUrl}/api/system/hero-assets/${asset._id}`,
        { isActive: !asset.isActive },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`Branding asset ${!asset.isActive ? "activated" : "deactivated"} successfully!`);
        fetchAssets();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const DEFAULT_CATEGORIES = [
    // Popular Core
    "Fashion",
    "Footwear",
    "Electronics",
    "Beauty",
    "Fitness",
    "Accessories",
    "Home & Lifestyle",
    "Kids Collection",

    // Apparel & Fashion
    "Men's Fashion",
    "Women's Fashion",
    "Streetwear & Urban",
    "Ethnic & Traditional",
    "Winter & Outerwear",
    "Activewear & Sportswear",

    // Footwear & Sneakers
    "Sneakers & Athletic",
    "Casual Shoes",
    "Formal Shoes",
    "Boots & Outdoor",

    // Electronics & Tech
    "Smartphones & Mobile",
    "Audio & Headphones",
    "Laptops & Computers",
    "Smartwatches & Wearables",
    "Gaming & Consoles",
    "Cameras & Photography",
    "Smart Home & Tech Gadgets",

    // Beauty & Grooming
    "Beauty & Cosmetics",
    "Skincare & Bodycare",
    "Haircare & Styling",
    "Perfumes & Fragrances",
    "Men's Grooming",

    // Home, Living & Kitchen
    "Kitchen & Dining",
    "Furniture & Living",
    "Home Decor & Lighting",
    "Bedding & Bath",
    "Home Appliances",

    // Fitness, Sports & Adventure
    "Fitness & Gym",
    "Sports & Outdoor",
    "Cycling & Bicycles",
    "Camping & Adventure",

    // Accessories & Luxury
    "Jewelry & Fine Accessories",
    "Luxury Watches",
    "Bags, Backpacks & Luggage",
    "Eyewear & Sunglasses",

    // Groceries, Essentials & Hobbies
    "Books & Stationery",
    "Toys & Baby Care",
    "Groceries & Gourmet",
    "Pet Supplies",
    "Health & Wellness",
    "Automotive & Tools",
    "Gifts & Festive"
  ];

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`${backendUrl}/api/system/hero-assets?admin=true`, { headers: { token } });
      if (response.data.success) {
        setAssets(response.data.assets);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Fetch hero assets error:", error);
      toast.error(error.response?.data?.message || "Failed to load hero assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();

    // Fetch dynamic store categories from database
    axiosClient.get(`${backendUrl}/api/product/categories`)
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.categories)) {
          const names = res.data.categories
            .map(c => typeof c === "string" ? c : c?.name)
            .filter(Boolean);
          setDbCategories(names);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch store categories:", err?.message);
      });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
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

  const handleRemoveBg = async () => {
    if (!imageFile) return toast.warning("Please upload an image first");
    setProcessing(true);
    toast.info("Applying remove.bg background removal... 🪄");
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await axiosClient.post(
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
        setImageFile(new File([blob], `hero_no_bg.png`, { type: "image/png" }));

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warning("Asset Name/Title is required");
    if (!imageFile && !editingAsset) return toast.warning("Please select a transparent image file");

    setUploading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("tagline", tagline);

    // Determine whether to use original image, only if new image was selected
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const url = editingAsset
        ? `${backendUrl}/api/system/hero-assets/${editingAsset._id}`
        : `${backendUrl}/api/system/hero-assets`;

      const method = editingAsset ? "put" : "post";

      const response = await axiosClient({
        method,
        url,
        data: formData,
        headers: {
          token,
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        toast.success(editingAsset ? "Hero branding asset updated successfully!" : "Hero branding asset uploaded successfully!");
        cancelEdit();
        fetchAssets();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign asset?")) return;

    try {
      const response = await axiosClient.delete(
        `${backendUrl}/api/system/hero-assets/${id}`,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Asset deleted successfully");
        fetchAssets();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Deletion failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Campaign Presentation
          </p>
          <div className="flex items-center gap-2.5 mt-1">
            <Megaphone size={18} className="text-indigo-500" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Hero Asset Slideshow</h2>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Manage transparent branding campaign cutout assets live on homepage hero
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Upload Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingAsset ? "Edit Branding Asset" : "Add Branding Asset"}
              </h3>
            </div>
            {editingAsset && (
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
            {/* Image Upload Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Transparent PNG / WebP Image
              </label>

              {imagePreview ? (
                <div className="space-y-2 text-left">
                  <div className="relative group rounded-xl border border-dashed border-slate-300 dark:border-white/[0.1] overflow-hidden flex flex-col items-center justify-center p-4 min-h-[220px]">
                     {/* Checkerboard Background Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] bg-slate-50 dark:bg-slate-900 dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] z-0" />

                    {processing ? (
                      <div className="relative z-10 flex flex-col items-center gap-1.5 text-[11px] text-slate-400 font-bold bg-white/80 dark:bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
                        <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span>Processing background...</span>
                      </div>
                    ) : (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="relative z-10 max-h-[160px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] animate-fade-in"
                      />
                    )}

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
                    className="w-full py-1.5 rounded-lg border border-indigo-500/30 dark:border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-600 disabled:opacity-50 text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {processing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span>Removing Background...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={11} />
                        <span>Remove Background</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-white/[0.08] hover:border-indigo-500 dark:hover:border-indigo-500/80 rounded-xl cursor-pointer py-8 px-4 text-center bg-slate-50 dark:bg-slate-900/50 transition duration-200 min-h-[170px]">
                    <Upload size={24} className="text-slate-400 dark:text-slate-500 animate-pulse" />
                    <span className="mt-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">Click to upload file</span>
                    <span className="mt-0.5 text-[9.5px] text-slate-400 dark:text-slate-500">JPEG / PNG / WebP</span>
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

            {/* Title / Name with AI Generator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Asset Name / Title
                </label>
                <button
                  type="button"
                  onClick={handleAIGenerateTitle}
                  disabled={aiTitleLoading}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-indigo-700 text-white text-[10px] font-black uppercase tracking-wider shadow-xs hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 border-none"
                  title="Generate creative campaign title & tagline using AI"
                >
                  <Sparkles size={11} className={aiTitleLoading ? "animate-spin" : ""} />
                  <span>{aiTitleLoading ? "Generating..." : "AI Generate"}</span>
                </button>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Urban Streetwear Model"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition dark: font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              />
            </div>

            {/* Category Dropdown & Custom Category Option */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategory(!isCustomCategory);
                    if (!isCustomCategory && !category) setCategory("");
                  }}
                  className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {isCustomCategory ? "← Choose From List" : "+ Custom Category"}
                </button>
              </div>

              {isCustomCategory ? (
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter custom category (e.g. Vintage Leather, Summer Sale)"
                  className="w-full px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setIsCustomCategory(true);
                      setCategory("");
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  <optgroup label="Popular & Active">
                    <option value="Fashion">Fashion</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home & Lifestyle">Home & Lifestyle</option>
                    <option value="Kids Collection">Kids Collection</option>
                  </optgroup>

                  <optgroup label="Apparel & Fashion">
                    <option value="Men's Fashion">Men's Fashion</option>
                    <option value="Women's Fashion">Women's Fashion</option>
                    <option value="Streetwear & Urban">Streetwear & Urban</option>
                    <option value="Ethnic & Traditional">Ethnic & Traditional</option>
                    <option value="Winter & Outerwear">Winter & Outerwear</option>
                    <option value="Activewear & Sportswear">Activewear & Sportswear</option>
                  </optgroup>

                  <optgroup label="Footwear & Sneakers">
                    <option value="Sneakers & Athletic">Sneakers & Athletic</option>
                    <option value="Casual Shoes">Casual Shoes</option>
                    <option value="Formal Shoes">Formal Shoes</option>
                    <option value="Boots & Outdoor">Boots & Outdoor</option>
                  </optgroup>

                  <optgroup label="Electronics & Tech">
                    <option value="Smartphones & Mobile">Smartphones & Mobile</option>
                    <option value="Audio & Headphones">Audio & Headphones</option>
                    <option value="Laptops & Computers">Laptops & Computers</option>
                    <option value="Smartwatches & Wearables">Smartwatches & Wearables</option>
                    <option value="Gaming & Consoles">Gaming & Consoles</option>
                    <option value="Cameras & Photography">Cameras & Photography</option>
                    <option value="Smart Home & Tech Gadgets">Smart Home & Tech Gadgets</option>
                  </optgroup>

                  <optgroup label="Beauty & Personal Care">
                    <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                    <option value="Skincare & Bodycare">Skincare & Bodycare</option>
                    <option value="Haircare & Styling">Haircare & Styling</option>
                    <option value="Perfumes & Fragrances">Perfumes & Fragrances</option>
                    <option value="Men's Grooming">Men's Grooming</option>
                  </optgroup>

                  <optgroup label="Home, Living & Appliances">
                    <option value="Kitchen & Dining">Kitchen & Dining</option>
                    <option value="Furniture & Living">Furniture & Living</option>
                    <option value="Home Decor & Lighting">Home Decor & Lighting</option>
                    <option value="Bedding & Bath">Bedding & Bath</option>
                    <option value="Home Appliances">Home Appliances</option>
                  </optgroup>

                  <optgroup label="Sports, Fitness & Adventure">
                    <option value="Fitness & Gym">Fitness & Gym</option>
                    <option value="Sports & Outdoor">Sports & Outdoor</option>
                    <option value="Cycling & Bicycles">Cycling & Bicycles</option>
                    <option value="Camping & Adventure">Camping & Adventure</option>
                  </optgroup>

                  <optgroup label="Luxury & Accessories">
                    <option value="Jewelry & Fine Accessories">Jewelry & Fine Accessories</option>
                    <option value="Luxury Watches">Luxury Watches</option>
                    <option value="Bags, Backpacks & Luggage">Bags, Backpacks & Luggage</option>
                    <option value="Eyewear & Sunglasses">Eyewear & Sunglasses</option>
                  </optgroup>

                  <optgroup label="Essentials & Lifestyle">
                    <option value="Books & Stationery">Books & Stationery</option>
                    <option value="Toys & Baby Care">Toys & Baby Care</option>
                    <option value="Groceries & Gourmet">Groceries & Gourmet</option>
                    <option value="Pet Supplies">Pet Supplies</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Automotive & Tools">Automotive & Tools</option>
                    <option value="Gifts & Festive">Gifts & Festive</option>
                  </optgroup>

                  {dbCategories.filter(c => !DEFAULT_CATEGORIES.includes(c)).length > 0 && (
                    <optgroup label="Store Database Categories">
                      {dbCategories.filter(c => !DEFAULT_CATEGORIES.includes(c)).map((cat, idx) => (
                        <option key={`db_${idx}`} value={cat}>{cat}</option>
                      ))}
                    </optgroup>
                  )}

                  <option value="__custom__">+ Enter Custom Category...</option>
                </select>
              )}
            </div>

            {/* Tagline */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Tagline / Subtext (Optional)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Modern Minimalist Silhouette"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs outline-none transition dark: font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={uploading || processing}
                className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-100 dark:text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 transition-all duration-200 border-none cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/10 dark:border-slate-800 border-t-transparent rounded-full animate-spin" />
                    <span>{editingAsset ? "Saving Changes..." : "Uploading Campaign..."}</span>
                  </>
                ) : (
                  <span>{editingAsset ? "Save Changes" : "Publish Asset"}</span>
                )}
              </button>

              {editingAsset && (
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

          {/* Guidelines */}
          <div className="bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl p-3.5 space-y-2 text-[10px] leading-relaxed text-indigo-700 dark:text-indigo-400 font-medium">
            <div className="flex gap-1.5 items-center font-black uppercase tracking-wider text-[9px]">
              <AlertCircle size={12} />
              <span>Asset Requirements</span>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li>Must have a **pure transparent background** when published.</li>
              <li>Supports **JPEG**, **PNG**, and **WebP** upload formats.</li>
              <li>Integrated **flood-fill background remover** ensures clean edges.</li>
              <li>High-resolution professional photography only.</li>
            </ul>
          </div>
        </div>

        {/* Assets List Grid */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs min-h-[500px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Branding Campaigns</h3>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[11px] font-bold outline-none cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                  >
                    <option value="dateNewest">Date: Newest First</option>
                    <option value="dateOldest">Date: Oldest First</option>
                    <option value="custom">Custom (Drag & Drop)</option>
                  </select>
                </div>
                
                <span className="rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 px-3.5 py-1">
                  {assets.length} Published
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-bold">Fetching campaign listings...</span>
              </div>
            ) : assets.length === 0 ? (
              <div className="flex-1 border border-dashed border-slate-200 dark:border-white/[0.06] rounded-xl flex flex-col items-center justify-center text-center p-12 text-xs text-slate-400">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900/80 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-800 mb-3">
                  <ImageIcon size={18} />
                </div>
                <p className="font-black text-slate-800 dark:text-slate-200">No Custom Campaign Assets Uploaded</p>
                <p className="max-w-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-normal">
                  The homepage slider will fall back to using default premium design assets automatically. Upload custom transparent cutout assets on the left to personalize your store!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedAssets.map((asset, index) => {
                  const cardImageUrl = asset.imageUrl.startsWith("http")
                    ? asset.imageUrl
                    : `${backendUrl}${asset.imageUrl}`;

                  return (
                    <div
                      key={asset._id}
                      draggable={sortBy === "custom"}
                      onDragStart={sortBy === "custom" ? () => handleDragStart(index) : undefined}
                      onDragOver={sortBy === "custom" ? handleDragOver : undefined}
                      onDrop={sortBy === "custom" ? () => handleDrop(index) : undefined}
                      onDragEnd={sortBy === "custom" ? handleDragEnd : undefined}
                      className={`group bg-slate-50 dark:bg-slate-900/50 border rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition duration-200 flex flex-col ${ sortBy === "custom" ? "cursor-grab active:cursor-grabbing" : "" } ${ draggedIndex === index ? "opacity-45 border-dashed border-indigo-500 scale-95 shadow-lg bg-indigo-50/5 dark:bg-indigo-950/5" : "border-slate-200/50 dark:border-white/[0.05]" }`}
                    >
                      {/* Image Preview with checkered background */}
                      <div className="relative h-[160px] flex items-center justify-center border-b border-slate-100 dark:border-white/[0.05] overflow-hidden p-3 shrink-0">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:12px_12px] bg-[position:0_0,0_6px,6px_-6px,-6px_0] bg-white dark:bg-slate-950 dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)]" />
                        <img
                          src={cardImageUrl}
                          alt={asset.name}
                          className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {sortBy === "custom" && (
                            <div
                              className="bg-slate-800 hover:bg-slate-800 text-slate-100 dark:text-white rounded-lg p-1.5 shadow-sm flex items-center justify-center cursor-grab active:cursor-grabbing border border-slate-700"
                              title="Drag to reorder slide"
                            >
                              <GripVertical size={13} />
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(asset); }}
                            className="bg-indigo-500 hover:bg-indigo-600 text-slate-100 dark:text-white rounded-lg p-1.5 shadow-sm border-none cursor-pointer flex items-center justify-center"
                            title="Edit asset"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset._id); }}
                            className="bg-rose-500 hover:bg-rose-600 text-slate-100 dark:text-white rounded-lg p-1.5 shadow-sm border-none cursor-pointer flex items-center justify-center"
                            title="Delete asset"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Details Info */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest border border-indigo-500/10">
                              {asset.category}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2 tracking-tight truncate">
                            {asset.name}
                          </h4>
                          {asset.tagline && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                              {asset.tagline}
                            </p>
                          )}
                        </div>
                        <div className="text-[10px] border-t border-slate-100 dark:border-white/[0.04] pt-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={11} className={asset.isActive ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"} />
                            <span className={asset.isActive ? "text-slate-700 dark:text-slate-300 font-bold" : "text-slate-400 dark:text-slate-500"}>
                              {asset.isActive ? "Active Campaign" : "Inactive"}
                            </span>
                          </div>
                          <label className="flex items-center gap-1 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!asset.isActive}
                              onChange={() => handleToggleActive(asset)}
                              className="w-3.5 h-3.5 text-indigo-600 border-slate-300 dark:border-white/[0.08] rounded-xs accent-indigo-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            />
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">Show on Live</span>
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
    </div>
  );
};

export default HeroSlideshow;

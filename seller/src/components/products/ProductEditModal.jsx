import React, { useState, useEffect } from "react";
import { 
  X, 
  Upload, 
  Trash2, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  Info, 
  Plus, 
  Minus,
  Sparkles,
  Layers,
  FileText,
  ImageIcon,
  Search,
  Sliders,
  DollarSign,
  Package
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../../config";

const ProductEditModal = ({
  editingProduct,
  onClose,
  token,
  fetchProducts
}) => {
  if (!editingProduct) return null;

  const [activeTab, setActiveTab] = useState("basic"); // "basic" | "media" | "description" | "specs" | "seo"
  
  const [formData, setFormData] = useState({
    name: editingProduct.name || "",
    price: editingProduct.price || "",
    category: editingProduct.category || "",
    subCategory: editingProduct.subCategory || "",
    collection: editingProduct.collection || "General",
    brand: editingProduct.brand || "",
    sku: editingProduct.sku || "",
    stock: editingProduct.stock !== undefined ? editingProduct.stock : "",
    audience: editingProduct.audience || "Unisex",
    description: editingProduct.description || "",
    shortDescription: editingProduct.shortDescription || "",
    tags: Array.isArray(editingProduct.tags) ? editingProduct.tags.join(", ") : (editingProduct.tags || ""),
    keywords: Array.isArray(editingProduct.keywords) ? editingProduct.keywords.join(", ") : (editingProduct.keywords || ""),
    highlights: Array.isArray(editingProduct.highlights) ? editingProduct.highlights.join(", ") : (editingProduct.highlights || ""),
    careInstructions: Array.isArray(editingProduct.careInstructions) ? editingProduct.careInstructions.join(", ") : (editingProduct.careInstructions || "")
  });

  const [editImages, setEditImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [templateFields, setTemplateFields] = useState([]);
  const [dynamicAttributes, setDynamicAttributes] = useState({});
  const [customSpecs, setCustomSpecs] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isLoadingDependencies, setIsLoadingDependencies] = useState(true);

  // Load initial data for the product
  useEffect(() => {
    const loadDependencies = async () => {
      setIsLoadingDependencies(true);
      try {
        // 1. Fetch categories
        const catRes = await axios.get(`${backendUrl}/api/seller/categories`, { headers: { token } });
        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
        }

        // 2. Fetch images
        const imgRes = await axios.get(`${backendUrl}/api/seller/product/${editingProduct._id}/images`, { headers: { token } });
        if (imgRes.data.success && imgRes.data.images) {
          setEditImages(imgRes.data.images);
        } else if (editingProduct.images) {
          setEditImages(editingProduct.images.map((url, idx) => ({ _id: `temp-${idx}`, imageUrl: url, isCover: idx === 0 })));
        }

        // 3. Load specifications
        if (editingProduct.specifications && Array.isArray(editingProduct.specifications)) {
          setCustomSpecs(editingProduct.specifications.map(s => ({ key: s.key || "", value: s.value || "" })));
        } else {
          setCustomSpecs([]);
        }

        // 4. Load dynamic category attributes
        const attrRes = await axios.get(`${backendUrl}/api/seller/product/${editingProduct._id}/attributes`, { headers: { token } });
        if (attrRes.data.success && attrRes.data.attributes) {
          const map = {};
          attrRes.data.attributes.forEach(a => {
            map[a.key || a.name] = a.value;
          });
          setDynamicAttributes(map);
        }
      } catch (err) {
        console.error("Error loading product edit info:", err.message);
      } finally {
        setIsLoadingDependencies(false);
      }
    };

    loadDependencies();
  }, [editingProduct, token]);

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    if (editImages.length + files.length > 10) {
      toast.warning("Maximum 10 images allowed.");
      return;
    }

    setIsUploadingImages(true);
    const fd = new FormData();
    files.forEach(f => fd.append("images", f));

    try {
      const response = await axios.post(
        `${backendUrl}/api/seller/product/${editingProduct._id}/images/upload`,
        fd,
        { headers: { token, "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        toast.success("Images uploaded successfully");
        const imgRes = await axios.get(`${backendUrl}/api/seller/product/${editingProduct._id}/images`, { headers: { token } });
        if (imgRes.data.success) {
          setEditImages(imgRes.data.images);
        }
      } else {
        toast.error(response.data.message || "Failed to upload images");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsUploadingImages(false);
    }
  };

  // Image Delete
  const handleImageDelete = async (imageId) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/seller/product/${editingProduct._id}/image/${imageId}`,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Image deleted");
        setEditImages(prev => prev.filter(img => img._id !== imageId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Set Cover Image
  const handleSetCover = async (imageId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/seller/product/${editingProduct._id}/image/${imageId}/cover`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Cover image set");
        setEditImages(prev => prev.map(img => ({
          ...img,
          isCover: img._id === imageId
        })));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Reorder Images
  const handleMoveImage = async (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= editImages.length) return;

    const reordered = [...editImages];
    const temp = reordered[index];
    reordered[index] = reordered[nextIndex];
    reordered[nextIndex] = temp;

    setEditImages(reordered);

    try {
      await axios.post(
        `${backendUrl}/api/seller/product/${editingProduct._id}/images/reorder`,
        { imageIds: reordered.map(img => img._id) },
        { headers: { token } }
      );
    } catch (err) {
      console.log("Could not save reorder state:", err.message);
    }
  };

  // Spec management
  const handleAddSpec = () => {
    setCustomSpecs(prev => [...prev, { key: "", value: "" }]);
  };

  const handleRemoveSpec = (idx) => {
    setCustomSpecs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx, field, val) => {
    setCustomSpecs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  // Final Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price || !formData.description.trim()) {
      toast.error("Product name, price, and description are required.");
      return;
    }

    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Valid selling price (> 0) is required.");
      return;
    }

    const parsedStock = parseInt(formData.stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      toast.error("Stock cannot be negative.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id: editingProduct._id,
        ...formData,
        price: parsedPrice,
        stock: parsedStock,
        specifications: customSpecs.filter(s => s.key.trim() !== ""),
        images: editImages.map(img => img.imageUrl || img)
      };

      const response = await axios.post(`${backendUrl}/api/seller/update-product`, payload, {
        headers: { token }
      });

      if (response.data.success) {
        // Save dynamic specifications if any
        if (customSpecs.length > 0) {
          await axios.post(`${backendUrl}/api/seller/product/${editingProduct._id}/attributes`, {
            attributes: customSpecs.filter(s => s.key.trim() !== "")
          }, { headers: { token } });
        }

        toast.success("Product listing updated successfully!");
        if (fetchProducts) fetchProducts();
        onClose();
      } else {
        toast.error(response.data.message || "Failed to update product");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic & Pricing", icon: DollarSign },
    { id: "media", label: `Media Gallery (${editImages.length})`, icon: ImageIcon },
    { id: "description", label: "Descriptions", icon: FileText },
    { id: "specs", label: "Technical Specs", icon: Sliders },
    { id: "seo", label: "SEO & Discovery", icon: Search }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-[#0F172A] w-full max-w-4xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Package size={16} />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Edit Product Listing
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {editingProduct.sku ? `SKU: ${editingProduct.sku}` : "Update catalog metadata & visuals"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 px-3 overflow-x-auto custom-scrollbar shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer shrink-0 ${
                  isActive 
                    ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-white/60 dark:bg-slate-800/40 font-black" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon size={13} className={isActive ? "text-amber-500" : "text-slate-400"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4 text-left">
          {/* TAB 1: BASIC & PRICING */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Product Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c._id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                    placeholder="e.g. Audio & Sound"
                  />
                </div>

                {/* Brand */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                    placeholder="e.g. SonicPro"
                  />
                </div>

                {/* SKU */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Stock Keeping Unit (SKU)
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                    placeholder="e.g. SP-AUD-001"
                  />
                </div>

                {/* Price (₹) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Selling Price (₹ INR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-black rounded-lg bg-slate-50 dark:bg-slate-900 text-amber-500 dark:text-amber-400 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Available Stock */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Inventory Stock Units <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-black rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                    placeholder="0"
                  />
                </div>

                {/* Target Audience */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Audience
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>

                {/* Collection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Collection / Catalog Tag
                  </label>
                  <input
                    type="text"
                    value={formData.collection}
                    onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                    placeholder="e.g. Summer Essentials, General"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA & GALLERY */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <Info size={15} className="shrink-0" />
                  <span>
                    Upload up to 10 high-resolution images. Set a cover image and arrange sequence for buyer storefront.
                  </span>
                </div>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  {editImages.length}/10 Uploaded
                </span>
              </div>

              {/* Upload Dropzone */}
              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-xl bg-slate-50 dark:bg-slate-900/50 cursor-pointer transition">
                <Upload size={24} className={`text-amber-500 mb-1 ${isUploadingImages ? "animate-bounce" : ""}`} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isUploadingImages ? "Uploading files..." : "Click to select or drag product photos"}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploadingImages}
                  className="hidden"
                />
              </label>

              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {editImages.map((img, idx) => {
                  const url = typeof img === "object" ? img.imageUrl : img;
                  const isCover = img.isCover || idx === 0;

                  return (
                    <div 
                      key={img._id || idx}
                      className={`relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 transition group ${
                        isCover ? "border-amber-500 shadow-md" : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <img src={url} alt="" className="h-32 w-full object-cover" />

                      {/* Cover Badge */}
                      {isCover && (
                        <span className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                          <Star size={9} className="fill-slate-950" />
                          <span>Cover</span>
                        </span>
                      )}

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-1">
                        {!isCover && img._id && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(img._id)}
                            className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400 text-[10px] font-bold"
                            title="Set as Cover"
                          >
                            Set Cover
                          </button>
                        )}

                        <div className="flex gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(idx, -1)}
                            className="p-1 rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40"
                            title="Move Left"
                          >
                            <ArrowLeft size={11} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === editImages.length - 1}
                            onClick={() => handleMoveImage(idx, 1)}
                            className="p-1 rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40"
                            title="Move Right"
                          >
                            <ArrowRight size={11} />
                          </button>
                        </div>

                        {img._id && (
                          <button
                            type="button"
                            onClick={() => handleImageDelete(img._id)}
                            className="p-1 rounded bg-rose-600 text-white hover:bg-rose-500"
                            title="Delete Image"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DESCRIPTIONS & HIGHLIGHTS */}
          {activeTab === "description" && (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Full Product Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                  placeholder="Provide comprehensive details on materials, dimensions, features, and warranty..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Short Summary / Subtitle
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                  placeholder="One-line pitch shown in product cards"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Key Highlights (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                  placeholder="e.g. 40h Battery Life, Active Noise Cancellation, Fast USB-C Charging"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Care & Usage Instructions
                </label>
                <input
                  type="text"
                  value={formData.careInstructions}
                  onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                  placeholder="e.g. Wipe with dry cloth only, Keep away from moisture"
                />
              </div>
            </div>
          )}

          {/* TAB 4: TECHNICAL SPECS */}
          {activeTab === "specs" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Product Specifications
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Custom key-value parameters shown in the storefront details table.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  <Plus size={11} />
                  <span>Add Attribute</span>
                </button>
              </div>

              <div className="space-y-2">
                {customSpecs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                    No custom specifications added yet. Click "Add Attribute" above.
                  </p>
                ) : (
                  customSpecs.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                        placeholder="Feature / Key (e.g. Material)"
                        className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                        placeholder="Value (e.g. 100% Cotton)"
                        className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SEO & DISCOVERY */}
          {activeTab === "seo" && (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Search Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                  placeholder="e.g. wireless, bluetooth, overear, bass"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Search Keywords
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-500"
                  placeholder="e.g. headphones, anc, pro studio gear"
                />
              </div>
            </div>
          )}

          {/* Footer Submit Button */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Check size={14} className="stroke-[3]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;

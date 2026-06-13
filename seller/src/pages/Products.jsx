import React, { useState } from "react";
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp,
  ArrowDown,
  Upload,
  Search,
  SlidersHorizontal,
  DollarSign,
  Layers,
  AlertTriangle
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";

const Products = ({ token, products = [], deleteProduct, loading, fetchProducts }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    category: "",
    subCategory: "",
    collection: "General",
    brand: "",
    sku: "",
    description: "",
    stock: ""
  });
  const [editImages, setEditImages] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editUploadLoading, setEditUploadLoading] = useState(false);

  // Dynamic attributes states for editing
  const [editCategories, setEditCategories] = useState([]);
  const [editTemplateFields, setEditTemplateFields] = useState([]);
  const [editDynamicAttributes, setEditDynamicAttributes] = useState({});
  const [editCustomAttributes, setEditCustomAttributes] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All"); // "All", "Healthy", "Low Stock", "Out of Stock"
  const [sortBy, setSortBy] = useState("name-asc"); // "name-asc", "price-asc", "price-desc", "stock-asc", "stock-desc"
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
      
      const stock = parseInt(product.stock) || 0;
      let matchesStock = true;
      if (stockFilter === "Healthy") matchesStock = stock >= 10;
      else if (stockFilter === "Low Stock") matchesStock = stock > 0 && stock < 10;
      else if (stockFilter === "Out of Stock") matchesStock = stock === 0;

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "price-asc") return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      if (sortBy === "price-desc") return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      if (sortBy === "stock-asc") return (parseInt(a.stock) || 0) - (parseInt(b.stock) || 0);
      if (sortBy === "stock-desc") return (parseInt(b.stock) || 0) - (parseInt(a.stock) || 0);
      return 0;
    });

  // Calculate stats
  const totalValue = products.reduce((acc, p) => acc + (parseFloat(p.price) * (parseInt(p.stock) || 0)), 0);
  const lowStockCount = products.filter(p => (parseInt(p.stock) || 0) < 10).length;

  const handleEditProductClick = async (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      price: product.price || "",
      category: product.category || "",
      subCategory: product.subCategory || "",
      collection: product.collection || "General",
      brand: product.brand || "",
      sku: product.sku || "",
      description: product.description || "",
      stock: product.stock || ""
    });
    setEditImages([]);
    setEditLoading(true);

    try {
      // 1. Fetch categories
      let cats = editCategories;
      if (cats.length === 0) {
        const catRes = await axios.get(`${backendUrl}/api/seller/categories`, { headers: { token } });
        if (catRes.data.success) {
          cats = catRes.data.categories;
          setEditCategories(cats);
        }
      }

      // 2. Load custom attributes from product.specifications
      const specs = product.specifications || [];
      setEditCustomAttributes(specs.map(s => ({ key: s.key, value: s.value })));

      const response = await axios.get(`${backendUrl}/api/seller/product/${product._id}/images`, {
        headers: { token }
      });
      if (response.data.success) {
        setEditImages(response.data.images);
      }
    } catch (err) {
      console.error("Failed to load product edit dependencies:", err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editImages.length < 3) {
        toast.error("At least 3 images are required to keep this product active.");
        return;
      }

      if (!editForm.name || !editForm.price || !editForm.description.trim()) {
        toast.error("Product name, price, and description are required.");
        return;
      }

      // Update basic product details
      const response = await axios.post(`${backendUrl}/api/seller/update-product`, {
        id: editingProduct._id,
        ...editForm,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock) || 0,
        images: editImages.map(img => img.imageUrl)
      }, {
        headers: { token }
      });

      if (response.data.success) {
        // Save dynamic attributes
        await axios.post(`${backendUrl}/api/seller/product/${editingProduct._id}/attributes`, {
          attributes: editCustomAttributes.filter(a => a.key.trim() !== "")
        }, {
          headers: { token }
        });

        toast.success("Product updated successfully!");
        setEditingProduct(null);
        if (fetchProducts) fetchProducts();
      } else {
        toast.error(response.data.message || "Failed to update product");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleEditImageUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    if (editImages.length + files.length > 10) {
      toast.warning("Maximum of 10 images allowed.");
      return;
    }

    setEditUploadLoading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append("images", file);
    });

    try {
      const response = await axios.post(
        `${backendUrl}/api/seller/product/${editingProduct._id}/images/upload`,
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data.success) {
        toast.success("Images uploaded successfully");
        const imgRes = await axios.get(`${backendUrl}/api/seller/product/${editingProduct._id}/images`, {
          headers: { token }
        });
        if (imgRes.data.success) {
          setEditImages(imgRes.data.images);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setEditUploadLoading(false);
    }
  };

  const handleEditImageDelete = async (imageId) => {
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

  const handleEditSetCover = async (imageId) => {
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

  const moveEditImage = async (index, direction) => {
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
      toast.error("Failed to save reorder state: " + err.message);
    }
  };

  const shouldShowField = (field) => {
    if (!field.conditionalRules || !field.conditionalRules.dependsOn) return true;
    const dependencyVal = editDynamicAttributes[field.conditionalRules.dependsOn];
    const expectedVal = field.conditionalRules.expectedValue;
    const isMatch = String(dependencyVal) === String(expectedVal);
    if (field.conditionalRules.action === "show") return isMatch;
    if (field.conditionalRules.action === "hide") return !isMatch;
    return true;
  };

  const renderDynamicField = (field) => {
    if (!shouldShowField(field)) return null;

    const value = editDynamicAttributes[field.fieldName] !== undefined ? editDynamicAttributes[field.fieldName] : "";
    
    const onChange = (val) => {
      setEditDynamicAttributes(prev => ({
        ...prev,
        [field.fieldName]: val
      }));
    };

    const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 bg-white transition";

    switch (field.fieldType) {
      case "Text Area":
      case "Rich Text Editor":
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || "Enter details..."}
            className={`${inputClass} resize-none`}
            rows={3}
            required={field.isRequired}
          />
        );
      case "Dropdown":
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          >
            <option value="">Select option</option>
            {field.selectOptions?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case "Multi Select":
        return (
          <div className="flex flex-wrap gap-2.5 p-3 border border-slate-200 rounded-xl bg-slate-50">
            {field.selectOptions?.map(opt => {
              const currentArray = Array.isArray(value) ? value : [];
              const isChecked = currentArray.includes(opt);
              return (
                <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...currentArray, opt]
                        : currentArray.filter(item => item !== opt);
                      onChange(updated);
                    }}
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        );
      case "Radio Button":
        return (
          <div className="flex flex-wrap gap-4 p-2 bg-slate-50/50 border border-slate-200/40 rounded-xl">
            {field.selectOptions?.map(opt => (
              <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                <input
                  type="radio"
                  name={field.fieldName}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );
      case "Checkbox":
        return (
          <label className="flex items-center gap-2 text-xs text-slate-750 font-bold cursor-pointer py-1.5 pl-1">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
            <span>{field.label || field.fieldName}</span>
          </label>
        );
      case "Date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "Time":
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "Datetime":
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "Email":
        return (
          <input
            type="email"
            placeholder={field.placeholder || "email@example.com"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "URL":
        return (
          <input
            type="url"
            placeholder={field.placeholder || "https://example.com"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "Phone":
        return (
          <input
            type="tel"
            placeholder={field.placeholder || "+1 555-555-5555"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "Color Picker":
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || "#ff0000"}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 h-10 border border-slate-200 rounded-lg cursor-pointer bg-white"
            />
            <span className="text-xs text-slate-500 font-mono font-bold">{value || "#ff0000"}</span>
          </div>
        );
      case "Number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "Decimal":
        return (
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "Location Picker":
        return (
          <input
            type="text"
            placeholder={field.placeholder || "Latitude, Longitude (e.g. 37.7749, -122.4194)"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "Tags Input":
        return (
          <input
            type="text"
            placeholder={field.placeholder || "Comma separated tags (e.g. red, cotton, wash)"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );
      case "Image Upload":
      case "Multiple Image Upload":
      case "Video Upload":
      case "File Upload":
        return (
          <input
            type="text"
            placeholder={field.placeholder || "Direct media link / URL"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );
      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All");
    setStockFilter("All");
    setSortBy("name-asc");
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 sm:pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage details, stocks, pricing, and visual representations.</p>
        </div>
        <button
          onClick={() => navigate("/add-product")}
          className="hidden sm:flex items-center gap-1.5 px-4.5 py-2.5 bg-[#FF5100] hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-md shadow-orange-600/10 cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Listings</span>
            <h4 className="text-base font-black text-slate-800 mt-0.5">{products.length} Items</h4>
          </div>
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Package size={16} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Inventory Capital</span>
            <h4 className="text-base font-black text-slate-800 mt-0.5">₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</h4>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <DollarSign size={16} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Low Stock Warnings</span>
            <h4 className="text-base font-black text-slate-800 mt-0.5">{lowStockCount} Products</h4>
          </div>
          <div className="h-8 w-8 rounded-lg bg-red-50/80 flex items-center justify-center text-red-500 border border-red-100">
            <AlertTriangle size={16} />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by title, details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm outline-none focus:border-slate-800 focus:ring-4 focus:ring-slate-950/5 transition font-semibold"
          />
        </div>
        
        {/* Desktop Controls (Inline) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500 transition bg-white font-bold cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.filter(c => c !== "All").map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500 transition bg-white font-bold cursor-pointer"
          >
            <option value="All">All Stocks</option>
            <option value="Healthy">Healthy Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500 transition bg-white font-bold cursor-pointer"
          >
            <option value="name-asc">Sort: A-Z</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-asc">Stock: Low to High</option>
            <option value="stock-desc">Stock: High to Low</option>
          </select>

          {(searchQuery || categoryFilter !== "All" || stockFilter !== "All" || sortBy !== "name-asc") && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-[#FF5100] hover:text-orange-600 transition cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Mobile controls toggle */}
        <div className="flex md:hidden w-full gap-2 shrink-0">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-extrabold text-slate-700 rounded-xl transition cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>Filters Drawer</span>
          </button>
          {(searchQuery || categoryFilter !== "All" || stockFilter !== "All" || sortBy !== "name-asc") && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 border border-[#FF5100]/20 bg-orange-50/50 text-xs font-extrabold text-[#FF5100] rounded-xl transition cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Drawer for filters */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isFilterDrawerOpen ? "visible" : "invisible pointer-events-none"}`}>
        <div 
          className={`absolute inset-0 bg-slate-950/45 backdrop-blur-xs transition-opacity duration-300 ${isFilterDrawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsFilterDrawerOpen(false)}
        />
        <div className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl p-6 flex flex-col justify-between transform transition-transform duration-300 ease-out ${isFilterDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">Refine Catalog</h3>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-50 transition">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none bg-white font-bold cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {categories.filter(c => c !== "All").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none bg-white font-bold cursor-pointer"
                >
                  <option value="All">All Stocks</option>
                  <option value="Healthy">Healthy Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sorting</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none bg-white font-bold cursor-pointer"
                >
                  <option value="name-asc">Sort: A-Z</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="stock-asc">Stock: Low to High</option>
                  <option value="stock-desc">Stock: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                handleClearFilters();
                setIsFilterDrawerOpen(false);
              }}
              className="w-full py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase transition cursor-pointer hover:bg-slate-50"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer hover:bg-slate-800"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Content Render (Loading, Empty, Cards or Table) */}
      {loading ? (
        // Premium skeletons block
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-4 animate-pulse">
              <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        // Custom empty onboarding state
        <div className="border border-dashed border-slate-250 bg-white rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="mx-auto h-16 w-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5100]">
            <Package size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">No products found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Either your filter settings did not match any products, or you haven't published your first item yet. Ready to start listing?
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            { (searchQuery || categoryFilter !== "All" || stockFilter !== "All" || sortBy !== "name-asc") ? (
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-750 hover:bg-slate-50 transition cursor-pointer"
              >
                Clear Active Filters
              </button>
            ) : (
              <button
                onClick={() => navigate("/add-product")}
                className="px-5 py-2.5 bg-[#FF5100] text-white hover:bg-orange-600 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                Add Your First Product
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile & Tablet Card Layout (< 1024px) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 lg:hidden">
            {filteredProducts.map((item) => {
              const stock = parseInt(item.stock) || 0;
              return (
                <div 
                  key={item._id}
                  className="bg-white border border-slate-200/85 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
                >
                  <div className="flex gap-4">
                    <img 
                      src={item.image?.[0] || item.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100"} 
                      alt={item.name} 
                      className="h-20 w-20 object-cover rounded-xl border border-slate-200/80 shadow-xs shrink-0" 
                    />
                    <div className="min-w-0 flex-1 space-y-1.5 text-left">
                      <span className="inline-block text-[9px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug truncate" onClick={() => handleEditProductClick(item)}>
                        {item.name}
                      </h4>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-sm font-black text-slate-900">₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          stock === 0 ? "bg-red-50 text-red-600" :
                          stock < 10 ? "bg-amber-50 text-amber-600" :
                          "bg-emerald-50 text-emerald-600"
                        }`}>
                          {stock === 0 ? "Out of Stock" : stock < 10 ? `${stock} Left` : `${stock} Units`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-50">
                    <button
                      onClick={() => handleEditProductClick(item)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteProduct(item._id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100/40 text-xs font-bold text-red-650 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table Layout (>= 1024px) */}
          <div className="hidden lg:block overflow-x-auto bg-white border border-slate-200/80 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4 w-16">Item</th>
                  <th className="py-3.5 px-4">Product details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Unit Price</th>
                  <th className="py-3.5 px-4 text-center">Fulfillment Stock</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((item) => {
                  const stock = parseInt(item.stock) || 0;
                  return (
                    <tr key={item._id} className="border-b border-slate-55 border-slate-50 hover:bg-slate-50/40 transition duration-150">
                      <td className="py-4 px-4">
                        <img 
                          src={item.image?.[0] || item.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100"} 
                          alt={item.name} 
                          className="h-10 w-10 object-cover rounded-xl border border-slate-200/80 shadow-sm" 
                        />
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-bold text-slate-900 leading-tight hover:text-orange-500 transition cursor-pointer" onClick={() => handleEditProductClick(item)}>{item.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-sm">{item.description}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200/30 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-black text-slate-900 text-right">₹{item.price.toFixed(2)}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          stock === 0 ? "bg-red-50 text-red-600 border border-red-100" :
                          stock < 10 ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}>
                          {stock === 0 ? "Out of Stock" : stock < 10 ? `Low: ${stock} Left` : `${stock} Units`}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button 
                            onClick={() => handleEditProductClick(item)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer active:scale-95"
                            title="Edit Details"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button 
                            onClick={() => deleteProduct(item._id)}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer active:scale-95"
                            title="Delete Listing"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Floating Add Product button on mobile only */}
      <button
        onClick={() => navigate("/add-product")}
        className="sm:hidden fixed bottom-20 right-4 z-40 bg-[#FF5100] hover:bg-orange-655 hover:bg-orange-600 text-white rounded-full p-4.5 shadow-lg flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
        title="Add Product"
      >
        <Plus size={20} />
      </button>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative border border-slate-100 animate-scaleUp">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Edit Product Listing</h2>
              <p className="text-xs text-slate-400 mt-1">Update product specifications, details, and gallery images.</p>
            </div>

            <form onSubmit={handleEditFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category (Locked)</label>
                  <input
                    type="text"
                    value={editForm.category}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collection</label>
                  <select
                    value={editForm.collection}
                    onChange={(e) => setEditForm({...editForm, collection: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Kid">Kid</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subcategory</label>
                  <input
                    type="text"
                    value={editForm.subCategory}
                    onChange={(e) => setEditForm({...editForm, subCategory: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</label>
                  <input
                    type="text"
                    value={editForm.brand}
                    onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</label>
                  <input
                    type="text"
                    value={editForm.sku}
                    onChange={(e) => setEditForm({...editForm, sku: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (₹ INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Available</label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition resize-none"
                />
              </div>

              {/* Custom Dynamic Specifications Builder */}
              <div className="space-y-4 pt-4 border-t border-slate-100 text-left animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-650 uppercase tracking-wider">
                    <Layers size={13} />
                    <span>Dynamic Product Attributes</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditCustomAttributes(prev => [...prev, { key: "", value: "" }])}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-sm"
                  >
                    <Plus size={11} />
                    <span>Add Attribute</span>
                  </button>
                </div>

                {editCustomAttributes.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl py-8 text-center text-slate-400 text-xs italic bg-slate-50/50">
                    No attributes added yet. Click "Add Attribute" to add custom key-value specifications.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editCustomAttributes.map((attr, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3.5 border border-slate-150 rounded-2xl bg-white shadow-sm transition hover:shadow-md">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-450 uppercase block">Attribute Name</label>
                            <input
                              type="text"
                              placeholder="e.g. RAM, Material, Color"
                              value={attr.key}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditCustomAttributes(prev => {
                                  const updated = [...prev];
                                  updated[idx] = { ...updated[idx], key: val };
                                  return updated;
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-850 text-xs outline-none focus:border-orange-500 transition"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-450 uppercase block">Value</label>
                            <input
                              type="text"
                              placeholder="e.g. 16GB, 100% Cotton, Black"
                              value={attr.value}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditCustomAttributes(prev => {
                                  const updated = [...prev];
                                  updated[idx] = { ...updated[idx], value: val };
                                  return updated;
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-850 text-xs outline-none focus:border-orange-500 transition"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end pb-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              setEditCustomAttributes(prev => {
                                const updated = [...prev];
                                const temp = updated[idx];
                                updated[idx] = updated[idx - 1];
                                updated[idx - 1] = temp;
                                return updated;
                              });
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-450 disabled:opacity-20 transition cursor-pointer"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === editCustomAttributes.length - 1}
                            onClick={() => {
                              setEditCustomAttributes(prev => {
                                const updated = [...prev];
                                const temp = updated[idx];
                                updated[idx] = updated[idx + 1];
                                updated[idx + 1] = temp;
                                return updated;
                              });
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-450 disabled:opacity-20 transition cursor-pointer"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditCustomAttributes(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gallery Image Manager */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Gallery</label>
                    <span className="text-[10px] text-slate-400 block mt-0.5">3 to 10 images required.</span>
                  </div>
                  <div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      className="hidden"
                      id="edit-image-upload-input"
                      disabled={editUploadLoading}
                    />
                    <label
                      htmlFor="edit-image-upload-input"
                      className={`px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        editUploadLoading ? "opacity-50 cursor-wait" : ""
                      }`}
                    >
                      <Upload size={13} />
                      <span>{editUploadLoading ? "Uploading..." : "Add Images"}</span>
                    </label>
                  </div>
                </div>

                {editLoading ? (
                  <p className="text-xs text-slate-400 text-center py-4">Loading gallery images...</p>
                ) : editImages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No images in gallery</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {editImages.map((imgObj, idx) => (
                      <div key={imgObj._id} className="relative group border border-slate-200 rounded-xl overflow-hidden p-1.5 flex flex-col gap-1.5 shadow-sm bg-slate-50">
                        <img
                          src={imgObj.imageUrl}
                          alt="Product"
                          className="w-full h-16 object-cover rounded-lg"
                        />
                        <div className="flex flex-col gap-1 text-[9px]">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleEditSetCover(imgObj._id)}
                              className={`px-1.5 py-0.5 rounded-full font-bold transition ${
                                imgObj.isCover ? "bg-orange-500 text-white animate-pulse" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                              }`}
                            >
                              {imgObj.isCover ? "Cover" : "Set Cover"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditImageDelete(imgObj._id)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded transition"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-200/55 pt-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveEditImage(idx, -1)}
                              className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            >
                              <ArrowLeft size={12} />
                            </button>
                            <span className="font-semibold text-slate-400">Idx: {idx + 1}</span>
                            <button
                              type="button"
                              disabled={idx === editImages.length - 1}
                              onClick={() => moveEditImage(idx, 1)}
                              className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            >
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md active:scale-95 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

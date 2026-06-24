import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Upload, 
  ArrowLeft, 
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Package,
  Layers,
  Sparkles,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  BookmarkCheck,
  AlertTriangle,
  Code,
  FileText,
  Eye,
  Globe,
  RefreshCw,
  Search,
  Check
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";

const AddProduct = ({ token, addProduct, products = [], fetchProducts }) => {
  // Modes: "form", "ai", "json"
  const [activeMode, setActiveMode] = useState("form");
  const [generateLoading, setGenerateLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    subCategory: "",
    audience: "Unisex",
    brand: "",
    sku: "",
    description: "",
    stock: "",
    tags: "",
    keywords: "",
    seoDescription: ""
  });

  const [categories, setCategories] = useState([]);
  const [customAttributes, setCustomAttributes] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]); 
  const [dragActive, setDragActive] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState([]);

  // Dynamic attributes states
  const [productAttributes, setProductAttributes] = useState([]);
  const [productVariants, setProductVariants] = useState([]);

  // Auto-Variant Generator logic
  useEffect(() => {
    const activeAttrs = productAttributes.filter(attr => attr.name.trim() && attr.values.trim());
    if (activeAttrs.length === 0) {
      setProductVariants([]);
      return;
    }

    const attrMap = {};
    activeAttrs.forEach(attr => {
      attrMap[attr.name.trim()] = attr.values
        .split(",")
        .map(v => v.trim())
        .filter(Boolean);
    });

    const attrKeys = Object.keys(attrMap);
    if (attrKeys.length === 0) {
      setProductVariants([]);
      return;
    }

    const combinations = [];
    const generate = (index, current) => {
      if (index === attrKeys.length) {
        combinations.push({ ...current });
        return;
      }
      const key = attrKeys[index];
      attrMap[key].forEach(val => {
        current[key] = val;
        generate(index + 1, current);
      });
    };
    generate(0, {});

    const basePrice = parseFloat(newProduct.price) || 0;
    const baseStock = parseInt(newProduct.stock) || 0;
    const baseSku = newProduct.sku || (newProduct.name ? newProduct.name.substring(0, 5).toUpperCase() : "PROD");

    const newVariants = combinations.map((comb, idx) => {
      const existing = productVariants.find(v => {
        return attrKeys.every(k => v.attributes[k] === comb[k]);
      });

      const comboSuffix = Object.values(comb).join("-").toUpperCase();
      return {
        sku: existing?.sku || `${baseSku}-${comboSuffix}-${idx}`,
        price: existing?.price !== undefined ? existing.price : basePrice,
        stock: existing?.stock !== undefined ? existing.stock : baseStock,
        attributes: comb
      };
    });

    setProductVariants(newVariants);
  }, [productAttributes, newProduct.price, newProduct.stock, newProduct.sku, newProduct.name]);

  // Custom Category & Subcategory text overrides
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomSubCategory, setIsCustomSubCategory] = useState(false);

  // Raw text inputs
  const [aiText, setAiText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState(null);

  // Preview panel tab: "card" | "page" | "seo"
  const [activePreviewTab, setActivePreviewTab] = useState("card");

  // Loaders for specific AI calls
  const [loaders, setLoaders] = useState({
    description: false,
    specifications: false,
    tags: false,
    collections: false,
    seo: false,
    parseText: false,
    enrichJson: false
  });

  const allowedFormats = ["jpg", "jpeg", "png", "webp"];
  const maxImageSizeMB = 5;

  const collectionsList = [
    "Trending Now",
    "Best Sellers",
    "New Arrivals",
    "Gaming Setup",
    "Student Essentials",
    "Festival Offers",
    "Luxury Picks",
    "Work From Home",
    "Photography Essentials",
    "Sports Essentials"
  ];

  // Load Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/seller/categories`, {
          headers: { token }
        });
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      } catch (err) {
        console.error("Failed to load categories:", err.message);
      }
    };
    if (token) {
      fetchCategories();
    }
  }, [token]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [uploadedFiles]);

  // JSON syntax check
  useEffect(() => {
    if (!jsonText.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(jsonText);
      setJsonError(null);
    } catch (err) {
      setJsonError(err.message);
    }
  }, [jsonText]);

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndAddFiles = (filesList) => {
    const maxLimit = 10;
    if (uploadedFiles.length + filesList.length > maxLimit) {
      toast.warning(`Maximum ${maxLimit} images allowed.`);
      return;
    }

    const validFiles = [];
    for (const file of filesList) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!allowedFormats.includes(ext)) {
        toast.error(`"${file.name}" is not supported (JPG, PNG, WEBP).`);
        continue;
      }

      if (file.size > maxImageSizeMB * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds ${maxImageSizeMB}MB.`);
        continue;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        isCover: false
      });
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => {
        const updated = [...prev, ...validFiles];
        if (!updated.some(f => f.isCover)) {
          updated[0].isCover = true;
        }
        return updated;
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndAddFiles(Array.from(e.target.files));
    }
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles(prev => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (prev[index]?.isCover && updated.length > 0) {
        updated[0].isCover = true;
      }
      return updated;
    });
  };

  const setCoverFile = (index) => {
    setUploadedFiles(prev => prev.map((f, idx) => ({
      ...f,
      isCover: idx === index
    })));
  };

  const moveUploadedFile = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= uploadedFiles.length) return;
    
    setUploadedFiles(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[nextIndex];
      next[nextIndex] = temp;
      return next;
    });
  };

  // Helper to toggle loader states
  const setLoader = (key, value) => {
    setLoaders(prev => ({ ...prev, [key]: value }));
  };

  // Smart AI Mode: Parse Unstructured Text
  const handleAIParseText = async () => {
    if (!aiText.trim()) {
      toast.error("Please paste some product details first.");
      return;
    }
    setLoader("parseText", true);
    try {
      const response = await axios.post(`${backendUrl}/api/ai/parse-text-product`, { text: aiText });
      if (response.data.success) {
        const data = response.data;
        
        // Auto check custom categories/subcategories if they aren't in DB
        const matchCat = categories.find(c => c.name.toLowerCase() === (data.category || "").toLowerCase());
        if (!matchCat && data.category) {
          setIsCustomCategory(true);
        } else {
          setIsCustomCategory(false);
        }

        setIsCustomSubCategory(true); // default to raw type-in or auto-fill

        setNewProduct(prev => ({
          ...prev,
          name: data.name || "",
          brand: data.brand || "",
          price: data.price || "",
          stock: data.stock || "",
          description: data.description || "",
          category: data.category || "",
          subCategory: data.subCategory || "",
          audience: data.audience || "Unisex",
          tags: data.tags ? data.tags.join(", ") : "",
          keywords: data.keywords ? data.keywords.join(", ") : ""
        }));

        if (data.specifications) {
          setCustomAttributes(data.specifications);
        }
        if (data.collections) {
          setSelectedCollections(data.collections);
        }

        toast.success("Unstructured text parsed and form populated!");
        setActiveMode("form");
      }
    } catch (err) {
      toast.error("Failed to parse text: " + (err.response?.data?.message || err.message));
    } finally {
      setLoader("parseText", false);
    }
  };

  // JSON Mode: Rule-based Product Generator (No AI)
  const handleGenerateProduct = async () => {
    if (jsonError) {
      toast.error("Please fix JSON syntax errors before generation.");
      return;
    }
    if (!jsonText.trim()) {
      toast.error("Please paste a JSON object first.");
      return;
    }

    setLoader("enrichJson", true);
    try {
      const parsedData = JSON.parse(jsonText);

      // Validate required fields
      if (!parsedData.name) {
        toast.error("JSON must contain a 'name' field.");
        setLoader("enrichJson", false);
        return;
      }
      if (!parsedData.category) {
        toast.error("JSON must contain a 'category' field.");
        setLoader("enrichJson", false);
        return;
      }
      if (!parsedData.subCategory) {
        toast.error("JSON must contain a 'subCategory' field.");
        setLoader("enrichJson", false);
        return;
      }
      if (parsedData.price === undefined) {
        toast.error("JSON must contain a 'price' field.");
        setLoader("enrichJson", false);
        return;
      }
      if (!parsedData.images || !Array.isArray(parsedData.images) || parsedData.images.length === 0) {
        toast.error("JSON must contain a non-empty 'images' array.");
        setLoader("enrichJson", false);
        return;
      }

      const response = await axios.post(`${backendUrl}/api/seller/generate-product`, { ...parsedData, preview: true }, {
        headers: { token }
      });

      if (response.data.success && response.data.product) {
        const product = response.data.product;

        // Auto check custom categories/subcategories if they aren't in DB
        const matchCat = categories.find(c => c.name.toLowerCase() === (product.category || "").toLowerCase());
        if (!matchCat && product.category) {
          setIsCustomCategory(true);
        } else {
          setIsCustomCategory(false);
        }

        setIsCustomSubCategory(true);

        setNewProduct({
          name: product.name || "",
          price: product.price || "",
          category: product.category || "",
          subCategory: product.subCategory || "",
          audience: product.audience || "Unisex",
          brand: product.brand || "",
          sku: product.sku || "",
          description: product.description || "",
          stock: product.stock || "",
          tags: product.tags ? (Array.isArray(product.tags) ? product.tags.join(", ") : product.tags) : "",
          keywords: product.keywords ? (Array.isArray(product.keywords) ? product.keywords.join(", ") : product.keywords) : "",
          seoDescription: product.shortDescription || ""
        });

        if (product.specifications) {
          setCustomAttributes(product.specifications);
        }

        if (product.attributes && typeof product.attributes === "object") {
          const standardFields = [
            'name', 'slug', 'category', 'subCategory', 'price', 'discountPrice', 'images',
            'brand', 'stock', 'sku', 'description', 'shortDescription', 'tags', 'keywords',
            'searchKeywords', 'specifications', 'collections', 'rating', 'ratings', 'highlights',
            'careInstructions', 'variants', 'shipping', 'seller', 'seo', 'isFeatured',
            'isTrending', 'isActive', 'createdAt', 'preview', 'audience', 'attributes'
          ];
          const formattedAttrs = Object.entries(product.attributes)
            .filter(([name]) => !standardFields.includes(name))
            .map(([name, vals]) => ({
              name,
              values: Array.isArray(vals) ? vals.join(", ") : String(vals)
            }));
          setProductAttributes(formattedAttrs);
        }

        if (product.images) {
          setUploadedFiles(
            product.images.map((img, idx) => ({
              file: null,
              preview: img,
              isCover: idx === 0
            }))
          );
        }

        if (product.collections) {
          setSelectedCollections(product.collections);
        }

        toast.success("JSON data parsed and populated in the form! Please review and publish.");
        setActiveMode("form");
        setJsonText("");
      } else {
        toast.error(response.data.message || "Failed to generate product");
      }
    } catch (err) {
      toast.error("Failed to generate product: " + (err.response?.data?.message || err.message));
    } finally {
      setLoader("enrichJson", false);
    }
  };

  // Targeted Inline AI improvement calls
  const handleAIImproveField = async (field) => {
    if (field === "description" && !newProduct.name) {
      toast.warning("Please provide at least a Product Name so AI has context.");
      return;
    }
    if (field === "seo" && !newProduct.name) {
      toast.warning("Please provide a Product Name first.");
      return;
    }
    if (field === "tags" && !newProduct.name) {
      toast.warning("Please provide a Product Name first.");
      return;
    }
    if (field === "collections" && !newProduct.name) {
      toast.warning("Please provide a Product Name first.");
      return;
    }
    if (field === "specifications" && !newProduct.name) {
      toast.warning("Please provide a Product Name first.");
      return;
    }

    setLoader(field, true);
    try {
      const response = await axios.post(`${backendUrl}/api/ai/improve-field`, {
        field,
        productData: {
          name: newProduct.name,
          brand: newProduct.brand,
          description: newProduct.description,
          category: newProduct.category,
          subCategory: newProduct.subCategory,
          specifications: customAttributes,
          tags: newProduct.tags ? newProduct.tags.split(",").map(t => t.trim()) : [],
          collections: selectedCollections
        }
      });

      if (response.data.success) {
        const data = response.data;
        if (field === "description") {
          setNewProduct(prev => ({ ...prev, description: data.description || prev.description }));
          toast.success("Description optimized!");
        } else if (field === "seo") {
          setNewProduct(prev => ({ 
            ...prev, 
            seoDescription: data.seoDescription || prev.seoDescription,
            keywords: data.keywords ? data.keywords.join(", ") : prev.keywords 
          }));
          toast.success("SEO meta description and keywords generated!");
        } else if (field === "tags") {
          setNewProduct(prev => ({ ...prev, tags: data.tags ? data.tags.join(", ") : prev.tags }));
          toast.success("Search tags generated!");
        } else if (field === "collections") {
          if (data.collections) {
            setSelectedCollections(data.collections);
          }
          toast.success("Suggested collections recommended!");
        } else if (field === "specifications") {
          if (data.specifications) {
            setCustomAttributes(data.specifications);
          }
          toast.success("Specifications populated!");
        }
      }
    } catch (err) {
      toast.error(`Improvement failed: ` + (err.response?.data?.message || err.message));
    } finally {
      setLoader(field, false);
    }
  };

  // Helper collection checkboxes
  const handleCollectionCheckbox = (col) => {
    setSelectedCollections(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  // Final Form Submission
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    // Quick validation safeguards
    if (!newProduct.name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (!newProduct.category.trim()) {
      toast.error("Product Category is required.");
      return;
    }
    const priceNum = parseFloat(newProduct.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Valid Price (> 0) is required.");
      return;
    }
    if (uploadedFiles.length < 1) {
      toast.error("At least one product image is required.");
      return;
    }
    if (!newProduct.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    const coverIndex = uploadedFiles.findIndex(f => f.isCover);
    const finalAttributes = customAttributes.filter(a => a.key.trim() !== "");

    // Build attributes map or array
    const hasDynamicAttrs = productAttributes.some(attr => attr.name.trim() && attr.values.trim());
    let attributesPayload = "";
    let variantsPayload = "";

    if (hasDynamicAttrs) {
      const dynamicAttrsMap = {};
      productAttributes.forEach(attr => {
        if (attr.name.trim() && attr.values.trim()) {
          dynamicAttrsMap[attr.name.trim()] = attr.values
            .split(",")
            .map(v => v.trim())
            .filter(Boolean);
        }
      });
      attributesPayload = JSON.stringify(dynamicAttrsMap);
      variantsPayload = JSON.stringify(productVariants);
    } else {
      attributesPayload = JSON.stringify(finalAttributes);
    }

    const success = await addProduct({
      ...newProduct,
      price: priceNum,
      stock: parseInt(newProduct.stock) || 0,
      images: uploadedFiles.filter(f => f.file !== null).map(f => f.file),
      existingImages: JSON.stringify(uploadedFiles.filter(f => f.file === null).map(f => f.preview)),
      coverIndex: coverIndex >= 0 ? coverIndex : 0,
      attributes: attributesPayload,
      variants: variantsPayload,
      collections: JSON.stringify(selectedCollections)
    });

    if (success) {
      // Clear form
      setNewProduct({
        name: "",
        brand: "",
        price: "",
        stock: "",
        description: "",
        category: "",
        subCategory: "",
        audience: "Unisex",
        sku: "",
        tags: "",
        keywords: "",
        seoDescription: ""
      });
      setCustomAttributes([]);
      setProductAttributes([]);
      setProductVariants([]);
      setUploadedFiles([]);
      setSelectedCollections([]);
      setAiText("");
      setJsonText("");
    }
  };

  // Validation Warnings Checks
  const validationWarnings = [];
  const nameTrimmed = newProduct.name.trim().toLowerCase();
  const isDuplicate = products.some(p => p.name.trim().toLowerCase() === nameTrimmed && !p.isDeleted);
  
  if (isDuplicate) {
    validationWarnings.push({ type: "error", message: "Duplicate Title: A product with this name already exists in your store." });
  }
  if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
    validationWarnings.push({ type: "warning", message: "Missing Price: Product must have a retail price set." });
  }
  if (uploadedFiles.length === 0) {
    validationWarnings.push({ type: "warning", message: "Missing Images: Upload at least 1 image to publish." });
  }
  if (!newProduct.description.trim() || newProduct.description.length < 15) {
    validationWarnings.push({ type: "warning", message: "Incomplete Description: Add a detailed description (min 15 chars)." });
  }

  // Pre-load example templates
  const pasteExampleText = () => {
    setAiText(`OPPO Reno 14 5G\n\nPrice: 32999\nStock: 50\n\n12GB RAM\n256GB Storage\n50MP AI Camera\n5000mAh Battery\n80W Fast Charging\n\nPremium smartphone with AMOLED display.`);
    toast.info("Example product loaded! Click Extract below.");
  };

  const pasteExampleJson = () => {
    setJsonText(`{\n  "name": "OPPO Reno 14 5G",\n  "brand": "OPPO",\n  "price": 32999,\n  "stock": 50,\n  "ram": "12GB",\n  "storage": "256GB"\n}`);
    toast.info("Example JSON loaded! Click Enrich below.");
  };

  // Find subcategories list for selected category
  const selectedCatObj = categories.find(c => c.name === newProduct.category);
  const subCategoriesList = selectedCatObj ? selectedCatObj.subcategories : [];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* Header section */}
      <div className="border-b border-slate-200 dark:border-white/[0.08] pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Smart Product Creation</h2>
          <p className="text-xs text-slate-400 mt-1">Select your preferred mode: manually fill traditional forms, paste raw specs via Smart AI, or supply structured JSON layouts.</p>
        </div>
      </div>

      {/* Switcher Tab Layout */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-full max-w-md">
        <button
          onClick={() => setActiveMode("form")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === "form" 
              ? "bg-white dark:bg-[#172033] text-slate-800 dark:text-white shadow-sm border border-slate-200/50 dark:border-white/[0.04]" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
          }`}
        >
          <FileText size={14} />
          <span>Form Mode</span>
        </button>
        <button
          onClick={() => setActiveMode("ai")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === "ai" 
              ? "bg-white dark:bg-[#172033] text-slate-800 dark:text-white shadow-sm border border-slate-200/50 dark:border-white/[0.04]" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
          }`}
        >
          <Sparkles size={14} />
          <span>Smart AI Mode</span>
        </button>
        <button
          onClick={() => setActiveMode("json")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === "json" 
              ? "bg-white dark:bg-[#172033] text-slate-800 dark:text-white shadow-sm border border-slate-200/50 dark:border-white/[0.04]" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
          }`}
        >
          <Code size={14} />
          <span>JSON Mode</span>
        </button>
      </div>

      {/* Main split dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Creation Forms & Textareas */}
        <div className="lg:col-span-7 space-y-6">
          {/* Smart AI Mode Textarea Block */}
          {activeMode === "ai" && (
            <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-extrabold uppercase text-xs tracking-wider">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>AI Document Parser</span>
                </div>
                <button
                  onClick={pasteExampleText}
                  className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-slate-950 px-2 py-1 rounded transition hover:bg-indigo-100/50 cursor-pointer"
                >
                  Load Example Info
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paste Product Information</label>
                <textarea
                  rows={10}
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Paste product details here (e.g. descriptions, tags, specifications copied from other websites, brochures, or raw notes)..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition resize-y font-sans leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleAIParseText}
                disabled={loaders.parseText}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition hover:shadow-lg hover:shadow-violet-650/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={14} className={loaders.parseText ? "animate-spin" : ""} />
                <span>{loaders.parseText ? "Extracting Structured Product Catalog..." : "AI Parse & Populate"}</span>
              </button>
            </div>
          )}

          {/* JSON Mode Editor Block */}
          {activeMode === "json" && (
            <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold uppercase text-xs tracking-wider">
                  <Code size={14} />
                  <span>JSON Editor & Validator</span>
                </div>
                <button
                  onClick={pasteExampleJson}
                  className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-slate-950 px-2 py-1 rounded transition hover:bg-indigo-100/50 cursor-pointer"
                >
                  Load Example JSON
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paste Product JSON Schema</label>
                  {jsonText.trim() && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      jsonError 
                        ? "bg-red-50 text-red-500 dark:bg-red-950/20" 
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
                    }`}>
                      {jsonError ? <AlertTriangle size={10} /> : <Check size={10} />}
                      {jsonError ? "Syntax Error" : "Syntax Valid"}
                    </span>
                  )}
                </div>

                <textarea
                  rows={10}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder={`{\n  "name": "OPPO Reno 14 5G",\n  "price": 32999\n}`}
                  className={`w-full px-4 py-3 rounded-xl border dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none transition font-mono ${
                    jsonError 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-slate-200 dark:border-white/[0.08] focus:border-orange-500"
                  }`}
                />
                {jsonError && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">Error: {jsonError}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerateProduct}
                disabled={loaders.enrichJson || !!jsonError}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition hover:shadow-lg hover:shadow-indigo-650/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Package size={14} className={loaders.enrichJson ? "animate-spin" : ""} />
                <span>{loaders.enrichJson ? "Generating Product..." : "Generate Product"}</span>
              </button>
            </div>
          )}

          {/* Form Mode Inputs (Available always or showing filled fields) */}
          <form onSubmit={handleCreateProduct} className="space-y-5 bg-white dark:bg-[#172033] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Product Specifications Form</h3>
              {activeMode !== "form" && (
                <span className="text-[9px] font-black text-violet-600 bg-violet-50 dark:bg-slate-950 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 animate-pulse">
                  <Sparkles size={10} />
                  AI populated
                </span>
              )}
            </div>

            {/* Core details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Product Title *</label>
                  <input
                    type="text"
                    placeholder="Samsung Galaxy S25 Ultra"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Brand</label>
                  <input
                    type="text"
                    placeholder="Samsung, Apple, Nike"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category *</label>
                    <button 
                      type="button"
                      onClick={() => setIsCustomCategory(!isCustomCategory)}
                      className="text-[9px] font-extrabold text-orange-500 cursor-pointer"
                    >
                      {isCustomCategory ? "Select Existing" : "Enter Custom"}
                    </button>
                  </div>
                  {isCustomCategory ? (
                    <input
                      type="text"
                      placeholder="e.g. Smart Electronics"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition"
                      required
                    />
                  ) : (
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value, subCategory: "" })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition cursor-pointer"
                      required
                    >
                      <option value="">Choose Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subcategory</label>
                    <button 
                      type="button"
                      onClick={() => setIsCustomSubCategory(!isCustomSubCategory)}
                      className="text-[9px] font-extrabold text-orange-500 cursor-pointer"
                    >
                      {isCustomSubCategory ? "Select Existing" : "Enter Custom"}
                    </button>
                  </div>
                  {isCustomSubCategory || isCustomCategory || subCategoriesList.length === 0 ? (
                    <input
                      type="text"
                      placeholder="e.g. Mobile Phones"
                      value={newProduct.subCategory}
                      onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition"
                    />
                  ) : (
                    <select
                      value={newProduct.subCategory}
                      onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition cursor-pointer"
                    >
                      <option value="">Choose Subcategory</option>
                      {subCategoriesList.map((sub, idx) => (
                        <option key={idx} value={sub}>{sub}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price (₹ INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="29999.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Initial Stock *</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Audience</label>
                  <select
                    value={newProduct.audience}
                    onChange={(e) => setNewProduct({ ...newProduct, audience: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition cursor-pointer"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              {/* SKU & Search Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seller SKU Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. SAM-S25-ULTRA"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tags (Comma Separated)</label>
                    <button
                      type="button"
                      onClick={() => handleAIImproveField("tags")}
                      disabled={loaders.tags}
                      className="text-[9px] font-extrabold text-violet-600 dark:text-violet-400 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {loaders.tags ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      <span>✨ Auto Tags</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="android, galaxy, smartphone"
                    value={newProduct.tags}
                    onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Description Textarea */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Product Description *</label>
                  <button
                    type="button"
                    onClick={() => handleAIImproveField("description")}
                    disabled={loaders.description}
                    className="text-[9px] font-extrabold text-violet-600 dark:text-violet-400 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {loaders.description ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    <span>✨ Improve Description</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Enter details about this product. Mention specifications, key highlights, build details..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition resize-y"
                  required
                />
              </div>

              {/* Specifications / Attributes section */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Product Specifications</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAIImproveField("specifications")}
                      disabled={loaders.specifications}
                      className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 hover:bg-violet-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-violet-750 dark:text-violet-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                    >
                      {loaders.specifications ? <RefreshCw size={8} className="animate-spin" /> : <Sparkles size={8} />}
                      <span>✨ Complete Specs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomAttributes(prev => [...prev, { key: "", value: "" }])}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                    >
                      <Plus size={10} />
                      <span>Add Attribute</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {customAttributes.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Key (e.g. RAM)"
                        value={attr.key}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomAttributes(prev => {
                            const updated = [...prev];
                            updated[idx].key = val;
                            return updated;
                          });
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 12GB)"
                        value={attr.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomAttributes(prev => {
                            const updated = [...prev];
                            updated[idx].value = val;
                            return updated;
                          });
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomAttributes(prev => prev.filter((_, i) => i !== idx))}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {customAttributes.length === 0 && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No specifications added yet. Add custom specifications manually or use AI Complete.</p>
                  )}
                </div>
              </div>

              {/* Dynamic Selection Attributes & Variants Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dynamic Product Attributes</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Define attributes (e.g. Size, Color) with comma-separated values to automatically build variations.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProductAttributes(prev => [...prev, { name: "", values: "" }])}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer shrink-0"
                  >
                    <Plus size={10} />
                    <span>Add Dynamic Attribute</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {productAttributes.map((attr, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-white/[0.04]">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          placeholder="Attribute Name (e.g. Color)"
                          value={attr.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProductAttributes(prev => {
                              const updated = [...prev];
                              updated[idx].name = val;
                              return updated;
                            });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500"
                        />
                        <input
                          type="text"
                          placeholder="Values (comma-separated, e.g. Black, White, Red)"
                          value={attr.values}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProductAttributes(prev => {
                              const updated = [...prev];
                              updated[idx].values = val;
                              return updated;
                            });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setProductAttributes(prev => prev.filter((_, i) => i !== idx))}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition cursor-pointer self-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Variants Grid Table */}
                {productVariants.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Generated Variants ({productVariants.length})</span>
                    <div className="overflow-x-auto rounded-xl border border-slate-250 dark:border-white/[0.08]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-250 dark:border-white/[0.08]">
                            <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Combination</th>
                            <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-1/3">SKU</th>
                            <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20">Price (₹)</th>
                            <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-16">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                          {productVariants.map((variant, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                              <td className="px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(variant.attributes).map(([k, v]) => (
                                    <span key={k} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                      {k}: {v}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={variant.sku}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setProductVariants(prev => {
                                      const updated = [...prev];
                                      updated[idx].sku = val;
                                      return updated;
                                    });
                                  }}
                                  className="w-full px-2 py-1 bg-transparent border border-slate-200 dark:border-white/[0.08] rounded text-xs text-slate-800 dark:text-white outline-none focus:border-orange-500"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setProductVariants(prev => {
                                      const updated = [...prev];
                                      updated[idx].price = val;
                                      return updated;
                                    });
                                  }}
                                  className="w-full px-2 py-1 bg-transparent border border-slate-200 dark:border-white/[0.08] rounded text-xs text-slate-800 dark:text-white outline-none focus:border-orange-500"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setProductVariants(prev => {
                                      const updated = [...prev];
                                      updated[idx].stock = val;
                                      return updated;
                                    });
                                  }}
                                  className="w-full px-2 py-1 bg-transparent border border-slate-200 dark:border-white/[0.08] rounded text-xs text-slate-800 dark:text-white outline-none focus:border-orange-500"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Collections section */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Collections</span>
                  <button
                    type="button"
                    onClick={() => handleAIImproveField("collections")}
                    disabled={loaders.collections}
                    className="text-[9px] font-extrabold text-violet-600 dark:text-violet-400 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {loaders.collections ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    <span>✨ Suggest Collections</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {collectionsList.map((col) => {
                    const isSelected = selectedCollections.includes(col);
                    return (
                      <div
                        key={col}
                        onClick={() => handleCollectionCheckbox(col)}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                          isSelected
                            ? "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900 text-orange-700 dark:text-orange-300 font-extrabold"
                            : "border-slate-100 dark:border-white/[0.04] bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        <BookmarkCheck size={12} className={isSelected ? "opacity-100 text-orange-500" : "opacity-35"} />
                        <span className="text-[10px] truncate">{col}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SEO details */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-black">SEO Metadata</span>
                  <button
                    type="button"
                    onClick={() => handleAIImproveField("seo")}
                    disabled={loaders.seo}
                    className="text-[9px] font-extrabold text-violet-600 dark:text-violet-400 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {loaders.seo ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    <span>✨ Generate SEO</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SEO Keywords (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. fast charging, 5g phone, oppo reno"
                      value={newProduct.keywords}
                      onChange={(e) => setNewProduct({ ...newProduct, keywords: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SEO Meta Description</label>
                    <input
                      type="text"
                      placeholder="SEO meta description snippet..."
                      value={newProduct.seoDescription}
                      onChange={(e) => setNewProduct({ ...newProduct, seoDescription: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload section */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Product Images *</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                    dragActive ? "border-orange-500 bg-orange-500/5" : "border-slate-200 hover:border-slate-350 dark:border-white/[0.08]"
                  }`}
                  onClick={() => document.getElementById("file-upload-input").click()}
                >
                  <Upload size={20} className="text-slate-400 mb-1" />
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Drag & drop images here</p>
                  <p className="text-[9px] text-slate-400">or click to browse from folders (JPG, PNG, WEBP)</p>
                  <input
                    type="file"
                    id="file-upload-input"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {uploadedFiles.map((fileObj, idx) => (
                      <div key={idx} className="relative group border border-slate-200 dark:border-white/[0.08] rounded-xl overflow-hidden p-1 flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-900">
                        <img
                          src={fileObj.preview}
                          alt=""
                          className="w-full h-16 object-cover rounded-lg"
                        />
                        <div className="flex justify-between items-center text-[8px] gap-1 px-1">
                          <button
                            type="button"
                            onClick={() => setCoverFile(idx)}
                            className={`px-1.5 py-0.5 rounded font-black transition cursor-pointer ${
                              fileObj.isCover ? "bg-orange-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {fileObj.isCover ? "Cover" : "Set Cover"}
                          </button>
                          
                          <div className="flex gap-0.5">
                            <button
                              type="button"
                              onClick={() => moveUploadedFile(idx, -1)}
                              disabled={idx === 0}
                              className="p-0.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowLeft size={8} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveUploadedFile(idx, 1)}
                              disabled={idx === uploadedFiles.length - 1}
                              className="p-0.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowRight size={8} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeUploadedFile(idx)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded-md transition cursor-pointer"
                          >
                            <Trash2 size={9} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Submit Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.04]">
              <button
                type="submit"
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle size={14} />
                <span>Publish Listing (Requires Admin Verification)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Live Previews & Warnings */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Validation Warnings Summary Panel */}
          {validationWarnings.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-extrabold uppercase text-[10px] tracking-wider">
                <AlertTriangle size={14} />
                <span>Pre-submission Flags ({validationWarnings.length})</span>
              </div>
              <ul className="space-y-1.5">
                {validationWarnings.map((warn, index) => (
                  <li key={index} className="text-[10px] text-amber-700 dark:text-amber-300 font-medium leading-normal flex items-start gap-1">
                    <span className="mt-0.5">•</span>
                    <span>{warn.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview panel switcher */}
          <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-slate-800 dark:text-white font-extrabold uppercase text-xs tracking-wider">
                <Eye size={14} />
                <span>Instant Live Preview</span>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                <button
                  onClick={() => setActivePreviewTab("card")}
                  className={`px-2 py-1.5 rounded-md transition cursor-pointer ${
                    activePreviewTab === "card" 
                      ? "bg-white dark:bg-[#172033] text-slate-800 dark:text-white shadow-sm" 
                      : "text-slate-500"
                  }`}
                >
                  Card
                </button>
                <button
                  onClick={() => setActivePreviewTab("page")}
                  className={`px-2 py-1.5 rounded-md transition cursor-pointer ${
                    activePreviewTab === "page" 
                      ? "bg-white dark:bg-[#172033] text-slate-800 dark:text-white shadow-sm" 
                      : "text-slate-500"
                  }`}
                >
                  Page
                </button>
                <button
                  onClick={() => setActivePreviewTab("seo")}
                  className={`px-2 py-1.5 rounded-md transition cursor-pointer ${
                    activePreviewTab === "seo" 
                      ? "bg-white dark:bg-[#172033] text-slate-800 dark:text-white shadow-sm" 
                      : "text-slate-500"
                  }`}
                >
                  SEO
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="overflow-hidden min-h-[300px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-4 border border-dashed border-slate-200 dark:border-white/[0.04]">
              
              {/* Card Preview */}
              {activePreviewTab === "card" && (
                <div className="w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-md flex flex-col transition hover:shadow-lg">
                  <div className="relative h-44 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                    {uploadedFiles.length > 0 ? (
                      <img
                        src={uploadedFiles.find(f => f.isCover)?.preview || uploadedFiles[0].preview}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={36} className="text-slate-350 dark:text-slate-700 animate-pulse" />
                    )}

                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
                      {newProduct.category && (
                        <span className="bg-orange-500 text-white text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                          {newProduct.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2 text-left flex-1 flex flex-col justify-between">
                    <div>
                      {newProduct.brand && (
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">
                          {newProduct.brand}
                        </span>
                      )}
                      <h4 className="text-xs font-black text-slate-850 dark:text-white line-clamp-1 mt-0.5">
                        {newProduct.name || "Untitled Product"}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-1 leading-normal font-sans">
                        {newProduct.description || "No description set yet."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/[0.04] mt-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        ₹ {parseFloat(newProduct.price) ? parseFloat(newProduct.price).toLocaleString("en-IN") : "0"}
                      </span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                        parseInt(newProduct.stock) > 0 
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" 
                          : "bg-red-50 text-red-500 dark:bg-red-950/20"
                      }`}>
                        {parseInt(newProduct.stock) > 0 ? `In Stock (${newProduct.stock})` : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Page Preview */}
              {activePreviewTab === "page" && (
                <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 space-y-4 text-left text-xs text-slate-800 dark:text-white shadow-md">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 h-20 bg-slate-100 dark:bg-slate-950 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/[0.08]">
                      {uploadedFiles.length > 0 ? (
                        <img
                          src={uploadedFiles.find(f => f.isCover)?.preview || uploadedFiles[0].preview}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={20} className="text-slate-300 dark:text-slate-700" />
                      )}
                    </div>
                    <div className="col-span-2 space-y-1">
                      {newProduct.brand && (
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">{newProduct.brand}</span>
                      )}
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{newProduct.name || "Untitled Product"}</h4>
                      <p className="text-sm font-black text-orange-500 mt-1">₹ {parseFloat(newProduct.price) ? parseFloat(newProduct.price).toLocaleString("en-IN") : "0"}</p>
                    </div>
                  </div>

                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg text-[10px]">
                    <p><strong className="text-slate-400 uppercase tracking-wider text-[8px]">Audience:</strong> {newProduct.audience}</p>
                    {newProduct.category && <p><strong className="text-slate-400 uppercase tracking-wider text-[8px]">Category:</strong> {newProduct.category} {newProduct.subCategory && ` / ${newProduct.subCategory}`}</p>}
                    {selectedCollections.length > 0 && <p><strong className="text-slate-400 uppercase tracking-wider text-[8px]">Collections:</strong> {selectedCollections.join(", ")}</p>}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">About this item</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                      {newProduct.description || "No description set."}
                    </p>
                  </div>

                  {customAttributes.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-100 dark:border-white/[0.04] pb-1">Technical Specifications</span>
                      <div className="grid grid-cols-2 gap-1.5 text-[9px] pt-1">
                        {customAttributes.map((attr, idx) => (
                          <div key={idx} className="flex justify-between border-b border-slate-50 dark:border-white/[0.02] pb-0.5">
                            <span className="font-bold text-slate-450 uppercase">{attr.key || "Specs"}:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[90px]">{attr.value || "Details"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {newProduct.tags && (
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {newProduct.tags.split(",").map((tag, idx) => (
                        <span key={idx} className="text-[8px] bg-slate-100 dark:bg-slate-950 text-slate-650 dark:text-slate-400 px-2 py-0.5 rounded font-medium">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SEO Google Search Result Preview */}
              {activePreviewTab === "seo" && (
                <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5 text-left shadow-md max-w-sm">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-sans">
                    <Globe size={10} className="text-slate-400" />
                    <span>https://cartnow.com</span>
                    <span>›</span>
                    <span className="text-slate-400 truncate max-w-[150px]">
                      product › {newProduct.name ? newProduct.name.toLowerCase().replace(/\s+/g, "-") : "listing"}
                    </span>
                  </div>

                  <a 
                    href="#seo-preview" 
                    className="text-indigo-700 hover:underline text-sm font-medium font-sans block leading-snug truncate cursor-pointer"
                  >
                    {newProduct.name ? `${newProduct.name} | Buy ${newProduct.brand || "Online"}` : "Untitled Product Listing | CartNow"}
                  </a>

                  <p className="text-[10px] text-slate-600 font-sans leading-normal line-clamp-3">
                    {newProduct.seoDescription || newProduct.description || "Enter a meta description or let the AI Generate SEO details to optimize Google and search engine rankings."}
                  </p>

                  {newProduct.keywords && (
                    <div className="flex items-center gap-1 text-[8px] text-slate-400 uppercase font-black pt-1">
                      <Search size={8} />
                      <span>Keywords: {newProduct.keywords}</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;

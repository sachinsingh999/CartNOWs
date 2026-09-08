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
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Sliders,
  Zap,
  X,
  EyeOff,
  Loader2,
  CheckCircle2,
  PartyPopper,
  BookOpen,
  Info,
  ExternalLink,
  LayoutGrid,
  Table2,
  ShoppingCart,
  SlidersHorizontal,
  CheckCheck,
  Coins,
  Image,
  Boxes,
  Tag,
  Link2,
  Percent,
  BadgePercent,
  Wand2,
  Hash,
  Rocket
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import MonacoJsonEditor from "../components/MonacoJsonEditor";
import MonacoTextEditor from "../components/MonacoTextEditor";

const AddProduct = ({ token, addProduct, products = [], fetchProducts }) => {
  // Modes: "form", "ai", "json"
  const [activeMode, setActiveMode] = useState("form");
  const [hasGeneratedFromJson, setHasGeneratedFromJson] = useState(false);
  const [hasGeneratedFromAi, setHasGeneratedFromAi] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [showJsonGuide, setShowJsonGuide] = useState(false);
  const [showFullGuideModal, setShowFullGuideModal] = useState(false);
  const [guideActiveTab, setGuideActiveTab] = useState("overview");

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

  // Quick input states & helpers
  const [imageUrlInput, setImageUrlInput] = useState("");

  const handleGenerateSku = () => {
    const brandPart = (newProduct.brand || "CART").slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "");
    const namePart = (newProduct.name || "ITEM").split(/\s+/).slice(0, 2).map(w => w.slice(0, 3)).join("-").toUpperCase().replace(/[^A-Z0-9-]/g, "");
    const randPart = Math.floor(100 + Math.random() * 900);
    const generated = `${brandPart || "CN"}-${namePart || "PRD"}-${randPart}`;
    setNewProduct(prev => ({ ...prev, sku: generated }));
    toast.info(`Generated SKU: ${generated}`);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("Please enter a valid HTTP or HTTPS image URL");
      return;
    }
    if (uploadedFiles.length >= 10) {
      toast.error("Maximum limit of 10 images reached");
      return;
    }
    setUploadedFiles(prev => [
      ...prev,
      {
        file: null,
        preview: url,
        isCover: prev.length === 0
      }
    ]);
    setImageUrlInput("");
    toast.success("Image URL added to gallery!");
  };

  const handleAddCommonSpecs = () => {
    const common = [
      { key: "Warranty", value: "1 Year Manufacturer Warranty" },
      { key: "Country of Origin", value: "India" },
      { key: "Package Contents", value: "1x Main Unit, User Manual, Standard Accessories" }
    ];
    setCustomAttributes(prev => {
      const existingKeys = new Set(prev.map(p => p.key.toLowerCase()));
      const toAdd = common.filter(c => !existingKeys.has(c.key.toLowerCase()));
      return [...prev, ...toAdd];
    });
    toast.success("Added common technical specification templates!");
  };

  const handleQuickStock = (amount) => {
    const current = parseInt(newProduct.stock, 10) || 0;
    setNewProduct(prev => ({ ...prev, stock: String(Math.max(0, current + amount)) }));
  };

  const handleInsertDescriptionTemplate = (templateType) => {
    let snippet = "";
    if (templateType === "features") {
      snippet = "Key Highlights & Features:\n• Premium build quality engineered for long-lasting durability\n• High performance with reliable daily efficiency\n• Ergonomic design tailored for optimal user comfort\n• Rigorously quality-tested to exceed industry standards";
    } else if (templateType === "box") {
      snippet = "Package Contents:\n• 1x Main Product Unit\n• 1x Quick Setup Guide & Instruction Manual\n• 1x Standard Accessories Kit\n• 1x Warranty Registration Card";
    } else if (templateType === "warranty") {
      snippet = "Warranty & Customer Care:\n• 1 Year Comprehensive Brand Warranty\n• 7-day hassle-free replacement on verified manufacturing defects\n• 24/7 dedicated customer assistance on CartNOW marketplace";
    }
    if (!snippet) return;

    setNewProduct(prev => ({
      ...prev,
      description: prev.description?.trim()
        ? `${prev.description.trim()}\n\n${snippet}`
        : snippet
    }));
    toast.success("Template inserted into product description!");
  };

  // Multi-step Wizard Flow States (Step 1 to 6)
  const [formStep, setFormStep] = useState(1);
  const [viewAllSteps, setViewAllSteps] = useState(false); // default false: step-by-step wizard

  // Metadata for Wizard Stepper
  const WIZARD_STEPS = [
    {
      id: 1,
      title: "Identity",
      subtitle: "Title & Category",
      icon: Tag,
      isComplete: Boolean(newProduct.name?.trim() && newProduct.category?.trim())
    },
    {
      id: 2,
      title: "Pricing & Stock",
      subtitle: "Price & Inventory",
      icon: Coins,
      isComplete: Boolean(newProduct.price && parseFloat(newProduct.price) > 0 && newProduct.stock !== "")
    },
    {
      id: 3,
      title: "Media & Photos",
      subtitle: "Product Gallery",
      icon: Image,
      isComplete: Boolean(uploadedFiles.length > 0)
    },
    {
      id: 4,
      title: "Attributes & Matrix",
      subtitle: "Dynamic Variants",
      icon: Boxes,
      isComplete: Boolean(productAttributes.length > 0 && productVariants.length > 0)
    },
    {
      id: 5,
      title: "Details & Specs",
      subtitle: "Overview & Tech Specs",
      icon: FileText,
      isComplete: Boolean(newProduct.description?.trim())
    },
    {
      id: 6,
      title: "Review & Publish",
      subtitle: "SEO & Marketplace Launch",
      icon: Rocket,
      isComplete: Boolean(
        newProduct.name?.trim() &&
        newProduct.category?.trim() &&
        parseFloat(newProduct.price) > 0 &&
        uploadedFiles.length > 0 &&
        newProduct.description?.trim()
      )
    }
  ];


  const handleNextStep = (targetStep) => {
    if (formStep === 1) {
      if (!newProduct.name.trim()) {
        toast.warning("Please enter a Product Title before continuing.");
        return;
      }
      if (!newProduct.category.trim()) {
        toast.warning("Please select or enter a Category.");
        return;
      }
    } else if (formStep === 2) {
      const priceNum = parseFloat(newProduct.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        toast.warning("Please enter a valid selling price (> 0).");
        return;
      }
      const stockNum = parseInt(newProduct.stock, 10);
      if (isNaN(stockNum) || stockNum < 0) {
        toast.warning("Stock quantity cannot be negative.");
        return;
      }
    } else if (formStep === 3) {
      if (uploadedFiles.length === 0) {
        toast.info("💡 You haven't added photos yet, but you can continue and add them before publishing.");
      }
    } else if (formStep === 4) {
      const invalidVariant = productVariants.find(
        (v) => (v.price !== undefined && Number(v.price) < 0) || (v.stock !== undefined && Number(v.stock) < 0)
      );
      if (invalidVariant) {
        toast.warning("Variant prices and stock cannot be negative.");
        return;
      }
    }
    setFormStep(targetStep);
    const container = document.getElementById("catalog-form-top");
    if (container) {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePrevStep = () => {
    setFormStep((prev) => Math.max(1, prev - 1));
    const container = document.getElementById("catalog-form-top");
    if (container) {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Auto-Variant Generator logic: Generates variants STRICTLY from Dynamic Attributes ONLY
  useEffect(() => {
    const attrMap = {};

    // Gather ONLY from productAttributes (Dynamic Attributes)
    productAttributes.forEach(attr => {
      const name = attr.name ? attr.name.trim() : "";
      if (!name || attr.displayType === "hidden" || attr.displayType === "specification") return;

      const rawVal = (attr.values && attr.values.trim()) 
        ? attr.values 
        : ((attr.value && typeof attr.value === "string") ? attr.value.trim() : "");

      if (!rawVal) return;

      const parsedVals = rawVal
        .split(",")
        .map(v => v.trim())
        .filter(Boolean);

      if (parsedVals.length > 0) {
        attrMap[name] = parsedVals;
      }
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
    const hasExplicitStock = newProduct.stock !== "" && newProduct.stock !== undefined && !isNaN(parseInt(newProduct.stock));
    const baseStock = hasExplicitStock ? parseInt(newProduct.stock) : (basePrice > 0 ? 10 : 0);
    const baseSku = newProduct.sku || (newProduct.name ? newProduct.name.substring(0, 5).toUpperCase() : "PROD");

    const newVariants = combinations.map((comb, idx) => {
      const existing = productVariants.find(v => {
        return attrKeys.every(k => (v.attributes && v.attributes[k] === comb[k]) || (v[k] === comb[k]));
      });

      const colorVal = comb.Color || comb.color || Object.entries(comb).find(([k]) => k.toLowerCase().includes("color"))?.[1] || "";
      const sizeVal = comb.Size || comb.size || Object.entries(comb).find(([k]) => k.toLowerCase().includes("size"))?.[1] || "";

      const comboSuffix = Object.values(comb).join("-").toUpperCase();
      const variantPrice = (existing?.price !== undefined && existing?.price > 0) ? existing.price : basePrice;
      const variantStock = (existing?.stock !== undefined && (existing?.stock > 0 || hasExplicitStock)) ? existing.stock : baseStock;

      return {
        Color: colorVal,
        Size: sizeVal,
        sku: existing?.sku || `${baseSku}-${comboSuffix}-${idx}`,
        price: variantPrice,
        stock: variantStock,
        images: existing?.images || [],
        barcode: existing?.barcode || "",
        availability: existing?.availability !== undefined ? existing.availability : true,
        attributes: comb
      };
    });

    setProductVariants(newVariants);
  }, [productAttributes, newProduct.price, newProduct.stock, newProduct.sku, newProduct.name]);

  // Variant management UI optimization & JSON Code Editor states
  const [showAllVariants, setShowAllVariants] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [modalPreviewImageIdx, setModalPreviewImageIdx] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVariantJsonModal, setShowVariantJsonModal] = useState(false);
  const [variantJsonText, setVariantJsonText] = useState("");
  const [variantJsonError, setVariantJsonError] = useState("");
  const [bulkPriceInput, setBulkPriceInput] = useState("");
  const [bulkStockInput, setBulkStockInput] = useState("");

  // Interactive View Modes & Filters for Variant Matrix
  const [matrixViewMode, setMatrixViewMode] = useState("grid"); // "grid" | "table"
  const [variantFilterQuery, setVariantFilterQuery] = useState("");
  const [selectedAttributeFilter, setSelectedAttributeFilter] = useState("all");
  const [selectedPreviewAttrs, setSelectedPreviewAttrs] = useState({});
  const [simulatorSelected, setSimulatorSelected] = useState({
    Color: "Midnight Black",
    Size: "UK 8"
  });

  const handleAdjustVariantPrice = (idx, delta) => {
    setProductVariants(prev => {
      const updated = [...prev];
      const curPrice = parseFloat(updated[idx].price) || 0;
      updated[idx].price = Math.max(0, curPrice + delta);
      return updated;
    });
  };

  const handleAdjustVariantStock = (idx, delta) => {
    setProductVariants(prev => {
      const updated = [...prev];
      const curStock = parseInt(updated[idx].stock) || 0;
      updated[idx].stock = Math.max(0, curStock + delta);
      return updated;
    });
  };

  // Sync selectedPreviewAttrs when dynamic attributes are updated
  useEffect(() => {
    setSelectedPreviewAttrs(prev => {
      const next = { ...prev };
      productAttributes.forEach(attr => {
        if (!attr.name) return;
        const name = attr.name.trim();
        const vals = (attr.values || "").split(",").map(v => v.trim()).filter(Boolean);
        if (vals.length > 0) {
          if (!next[name] || !vals.includes(next[name])) {
            next[name] = vals[0];
          }
        } else {
          delete next[name];
        }
      });
      return next;
    });
  }, [productAttributes]);

  // Compute active matching variant for the Live Product Preview
  const activeMatchingVariant = productVariants.find(v => {
    if (!v.attributes) return false;
    return Object.entries(selectedPreviewAttrs).every(([k, val]) => v.attributes[k] === val);
  }) || (productVariants.length > 0 ? productVariants[0] : null);

  const handleOpenVariantJsonModal = () => {
    const cleanVariants = productVariants.map((v, idx) => {
      const colorVal = v.Color || v.color || v.attributes?.Color || v.attributes?.color || "";
      const sizeVal = v.Size || v.size || v.attributes?.Size || v.attributes?.size || "";
      
      const res = {};
      if (colorVal) res.Color = colorVal;
      if (sizeVal) res.Size = sizeVal;
      
      if (v.attributes) {
        Object.entries(v.attributes).forEach(([k, val]) => {
          if (k !== "Color" && k !== "Size" && k !== "color" && k !== "size") {
            res[k] = val;
          }
        });
      }

      res.sku = v.sku || `SKU-${idx + 1}`;
      res.price = Number(v.price || newProduct.price || 0);
      res.stock = Number(v.stock || 0);

      return res;
    });

    setVariantJsonText(JSON.stringify(cleanVariants, null, 2));
    setVariantJsonError("");
    setShowVariantJsonModal(true);
  };

  const handleApplyVariantJson = () => {
    try {
      const parsed = JSON.parse(variantJsonText);
      if (!Array.isArray(parsed)) {
        setVariantJsonError("JSON must be an array of variant objects.");
        return;
      }
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (typeof item !== "object" || item === null) {
          setVariantJsonError(`Variant #${i + 1} is not a valid object.`);
          return;
        }
        if (item.price !== undefined && Number(item.price) < 0) {
          setVariantJsonError(`Variant #${i + 1} price cannot be negative.`);
          return;
        }
        if (item.stock !== undefined && Number(item.stock) < 0) {
          setVariantJsonError(`Variant #${i + 1} stock cannot be negative.`);
          return;
        }
      }

      const updatedVariants = parsed.map((item, idx) => {
        const colorVal = item.Color || item.color || item.attributes?.Color || item.attributes?.color || "";
        const sizeVal = item.Size || item.size || item.attributes?.Size || item.attributes?.size || "";

        const attrs = { ...item.attributes };
        if (colorVal) attrs.Color = colorVal;
        if (sizeVal) attrs.Size = sizeVal;

        return {
          Color: colorVal,
          Size: sizeVal,
          sku: item.sku || `SKU-${idx + 1}`,
          price: Math.max(0, parseFloat(item.price) || 0),
          stock: Math.max(0, parseInt(item.stock, 10) || 0),
          images: item.images || [],
          barcode: item.barcode || "",
          availability: item.availability !== false,
          attributes: attrs
        };
      });

      setProductVariants(updatedVariants);
      setShowVariantJsonModal(false);
      toast.success("Variant JSON updated successfully! 🚀");
    } catch (err) {
      setVariantJsonError("Invalid JSON syntax: " + err.message);
    }
  };

  const handleApplyBulkPrice = () => {
    const p = parseFloat(bulkPriceInput);
    if (isNaN(p) || p < 0) {
      toast.warning("Price cannot be negative. Please enter a valid non-negative price.");
      return;
    }
    const safePrice = Math.max(0, p);
    setProductVariants(prev => prev.map(v => ({ ...v, price: safePrice })));
    toast.success(`Updated price to ₹${safePrice} across all ${productVariants.length} variants.`);
    setBulkPriceInput("");
  };

  const handleApplyBulkStock = () => {
    const s = parseInt(bulkStockInput, 10);
    if (isNaN(s) || s < 0) {
      toast.warning("Stock cannot be negative. Please enter a valid non-negative stock amount.");
      return;
    }
    const safeStock = Math.max(0, s);
    setProductVariants(prev => prev.map(v => ({ ...v, stock: safeStock })));
    toast.success(`Updated stock to ${safeStock} units across all ${productVariants.length} variants.`);
    setBulkStockInput("");
  };

  // Custom Category & Subcategory text overrides
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomSubCategory, setIsCustomSubCategory] = useState(false);

  // Raw text inputs
  const [aiText, setAiText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState(null);

  // Preview panel tab: "page" | "card" | "seo"
  const [activePreviewTab, setActivePreviewTab] = useState("page");

  // Loaders for specific AI calls
  const [loaders, setLoaders] = useState({
    description: false,
    specifications: false,
    tags: false,
    collections: false,
    seo: false,
    parseText: false,
    enrichJson: false,
    generateImage: false
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

  // Clean up object URLs on unmount only
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(f => {
        if (f.preview && f.file) {
          URL.revokeObjectURL(f.preview);
        }
      });
    };
  }, []);

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
      const target = prev[index];
      if (target && target.preview && target.file) {
        URL.revokeObjectURL(target.preview);
      }
      const updated = prev.filter((_, idx) => idx !== index);
      if (target?.isCover && updated.length > 0) {
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
      let data = null;
      try {
        const response = await axios.post(`${backendUrl}/api/ai/parse-text-product`, { text: aiText });
        if (response.data?.success) {
          data = response.data;
        }
      } catch (apiErr) {
        console.warn("Backend AI parse unavailable, using client heuristics:", apiErr);
      }

      // If backend was unreachable or returned empty, use client regex heuristics
      if (!data) {
        const lines = aiText.split("\n").map(l => l.trim()).filter(Boolean);
        const titleLine = lines[0] || "AI Extracted Product";
        const priceMatch = aiText.match(/(?:price|mrp|cost|₹|rs\.?)\s*[:=-]?\s*(\d+[\d,]*)/i);
        const stockMatch = aiText.match(/(?:stock|qty|quantity|units?)\s*[:=-]?\s*(\d+)/i);
        const brandMatch = aiText.match(/(?:brand|by|maker)\s*[:=-]?\s*([a-zA-Z0-9\s]+)/i);

        data = {
          name: titleLine,
          price: priceMatch ? priceMatch[1].replace(/,/g, "") : "999",
          stock: stockMatch ? stockMatch[1] : "10",
          brand: brandMatch ? brandMatch[1].trim() : "",
          description: aiText,
          audience: "Unisex"
        };
      }

      // Auto check custom categories/subcategories if they aren't in DB
      const matchCat = categories.find(c => c.name.toLowerCase() === (data.category || "").toLowerCase());
      if (!matchCat && data.category) {
        setIsCustomCategory(true);
      } else {
        setIsCustomCategory(false);
      }

      setIsCustomSubCategory(true);

      setNewProduct(prev => ({
        ...prev,
        name: data.name || prev.name,
        brand: data.brand || prev.brand,
        price: data.price !== undefined ? String(data.price) : prev.price,
        stock: data.stock !== undefined ? String(data.stock) : prev.stock,
        description: data.description || prev.description,
        category: data.category || prev.category,
        subCategory: data.subCategory || prev.subCategory,
        audience: data.audience || prev.audience || "Unisex",
        tags: data.tags ? (Array.isArray(data.tags) ? data.tags.join(", ") : data.tags) : prev.tags,
        keywords: data.keywords ? (Array.isArray(data.keywords) ? data.keywords.join(", ") : data.keywords) : prev.keywords
      }));

      if (data.specifications) {
        setCustomAttributes(data.specifications);
      }
      if (data.collections) {
        setSelectedCollections(data.collections);
      }

      setHasGeneratedFromAi(true);
      toast.success("AI parsed and product form populated! Review details below.");
      setTimeout(() => {
        document.getElementById("catalog-form-top")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
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
      if (Number(parsedData.price) < 0) {
        toast.error("Product price cannot be negative.");
        setLoader("enrichJson", false);
        return;
      }
      if (parsedData.stock !== undefined && Number(parsedData.stock) < 0) {
        toast.error("Product stock cannot be negative.");
        setLoader("enrichJson", false);
        return;
      }
      if (!parsedData.images || !Array.isArray(parsedData.images) || parsedData.images.length === 0) {
        toast.error("JSON must contain a non-empty 'images' array.");
        setLoader("enrichJson", false);
        return;
      }

      let product = null;
      try {
        const response = await axios.post(`${backendUrl}/api/seller/generate-product`, { ...parsedData, preview: true }, {
          headers: { token }
        });
        if (response.data?.success && response.data?.product) {
          product = response.data.product;
        }
      } catch (apiErr) {
        console.warn("Backend generate-product unavailable, falling back to direct JSON mapping:", apiErr);
      }

      // Robust fallback to client-side mapping if backend is unreachable
      if (!product) {
        product = {
          ...parsedData,
          name: parsedData.name || "",
          price: parsedData.price !== undefined ? String(Math.max(0, parseFloat(parsedData.price) || 0)) : "",
          category: parsedData.category || "",
          subCategory: parsedData.subCategory || "",
          brand: parsedData.brand || "",
          stock: parsedData.stock !== undefined ? String(Math.max(0, parseInt(parsedData.stock, 10) || 0)) : "10",
          sku: parsedData.sku || "",
          audience: parsedData.audience || "Unisex",
          description: parsedData.description || "",
          shortDescription: parsedData.shortDescription || parsedData.seoDescription || "",
          specifications: parsedData.specifications || [],
          attributes: parsedData.attributes || {},
          tags: parsedData.tags || [],
          keywords: parsedData.keywords || [],
          collections: parsedData.collections || [],
          variants: parsedData.variants || [],
          images: parsedData.images || []
        };
      }

      // Auto check custom categories/subcategories if they aren't in DB
      const matchCat = categories.find(c => c.name.toLowerCase() === (product.category || "").toLowerCase());
      if (!matchCat && product.category) {
        setIsCustomCategory(true);
      } else {
        setIsCustomCategory(false);
      }

      setIsCustomSubCategory(true);

      const rawStock = (product.stock !== undefined && product.stock !== null && product.stock !== "")
        ? product.stock
        : ((parsedData.stock !== undefined && parsedData.stock !== null && parsedData.stock !== "") ? parsedData.stock : "10");
      const safeStockVal = String(Math.max(0, parseInt(rawStock, 10) || 0));

      const rawPrice = product.price !== undefined ? product.price : parsedData.price;
      const safePriceVal = rawPrice !== undefined ? String(Math.max(0, parseFloat(rawPrice) || 0)) : "";

      setNewProduct({
        name: product.name || "",
        price: safePriceVal,
        category: product.category || "",
        subCategory: product.subCategory || "",
        audience: product.audience || "Unisex",
        brand: product.brand || "",
        sku: product.sku || "",
        description: product.description || "",
        stock: safeStockVal,
        tags: product.tags ? (Array.isArray(product.tags) ? product.tags.join(", ") : product.tags) : "",
        keywords: product.keywords ? (Array.isArray(product.keywords) ? product.keywords.join(", ") : product.keywords) : "",
        seoDescription: product.shortDescription || ""
      });

      if (product.specifications) {
        setCustomAttributes(product.specifications);
      }

      if (product.attributes) {
        if (Array.isArray(product.attributes)) {
          const formattedAttrs = product.attributes.map(attr => ({
            name: attr.name || "",
            displayType: attr.displayType || "variant",
            inputType: attr.inputType || "Text",
            value: attr.value || "",
            values: Array.isArray(attr.values) ? attr.values.join(", ") : (attr.values || "")
          }));
          setProductAttributes(formattedAttrs);
        } else if (typeof product.attributes === "object") {
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
              displayType: "variant",
              inputType: "Text",
              value: "",
              values: Array.isArray(vals) ? vals.join(", ") : String(vals)
            }));
          setProductAttributes(formattedAttrs);
        }
      }

      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        const loadedVariants = product.variants.map((v, idx) => ({
          sku: v.sku || `${product.sku || "PROD"}-${idx}`,
          price: Math.max(0, v.price !== undefined ? parseFloat(v.price) || 0 : (parseFloat(product.price) || 0)),
          stock: Math.max(0, v.stock !== undefined ? parseInt(v.stock, 10) || 0 : (parseInt(safeStockVal, 10) || 10)),
          images: v.images || [],
          barcode: v.barcode || "",
          availability: v.availability !== false,
          attributes: v.attributes || {}
        }));
        setProductVariants(loadedVariants);
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

      setHasGeneratedFromJson(true);
      toast.success("Product schema generated and form populated! Review details below.");
      setTimeout(() => {
        document.getElementById("catalog-form-top")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      toast.error("Failed to generate product: " + (err.response?.data?.message || err.message));
    } finally {
      setLoader("enrichJson", false);
    }
  };

  const handleAIGenerateImage = async () => {
    if (!newProduct.name || !newProduct.name.trim()) {
      toast.warning("Please enter a Product Name first so AI knows what to generate.");
      return;
    }

    setLoader("generateImage", true);
    try {
      const response = await axios.post(`${backendUrl}/api/ai/generate-image`, {
        name: newProduct.name,
        description: newProduct.description
      });

      if (response.data.success) {
        const generatedUrl = response.data.imageUrl;
        setUploadedFiles(prev => {
          const isFirst = prev.length === 0;
          return [
            ...prev,
            {
              file: null, // remote hosted image on Cloudinary
              preview: generatedUrl,
              isCover: isFirst
            }
          ];
        });
        toast.success("AI product image generated and added to gallery!");
      } else {
        toast.error(response.data.message || "Failed to generate image.");
      }
    } catch (err) {
      toast.error("AI image generation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoader("generateImage", false);
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
      setFormStep(1);
      const container = document.getElementById("catalog-form-top");
      if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!newProduct.category.trim()) {
      toast.error("Product Category is required.");
      setFormStep(1);
      const container = document.getElementById("catalog-form-top");
      if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const priceNum = parseFloat(newProduct.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Valid Price (> 0) is required.");
      setFormStep(2);
      const container = document.getElementById("catalog-form-top");
      if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const stockNum = parseInt(newProduct.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error("Stock quantity cannot be negative.");
      setFormStep(2);
      const container = document.getElementById("catalog-form-top");
      if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (uploadedFiles.length < 1) {
      toast.error("At least one product image is required.");
      setFormStep(3);
      const container = document.getElementById("catalog-form-top");
      if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!newProduct.description.trim()) {
      toast.error("Description is required.");
      setFormStep(5);
      const container = document.getElementById("catalog-form-top");
      if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const coverIndex = uploadedFiles.findIndex(f => f.isCover);
    const finalAttributes = customAttributes.filter(a => a.key.trim() !== "");

    // Build attributes map or array
    const hasDynamicAttrs = productAttributes.some(attr => attr.name.trim() !== "");
    let attributesPayload = "";
    let variantsPayload = "";

    if (hasDynamicAttrs) {
      // Validate no negative price or stock in variants
      const invalidVariant = productVariants.find(
        v => (v.price !== undefined && Number(v.price) < 0) || (v.stock !== undefined && Number(v.stock) < 0)
      );
      if (invalidVariant) {
        toast.error("Variant prices and stock cannot be negative.");
        setFormStep(4);
        const container = document.getElementById("catalog-form-top");
        if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      const dynamicAttrsArray = productAttributes
        .filter(attr => attr.name.trim() !== "")
        .map(attr => {
          const displayType = attr.displayType || "variant";
          let value = "";
          let values = [];

          if (displayType === "variant") {
            values = attr.values ? attr.values.split(",").map(v => v.trim()).filter(Boolean) : [];
            value = values[0] || "";
          } else {
            value = String(attr.value || "");
          }

          return {
            name: attr.name.trim(),
            displayType,
            inputType: attr.inputType || "Text",
            value,
            values
          };
        });

      const sanitizedVariants = productVariants.map(v => ({
        ...v,
        price: Math.max(0, parseFloat(v.price) || 0),
        stock: Math.max(0, parseInt(v.stock, 10) || 0)
      }));

      attributesPayload = JSON.stringify(dynamicAttrsArray);
      variantsPayload = JSON.stringify(sanitizedVariants);
    } else {
      attributesPayload = JSON.stringify(finalAttributes);
    }

    setIsPublishing(true);
    try {
      const success = await addProduct({
        ...newProduct,
        price: Math.max(0, priceNum),
        stock: Math.max(0, stockNum),
        images: uploadedFiles.filter(f => f.file !== null).map(f => f.file),
        existingImages: JSON.stringify(uploadedFiles.filter(f => f.file === null).map(f => f.preview)),
        coverIndex: coverIndex >= 0 ? coverIndex : 0,
        attributes: attributesPayload,
        variants: variantsPayload,
        collections: JSON.stringify(selectedCollections)
      });

      if (success) {
        setShowSuccessModal(true);
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
    } finally {
      setIsPublishing(false);
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
    setJsonText(JSON.stringify({
      name: "Nike Air Max Pulse",
      category: "Footwear",
      subCategory: "Sneakers",
      price: 12999,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"
      ],
      brand: "Nike",
      stock: 120,
      sku: "NK-AMP-001",
      audience: "Unisex",
      description: "The Nike Air Max Pulse pulls inspiration from the London music scene, bringing an underground touch to the iconic Air Max line.",
      shortDescription: "Stylishly comfortable sneakers featuring advanced Air Max cushioning.",
      tags: ["shoes", "sneakers", "nike", "running", "casual"],
      keywords: ["nike air max", "sneakers for men", "unisex shoes", "running footwear"],
      collections: ["Trending Now"],
      specifications: [
        { key: "Sole Material", value: "Rubber" },
        { key: "Upper Material", value: "Mesh & Leather" }
      ],
      attributes: {
        Color: ["Red", "White", "Black"]
      }
    }, null, 2));
toast.info("Example JSON loaded! Click Enrich below.");
  };

  // Find subcategories list for selected category
  const selectedCatObj = categories.find(c => c.name === newProduct.category);
  const subCategoriesList = selectedCatObj ? selectedCatObj.subcategories : [];
  
  // Calculate Form Completeness Percentage
  const requiredFields = [
    Boolean(newProduct.name?.trim()),
    Boolean(newProduct.price && parseFloat(newProduct.price) > 0),
    Boolean(newProduct.category?.trim()),
    Boolean(newProduct.stock !== "" && parseInt(newProduct.stock) >= 0),
    Boolean(newProduct.description?.trim()),
    Boolean(uploadedFiles.length > 0)
  ];
  const completedCount = requiredFields.filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / requiredFields.length) * 100);

  return (
    <div className="w-full px-1 sm:px-2 py-1 space-y-3.5 text-left pb-12">
      
      {/* ==================== COMPACT HEADER & MODE SWITCHER ==================== */}
      <div className="bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2 sm:py-2.5 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Title & Mode Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight shrink-0">
            Create Product
          </h2>

          {/* Segmented Mode Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl shadow-inner">
            <button
              type="button"
              onClick={() => setActiveMode("form")}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeMode === "form" 
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" 
              }`}
            >
              <FileText size={13} />
              <span>Form</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeMode === "ai" && hasGeneratedFromAi) {
                  setHasGeneratedFromAi(false);
                }
                setActiveMode("ai");
              }}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeMode === "ai" 
                  ? "bg-violet-600 text-white shadow-xs" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" 
              }`}
            >
              <Sparkles size={13} className={activeMode === "ai" ? "animate-pulse" : ""} />
              <span>Smart AI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeMode === "json" && hasGeneratedFromJson) {
                  setHasGeneratedFromJson(false);
                }
                setActiveMode("json");
              }}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeMode === "json" 
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" 
              }`}
            >
              <Code size={13} />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Right: Readiness + Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap ml-auto">
          {/* Readiness Mini Bar */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Readiness</span>
            <div className="w-16 sm:w-20 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  completionPercentage === 100 
                    ? "bg-emerald-500" 
                    : completionPercentage > 50 
                    ? "bg-orange-500" 
                    : "bg-amber-500"
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className={`text-[11px] font-black ${
              completionPercentage === 100 ? "text-emerald-500" : "text-orange-500"
            }`}>
              {completionPercentage}% <span className="text-slate-400 font-medium text-[10px]">({completedCount}/6)</span>
            </span>
          </div>

          {/* Action Buttons */}
          <button
            type="button"
            onClick={() => setShowFullGuideModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
            title="Open Complete Guide"
          >
            <BookOpen size={13} className="text-orange-500" />
            <span>Guide</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setModalPreviewImageIdx(0);
              setActivePreviewTab("page");
              setShowPreviewModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
            title="Open Live Product Preview Pop-up"
          >
            <Eye size={13} className="text-orange-500" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* ==================== MAIN STUDIO DASHBOARD LAYOUT ==================== */}
      <div className="w-full space-y-4">
        
        {/* CREATION CARDS & FORMS */}
        <div className="w-full space-y-4">
          
          {/* SMART AI MODE: Left & Right Layout (Hidden once product is generated) */}
          {activeMode === "ai" && !hasGeneratedFromAi && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch text-left animate-in fade-in duration-200">
              
              {/* LEFT COLUMN: AI Document Extractor (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-black uppercase text-xs tracking-wider">
                      <Sparkles size={16} className="animate-pulse text-violet-500" />
                      <span>AI Product Document Extractor</span>
                    </div>
                    {aiText.trim() && (
                      <span className="text-[9px] font-black px-2.5 py-0.5 rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300 border border-violet-500/20 flex items-center gap-1">
                        <Check size={10} />
                        <span>{aiText.trim().split(/\s+/).length} Words Detected</span>
                      </span>
                    )}
                  </div>

                  {/* Monaco Document Editor */}
                  <div className="pt-1">
                    <MonacoTextEditor
                      value={aiText}
                      onChange={setAiText}
                      onLoadSample={pasteExampleText}
                      height="400px"
                    />
                  </div>
                </div>


                {/* Quick actions row */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={pasteExampleText}
                    className="w-full sm:w-auto px-3.5 py-2.5 text-[11px] font-bold bg-violet-50 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-slate-700 text-violet-600 dark:text-violet-400 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <FileText size={12} />
                    <span>Load Sample Info</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAIParseText}
                    disabled={loaders.parseText}
                    className="flex-1 w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-violet-600/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={14} className={loaders.parseText ? "animate-spin" : ""} />
                    <span>{loaders.parseText ? "Extracting Structured Product Catalog..." : "AI Parse & Populate Form"}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: AI Capabilities & Guidance (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  {/* Header with Master Guide */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold text-xs">
                        <Sparkles size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                          AI Intelligence Engine
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Neural unstructured copy parser
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowFullGuideModal(true)}
                      className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen size={11} />
                      <span>Master Guide</span>
                    </button>
                  </div>

                  {/* Helper instruction */}
                  <div className="bg-violet-50/50 dark:bg-slate-950/60 rounded-xl p-3 border border-violet-100 dark:border-violet-900/30 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
                    <p>
                      Paste product notes, raw descriptions, or spec sheets on the left and click <strong className="text-violet-600 dark:text-violet-400">"AI Parse & Populate Form"</strong> to extract all fields automatically.
                    </p>
                    <button
                      type="button"
                      onClick={pasteExampleText}
                      className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Insert Sample Product Specs</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* Extraction Capabilities list */}
                  <div className="space-y-2.5">
                    <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5">
                      <span className="font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <CheckCircle2 size={11} /> What AI Automatically Extracts
                      </span>
                      <ul className="text-[10px] space-y-1 text-slate-600 dark:text-slate-400">
                        <li><strong className="text-slate-700 dark:text-slate-300">Identity:</strong> Title, Brand, Model & Audience</li>
                        <li><strong className="text-slate-700 dark:text-slate-300">Pricing & Stock:</strong> Retail price (INR) and inventory count</li>
                        <li><strong className="text-slate-700 dark:text-slate-300">Classification:</strong> Category & subcategory taxonomy</li>
                        <li><strong className="text-slate-700 dark:text-slate-300">Specifications:</strong> Technical attributes (RAM, Storage, etc.)</li>
                        <li><strong className="text-slate-700 dark:text-slate-300">SEO:</strong> Search keywords and tags</li>
                      </ul>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5">
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Info size={11} /> Pro Tips for Maximum Accuracy
                      </span>
                      <ul className="text-[10px] space-y-1 text-slate-600 dark:text-slate-400">
                        <li>Include explicit price and stock (e.g. <code className="font-mono text-pink-500">Price: 19999</code>)</li>
                        <li>Bullet-point specs are parsed directly into the technical table</li>
                        <li>You can review and edit every single field before publishing</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>CartNOW AI Catalog Intelligence</span>
                  <span className="text-violet-500 font-bold">NLP & Vision Enabled</span>
                </div>
              </div>

            </div>
          )}

          {/* JSON MODE: Left & Right Layout (Hidden once product is generated) */}
          {activeMode === "json" && !hasGeneratedFromJson && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch text-left animate-in fade-in duration-200">
              
              {/* LEFT COLUMN: JSON Code Editor & Generator (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase text-xs tracking-wider">
                      <Code size={16} />
                      <span>JSON Editor & Schema Validator</span>
                    </div>
                    {jsonText.trim() && (
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${
                        jsonError ? "bg-red-50 text-red-500 dark:bg-red-950/30 border border-red-500/20" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 border border-emerald-500/20"
                      }`}>
                        {jsonError ? <AlertTriangle size={10} /> : <Check size={10} />}
                        {jsonError ? "Syntax Error" : "Syntax Valid"}
                      </span>
                    )}
                  </div>

                  {/* Monaco JSON Editor */}
                  <div className="pt-1">
                    <MonacoJsonEditor
                      value={jsonText}
                      onChange={setJsonText}
                      error={jsonError}
                      onLoadSample={pasteExampleJson}
                      height="400px"
                    />
                  </div>
                </div>


                {/* Quick actions row */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={pasteExampleJson}
                    className="w-full sm:w-auto px-3.5 py-2.5 text-[11px] font-bold bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <FileText size={12} />
                    <span>Load Sample JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateProduct}
                    disabled={loaders.enrichJson || !!jsonError}
                    className="flex-1 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-indigo-600/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Package size={14} className={loaders.enrichJson ? "animate-spin" : ""} />
                    <span>{loaders.enrichJson ? "Generating Product..." : "Generate Product From JSON"}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Generator Info & Schema Specifications (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  {/* Header with Master Guide */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                        <Code size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                          JSON Listing Generator
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Instant rule-based catalog mapper
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowFullGuideModal(true)}
                      className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen size={11} />
                      <span>Master Guide</span>
                    </button>
                  </div>

                  {/* Helper instruction */}
                  <div className="bg-indigo-50/50 dark:bg-slate-950/60 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900/30 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
                    <p>
                      Paste your schema on the left and click <strong className="text-indigo-600 dark:text-indigo-400">"Generate Product From JSON"</strong> to automatically generate all steps, variants, and specs.
                    </p>
                    <button
                      type="button"
                      onClick={pasteExampleJson}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Insert Working Template</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* Specifications Reference: Required vs Optional */}
                  <div className="space-y-2.5">
                    <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <CheckCircle2 size={11} /> 5 Required Fields
                      </span>
                      <ul className="text-[10px] space-y-1 text-slate-600 dark:text-slate-400">
                        <li><code className="text-pink-600 dark:text-pink-400 font-bold">name</code> (string): Product title</li>
                        <li><code className="text-pink-600 dark:text-pink-400 font-bold">price</code> (number): Retail price in INR</li>
                        <li><code className="text-pink-600 dark:text-pink-400 font-bold">category</code> (string): Main category</li>
                        <li><code className="text-pink-600 dark:text-pink-400 font-bold">subCategory</code> (string): Subtype</li>
                        <li><code className="text-pink-600 dark:text-pink-400 font-bold">images</code> (array): Product photo URLs</li>
                      </ul>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5">
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Info size={11} /> Optional & Recommended Fields
                      </span>
                      <ul className="text-[10px] space-y-1 text-slate-600 dark:text-slate-400">
                        <li><code className="font-bold text-slate-700 dark:text-slate-300">brand</code>, <code className="font-bold text-slate-700 dark:text-slate-300">stock</code>, <code className="font-bold text-slate-700 dark:text-slate-300">sku</code></li>
                        <li><code className="font-bold text-slate-700 dark:text-slate-300">description</code>, <code className="font-bold text-slate-700 dark:text-slate-300">audience</code></li>
                        <li><code className="font-bold text-slate-700 dark:text-slate-300">specifications</code>: Array of <code className="text-slate-500">{"{ key, value }"}</code></li>
                        <li><code className="font-bold text-slate-700 dark:text-slate-300">attributes</code>: Variant map <code className="text-slate-500">{"{ Color, Size }"}</code></li>
                        <li><code className="font-bold text-slate-700 dark:text-slate-300">tags</code>, <code className="font-bold text-slate-700 dark:text-slate-300">keywords</code>, <code className="font-bold text-slate-700 dark:text-slate-300">collections</code></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>CartNOW Schema Standard v2.0</span>
                  <span className="text-emerald-500 font-bold">Strict Validation</span>
                </div>
              </div>

            </div>
          )}

          {/* IN JSON MODE: Success notification & jump actions after generation */}
          {activeMode === "json" && hasGeneratedFromJson && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-black shadow-xs shrink-0">
                  <Check size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Product Generated from JSON!</span>
                    <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">Ready to Review</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    All attributes, variants, pricing, and specs have been loaded into the form below.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => setHasGeneratedFromJson(false)}
                  className="w-full sm:w-auto px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  title="Reopen JSON Schema Editor"
                >
                  <Code size={13} />
                  <span>Show / Edit JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalPreviewImageIdx(0);
                    setActivePreviewTab("page");
                    setShowPreviewModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Eye size={13} />
                  <span>Open Verification Pop-up</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormStep(6);
                    document.getElementById("catalog-form-top")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 size={13} />
                  <span>Go to Publish (Step 6)</span>
                </button>
              </div>
            </div>
          )}

          {/* IN AI MODE: Success notification & jump actions after generation */}
          {activeMode === "ai" && hasGeneratedFromAi && (
            <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-violet-600 text-white rounded-xl flex items-center justify-center font-black shadow-xs shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Product Extracted by AI!</span>
                    <span className="text-[9px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold">Ready to Review</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    All attributes, specs, and details have been extracted and loaded into the form below.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => setHasGeneratedFromAi(false)}
                  className="w-full sm:w-auto px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  title="Reopen AI Document Extractor"
                >
                  <Zap size={13} />
                  <span>Show / Edit Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalPreviewImageIdx(0);
                    setActivePreviewTab("page");
                    setShowPreviewModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Eye size={13} />
                  <span>Open Verification Pop-up</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormStep(6);
                    document.getElementById("catalog-form-top")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 size={13} />
                  <span>Go to Publish (Step 6)</span>
                </button>
              </div>
            </div>
          )}

          {/* MAIN FORM CONTAINER: Hidden in JSON/AI mode until user generates product */}
          {(activeMode === "form" || (activeMode === "json" ? hasGeneratedFromJson : hasGeneratedFromAi)) && (
            <form onSubmit={handleCreateProduct} noValidate className="space-y-3">
            
            {/* STEPPER NAVIGATION BAR */}
            <div id="catalog-form-top" className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-3 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-black shrink-0 shadow-2xs">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                        Listing Workflow
                      </h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        {WIZARD_STEPS.filter(s => s.isComplete).length} of 6 Steps Ready ({Math.round((WIZARD_STEPS.filter(s => s.isComplete).length / 6) * 100)}%)
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Step-by-step product listing pipeline for CartNOW marketplace catalog.
                    </p>
                  </div>
                </div>

                {/* View Switcher: Step Wizard vs Show All Details */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-[10px] font-black">
                  <button
                    type="button"
                    onClick={() => setViewAllSteps(false)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      !viewAllSteps
                        ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-2xs font-extrabold"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Sliders size={12} />
                    <span>Step Wizard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewAllSteps(true)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      viewAllSteps
                        ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-2xs font-extrabold"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <LayoutGrid size={12} />
                    <span>Show All Details</span>
                  </button>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(8, Math.round((WIZARD_STEPS.filter(s => s.isComplete).length / 6) * 100))}%` }}
                />
              </div>

              {/* Step Navigation Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {WIZARD_STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = !viewAllSteps && formStep === step.id;
                  const isDone = step.isComplete;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        setViewAllSteps(false);
                        setFormStep(step.id);
                      }}
                      className={`relative p-2.5 rounded-xl text-left transition-all duration-200 border cursor-pointer flex flex-col justify-between min-h-[70px] ${
                        isActive
                          ? "bg-orange-50/90 dark:bg-orange-950/30 border-orange-500 shadow-xs ring-1 ring-orange-500/30"
                          : isDone
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500 text-slate-700 dark:text-slate-300"
                          : "bg-slate-50/80 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                          isActive
                            ? "bg-orange-500 text-white shadow-2xs"
                            : isDone
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}>
                          {isDone ? <Check size={11} strokeWidth={3} /> : step.id}
                        </span>
                        <Icon size={14} className={isActive ? "text-orange-500" : isDone ? "text-emerald-500" : "text-slate-400"} />
                      </div>

                      <div>
                        <div className={`text-[11px] font-extrabold truncate ${
                          isActive ? "text-orange-600 dark:text-orange-400" : isDone ? "text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-400"
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate font-medium">
                          {isDone ? "Ready ✓" : isActive ? "Active" : step.subtitle}
                        </div>
                      </div>

                      {isActive && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-orange-500 rounded-full animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            
            {/* CARD 1: GENERAL PRODUCT IDENTITY */}
            {(viewAllSteps || formStep === 1) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    <Tag size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                      General Product Identity
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Establish your core product title, manufacturer brand, classification, and SKU.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {newProduct.name?.trim() && newProduct.category?.trim() ? (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                      <Check size={11} strokeWidth={3} />
                      <span>Identity Ready</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-500/20">
                      Title & Category Required
                    </span>
                  )}

                  {activeMode !== "form" && (
                    <span className="text-[9px] font-black text-violet-600 bg-violet-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={10} />
                      AI Populated
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Brand Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Product Title <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-[10px] font-mono ${newProduct.name.length > 100 ? "text-amber-500" : "text-slate-400"}`}>
                      {newProduct.name.length} / 120
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Samsung Galaxy S25 Ultra 5G (Titanium Gray, 256GB)"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-800 shadow-2xs font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Brand Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <span>Suggestions:</span>
                      {["Samsung", "Apple", "Nike", "Sony"].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setNewProduct({ ...newProduct, brand: b })}
                          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-bold"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Samsung, Apple, Nike, Sony"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-800 shadow-2xs"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(!isCustomCategory)}
                      className="text-[10px] font-black text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                    >
                      {isCustomCategory ? "← Catalog List" : "+ Enter Custom"}
                    </button>
                  </div>
                  {isCustomCategory ? (
                    <input
                      type="text"
                      placeholder="e.g. Smart Electronics"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-800 shadow-2xs"
                      required
                    />
                  ) : (
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value, subCategory: "" })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition cursor-pointer focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-800 shadow-2xs font-medium"
                      required
                    >
                      <option value="">Choose Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Subcategory
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomSubCategory(!isCustomSubCategory)}
                      className="text-[10px] font-black text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                    >
                      {isCustomSubCategory ? "← Catalog List" : "+ Enter Custom"}
                    </button>
                  </div>
                  {isCustomSubCategory || isCustomCategory || subCategoriesList.length === 0 ? (
                    <input
                      type="text"
                      placeholder="e.g. Mobile Phones, Running Shoes"
                      value={newProduct.subCategory}
                      onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-800 shadow-2xs"
                    />
                  ) : (
                    <select
                      value={newProduct.subCategory}
                      onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition cursor-pointer focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-800 shadow-2xs font-medium"
                    >
                      <option value="">Choose Subcategory</option>
                      {subCategoriesList.map((sub, idx) => (
                        <option key={idx} value={sub}>{sub}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* SKU & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Seller SKU Reference
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Zap size={11} />
                      <span>⚡ Auto SKU</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. SAM-S25-ULTRA-512"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-800 shadow-2xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Tags (Comma Separated)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAIImproveField("tags")}
                      disabled={loaders.tags}
                      className="text-[10px] font-black text-violet-600 dark:text-violet-400 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {loaders.tags ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={11} />}
                      <span>✨ Auto Tags</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="android, galaxy, 5g, smartphone"
                    value={newProduct.tags}
                    onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-800 shadow-2xs"
                  />
                  {newProduct.tags && newProduct.tags.trim() && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {newProduct.tags.split(",").map((t, idx) => {
                        const clean = t.trim();
                        if (!clean) return null;
                        return (
                          <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            #{clean}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 1 NAVIGATION FOOTER */}
              <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Step 1 of 6: General Identity</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNextStep(2)}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer group"
                >
                  <span>Next: Pricing & Stock</span>
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
            )}

            {/* CARD 2: PRICING & INVENTORY */}
            {(viewAllSteps || formStep === 2) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    <Coins size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                      Pricing & Inventory Control
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Configure selling price, inventory count, low-stock threshold, and target customer demographic.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {newProduct.price && parseFloat(newProduct.price) > 0 && newProduct.stock !== "" ? (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                      <Check size={11} strokeWidth={3} />
                      <span>Pricing Validated</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20">
                      Price & Stock Required
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Selling Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Base Selling Price (₹ INR) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="129999.00"
                      value={newProduct.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || parseFloat(val) >= 0) {
                          setNewProduct({ ...newProduct, price: val });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                      }}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:ring-2 focus:ring-emerald-500 border border-slate-200 dark:border-slate-800 shadow-2xs font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Stock with quick buttons */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Initial Base Stock (Units) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      {[10, 50, 100].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleQuickStock(num)}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          +{num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={newProduct.stock}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || parseInt(val, 10) >= 0) {
                        setNewProduct({ ...newProduct, stock: val });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === ".") e.preventDefault();
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:ring-2 focus:ring-emerald-500 border border-slate-200 dark:border-slate-800 shadow-2xs font-mono font-semibold"
                    required
                  />
                </div>

                {/* Target Audience */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Target Demographic
                  </label>
                  <select
                    value={newProduct.audience}
                    onChange={(e) => setNewProduct({ ...newProduct, audience: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition cursor-pointer focus:ring-2 focus:ring-emerald-500 border border-slate-200 dark:border-slate-800 shadow-2xs font-medium"
                  >
                    <option value="Unisex">Unisex (All Shoppers)</option>
                    <option value="Men">Men / Male</option>
                    <option value="Women">Women / Female</option>
                    <option value="Kids">Kids & Toddlers</option>
                  </select>
                </div>
              </div>

              {/* Live Pricing & Margin Breakdown Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Listing Price</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                      {newProduct.price ? `₹${parseFloat(newProduct.price).toLocaleString("en-IN")}` : "₹0.00"}
                    </span>
                  </div>
                  <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Market Fee (5%)</span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                      {newProduct.price ? `₹${((parseFloat(newProduct.price) || 0) * 0.05).toFixed(2)}` : "₹0.00"}
                    </span>
                  </div>
                  <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Net Seller Payout</span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {newProduct.price ? `₹${((parseFloat(newProduct.price) || 0) * 0.95).toFixed(2)}` : "₹0.00"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    parseInt(newProduct.stock, 10) > 0
                      ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
                  }`}>
                    {parseInt(newProduct.stock, 10) > 0 ? `In Stock (${newProduct.stock} units)` : "Stock Not Set"}
                  </span>
                </div>
              </div>

              {/* STEP 2 NAVIGATION FOOTER */}
              <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back: Identity</span>
                </button>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Step 2 of 6: Pricing & Inventory</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNextStep(3)}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer group"
                >
                  <span>Next: Media & Photos</span>
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
            )}

            {/* CARD 3: MEDIA & VISUAL ASSETS */}
            {(viewAllSteps || formStep === 3) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    <Image size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                      Product Media & Visual Gallery
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Upload high-resolution photography. The first or cover image will appear on CartNOW search cards.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                    uploadedFiles.length > 0
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/20"
                      : "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300 border-orange-500/20"
                  }`}>
                    {uploadedFiles.length > 0 ? <Check size={11} strokeWidth={3} /> : null}
                    <span>{uploadedFiles.length} of 10 Photos Uploaded</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleAIGenerateImage}
                    disabled={loaders.generateImage || !newProduct.name?.trim()}
                    className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                    title={!newProduct.name?.trim() ? "Enter a product name to enable image generation" : "Generate image using AI"}
                  >
                    <Sparkles size={11} className={loaders.generateImage ? "animate-spin" : ""} />
                    <span>{loaders.generateImage ? "Generating..." : "AI Image"}</span>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`w-full py-6 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition border-2 border-dashed ${
                  dragActive
                    ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-orange-500/60 hover:bg-orange-50/20"
                }`}
                onClick={() => document.getElementById("file-upload-input").click()}
              >
                <div className="h-10 w-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-0.5">
                  <Upload size={20} />
                </div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                  Drop product images here, or <span className="text-orange-600 dark:text-orange-400 underline">browse files</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  Supports high-res JPG, PNG, WEBP • Up to 10 photos • Max 10MB per file
                </p>
                <input
                  type="file"
                  id="file-upload-input"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Quick Add from Image URL */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold shrink-0">
                  <Link2 size={13} className="text-orange-500" />
                  <span>Add from Photo URL:</span>
                </div>
                <div className="flex-1 flex items-center gap-2 w-full">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or CDN link"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white outline-none focus:border-orange-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold cursor-pointer transition shrink-0 shadow-2xs"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* File Preview Cards Grid */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Uploaded Gallery ({uploadedFiles.length} Photos)</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold lowercase text-[10px]">
                      ★ Click "Cover" to set main thumbnail
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {uploadedFiles.map((fileObj, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-2xl overflow-hidden p-2 flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 border transition-all ${
                          fileObj.isCover
                            ? "border-orange-500 ring-2 ring-orange-500/20 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 shadow-2xs"
                        }`}
                      >
                        <div className="relative w-full h-24 rounded-xl overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center">
                          <img
                            src={fileObj.preview}
                            alt=""
                            className="w-full h-full object-contain p-1"
                          />
                          {fileObj.isCover && (
                            <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                              ★ Cover
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[9px] gap-1 px-0.5">
                          <button
                            type="button"
                            onClick={() => setCoverFile(idx)}
                            className={`px-2 py-0.5 rounded font-black transition cursor-pointer ${
                              fileObj.isCover
                                ? "bg-orange-500 text-white"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                            }`}
                          >
                            {fileObj.isCover ? "Cover" : "Set Cover"}
                          </button>

                          <div className="flex gap-0.5">
                            <button
                              type="button"
                              onClick={() => moveUploadedFile(idx, -1)}
                              disabled={idx === 0}
                              title="Move photo left"
                              className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowLeft size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveUploadedFile(idx, 1)}
                              disabled={idx === uploadedFiles.length - 1}
                              title="Move photo right"
                              className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowRight size={11} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeUploadedFile(idx)}
                            title="Delete photo"
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1 rounded transition cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3 NAVIGATION FOOTER */}
              <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back: Pricing</span>
                </button>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  <span>Step 3 of 6: Visual Assets ({uploadedFiles.length} uploaded)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNextStep(4)}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer group"
                >
                  <span>Next: Attributes & Variants</span>
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
            )}

            {/* CARD 4: DYNAMIC ATTRIBUTES & MULTI-VARIANT GENERATOR */}
            {(viewAllSteps || formStep === 4) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    <Boxes size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                      Dynamic Attributes & Variant Matrix
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Specify configurable options like Color, Size, or Storage to auto-generate inventory combinations.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {productVariants.length > 0 ? (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                      <Check size={11} strokeWidth={3} />
                      <span>{productVariants.length} Combinations Ready</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-500/20">
                      Single SKU / Optional Variants
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setProductAttributes(prev => [...prev, { name: "", values: "", displayType: "pill" }])}
                    className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-2xs"
                  >
                    <Plus size={12} />
                    <span>Add Attribute</span>
                  </button>
                </div>
              </div>

              {/* Quick Presets & Guide Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-violet-50/70 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 rounded-xl">
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="font-extrabold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                    Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => setProductAttributes([
                      { name: "Color", values: "Black, White, Navy", displayType: "color" },
                      { name: "Size", values: "S, M, L, XL", displayType: "pill" }
                    ])}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-950/50 font-bold transition cursor-pointer"
                  >
                    + Apparel (Size & Color)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductAttributes([
                      { name: "Size", values: "UK 7, UK 8, UK 9, UK 10", displayType: "pill" },
                      { name: "Color", values: "Black, White, Red", displayType: "color" }
                    ])}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-950/50 font-bold transition cursor-pointer"
                  >
                    + Footwear (UK Sizes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductAttributes([
                      { name: "Storage", values: "128GB, 256GB, 512GB", displayType: "pill" },
                      { name: "Color", values: "Space Gray, Silver", displayType: "color" }
                    ])}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-950/50 font-bold transition cursor-pointer"
                  >
                    + Tech (Storage & Color)
                  </button>
                  {productAttributes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setProductAttributes([]);
                        setProductVariants([]);
                        toast.info("Cleared dynamic attributes");
                      }}
                      className="px-2 py-0.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-100 font-bold transition cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGuideActiveTab("attributes");
                    setShowFullGuideModal(true);
                  }}
                  className="text-[10px] font-extrabold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <BookOpen size={11} />
                  <span>Dynamic Attribute Guide ↗</span>
                </button>
              </div>

              {/* Attributes Builder Items */}
              {productAttributes.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1.5">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No dynamic attributes defined
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-md mx-auto">
                    This product will be listed as a single SKU with the base price and inventory set in Step 2. To sell multiple sizes, colors, or options, click a preset above or click <strong>+ Add Attribute</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {productAttributes.map((attr, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5 shadow-2xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Attribute Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Color, Size, Storage"
                            value={attr.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setProductAttributes(prev => {
                                const updated = [...prev];
                                updated[idx].name = val;
                                return updated;
                              });
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 shadow-2xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Values (Comma Separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. Black, White, Titanium"
                            value={attr.values}
                            onChange={(e) => {
                              const val = e.target.value;
                              setProductAttributes(prev => {
                                const updated = [...prev];
                                updated[idx].values = val;
                                return updated;
                              });
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 shadow-2xs"
                          />
                        </div>

                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Display Type</label>
                            <select
                              value={attr.displayType}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProductAttributes(prev => {
                                  const updated = [...prev];
                                  updated[idx].displayType = val;
                                  return updated;
                                });
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-violet-500 shadow-2xs font-medium"
                            >
                              <option value="pill">Option Pill</option>
                              <option value="dropdown">Dropdown Select</option>
                              <option value="color">Color Swatch</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => setProductAttributes(prev => prev.filter((_, i) => i !== idx))}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition cursor-pointer"
                            title="Delete Attribute"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Live Value Preview Chips */}
                      {attr.values && attr.values.trim() && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Live Chips:</span>
                          {attr.values.split(",").map((rawVal, vIdx) => {
                            const val = rawVal.trim();
                            if (!val) return null;
                            return (
                              <span
                                key={vIdx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs"
                              >
                                {attr.displayType === "color" && (
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                                    style={{ backgroundColor: val.toLowerCase().replace(/\s+/g, '') }}
                                  />
                                )}
                                <span>{val}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Variant Matrix Interactive Explorer */}
              {productVariants.length > 0 && (() => {
                const prices = productVariants.map(v => v.price || 0);
                const minPrice = prices.length ? Math.min(...prices) : 0;
                const maxPrice = prices.length ? Math.max(...prices) : 0;
                const totalStock = productVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

                const attrSummary = {};
                const allValuesSet = new Set();
                productVariants.forEach(v => {
                  Object.entries(v.attributes || {}).forEach(([k, val]) => {
                    if (!attrSummary[k]) attrSummary[k] = new Set();
                    attrSummary[k].add(val);
                    allValuesSet.add(val);
                  });
                });
                const filterChips = Array.from(allValuesSet);

                // Filter variants based on selected attribute filter and text search
                const filteredVariants = productVariants.filter(v => {
                  if (selectedAttributeFilter !== "all") {
                    const matchChip = Object.values(v.attributes || {}).includes(selectedAttributeFilter);
                    if (!matchChip) return false;
                  }
                  if (variantFilterQuery.trim()) {
                    const q = variantFilterQuery.toLowerCase().trim();
                    const matchSku = (v.sku || "").toLowerCase().includes(q);
                    const matchAttr = Object.entries(v.attributes || {}).some(
                      ([k, val]) => k.toLowerCase().includes(q) || val.toLowerCase().includes(q)
                    );
                    if (!matchSku && !matchAttr) return false;
                  }
                  return true;
                });

                const displayedVariants = showAllVariants ? filteredVariants : filteredVariants.slice(0, 8);

                return (
                  <div className="space-y-4 pt-2">
                    {/* Top Summary & Mode Switcher Bar */}
                    <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-4 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                              Variant Matrix ({productVariants.length} Combinations)
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                            <span>Price Range: <strong className="text-emerald-400">₹{minPrice}{minPrice !== maxPrice ? ` - ₹${maxPrice}` : ''}</strong></span>
                            <span className="text-slate-500">•</span>
                            <span>Total Stock: <strong className="text-indigo-300">{totalStock} units</strong></span>
                          </div>
                        </div>

                        {/* Mode View Toggle: Interactive Cards vs Table */}
                        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                          <button
                            type="button"
                            onClick={() => setMatrixViewMode("grid")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                              matrixViewMode === "grid"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <LayoutGrid size={13} />
                            <span>Interactive Cards</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMatrixViewMode("table")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                              matrixViewMode === "table"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <Table2 size={13} />
                            <span>Data Table</span>
                          </button>
                        </div>
                      </div>

                      {/* Bulk Modifiers Toolbar */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Bulk Actions:</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              placeholder="Stock"
                              value={bulkStockInput}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || parseInt(val, 10) >= 0) {
                                  setBulkStockInput(val);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === ".") e.preventDefault();
                              }}
                              className="w-20 px-2.5 py-1 bg-slate-950 rounded-lg text-xs text-white placeholder-slate-500 outline-none border border-slate-800 focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={handleApplyBulkStock}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                            >
                              Set Stock
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Price ₹"
                              value={bulkPriceInput}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || parseFloat(val) >= 0) {
                                  setBulkPriceInput(val);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                              }}
                              className="w-20 px-2.5 py-1 bg-slate-950 rounded-lg text-xs text-white placeholder-slate-500 outline-none border border-slate-800 focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={handleApplyBulkPrice}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                            >
                              Set Price
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const formatted = productVariants.map((v, idx) => ({
                                ...v.attributes,
                                sku: v.sku || `SKU-${idx + 1}`,
                                price: Number(v.price || 0),
                                stock: Number(v.stock || 0)
                              }));
                              navigator.clipboard.writeText(JSON.stringify(formatted, null, 2));
                              toast.success("Variant JSON copied!");
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 transition"
                          >
                            <Copy size={11} /> Copy JSON
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenVariantJsonModal}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 transition"
                          >
                            <Code size={11} /> Edit JSON
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Filter & Search Bar */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="relative flex-1 max-w-sm">
                          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Filter variants (e.g. Black, UK 8, SKU)..."
                            value={variantFilterQuery}
                            onChange={(e) => setVariantFilterQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>

                        {activeMatchingVariant && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-3 py-1 rounded-xl">
                            <Eye size={12} />
                            <span>Previewing: {Object.entries(activeMatchingVariant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(", ")}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Attribute Chips */}
                      {filterChips.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Filter By:</span>
                          <button
                            type="button"
                            onClick={() => setSelectedAttributeFilter("all")}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              selectedAttributeFilter === "all"
                                ? "bg-violet-600 text-white shadow-2xs"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            All ({productVariants.length})
                          </button>
                          {filterChips.map(chip => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => setSelectedAttributeFilter(chip)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                selectedAttributeFilter === chip
                                  ? "bg-violet-600 text-white shadow-2xs"
                                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-violet-300"
                              }`}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* VIEW 1: INTERACTIVE GRID CARDS VIEW */}
                    {matrixViewMode === "grid" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          {displayedVariants.map((variant) => {
                            const realIdx = productVariants.indexOf(variant);
                            const isSelectedPreview = activeMatchingVariant === variant;

                            return (
                              <div
                                key={realIdx}
                                className={`p-3.5 rounded-2xl border transition-all duration-200 text-left relative flex flex-col justify-between ${
                                  isSelectedPreview
                                    ? "bg-violet-50/90 dark:bg-violet-950/40 border-violet-500 shadow-md ring-2 ring-violet-500/30"
                                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 shadow-2xs"
                                }`}
                              >
                                <div>
                                  {/* Card Header & Attribute Pills */}
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex flex-wrap gap-1">
                                      {Object.entries(variant.attributes || {}).map(([k, val]) => (
                                        <span
                                          key={k}
                                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700"
                                        >
                                          {k}: {val}
                                        </span>
                                      ))}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setSelectedPreviewAttrs({ ...variant.attributes })}
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 shrink-0 ${
                                        isSelectedPreview
                                          ? "bg-violet-600 text-white shadow-xs"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400"
                                      }`}
                                      title="Preview this variant on customer card"
                                    >
                                      {isSelectedPreview ? <Check size={10} /> : <Eye size={10} />}
                                      <span>{isSelectedPreview ? "Live Preview" : "Preview"}</span>
                                    </button>
                                  </div>

                                  {/* Interactive Controls: Price & Stock */}
                                  <div className="grid grid-cols-2 gap-2 pt-1">
                                    {/* Price Modifier */}
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Price (₹)</label>
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={variant.price}
                                          onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === "") {
                                              setProductVariants(prev => {
                                                const updated = [...prev];
                                                updated[realIdx].price = "";
                                                return updated;
                                              });
                                            } else {
                                              const val = Math.max(0, parseFloat(raw) || 0);
                                              setProductVariants(prev => {
                                                const updated = [...prev];
                                                updated[realIdx].price = val;
                                                return updated;
                                              });
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                                          }}
                                          className="w-full px-2 py-1 text-xs font-black bg-slate-50 dark:bg-slate-950 rounded-lg outline-none focus:ring-1 focus:ring-violet-500 text-slate-900 dark:text-white"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleAdjustVariantPrice(realIdx, 100)}
                                          className="px-1.5 py-1 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 text-slate-600 dark:text-slate-300 rounded-md transition cursor-pointer"
                                          title="Add ₹100"
                                        >
                                          +100
                                        </button>
                                      </div>
                                    </div>

                                    {/* Stock Stepper */}
                                    <div className="space-y-1">
                                      <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Stock</label>
                                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                                          variant.stock > 5 ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : variant.stock > 0 ? "text-amber-500 bg-amber-50 dark:bg-amber-950/20" : "text-red-500 bg-red-50 dark:bg-red-950/20"
                                        }`}>
                                          {variant.stock > 0 ? `${variant.stock} left` : "Out"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleAdjustVariantStock(realIdx, -1)}
                                          className="h-6 w-6 flex items-center justify-center font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition cursor-pointer shrink-0"
                                        >
                                          -
                                        </button>
                                        <input
                                          type="number"
                                          min="0"
                                          value={variant.stock}
                                          onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === "") {
                                              setProductVariants(prev => {
                                                const updated = [...prev];
                                                updated[realIdx].stock = "";
                                                return updated;
                                              });
                                            } else {
                                              const val = Math.max(0, parseInt(raw, 10) || 0);
                                              setProductVariants(prev => {
                                                const updated = [...prev];
                                                updated[realIdx].stock = val;
                                                return updated;
                                              });
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === ".") e.preventDefault();
                                          }}
                                          className="w-full text-center px-1 py-1 text-xs font-black bg-slate-50 dark:bg-slate-950 rounded-lg outline-none text-slate-900 dark:text-white"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleAdjustVariantStock(realIdx, 1)}
                                          className="h-6 w-6 flex items-center justify-center font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition cursor-pointer shrink-0"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Card Footer: SKU & Availability */}
                                <div className="flex items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="text-slate-400 font-mono text-[9px]">SKU:</span>
                                    <input
                                      type="text"
                                      value={variant.sku}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setProductVariants(prev => {
                                          const updated = [...prev];
                                          updated[realIdx].sku = val;
                                          return updated;
                                        });
                                      }}
                                      className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 bg-transparent outline-none w-24 truncate focus:bg-slate-100 dark:focus:bg-slate-800 px-1 rounded"
                                    />
                                  </div>

                                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-bold text-slate-500">
                                    <input
                                      type="checkbox"
                                      checked={variant.availability !== false}
                                      onChange={(e) => {
                                        const val = e.target.checked;
                                        setProductVariants(prev => {
                                          const updated = [...prev];
                                          updated[realIdx].availability = val;
                                          return updated;
                                        });
                                      }}
                                      className="w-3.5 h-3.5 text-violet-600 rounded cursor-pointer"
                                    />
                                    <span>Active</span>
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* VIEW 2: DATA TABLE VIEW */}
                    {matrixViewMode === "table" && (
                      <div className="overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950/60 p-2 shadow-2xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="px-3 py-2.5 rounded-l-xl">Combination</th>
                              <th className="px-3 py-2.5">SKU</th>
                              <th className="px-3 py-2.5">Price (₹)</th>
                              <th className="px-3 py-2.5">Stock</th>
                              <th className="px-3 py-2.5">Images</th>
                              <th className="px-3 py-2.5">Barcode</th>
                              <th className="px-3 py-2.5 text-center rounded-r-xl">Avail.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/40 dark:divide-slate-900/60">
                            {displayedVariants.map((variant) => {
                              const realIdx = productVariants.indexOf(variant);
                              const isSelected = activeMatchingVariant === variant;
                              return (
                                <tr key={realIdx} className={`transition ${isSelected ? "bg-violet-500/10 dark:bg-violet-950/30" : "hover:bg-white/60 dark:hover:bg-slate-900/40"}`}>
                                  <td className="px-3 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                                    <div className="flex flex-wrap gap-1">
                                      {Object.entries(variant.attributes).map(([k, v]) => (
                                        <span key={k} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                                          {k}: {v}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <input
                                      type="text"
                                      value={variant.sku}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setProductVariants(prev => {
                                          const updated = [...prev];
                                          updated[realIdx].sku = val;
                                          return updated;
                                        });
                                      }}
                                      className="w-full min-w-[120px] px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                                    />
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={variant.price}
                                      onChange={(e) => {
                                        const raw = e.target.value;
                                        const val = Math.max(0, parseFloat(raw) || 0);
                                        setProductVariants(prev => {
                                          const updated = [...prev];
                                          updated[realIdx].price = val;
                                          return updated;
                                        });
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                                      }}
                                      className="w-full min-w-[80px] px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                                    />
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <input
                                      type="number"
                                      min="0"
                                      value={variant.stock}
                                      onChange={(e) => {
                                        const val = Math.max(0, parseInt(e.target.value) || 0);
                                        setProductVariants(prev => {
                                          const updated = [...prev];
                                          updated[realIdx].stock = val;
                                          return updated;
                                        });
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === ".") e.preventDefault();
                                      }}
                                      className="w-full min-w-[70px] px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                                    />
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <div className="flex gap-1.5 overflow-x-auto py-0.5 max-w-[160px]">
                                      {uploadedFiles.map((fileObj, fIdx) => {
                                        const isImgSelected = (variant.images || []).includes(fIdx);
                                        return (
                                          <button
                                            key={fIdx}
                                            type="button"
                                            onClick={() => toggleVariantImage(realIdx, fIdx)}
                                            className={`relative w-7 h-7 rounded-lg overflow-hidden transition-all flex-shrink-0 cursor-pointer ${isImgSelected ? "ring-2 ring-indigo-600 dark:ring-indigo-400 scale-105 shadow-2xs" : "opacity-60 hover:opacity-100" }`}
                                            title={isImgSelected ? "Selected for variant" : "Click to select image"}
                                          >
                                            <img 
                                              src={fileObj.preview} 
                                              alt={`Thumb ${fIdx + 1}`} 
                                              className="w-full h-full object-cover bg-slate-100 dark:bg-slate-900" 
                                            />
                                            {isImgSelected && (
                                              <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                                                <Check size={12} className="text-white stroke-[3]" />
                                              </div>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <input
                                      type="text"
                                      value={variant.barcode || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setProductVariants(prev => {
                                          const updated = [...prev];
                                          updated[realIdx].barcode = val;
                                          return updated;
                                        });
                                      }}
                                      placeholder="Barcode"
                                      className="w-full min-w-[90px] px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                                    />
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    <input
                                      type="checkbox"
                                      checked={variant.availability !== false}
                                      onChange={(e) => {
                                        const val = e.target.checked;
                                        setProductVariants(prev => {
                                          const updated = [...prev];
                                          updated[realIdx].availability = val;
                                          return updated;
                                        });
                                      }}
                                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer focus:ring-indigo-500"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Expand / Collapse Footer */}
                    {filteredVariants.length > 8 && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-between text-xs mt-2">
                        <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px]">
                          Showing <strong>{displayedVariants.length}</strong> of <strong>{filteredVariants.length}</strong> variants
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAllVariants(prev => !prev)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                        >
                          {showAllVariants ? (
                            <>Show Fewer (8) <ChevronUp size={14} /></>
                          ) : (
                            <>Show All ({filteredVariants.length}) <ChevronDown size={14} /></>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* STEP 4 NAVIGATION FOOTER */}
              <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back: Media</span>
                </button>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  <span>Step 4 of 6: Variants ({productVariants.length} generated)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNextStep(5)}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer group"
                >
                  <span>Next: Description & Specs</span>
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
            )}

            {/* CARD 5: DESCRIPTION & SPECIFICATIONS */}
            {(viewAllSteps || formStep === 5) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    <FileText size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                      Description & Technical Specifications
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Provide clear product descriptions, key selling points, and structured specification attributes.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {newProduct.description?.trim() ? (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                      <Check size={11} strokeWidth={3} />
                      <span>Description & {customAttributes.length} Specs Ready</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-500/20">
                      Description Required
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Product Overview & Description <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {newProduct.description.length} chars • {newProduct.description.trim() ? newProduct.description.trim().split(/\s+/).length : 0} words
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAIImproveField("description")}
                    disabled={loaders.description}
                    className="text-[10px] font-extrabold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {loaders.description ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={11} />}
                    <span>✨ AI Enhance Description</span>
                  </button>
                </div>

                {/* Quick Insert Templates Bar */}
                <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 rounded-xl text-[10px]">
                  <span className="font-extrabold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                    Quick Templates:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInsertDescriptionTemplate("features")}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950/50 font-bold transition cursor-pointer"
                  >
                    + Key Highlights
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertDescriptionTemplate("box")}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950/50 font-bold transition cursor-pointer"
                  >
                    + What's in the Box
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertDescriptionTemplate("warranty")}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950/50 font-bold transition cursor-pointer"
                  >
                    + Warranty & Support
                  </button>
                </div>

                <textarea
                  rows={5}
                  placeholder="Enter a detailed product description. Highlight craftsmanship, specifications, dimensions, use cases, and warranty details..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition resize-y focus:ring-2 focus:ring-sky-500 border border-slate-200 dark:border-slate-800 shadow-2xs font-sans leading-relaxed"
                  required
                />
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Technical Specification Rows ({customAttributes.length} Added)
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Standard key-value specifications shown on the customer product detail page.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={handleAddCommonSpecs}
                      className="flex items-center gap-1 px-2.5 py-1 bg-sky-50 dark:bg-slate-950 hover:bg-sky-100 dark:hover:bg-slate-800 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition cursor-pointer shadow-2xs"
                      title="Add Warranty, Country of Origin, and Package Contents"
                    >
                      <Plus size={11} />
                      <span>+ Common Specs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAIImproveField("specifications")}
                      disabled={loaders.specifications}
                      className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 hover:bg-violet-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      {loaders.specifications ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={11} />}
                      <span>✨ Complete Specs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomAttributes(prev => [...prev, { key: "", value: "" }])}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition cursor-pointer shadow-2xs"
                    >
                      <Plus size={11} />
                      <span>Add Row</span>
                    </button>
                  </div>
                </div>

                {customAttributes.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1.5">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No technical specification rows added
                    </p>
                    <p className="text-[10px] text-slate-400 max-w-md mx-auto">
                      Specifications build buyer confidence and improve search accuracy. Click <strong>+ Common Specs</strong> to auto-populate Warranty, Origin, and Box contents, or <strong>Add Row</strong> for custom fields.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customAttributes.map((attr, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                        <input
                          type="text"
                          placeholder="Key (e.g. Battery Capacity, Material, Dimensions)"
                          value={attr.key}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomAttributes(prev => {
                              const updated = [...prev];
                              updated[idx].key = val;
                              return updated;
                            });
                          }}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs font-semibold"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 5000 mAh Li-Ion, Aerospace Aluminum)"
                          value={attr.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomAttributes(prev => {
                              const updated = [...prev];
                              updated[idx].value = val;
                              return updated;
                            });
                          }}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setCustomAttributes(prev => prev.filter((_, i) => i !== idx))}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition cursor-pointer"
                          title="Remove row"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* STEP 5 NAVIGATION FOOTER */}
              <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back: Variants</span>
                </button>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span>Step 5 of 6: Description & Specs</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNextStep(6)}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer group"
                >
                  <span>Next: Review & Launch</span>
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
            )}

            {/* CARD 6: COLLECTIONS & SEO META */}
            {(viewAllSteps || formStep === 6) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    <Rocket size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                      Collections & Search Engine Optimization
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Assign store promotion collections, optimize Google search metadata, and review launch requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {completedCount === 6 ? (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                      <Check size={11} strokeWidth={3} />
                      <span>All 6 Listing Essentials Ready</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-500/20">
                      {completedCount} of 6 Essentials Complete
                    </span>
                  )}
                </div>
              </div>

              {/* Collections Checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Assigned Marketplace Collections
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {selectedCollections.length} of 6 selected
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["Featured Products", "Best Sellers", "New Arrivals", "Trending Now", "Special Offers", "Flash Sale"].map((col) => {
                    const isSelected = selectedCollections.includes(col);
                    return (
                      <div
                        key={col}
                        onClick={() => handleCollectionCheckbox(col)}
                        className={`p-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition border ${
                          isSelected
                            ? "bg-orange-50/80 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-500/40 font-extrabold shadow-2xs"
                            : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-slate-800 hover:border-orange-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <BookmarkCheck size={14} className={isSelected ? "text-orange-500 opacity-100" : "opacity-30"} />
                        <span className="text-[11px] truncate">{col}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SEO details */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      SEO & Discoverability Metadata
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Optimize how your listing appears in CartNOW search and Google results.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAIImproveField("seo")}
                    disabled={loaders.seo}
                    className="text-[10px] font-extrabold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {loaders.seo ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={11} />}
                    <span>✨ Generate SEO Meta</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      SEO Keywords (Comma Separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. fast charging, 5g phone, samsung, android smartphone"
                      value={newProduct.keywords}
                      onChange={(e) => setNewProduct({ ...newProduct, keywords: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-800 shadow-2xs font-medium"
                    />
                    {newProduct.keywords && newProduct.keywords.trim() && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {newProduct.keywords.split(",").map((kw, idx) => {
                          const clean = kw.trim();
                          if (!clean) return null;
                          return (
                            <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              #{clean}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        SEO Meta Description
                      </label>
                      <span className={`text-[10px] font-mono ${newProduct.seoDescription.length > 160 ? "text-amber-500" : "text-slate-400"}`}>
                        {newProduct.seoDescription.length} / 160 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Concise 150-160 character snippet for Google search result card..."
                      value={newProduct.seoDescription}
                      onChange={(e) => setNewProduct({ ...newProduct, seoDescription: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-800 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Google Search SERP Simulation Card */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <Globe size={13} className="text-blue-500" />
                      <span>Google Search Result Snippet Simulation</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Live SERP Preview</span>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                      <span className="w-4 h-4 rounded-full bg-orange-500/10 text-orange-600 font-black text-[9px] flex items-center justify-center shrink-0">
                        C
                      </span>
                      <span className="truncate">
                        cartnow.shop › product › {newProduct.name ? newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 35) : "product-listing"}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer truncate">
                      {newProduct.name || "Untitled Product Listing"} | CartNOW Official Store
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                      <span>★★★★★ 4.9 (120+)</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {newProduct.price ? `₹${parseFloat(newProduct.price).toLocaleString("en-IN")}` : "₹0.00"}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-normal">In Stock</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {newProduct.seoDescription || newProduct.description?.slice(0, 150) || "Browse and purchase directly from verified CartNOW merchants. Fast shipping, guaranteed warranty, and secure checkout."}
                    </p>
                  </div>
                </div>
              </div>

              {/* STEP 6 NAVIGATION FOOTER */}
              <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back: Description</span>
                </button>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 size={13} />
                  <span>Final Step: Ready for Review & Publishing</span>
                </div>
              </div>
            </div>
            )}

            {/* PRE-FLIGHT LAUNCH REVIEW CARD (Shown on Step 6 or when viewing all steps) */}
            {(viewAllSteps || formStep === 6) && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 text-left space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      🚀
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                        Listing Pre-Flight Audit & Launch Review
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Review your 6 listing essentials before publishing to the live CartNOW marketplace.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {completedCount} of 6 Essentials Complete
                    </span>
                  </div>
                </div>

                {/* 6-Point Live Audit Checklist Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${newProduct.name?.trim() && newProduct.category?.trim() ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${newProduct.name?.trim() && newProduct.category?.trim() ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
                      {newProduct.name?.trim() && newProduct.category?.trim() ? <Check size={11} strokeWidth={3} /> : "1"}
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] font-black block truncate">1. Identity & Brand</span>
                      <span className="text-[9px] opacity-80">{newProduct.name?.trim() ? "Title & Category Set" : "Missing Title"}</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${newProduct.price && parseFloat(newProduct.price) > 0 ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${newProduct.price && parseFloat(newProduct.price) > 0 ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
                      {newProduct.price && parseFloat(newProduct.price) > 0 ? <Check size={11} strokeWidth={3} /> : "2"}
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] font-black block truncate">2. Selling Price</span>
                      <span className="text-[9px] opacity-80">{newProduct.price ? `₹${parseFloat(newProduct.price).toLocaleString("en-IN")}` : "Missing Price"}</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${newProduct.stock !== "" && parseInt(newProduct.stock) >= 0 ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${newProduct.stock !== "" && parseInt(newProduct.stock) >= 0 ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
                      {newProduct.stock !== "" && parseInt(newProduct.stock) >= 0 ? <Check size={11} strokeWidth={3} /> : "3"}
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] font-black block truncate">3. Base Inventory</span>
                      <span className="text-[9px] opacity-80">{newProduct.stock !== "" ? `${newProduct.stock} units` : "Missing Stock"}</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${uploadedFiles.length > 0 ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${uploadedFiles.length > 0 ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
                      {uploadedFiles.length > 0 ? <Check size={11} strokeWidth={3} /> : "4"}
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] font-black block truncate">4. Photo Gallery</span>
                      <span className="text-[9px] opacity-80">{uploadedFiles.length > 0 ? `${uploadedFiles.length} photos ready` : "Missing Photos"}</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${newProduct.description?.trim() ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${newProduct.description?.trim() ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
                      {newProduct.description?.trim() ? <Check size={11} strokeWidth={3} /> : "5"}
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] font-black block truncate">5. Description</span>
                      <span className="text-[9px] opacity-80">{newProduct.description?.trim() ? "Configured" : "Missing Details"}</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${newProduct.keywords || newProduct.seoDescription ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${newProduct.keywords || newProduct.seoDescription ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
                      {newProduct.keywords || newProduct.seoDescription ? <Check size={11} strokeWidth={3} /> : "6"}
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] font-black block truncate">6. SEO & Collections</span>
                      <span className="text-[9px] opacity-80">{newProduct.keywords || newProduct.seoDescription ? "Optimized" : "Optional / Default"}</span>
                    </div>
                  </div>
                </div>

                {/* Snapshot Highlights Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Selling Price</span>
                    <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
                      {newProduct.price ? `₹${parseFloat(newProduct.price).toLocaleString("en-IN")}` : "Not Set"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Base Stock</span>
                    <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
                      {newProduct.stock !== "" ? `${newProduct.stock} units` : "0 units"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Media Assets</span>
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {uploadedFiles.length} photo{uploadedFiles.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Variants</span>
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {productVariants.length > 0 ? `${productVariants.length} combinations` : "Single SKU"}
                    </span>
                  </div>
                </div>

                {/* Category & Title Banner */}
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/80 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Title</span>
                    <span className="font-bold text-slate-800 dark:text-white truncate block">
                      {newProduct.name || "Untitled Product Listing"}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Category</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {newProduct.category || "Uncategorized"} {newProduct.subCategory ? `› ${newProduct.subCategory}` : ""}
                    </span>
                  </div>
                </div>

                {/* POP-UP VERIFICATION TRIGGER ACTION */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                      <Eye size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white">
                        Verify Customer Storefront View
                      </h5>
                      <p className="text-[10px] text-slate-400">
                        Inspect photos, interactive variant chips, specs table, and Google SERP card.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setModalPreviewImageIdx(0);
                      setActivePreviewTab("page");
                      setShowPreviewModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-orange-500 dark:hover:bg-orange-600 text-orange-600 dark:text-orange-400 hover:text-white dark:hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 border-2 border-orange-500/30 hover:border-orange-500 shadow-2xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Eye size={14} />
                    <span>Open Verification Pop-up</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUBMIT ACTION BUTTON (Shown on Step 6 or when viewing all steps) */}
            {(viewAllSteps || formStep === 6) && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group ${
                    isPublishing
                      ? "bg-orange-500 text-white cursor-wait animate-pulse"
                      : "bg-orange-500 hover:bg-orange-600 text-white active:scale-[0.98]"
                  }`}
                >
                  <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                  {isPublishing ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white" />
                      <span>Publishing Listing to CartNOW Store...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} className="text-white group-hover:scale-110 transition-transform" />
                      <span>Publish Listing to Marketplace</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </form>
          )}
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Product Live Preview Pop-up Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl w-full max-w-5xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Eye size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Product Verification Preview
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-full">
                      Live Store Simulation
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Verify how your listing appears to buyers, test dynamic variant pricing swatches, and inspect SEO metadata.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View Tabs */}
                <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("page")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      activePreviewTab === "page"
                        ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs font-black"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Package size={12} />
                    <span>Storefront Page</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("card")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      activePreviewTab === "card"
                        ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs font-black"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <LayoutGrid size={12} />
                    <span>Catalog Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("seo")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      activePreviewTab === "seo"
                        ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs font-black"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Globe size={12} />
                    <span>Google SEO</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB 1: STOREFRONT PRODUCT PAGE */}
              {activePreviewTab === "page" && (
                <div className="space-y-6 text-left">
                  {/* Top 2-Column Section */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Visual Media Gallery (5 cols) */}
                    <div className="md:col-span-5 space-y-3">
                      <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                        {uploadedFiles.length > 0 ? (
                          <img
                            src={uploadedFiles[modalPreviewImageIdx]?.preview || uploadedFiles.find(f => f.isCover)?.preview || uploadedFiles[0]?.preview}
                            alt={newProduct.name || "Product"}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-700">
                            <Package size={48} className="animate-pulse" />
                            <span className="text-xs font-medium">No Image Uploaded</span>
                          </div>
                        )}

                        {uploadedFiles.length > 0 && uploadedFiles[modalPreviewImageIdx]?.isCover && (
                          <span className="absolute top-3 left-3 bg-orange-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                            Primary Cover
                          </span>
                        )}
                        {uploadedFiles.length > 0 && (
                          <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                            {modalPreviewImageIdx + 1} / {uploadedFiles.length}
                          </span>
                        )}
                      </div>

                      {/* Image Thumbnails Strip */}
                      {uploadedFiles.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                          {uploadedFiles.map((file, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setModalPreviewImageIdx(idx)}
                              className={`relative h-14 w-14 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                                modalPreviewImageIdx === idx
                                  ? "border-orange-500 ring-2 ring-orange-500/30 shadow-xs scale-105"
                                  : "border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img src={file.preview} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                              {file.isCover && (
                                <span className="absolute bottom-0 inset-x-0 bg-orange-500 text-white text-[6px] font-black uppercase text-center py-0.5">
                                  Cover
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Details & Purchase Controls (7 cols) */}
                    <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        {/* Breadcrumbs & Brand */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <span className="truncate">
                            {newProduct.category || "General"} {newProduct.subCategory ? `› ${newProduct.subCategory}` : ""}
                          </span>
                          {newProduct.brand && (
                            <span className="font-extrabold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md">
                              {newProduct.brand}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                          {newProduct.name || "Untitled Product Listing"}
                        </h2>

                        {/* Ratings Simulation */}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1 bg-amber-500 text-white font-black text-[10px] px-2 py-0.5 rounded-md">
                            <span>4.9</span>
                            <span>★</span>
                          </div>
                          <span className="text-slate-400 font-medium text-[11px]">
                            128 Ratings & 42 Customer Reviews
                          </span>
                        </div>

                        {/* Price & MRP Row */}
                        <div className="pt-2 flex items-baseline gap-3">
                          <span className="text-3xl font-black text-slate-900 dark:text-white">
                            ₹{parseFloat(activeMatchingVariant ? activeMatchingVariant.price : newProduct.price) ? parseFloat(activeMatchingVariant ? activeMatchingVariant.price : newProduct.price).toLocaleString("en-IN") : "0"}
                          </span>
                          {parseFloat(newProduct.price) > 0 && (
                            <>
                              <span className="text-sm font-semibold text-slate-400 line-through">
                                ₹{Math.round((parseFloat(activeMatchingVariant ? activeMatchingVariant.price : newProduct.price) || 0) * 1.25).toLocaleString("en-IN")}
                              </span>
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                                20% OFF
                              </span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block">Inclusive of all local taxes</span>

                        {/* Stock & Delivery Info */}
                        <div className="flex items-center gap-3 pt-1">
                          <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                            parseInt(activeMatchingVariant ? activeMatchingVariant.stock : newProduct.stock) > 0
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 border border-emerald-500/30"
                              : "bg-red-50 text-red-500 dark:bg-red-950/30 border border-red-500/30"
                          }`}>
                            <span className={`h-2 w-2 rounded-full ${parseInt(activeMatchingVariant ? activeMatchingVariant.stock : newProduct.stock) > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                            <span>
                              {parseInt(activeMatchingVariant ? activeMatchingVariant.stock : newProduct.stock) > 0
                                ? `In Stock (${activeMatchingVariant ? activeMatchingVariant.stock : newProduct.stock} units)`
                                : "Out of Stock"}
                            </span>
                          </span>

                          <span className="text-[11px] text-slate-500 font-medium">
                            Target Audience: <strong>{newProduct.audience || "Unisex"}</strong>
                          </span>
                        </div>

                        {/* Dynamic Attributes / Variant Interactive Chips */}
                        {productAttributes.length > 0 && (
                          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Interactive Variant Options
                              </span>
                              {activeMatchingVariant?.sku && (
                                <span className="text-[10px] font-mono text-orange-500 font-bold">
                                  SKU: {activeMatchingVariant.sku}
                                </span>
                              )}
                            </div>

                            {productAttributes.filter(a => a.name && a.values).map((attr) => {
                              const vals = attr.values.split(",").map(v => v.trim()).filter(Boolean);
                              const isColor = attr.displayType === "color" || attr.name.toLowerCase() === "color";

                              return (
                                <div key={attr.name} className="space-y-1.5">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{attr.name}:</span>
                                    <span className="font-black text-orange-600 dark:text-orange-400">
                                      {selectedPreviewAttrs[attr.name] || vals[0] || ""}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {vals.map((val) => {
                                      const isSelected = selectedPreviewAttrs[attr.name] === val;
                                      if (isColor) {
                                        return (
                                          <button
                                            key={val}
                                            type="button"
                                            onClick={() => setSelectedPreviewAttrs(prev => ({ ...prev, [attr.name]: val }))}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                              isSelected
                                                ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/30"
                                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-400"
                                            }`}
                                          >
                                            <span
                                              className="h-3.5 w-3.5 rounded-full border border-slate-300 shadow-2xs"
                                              style={{ backgroundColor: val.toLowerCase().replace(/\s+/g, "") }}
                                            />
                                            <span>{val}</span>
                                          </button>
                                        );
                                      }

                                      return (
                                        <button
                                          key={val}
                                          type="button"
                                          onClick={() => setSelectedPreviewAttrs(prev => ({ ...prev, [attr.name]: val }))}
                                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                            isSelected
                                              ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-400"
                                          }`}
                                        >
                                          {val}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Storefront Action Buttons (Customer Sim) */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            const currentPrice = activeMatchingVariant ? activeMatchingVariant.price : newProduct.price;
                            toast.info(`🛒 Simulation: "${newProduct.name || "Product"}" added to buyer's cart for ₹${currentPrice}!`);
                          }}
                          className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={15} />
                          <span>Simulate Add to Cart</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toast.success(`⚡ Simulation: Buyer directed to Instant Checkout!`);
                          }}
                          className="py-3 px-4 bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Zap size={15} />
                          <span>Simulate Buy Now</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Product Description Section */}
                  <div className="p-5 bg-slate-50/70 dark:bg-slate-950/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Product Overview & Details
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                      {newProduct.description || "No description provided yet."}
                    </p>
                  </div>

                  {/* Technical Specifications Table */}
                  {customAttributes.filter(a => a.key && a.value).length > 0 && (
                    <div className="p-5 bg-slate-50/70 dark:bg-slate-950/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Technical Specifications ({customAttributes.filter(a => a.key && a.value).length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {customAttributes.filter(a => a.key && a.value).map((spec, idx) => (
                          <div key={idx} className="flex justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                            <span className="font-bold text-slate-500">{spec.key}</span>
                            <span className="font-extrabold text-slate-800 dark:text-white">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collections & Tags */}
                  {(selectedCollections.length > 0 || newProduct.tags) && (
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {selectedCollections.map((col) => (
                        <span key={col} className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-black uppercase">
                          🏷️ {col}
                        </span>
                      ))}
                      {newProduct.tags && newProduct.tags.split(",").map((t, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold">
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CATALOG CARD PREVIEW */}
              {activePreviewTab === "card" && (
                <div className="flex flex-col items-center justify-center p-6 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl space-y-4">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    How this product appears in the CartNOW search catalog & category feeds:
                  </span>
                  <div className="w-72 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col text-left">
                    <div className="relative h-52 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                      {uploadedFiles.length > 0 ? (
                        <img
                          src={uploadedFiles.find(f => f.isCover)?.preview || uploadedFiles[0]?.preview}
                          alt="Product"
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <Package size={36} className="text-slate-300 dark:text-slate-700 animate-pulse" />
                      )}
                      {uploadedFiles.length > 0 && uploadedFiles.find(f => f.isCover) && (
                        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs">
                          Cover
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span className="truncate">{newProduct.category || "General"}</span>
                        {newProduct.brand && (
                          <span className="font-extrabold uppercase text-orange-500">
                            {newProduct.brand}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-800 dark:text-white line-clamp-2 leading-snug">
                        {newProduct.name || "Untitled Product Listing"}
                      </h4>

                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="bg-amber-500 text-white font-black px-1.5 py-0.5 rounded text-[9px]">4.9 ★</span>
                        <span className="text-slate-400 font-medium">(128)</span>
                      </div>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{parseFloat(activeMatchingVariant ? activeMatchingVariant.price : newProduct.price) ? parseFloat(activeMatchingVariant ? activeMatchingVariant.price : newProduct.price).toLocaleString("en-IN") : "0"}
                        </span>
                        {parseFloat(newProduct.price) > 0 && (
                          <span className="text-xs font-semibold text-slate-400 line-through">
                            ₹{Math.round((parseFloat(activeMatchingVariant ? activeMatchingVariant.price : newProduct.price) || 0) * 1.25).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toast.info(`🛒 Buyer card interaction: Added to cart!`)}
                        className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm mt-2"
                      >
                        <ShoppingCart size={13} />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Google SERP Search Preview */}
              {activePreviewTab === "seo" && (
                <div className="flex flex-col items-center justify-center p-6 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl space-y-4">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Google Search Engine Results Snippet Preview:
                  </span>
                  <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-2 text-left shadow-md max-w-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans">
                      <Globe size={12} className="text-slate-400" />
                      <span>https://cartnow.com</span>
                      <span>›</span>
                      <span className="text-slate-400 truncate max-w-[180px]">
                        product › {newProduct.name ? newProduct.name.toLowerCase().replace(/\s+/g, "-") : "listing"}
                      </span>
                    </div>

                    <a
                      href="#seo-preview"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline text-base font-bold font-sans block leading-snug truncate cursor-pointer"
                    >
                      {newProduct.name ? `${newProduct.name} | Buy ${newProduct.brand || "Online"}` : "Untitled Product Listing | CartNow"}
                    </a>

                    <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-normal line-clamp-3">
                      {newProduct.seoDescription || newProduct.description || "Enter a meta description or let the AI Generate SEO details to optimize Google and search engine rankings."}
                    </p>

                    {newProduct.keywords && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-black pt-1">
                        <Search size={10} />
                        <span>Keywords: {newProduct.keywords}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Status: <strong>{completionPercentage}% Configured</strong> ({completedCount < requiredFields.length ? `${requiredFields.length - completedCount} Incomplete Required Fields` : "All Checks Passed"})</span>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleCreateProduct();
                  }}
                  disabled={isPublishing}
                  className="w-full sm:w-auto px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
                >
                  {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{isPublishing ? "Publishing..." : "Confirm & Publish Now"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Variant JSON Code Editor Modal */}
      {showVariantJsonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Code size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Variant JSON Code Editor</h3>
                  <p className="text-[10px] text-slate-400">View, edit, or paste variant prices, stocks, and attributes in raw JSON</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVariantJsonModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {variantJsonError && (
                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{variantJsonError}</span>
                </div>
              )}
              <textarea
                rows={12}
                value={variantJsonText}
                onChange={(e) => {
                  setVariantJsonText(e.target.value);
                  setVariantJsonError("");
                }}
                className="w-full p-4 bg-slate-955 text-indigo-300 font-mono text-xs rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed shadow-2xs"
                placeholder='[{"attributes":{"Color":"Red","Size":"M"},"price":599,"stock":10,"sku":"PROD-RED-M-0"}]'
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Format: Array of objects with attributes, price, stock, sku.</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(variantJsonText);
                    toast.info("JSON copied to clipboard!");
                  }}
                  className="text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Copy size={12} /> Copy JSON
                </button>
              </div>
            </div>

            <div className="p-4 flex justify-end gap-2 bg-slate-950">
              <button
                type="button"
                onClick={() => setShowVariantJsonModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyVariantJson}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check size={14} /> Save & Apply JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Success Celebration Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative mx-auto w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <PartyPopper size={36} className="text-white" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Product Published Successfully! 🎉
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your product listing is now active with all dynamic attributes, matrix variants, and high-res media synced.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                Create Another Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Product Creation & Schema Master Guide Modal */}
      {showFullGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[88vh] max-h-[900px] shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500 text-white shadow-xs">
                  <BookOpen size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Product Creation Documentation
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">
                      CartNOW Studio
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Comprehensive specifications, dynamic attribute matrices, AI parsing, and JSON schemas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFullGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Navigation Tabs - Equal Width & Same Dimensions for All Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
              {[
                { id: "overview", label: "Overview & Workflow", icon: Sparkles },
                { id: "form", label: "Form Mode", icon: FileText },
                { id: "attributes", label: "Dynamic Attributes", icon: Sliders },
                { id: "ai", label: "Smart AI Mode", icon: Zap },
                { id: "json", label: "JSON Schema Mode", icon: Code },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = guideActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setGuideActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 py-3.5 px-3 border-b-2 text-xs font-bold transition cursor-pointer text-center ${
                      isActive
                        ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-900 shadow-2xs font-black"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-orange-500" : "text-slate-400"} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Tab Content Area - Consistent Height Across All Tabs */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
              {/* Tab 1: Overview & Workflow */}
              {guideActiveTab === "overview" && (
                <div className="space-y-5">
                  <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-500/20 rounded-2xl p-4">
                    <h4 className="font-black text-slate-900 dark:text-white text-sm mb-1">
                      Welcome to the CartNOW Product Engine
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      You can create listings using any of the 3 modes based on your workflow. Regardless of mode, every listing runs through validation checks, dynamic matrix generation, and storefront simulation.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
                      4-Step Publishing Lifecycle
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <span className="h-6 w-6 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center">1</span>
                        <p className="font-bold text-slate-900 dark:text-white">Choose Creation Mode</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          <strong>Form Mode</strong> for manual step-by-step control, <strong>Smart AI</strong> to parse supplier text, or <strong>JSON Mode</strong> for bulk schemas.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <span className="h-6 w-6 rounded-lg bg-indigo-500 text-white font-black text-xs flex items-center justify-center">2</span>
                        <p className="font-bold text-slate-900 dark:text-white">Specify Details & Images</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Upload up to 4 photos, set title, category, subcategory, base price, and stock count to satisfy requirements.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <span className="h-6 w-6 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center">3</span>
                        <p className="font-bold text-slate-900 dark:text-white">Configure Variants</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Add attributes like Size, Color, or Storage. The matrix engine automatically calculates Cartesian inventory combinations.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <span className="h-6 w-6 rounded-lg bg-blue-500 text-white font-black text-xs flex items-center justify-center">4</span>
                        <p className="font-bold text-slate-900 dark:text-white">Verify & Publish</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Ensure the <strong>Listing Readiness</strong> bar reaches 100%, verify with the preview pop-up, and publish directly.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
                      Available Creation Modes
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                          <FileText size={16} className="text-orange-500" />
                          <span>Standard Form Mode</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Full visual control with an intuitive step-by-step wizard, interactive color pickers, and automated tag generation.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                          <Zap size={16} className="text-violet-500" />
                          <span>Smart AI Extractor</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Paste raw manufacturer spec sheets, PDFs, or unstructured product notes to instantly populate all catalog fields.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                          <Code size={16} className="text-blue-500" />
                          <span>JSON Schema Mode</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Developer-friendly JSON schema input with real-time linting, validation diagnostics, and one-click template loading.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Form Mode */}
              {guideActiveTab === "form" && (
                <div className="space-y-5">
                  <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 rounded-2xl p-4">
                    <h4 className="font-black text-orange-800 dark:text-orange-300 text-sm mb-1">
                      Step-by-Step Form Studio Architecture
                    </h4>
                    <p className="text-xs text-orange-700/90 dark:text-orange-400/90 leading-relaxed">
                      Form Mode guides you sequentially through 6 organized stages, ensuring every required catalog detail is verified before publishing.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center">1</span>
                        <h5 className="font-bold text-slate-900 dark:text-white">Basic Information</h5>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Enter title, brand name, and base retail pricing in INR. Dynamic discount MRP calculation will apply automatically.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-indigo-500 text-white font-black text-xs flex items-center justify-center">2</span>
                        <h5 className="font-bold text-slate-900 dark:text-white">Categorization</h5>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Select main category, subcategory, and target customer audience (Men, Women, Kids, Unisex).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center">3</span>
                        <h5 className="font-bold text-slate-900 dark:text-white">Media Uploads</h5>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Upload up to 4 high-res photos (JPG, PNG, WebP up to 5MB). Set a primary cover photo with one click.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-blue-500 text-white font-black text-xs flex items-center justify-center">4</span>
                        <h5 className="font-bold text-slate-900 dark:text-white">Specifications</h5>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Add key-value technical specifications (e.g. Material, RAM, Warranty) and auto-generate SEO keywords.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-purple-500 text-white font-black text-xs flex items-center justify-center">5</span>
                        <h5 className="font-bold text-slate-900 dark:text-white">Dynamic Variants</h5>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Configure attributes with visual pills, color swatches, or dropdowns to build a Cartesian variant inventory matrix.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-teal-500 text-white font-black text-xs flex items-center justify-center">6</span>
                        <h5 className="font-bold text-slate-900 dark:text-white">Review & Publish</h5>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Verify listing readiness, test customer interaction in the live pop-up modal, and publish with instant feedback.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Dynamic Attributes & Variant Matrix */}
              {guideActiveTab === "attributes" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/40 space-y-1.5">
                    <h5 className="font-black text-violet-900 dark:text-violet-200 text-sm flex items-center gap-1.5">
                      <Sliders size={15} className="text-violet-500" />
                      Dynamic Attributes & Matrix Variant Generator
                    </h5>
                    <p className="text-[11px] text-violet-700/90 dark:text-violet-300/90 leading-relaxed">
                      Dynamic attributes allow you to sell a product in multiple sizes, colors, capacities, or packaging variants without creating duplicate product listings.
                    </p>
                  </div>

                  {/* 3 Core Display Types */}
                  <div>
                    <h6 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2.5">
                      1. Display Types Explained
                    </h6>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 text-[10px] font-bold">
                          Option Pill
                        </span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Pill Badges</p>
                        <p className="text-[10px] text-slate-400">
                          Clickable pill buttons. Best for <strong>Sizes (S, M, L)</strong>, <strong>Storage (128GB, 256GB)</strong>, and <strong>Pack Sizes (250g, 500g)</strong>.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 text-[10px] font-bold">
                          Color Swatch
                        </span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Color Circles</p>
                        <p className="text-[10px] text-slate-400">
                          Interactive visual swatches with hover names. Best for <strong>Colors (Black, White, Crimson, Navy)</strong>.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                          Dropdown Select
                        </span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Compact Select</p>
                        <p className="text-[10px] text-slate-400">
                          Clean drop-down menu. Best when you have <strong>5+ options</strong> (e.g. Ring sizes, Shoe sizes UK 5-13).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Matrix Math & Interactive Simulator in Side-by-Side Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Simulator Left (7 cols) */}
                    <div className="lg:col-span-7 p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 text-left flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-violet-500" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                              Interactive Attribute & Cart Simulator
                            </span>
                          </div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            Live Playground
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Click below to test how customer selections instantly recalculate SKU, price, and stock status:
                        </p>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Color Options:</span>
                            <div className="flex gap-1.5">
                              {["Midnight Black", "Arctic White", "Crimson Red"].map(c => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setSimulatorSelected(prev => ({ ...prev, Color: c }))}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                    simulatorSelected.Color === c 
                                      ? "bg-violet-600 text-white shadow-xs" 
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                  }`}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Size Options:</span>
                            <div className="flex gap-1.5">
                              {["UK 7", "UK 8", "UK 9", "UK 10"].map(s => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setSimulatorSelected(prev => ({ ...prev, Size: s }))}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                    simulatorSelected.Size === s 
                                      ? "bg-violet-600 text-white shadow-xs" 
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                            <div>
                              <span className="text-slate-400">Simulated SKU: </span>
                              <strong className="font-mono text-violet-600 dark:text-violet-400">
                                PROD-{simulatorSelected.Color?.slice(0, 3).toUpperCase()}-{simulatorSelected.Size?.replace(/\s+/g, "")}
                              </strong>
                            </div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                              ₹{simulatorSelected.Size === "UK 10" ? "13,499" : "12,999"} (In Stock)
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[10px] text-slate-400">
                        Matrix math: 3 colors × 4 sizes = <strong>12 unique inventory SKUs</strong>.
                      </div>
                    </div>

                    {/* JSON Format Right (5 cols) */}
                    <div className="lg:col-span-5 p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h6 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                          2. JSON Schema Structure
                        </h6>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Pass key-value arrays in the payload to generate attributes programmatically:
                        </p>
                        <pre className="p-3 bg-slate-950 text-indigo-300 rounded-xl text-[10px] font-mono overflow-x-auto leading-relaxed">
{`"attributes": {
  "Color": [
    "Midnight Black",
    "Arctic White",
    "Crimson Red"
  ],
  "Size": [
    "UK 7", "UK 8",
    "UK 9", "UK 10"
  ]
}`}
                        </pre>
                      </div>

                      <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-700 dark:text-violet-300">
                        Per-variant price overrides and custom stock values can be configured on Step 5.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Smart AI Mode */}
              {guideActiveTab === "ai" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/40">
                    <h5 className="font-black text-violet-900 dark:text-violet-300 text-sm mb-1">
                      Turn Raw Unstructured Text into a Published Catalog Listing
                    </h5>
                    <p className="text-[11px] text-violet-700/90 dark:text-violet-400/90 leading-relaxed">
                      Copy raw specs directly from an email, a supplier PDF, or manufacturer website note and paste it in the Smart AI extractor.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Left Column (6 cols): Step-by-step & Pro Tips */}
                    <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
                      <h6 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                        AI Parsing Workflow
                      </h6>
                      <ol className="list-decimal pl-5 space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <li>Switch to <strong>Smart AI Mode</strong> from the top toolbar.</li>
                        <li>Paste product descriptions, technical bullet points, or supplier notes.</li>
                        <li>Click <strong>"AI Parse & Populate Form"</strong> to run automated extraction.</li>
                        <li>Review the populated form, upload photos, and proceed to publish!</li>
                      </ol>

                      <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                          Pro Tip for Best Accuracy
                        </span>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400">
                          Include explicit prices and stock counts (e.g. <code className="font-mono text-pink-500">Price: ₹14,999, Stock: 50</code>) for instant automatic field assignment.
                        </p>
                      </div>
                    </div>

                    {/* Right Column (6 cols): What AI Extracts Automatically */}
                    <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <h6 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                          Automatically Extracted Properties
                        </h6>
                        <ul className="text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400">
                          <li><strong className="text-slate-800 dark:text-slate-200">Identity:</strong> Title, Brand, Model & Audience</li>
                          <li><strong className="text-slate-800 dark:text-slate-200">Pricing & Stock:</strong> Retail price (INR) and inventory availability</li>
                          <li><strong className="text-slate-800 dark:text-slate-200">Taxonomy:</strong> Automatic matching to CartNOW category tree</li>
                          <li><strong className="text-slate-800 dark:text-slate-200">Specifications:</strong> Key-value attributes (RAM, Material, Battery)</li>
                          <li><strong className="text-slate-800 dark:text-slate-200">SEO:</strong> Search tags and keywords</li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          pasteExampleText();
                          setShowFullGuideModal(false);
                          setActiveMode("ai");
                        }}
                        className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Zap size={14} />
                        <span>Load Sample Spec & Try AI Mode</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: JSON Mode */}
              {guideActiveTab === "json" && (
                <div className="space-y-5">
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-4">
                    <h4 className="font-black text-blue-800 dark:text-blue-300 text-sm mb-1">
                      Fast Programmatic & Bulk JSON Catalog Schema
                    </h4>
                    <p className="text-xs text-blue-700/90 dark:text-blue-400/90 leading-relaxed">
                      JSON Mode is the fastest method for developer, API, or automated batch listing creation with strict payload validation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Schema Table Left (7 cols) */}
                    <div className="lg:col-span-7 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 uppercase font-black text-[10px]">
                          <tr>
                            <th className="p-2.5">Field</th>
                            <th className="p-2.5">Type</th>
                            <th className="p-2.5">Required</th>
                            <th className="p-2.5">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          <tr>
                            <td className="p-2 font-mono font-bold text-pink-600 dark:text-pink-400">name</td>
                            <td className="p-2 text-slate-400">string</td>
                            <td className="p-2 text-emerald-600 font-bold">Yes</td>
                            <td className="p-2">Full title of the product listing</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono font-bold text-pink-600 dark:text-pink-400">price</td>
                            <td className="p-2 text-slate-400">number</td>
                            <td className="p-2 text-emerald-600 font-bold">Yes</td>
                            <td className="p-2">Retail price in INR (must be positive)</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono font-bold text-pink-600 dark:text-pink-400">category</td>
                            <td className="p-2 text-slate-400">string</td>
                            <td className="p-2 text-emerald-600 font-bold">Yes</td>
                            <td className="p-2">Main category (e.g. "Footwear")</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono font-bold text-pink-600 dark:text-pink-400">subCategory</td>
                            <td className="p-2 text-slate-400">string</td>
                            <td className="p-2 text-emerald-600 font-bold">Yes</td>
                            <td className="p-2">Subtype (e.g. "Sneakers")</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono font-bold text-pink-600 dark:text-pink-400">images</td>
                            <td className="p-2 text-slate-400">array[string]</td>
                            <td className="p-2 text-emerald-600 font-bold">Yes</td>
                            <td className="p-2">At least 1 valid photo URL</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono font-bold">brand</td>
                            <td className="p-2 text-slate-400">string</td>
                            <td className="p-2 text-slate-400">Optional</td>
                            <td className="p-2">Brand or manufacturer name</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono font-bold">stock</td>
                            <td className="p-2 text-slate-400">number</td>
                            <td className="p-2 text-slate-400">Optional</td>
                            <td className="p-2">Initial inventory count (default: 10)</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono font-bold">attributes</td>
                            <td className="p-2 text-slate-400">object</td>
                            <td className="p-2 text-slate-400">Optional</td>
                            <td className="p-2">Map of attribute names to array of values</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Template Right (5 cols) */}
                    <div className="lg:col-span-5 p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">Ready-to-Paste Template</span>
                          <button
                            type="button"
                            onClick={() => {
                              pasteExampleJson();
                              setShowFullGuideModal(false);
                              setActiveMode("json");
                            }}
                            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            Load This Into Editor ↗
                          </button>
                        </div>
                        <pre className="p-3 bg-slate-950 text-indigo-300 rounded-xl text-[10px] font-mono overflow-x-auto max-h-56 leading-relaxed">
{`{
  "name": "Nike Air Max Pulse",
  "category": "Footwear",
  "subCategory": "Sneakers",
  "price": 12999,
  "images": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
  ],
  "brand": "Nike",
  "stock": 120,
  "sku": "NK-AMP-001",
  "audience": "Unisex",
  "attributes": {
    "Color": ["Red", "White", "Black"],
    "Size": ["UK 7", "UK 8", "UK 9"]
  }
}`}
                        </pre>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        CartNOW Schema Standard v2.0 • Strict JSON syntax validation.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">CartNOW Seller Portal Documentation</span>
              <button
                type="button"
                onClick={() => setShowFullGuideModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddProduct;

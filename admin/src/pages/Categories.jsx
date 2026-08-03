import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  FolderMinus, 
  Settings, 
  PlusCircle, 
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Check,
  Copy,
  FolderTree,
  Eye,
  ArrowUp,
  ArrowDown,
  Archive,
  RotateCcw,
  Sparkles,
  Lock,
  X,
  Sliders,
  SlidersHorizontal,
  HelpCircle,
  AlertTriangle,
  FileCode,
  Heart
} from "lucide-react";

const Categories = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [status, setStatus] = useState("active");
  const [isFeatured, setIsFeatured] = useState(false);

  // SEO details
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewArchived, setViewArchived] = useState(false);

  // Tab state for the customization panel
  const [panelTab, setPanelTab] = useState("settings"); // "settings", "attributes", "rules", "preview"

  // Attribute selection state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [templateFields, setTemplateFields] = useState([]);
  const [catSettings, setCatSettings] = useState({
    minImages: 3,
    maxImages: 10,
    requiresApproval: true,
    inventoryTrackingEnabled: true,
    skuRequired: false,
    barcodeRequired: false
  });

  // Dynamic Attribute form state
  const [newField, setNewField] = useState({
    fieldName: "",
    label: "",
    placeholder: "",
    description: "",
    helpText: "",
    fieldType: "Text",
    isRequired: false,
    isSearchable: true,
    isFilterable: true,
    isSortable: false,
    visibleOnListing: true,
    visibleOnSearch: true,
    visibleOnSellerForm: true,
    visibleOnAdminForm: true,
    defaultValue: "",
    selectOptions: "", // string comma separated
    // Validation
    minLength: "",
    maxLength: "",
    regexPattern: "",
    minVal: "",
    maxVal: "",
    maxFileSizeMB: "",
    // Conditional
    dependsOn: "",
    expectedValue: "",
    action: "show"
  });

  const [editingFieldId, setEditingFieldId] = useState(null);

  const fieldTypes = [
    "Text",
    "Text Area",
    "Number",
    "Decimal",
    "Dropdown",
    "Multi Select",
    "Checkbox",
    "Radio Button",
    "Date",
    "Time",
    "Datetime",
    "Email",
    "URL",
    "Phone",
    "Rich Text Editor",
    "Image Upload",
    "Multiple Image Upload",
    "Video Upload",
    "File Upload",
    "Location Picker",
    "Color Picker",
    "Tags Input"
  ];

  const [aiLoading, setAiLoading] = useState(false);
  const [aiTemplateLoading, setAiTemplateLoading] = useState(false);

  const handleAIFill = async () => {
    if (!name.trim()) return toast.error("Please enter a category name first");
    setAiLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/category/ai-fill`,
        { name },
        { headers: { token } }
      );
      if (data.success && data.data) {
        const metadata = data.data;
        if (metadata.description) setDescription(metadata.description);
        if (metadata.icon) setIcon(metadata.icon);
        if (metadata.seoTitle) setSeoTitle(metadata.seoTitle);
        if (metadata.seoDescription) setSeoDescription(metadata.seoDescription);
        if (metadata.seoKeywords) setSeoKeywords(metadata.seoKeywords);
        toast.success("Category details auto-filled by AI! Feel free to modify as needed.");
      } else {
        toast.error(data.message || "Failed to fill details with AI");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "AI auto-fill request failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAITemplateFill = async () => {
    if (!selectedCategory) return toast.error("No category selected");
    setAiTemplateLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/category/template/ai-fill`,
        { categoryId: selectedCategory._id, categoryName: selectedCategory.name },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message || "Blueprint filled by AI!");
        fetchTemplateAndSettings(selectedCategory._id);
      } else {
        toast.error(data.message || "Failed to generate blueprint");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "AI blueprint fill request failed");
    } finally {
      setAiTemplateLoading(false);
    }
  };

  const fetchCategories = async (selectFirst = false) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/categories?includeArchived=${viewArchived}`,
        { headers: { token } }
      );
      if (data.success) {
        setCategories(data.categories);
        if (data.categories.length > 0 && (selectFirst || !selectedCategory)) {
          const firstCat = data.categories[0];
          setSelectedCategory(firstCat);
          fetchTemplateAndSettings(firstCat._id);
        }
      }
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const fetchTemplateAndSettings = async (categoryId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/category/${categoryId}/template`,
        { headers: { token } }
      );
      if (data.success) {
        setTemplateFields(data.fields || []);
        if (data.settings) {
          setCatSettings(data.settings);
        }
      }
    } catch {
      toast.error("Failed to load template configuration");
    }
  };

  useEffect(() => {
    fetchCategories(true);
  }, [viewArchived]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    fetchTemplateAndSettings(cat._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    setLoading(true);
    try {
      const payload = {
        name,
        description,
        icon,
        bannerImage,
        parentCategoryId: parentCategoryId || null,
        status,
        isFeatured,
        seoTitle,
        seoDescription,
        seoKeywords: seoKeywords ? seoKeywords.split(",").map(k => k.trim()) : []
      };

      if (editingId) {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/category/update`,
          { id: editingId, ...payload },
          { headers: { token } }
        );
        if (data.success) {
          toast.success("Category updated successfully");
          setEditingId(null);
          // Update selected category details locally
          if (selectedCategory && selectedCategory._id === editingId) {
            setSelectedCategory({ ...selectedCategory, ...payload });
          }
        } else toast.error(data.message);
      } else {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/category/create`,
          payload,
          { headers: { token } }
        );
        if (data.success) {
          toast.success("Category created successfully");
        } else toast.error(data.message);
      }

      resetCategoryForm();
      fetchCategories();
    } catch {
      toast.error("Operation failed");
    }
    setLoading(false);
  };

  const resetCategoryForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setIcon("");
    setBannerImage("");
    setParentCategoryId("");
    setStatus("active");
    setIsFeatured(false);
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords("");
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || "");
    setIcon(cat.icon || "");
    setBannerImage(cat.bannerImage || "");
    setParentCategoryId(cat.parentCategoryId || "");
    setStatus(cat.status || "active");
    setIsFeatured(cat.isFeatured || false);
    setSeoTitle(cat.seoTitle || "");
    setSeoDescription(cat.seoDescription || "");
    setSeoKeywords(cat.seoKeywords?.join(", ") || "");
    setPanelTab("settings"); // Switch to settings tab to view edit form
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this category? All its attributes will be removed.")) return;
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/category/delete`, { id }, { headers: { token } });
      if (data.success) {
        toast.success("Category deleted");
        if (selectedCategory?._id === id) setSelectedCategory(null);
        fetchCategories();
      }
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/category/duplicate`, { id }, { headers: { token } });
      if (data.success) {
        toast.success("Category cloned successfully!");
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to duplicate category");
    }
  };

  const handleArchive = async (id) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/category/archive`, { id }, { headers: { token } });
      if (data.success) {
        toast.success("Category archived");
        fetchCategories();
      }
    } catch {
      toast.error("Failed to archive category");
    }
  };

  const handleRestore = async (id) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/category/restore`, { id }, { headers: { token } });
      if (data.success) {
        toast.success("Category restored");
        fetchCategories();
      }
    } catch {
      toast.error("Failed to restore category");
    }
  };

  const moveCategory = async (index, direction) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= categories.length) return;

    const list = [...categories];
    const temp = list[index].displayOrder || 0;
    list[index].displayOrder = list[nextIdx].displayOrder || 0;
    list[nextIdx].displayOrder = temp;

    try {
      const orderPayload = list.map((c, idx) => ({ id: c._id, displayOrder: idx }));
      await axios.post(`${backendUrl}/api/admin/category/reorder`, { order: orderPayload }, { headers: { token } });
      fetchCategories();
    } catch {
      toast.error("Failed to reorder categories");
    }
  };

  // Attributes & options management
  const handleAddOrUpdateField = async (e) => {
    e.preventDefault();
    if (!newField.fieldName.trim()) return toast.error("Field name is required");
    try {
      const validationRules = {
        customErrorMessage: ""
      };
      if (newField.minLength) validationRules.minLength = parseInt(newField.minLength);
      if (newField.maxLength) validationRules.maxLength = parseInt(newField.maxLength);
      if (newField.regexPattern) validationRules.regexPattern = newField.regexPattern;
      if (newField.minVal) validationRules.minVal = parseFloat(newField.minVal);
      if (newField.maxVal) validationRules.maxVal = parseFloat(newField.maxVal);
      if (newField.maxFileSizeMB) validationRules.maxFileSizeMB = parseFloat(newField.maxFileSizeMB);

      const conditionalRules = {};
      if (newField.dependsOn) {
        conditionalRules.dependsOn = newField.dependsOn;
        conditionalRules.expectedValue = newField.expectedValue;
        conditionalRules.action = newField.action;
      }

      const payload = {
        categoryId: selectedCategory._id,
        fieldName: newField.fieldName,
        label: newField.label || newField.fieldName,
        placeholder: newField.placeholder,
        description: newField.description,
        helpText: newField.helpText,
        fieldType: newField.fieldType,
        isRequired: newField.isRequired,
        isSearchable: newField.isSearchable,
        isFilterable: newField.isFilterable,
        isSortable: newField.isSortable,
        visibleOnListing: newField.visibleOnListing,
        visibleOnSearch: newField.visibleOnSearch,
        visibleOnSellerForm: newField.visibleOnSellerForm,
        visibleOnAdminForm: newField.visibleOnAdminForm,
        defaultValue: newField.defaultValue,
        selectOptions: newField.selectOptions ? newField.selectOptions.split(",").map(o => o.trim()) : [],
        validationRules,
        conditionalRules
      };

      if (editingFieldId) {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/category/template/field/update`,
          { id: editingFieldId, ...payload },
          { headers: { token } }
        );
        if (data.success) {
          toast.success("Attribute updated");
          setEditingFieldId(null);
        }
      } else {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/category/template/field`,
          payload,
          { headers: { token } }
        );
        if (data.success) {
          toast.success("Attribute added successfully");
        }
      }

      resetAttributeForm();
      fetchTemplateAndSettings(selectedCategory._id);
    } catch {
      toast.error("Failed to save attribute field");
    }
  };

  const resetAttributeForm = () => {
    setEditingFieldId(null);
    setNewField({
      fieldName: "",
      label: "",
      placeholder: "",
      description: "",
      helpText: "",
      fieldType: "Text",
      isRequired: false,
      isSearchable: true,
      isFilterable: true,
      isSortable: false,
      visibleOnListing: true,
      visibleOnSearch: true,
      visibleOnSellerForm: true,
      visibleOnAdminForm: true,
      defaultValue: "",
      selectOptions: "",
      minLength: "",
      maxLength: "",
      regexPattern: "",
      minVal: "",
      maxVal: "",
      maxFileSizeMB: "",
      dependsOn: "",
      expectedValue: "",
      action: "show"
    });
  };

  const handleEditField = (field) => {
    setEditingFieldId(field._id);
    setNewField({
      fieldName: field.fieldName,
      label: field.label || field.fieldName,
      placeholder: field.placeholder || "",
      description: field.description || "",
      helpText: field.helpText || "",
      fieldType: field.fieldType,
      isRequired: field.isRequired || false,
      isSearchable: field.isSearchable !== false,
      isFilterable: field.isFilterable !== false,
      isSortable: field.isSortable || false,
      visibleOnListing: field.visibleOnListing !== false,
      visibleOnSearch: field.visibleOnSearch !== false,
      visibleOnSellerForm: field.visibleOnSellerForm !== false,
      visibleOnAdminForm: field.visibleOnAdminForm !== false,
      defaultValue: field.defaultValue || "",
      selectOptions: field.selectOptions?.join(", ") || "",
      minLength: field.validationRules?.minLength || "",
      maxLength: field.validationRules?.maxLength || "",
      regexPattern: field.validationRules?.regexPattern || "",
      minVal: field.validationRules?.minVal || "",
      maxVal: field.validationRules?.maxVal || "",
      maxFileSizeMB: field.validationRules?.maxFileSizeMB || "",
      dependsOn: field.conditionalRules?.dependsOn || "",
      expectedValue: field.conditionalRules?.expectedValue || "",
      action: field.conditionalRules?.action || "show"
    });
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm("Delete this category attribute?")) return;
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/category/template/field/delete`, { id: fieldId }, { headers: { token } });
      if (data.success) {
        toast.success("Attribute deleted");
        fetchTemplateAndSettings(selectedCategory._id);
      }
    } catch {
      toast.error("Failed to delete attribute");
    }
  };

  const moveField = async (index, direction) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= templateFields.length) return;

    const list = [...templateFields];
    const temp = list[index].displayOrder || 0;
    list[index].displayOrder = list[nextIdx].displayOrder || 0;
    list[nextIdx].displayOrder = temp;

    try {
      const orderPayload = list.map((f, idx) => ({ id: f._id, displayOrder: idx }));
      await axios.post(`${backendUrl}/api/admin/category/template/field/reorder`, { order: orderPayload }, { headers: { token } });
      fetchTemplateAndSettings(selectedCategory._id);
    } catch {
      toast.error("Failed to reorder attributes");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/category/settings`, {
        categoryId: selectedCategory._id,
        ...catSettings
      }, { headers: { token } });
      if (data.success) {
        toast.success("Category settings saved");
      }
    } catch {
      toast.error("Failed to save settings");
    }
  };

  // Render tree helper
  const renderCategoryTree = (parentId = null, level = 0) => {
    const list = categories.filter(c => {
      if (parentId === null) {
        return !c.parentCategoryId;
      }
      return c.parentCategoryId === parentId;
    });

    if (list.length === 0) return null;

    return (
      <div className={`space-y-1.5 ${level > 0 ? "pl-4 border-l border-slate-100 dark:border-slate-800/80 mt-1" : ""}`}>
        {list.map((cat, index) => {
          const isSelected = selectedCategory?._id === cat._id;
          return (
            <div key={cat._id} className="space-y-1">
              <div 
                onClick={() => handleSelectCategory(cat)}
                className={`py-2 px-3 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all duration-200 border ${ isSelected ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 border-slate-150 dark:border-slate-800/60" }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FolderTree size={14} className={isSelected ? "text-white" : "text-slate-400"} />
                  <span className="text-xs font-bold truncate">{cat.name}</span>
                  {cat.isFeatured && (
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${ isSelected ? "bg-white text-orange-500" : "bg-orange-100 text-orange-600 dark:bg-orange-550/10 dark:text-orange-400" }`}>
                      Featured
                    </span>
                  )}
                  {cat.status === "disabled" && (
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-slate-150 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Disabled
                    </span>
                  )}
                  {cat.status === "pending" && (
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500 text-white animate-pulse">
                      Pending Approval
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  {cat.status === "pending" && (
                    <button
                      onClick={async () => {
                        try {
                          await axios.post(`${backendUrl}/api/admin/category/update`, { id: cat._id, status: "active" }, { headers: { token } });
                          toast.success("Category approved successfully!");
                          fetchCategories();
                        } catch {
                          toast.error("Failed to approve category");
                        }
                      }}
                      title="Approve Category"
                      className="p-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white transition flex items-center justify-center cursor-pointer border-none"
                    >
                      <Check size={11} className="stroke-[3]" />
                    </button>
                  )}
                  <button
                    onClick={() => moveCategory(categories.indexOf(cat), -1)}
                    disabled={index === 0}
                    className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${isSelected ? "text-orange-200 hover:text-white" : "text-slate-400 hover:text-slate-600"} disabled:opacity-20 cursor-pointer border-none`}
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button
                    onClick={() => moveCategory(categories.indexOf(cat), 1)}
                    disabled={index === list.length - 1}
                    className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${isSelected ? "text-orange-200 hover:text-white" : "text-slate-400 hover:text-slate-600"} disabled:opacity-20 cursor-pointer border-none`}
                  >
                    <ArrowDown size={11} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(cat._id)}
                    title="Clone Category"
                    className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${isSelected ? "text-orange-200 hover:text-white" : "text-slate-400 hover:text-slate-600"} cursor-pointer border-none`}
                  >
                    <Copy size={11} />
                  </button>
                  <button
                    onClick={() => handleEdit(cat)}
                    className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${isSelected ? "text-orange-200 hover:text-white" : "text-slate-400 hover:text-slate-600"} cursor-pointer border-none`}
                  >
                    <Edit3 size={11} />
                  </button>
                  {cat.status === "archived" ? (
                    <button
                      onClick={() => handleRestore(cat._id)}
                      title="Restore from archive"
                      className={`p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-500/10 ${isSelected ? "text-white" : "text-emerald-500"} cursor-pointer border-none`}
                    >
                      <RotateCcw size={11} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleArchive(cat._id)}
                      title="Archive Category"
                      className={`p-1 rounded hover:bg-amber-50 dark:hover:bg-amber-500/10 ${isSelected ? "text-white" : "text-amber-500"} cursor-pointer border-none`}
                    >
                      <Archive size={11} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className={`p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 ${isSelected ? "text-red-200 hover:text-white" : "text-red-400 hover:text-red-500"} cursor-pointer border-none`}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
              {renderCategoryTree(cat._id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  const tabs = [
    { id: "settings", label: "General Settings", icon: Settings },
    { id: "attributes", label: "Dynamic Attributes", icon: Sliders },
    { id: "rules", label: "Submission Rules", icon: ShieldCheck },
    { id: "preview", label: "Live Form Preview", icon: Eye }
  ];

  return (
    <div className="space-y-6 text-left text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Stats & Search Bar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-orange-500 dark:bg-orange-500/10 text-white dark:text-orange-400 rounded-lg flex items-center justify-center border border-orange-500/10 shadow-xs shrink-0">
              <Layers size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Category Architect & Taxonomies</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Build parent/sub taxonomies, dynamic forms schemas, verification rules, and visual models</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                resetCategoryForm();
                setPanelTab("settings");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-black transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Plus size={13} />
              <span>New Category</span>
            </button>
            
            <button
              onClick={() => setViewArchived(!viewArchived)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs ${ viewArchived ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100" }`}
            >
              <Archive size={13} />
              <span>{viewArchived ? "Hide Archived" : "Show Archived"}</span>
            </button>

            <button
              onClick={() => fetchCategories(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
            >
              <RotateCcw size={12} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Middle: Taxonomy Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Total Taxonomies", val: categories.length, sub: "Configured catalog classes", icon: Layers, color: "text-orange-500 bg-orange-500/10" },
            { label: "Featured Categories", val: categories.filter(c => c.isFeatured).length, sub: "Promoted on storefront", icon: Sparkles, color: "text-amber-500 bg-amber-500/10" },
            { label: "Archived Categories", val: categories.filter(c => c.status === "archived").length, sub: "Stored in archive", icon: Archive, color: "text-slate-500 bg-slate-500/10" }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl border bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 flex items-center justify-between group relative overflow-hidden"
              >
                <div className="space-y-1 relative z-10 text-left">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{card.val}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    {card.sub}
                  </span>
                </div>
                <div className={`p-2 rounded-lg border ${card.color} border-slate-200/50 dark:border-slate-800 transition-transform duration-200 group-hover:scale-105 relative z-10`}>
                  <Icon size={14} />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: HIERARCHICAL TREE DIRECTORY */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/85">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree className="text-orange-500" size={14} />
              <span>Taxonomy Directory</span>
            </h2>
            <span className="text-[9px] font-extrabold bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-slate-800/30">
              {categories.length} Categories
            </span>
          </div>

          <div className="overflow-y-auto max-h-[680px] pr-1 space-y-1 custom-scrollbar">
            {categories.length === 0 ? (
              <div className="border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl py-12 text-center space-y-2">
                <FolderMinus className="mx-auto text-slate-300 dark:text-slate-700" size={36} />
                <p className="text-xs font-bold text-slate-800 dark:text-white">No categories found</p>
                <p className="text-[10px] text-slate-400 max-w-[160px] mx-auto leading-relaxed">Create a taxonomy node using the Add button.</p>
              </div>
            ) : (
              renderCategoryTree(null, 0)
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WORKSPACE FOR SELECTED CATEGORY */}
        <div className="lg:col-span-2 space-y-6">
          
          {selectedCategory ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
              
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/85">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Active Workspace</span>
                    <span className={`h-1.5 w-1.5 rounded-full animate-ping ${selectedCategory.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-1">{selectedCategory.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAITemplateFill}
                    disabled={aiTemplateLoading}
                    className="px-3.5 py-2 text-xs font-black uppercase tracking-wider bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md shadow-orange-500/10 transition flex items-center gap-1.5 cursor-pointer border-none"
                  >
                    <Sparkles size={13} className={aiTemplateLoading ? "animate-spin" : ""} />
                    <span>{aiTemplateLoading ? "AI Designing..." : "AI Generate Blueprint"}</span>
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-slate-100 dark:border-slate-800/60 overflow-x-auto gap-4 scrollbar-none">
                {tabs.map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = panelTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPanelTab(tab.id)}
                      className={`flex items-center gap-1.5 pb-3 text-xs font-bold uppercase tracking-wider transition-all relative border-b-2 bg-transparent -mb-[2px] cursor-pointer border-none px-1 py-0.5 ${ isActive ? "border-orange-500 text-orange-500 font-black" : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" }`}
                    >
                      <IconComp size={13} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Settings Form */}
              {panelTab === "settings" && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Category Name *</label>
                      <button
                        type="button"
                        onClick={handleAIFill}
                        disabled={aiLoading || !name.trim()}
                        className="text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-500 dark:text-orange-400 hover:bg-orange-500/15 disabled:opacity-50 border border-orange-500/20 px-2 py-0.5 rounded transition flex items-center gap-1 cursor-pointer select-none"
                      >
                        <Sparkles size={10} className={aiLoading ? "animate-spin" : ""} />
                        <span>{aiLoading ? "AI Structuring..." : "AI Auto-Fill"}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Mens Wear, Smartphones, Home Decor"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Parent Category</label>
                      <select
                        value={parentCategoryId}
                        onChange={(e) => setParentCategoryId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:border-blue-500"
                      >
                        <option value="">None (Top-Level Category)</option>
                        {categories
                          .filter(c => c._id !== editingId)
                          .map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Icon Class/Identifier</label>
                      <input
                        type="text"
                        placeholder="e.g. laptop, shirt, smartphone"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Category Description</label>
                    <textarea
                      placeholder="Write a clear taxonomy guideline summary..."
                      value={description}
                      rows={3}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition resize-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Category Banner Image URL</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/example-banner-url"
                      value={bannerImage}
                      onChange={(e) => setBannerImage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:border-blue-500"
                    />
                  </div>

                  {/* SEO Metadata Card */}
                  <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50/40 dark:bg-slate-950/20 space-y-4">
                    <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block">SEO Search Metadata</span>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">SEO Title Meta</label>
                      <input
                        type="text"
                        placeholder="e.g. Shop Premium Watches & Accessories Online"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">SEO Keywords (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. watches, luxury watch, buy designer watch"
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">SEO Description Meta</label>
                      <textarea
                        placeholder="Provide search engine summary snippet..."
                        value={seoDescription}
                        rows={2}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none resize-none transition focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Featured Frontpage</span>
                      <button
                        type="button"
                        onClick={() => setIsFeatured(!isFeatured)}
                        className="text-slate-500 hover:text-slate-800 transition bg-transparent border-none cursor-pointer"
                      >
                        {isFeatured ? <ToggleRight className="text-orange-500" size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Status Active</span>
                      <button
                        type="button"
                        onClick={() => setStatus(status === "active" ? "disabled" : "active")}
                        className="text-slate-500 hover:text-slate-800 transition bg-transparent border-none cursor-pointer"
                      >
                        {status === "active" ? <ToggleRight className="text-orange-500" size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer border-none"
                    >
                      {loading ? "Saving..." : editingId ? "Save Category Changes" : "Create Category"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className="px-4.5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border-none"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Tab 2: Dynamic Attributes Builder */}
              {panelTab === "attributes" && (
                <div className="space-y-6">
                  
                  {/* Add / Edit Attribute Form */}
                  <form onSubmit={handleAddOrUpdateField} className="bg-slate-50/40 dark:bg-slate-950/15 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-4">
                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                      <PlusCircle size={14} className="text-orange-500" />
                      <span>{editingFieldId ? "Modify Attribute field" : "Define Custom Product Attribute"}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Database field Key *</label>
                        <input
                          type="text"
                          placeholder="e.g. screenResolution, materialType"
                          value={newField.fieldName}
                          onChange={(e) => setNewField({ ...newField, fieldName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Visual Label Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Screen Resolution, Material Type"
                          value={newField.label}
                          onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Field Input Type</label>
                        <select
                          value={newField.fieldType}
                          onChange={(e) => setNewField({ ...newField, fieldType: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none focus:border-blue-500"
                        >
                          {fieldTypes.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Placeholder Text</label>
                        <input
                          type="text"
                          placeholder="Short input cue..."
                          value={newField.placeholder}
                          onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Options (visible only if type has lists) */}
                    {(newField.fieldType === "Dropdown" || newField.fieldType === "Multi Select" || newField.fieldType === "Radio Button" || newField.fieldType === "Tags Input") && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Selectable Options (comma separated)</label>
                        <input
                          type="text"
                          placeholder="Option A, Option B, Option C"
                          value={newField.selectOptions}
                          onChange={(e) => setNewField({ ...newField, selectOptions: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl bg-white dark:bg-slate-950">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Required</span>
                        <input
                          type="checkbox"
                          checked={newField.isRequired}
                          onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })}
                          className="h-4.5 w-4.5 rounded text-orange-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl bg-white dark:bg-slate-950">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Searchable</span>
                        <input
                          type="checkbox"
                          checked={newField.isSearchable}
                          onChange={(e) => setNewField({ ...newField, isSearchable: e.target.checked })}
                          className="h-4.5 w-4.5 rounded text-orange-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl bg-white dark:bg-slate-950">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Filterable</span>
                        <input
                          type="checkbox"
                          checked={newField.isFilterable}
                          onChange={(e) => setNewField({ ...newField, isFilterable: e.target.checked })}
                          className="h-4.5 w-4.5 rounded text-orange-500"
                        />
                      </div>

                      <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl bg-white dark:bg-slate-950">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Sortable</span>
                        <input
                          type="checkbox"
                          checked={newField.isSortable}
                          onChange={(e) => setNewField({ ...newField, isSortable: e.target.checked })}
                          className="h-4.5 w-4.5 rounded text-orange-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-850">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 dark:bg-slate-850 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
                      >
                        <Check size={13} />
                        <span>{editingFieldId ? "Update Attribute" : "Add Attribute"}</span>
                      </button>
                      
                      {(editingFieldId || newField.fieldName) && (
                        <button
                          type="button"
                          onClick={resetAttributeForm}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 text-xs font-bold rounded-xl transition cursor-pointer border-none"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Attributes List Table */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Active Schema Attributes</span>
                    
                    {templateFields.length === 0 ? (
                      <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-8 text-center text-slate-400 space-y-1">
                        <SlidersHorizontal size={24} className="mx-auto" />
                        <p className="text-xs font-bold">No dynamic fields defined</p>
                        <p className="text-[10px] text-slate-500">Products in this category will use default catalog schemas.</p>
                      </div>
                    ) : (
                      <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-950">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                                <th className="p-3 pl-4">Key / Label</th>
                                <th className="p-3">Input Type</th>
                                <th className="p-3 text-center">Required</th>
                                <th className="p-3 text-center">Indexes</th>
                                <th className="p-3 text-right pr-4">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {templateFields
                                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                                .map((field, idx) => (
                                  <tr key={field._id} className="border-b border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                                    <td className="p-3 pl-4">
                                      <div className="font-bold text-slate-900 dark:text-white leading-normal">{field.label}</div>
                                      <div className="font-mono text-[9px] text-slate-400 mt-0.5">{field.fieldName}</div>
                                    </td>
                                    <td className="p-3 text-slate-500 dark:text-slate-400 font-medium">{field.fieldType}</td>
                                    <td className="p-3 text-center">
                                      <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] border ${field.isRequired ? "bg-red-50 text-red-650 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-800"}`}>
                                        {field.isRequired ? "Yes" : "No"}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center font-medium">
                                      <div className="flex gap-1 justify-center flex-wrap">
                                        {field.isSearchable && <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-550/10 dark:text-blue-400 dark:border-blue-500/25">Search</span>}
                                        {field.isFilterable && <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-550/10 dark:text-indigo-400 dark:border-indigo-500/25">Filter</span>}
                                        {field.isSortable && <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-teal-50 text-teal-600 border border-teal-100 dark:bg-teal-550/10 dark:text-teal-400 dark:border-teal-500/25">Sort</span>}
                                      </div>
                                    </td>
                                    <td className="p-3 text-right pr-4">
                                      <div className="flex items-center gap-1 justify-end">
                                        <button
                                          onClick={() => moveField(idx, -1)}
                                          disabled={idx === 0}
                                          className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-20 cursor-pointer border-none bg-transparent"
                                        >
                                          <ArrowUp size={11} />
                                        </button>
                                        <button
                                          onClick={() => moveField(idx, 1)}
                                          disabled={idx === templateFields.length - 1}
                                          className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-20 cursor-pointer border-none bg-transparent"
                                        >
                                          <ArrowDown size={11} />
                                        </button>
                                        <button
                                          onClick={() => handleEditField(field)}
                                          className="p-1 rounded text-slate-400 hover:text-orange-500 cursor-pointer border-none bg-transparent"
                                        >
                                          <Edit3 size={11} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteField(field._id)}
                                          className="p-1 rounded text-slate-400 hover:text-red-500 cursor-pointer border-none bg-transparent"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Submission Rules Settings */}
              {panelTab === "rules" && (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Minimum Product Images</label>
                      <input
                        type="number"
                        min="0"
                        value={catSettings.minImages}
                        onChange={(e) => setCatSettings({ ...catSettings, minImages: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Maximum Product Images</label>
                      <input
                        type="number"
                        min="0"
                        value={catSettings.maxImages}
                        onChange={(e) => setCatSettings({ ...catSettings, maxImages: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none transition focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Supervised Content Moderation</span>
                        <p className="text-[9px] text-slate-400">Product listings under this category must be checked by moderators before publishing.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCatSettings({ ...catSettings, requiresApproval: !catSettings.requiresApproval })}
                        className="text-slate-500 hover:text-slate-800 transition bg-transparent border-none cursor-pointer"
                      >
                        {catSettings.requiresApproval ? <ToggleRight className="text-orange-500" size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Real-time Stock Inventory Tracking</span>
                        <p className="text-[9px] text-slate-400">Enable automated tracking of stock status, low inventory alerts, and dispatch reports.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCatSettings({ ...catSettings, inventoryTrackingEnabled: !catSettings.inventoryTrackingEnabled })}
                        className="text-slate-500 hover:text-slate-800 transition bg-transparent border-none cursor-pointer"
                      >
                        {catSettings.inventoryTrackingEnabled ? <ToggleRight className="text-orange-500" size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Mandatory SKU Identifiers</span>
                        <p className="text-[9px] text-slate-400">Require sellers to input unique SKU tags when uploading listings.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCatSettings({ ...catSettings, skuRequired: !catSettings.skuRequired })}
                        className="text-slate-500 hover:text-slate-800 transition bg-transparent border-none cursor-pointer"
                      >
                        {catSettings.skuRequired ? <ToggleRight className="text-orange-500" size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Platform Barcode Constraints</span>
                        <p className="text-[9px] text-slate-400">Require UPC, EAN, or ISBN barcode details when adding products.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCatSettings({ ...catSettings, barcodeRequired: !catSettings.barcodeRequired })}
                        className="text-slate-500 hover:text-slate-800 transition bg-transparent border-none cursor-pointer"
                      >
                        {catSettings.barcodeRequired ? <ToggleRight className="text-orange-500" size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 dark:bg-slate-850 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer border-none"
                  >
                    Save Category Submission Settings
                  </button>
                </form>
              )}

              {/* Tab 4: Live Seller Form Preview */}
              {panelTab === "preview" && (
                <div className="space-y-6">
                  <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50/30 dark:bg-slate-950/20 space-y-1">
                    <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Interactive Sandbox Preview</span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">This simulates the category-specific dynamic form interface seen by sellers during catalog uploading.</p>
                  </div>

                  <div className="space-y-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-white dark:bg-slate-950">
                    <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                      <PlusCircle size={14} className="text-slate-400" />
                      <span>Listing Attributes: {selectedCategory.name}</span>
                    </h5>

                    {templateFields.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs italic">
                        No custom fields configured for this category. Standard fields only.
                      </div>
                    ) : (
                      <div className="space-y-4 text-xs">
                        {templateFields
                          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                          .map((field) => (
                            <div key={field._id} className="space-y-1 text-left">
                              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-350">
                                {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                              </label>
                              
                              {/* Render Simulated Elements depending on type */}
                              {field.fieldType === "Text" || field.fieldType === "Email" || field.fieldType === "URL" || field.fieldType === "Phone" ? (
                                <input
                                  type="text"
                                  placeholder={field.placeholder || `Enter ${field.label}...`}
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none"
                                />
                              ) : field.fieldType === "Text Area" || field.fieldType === "Rich Text Editor" ? (
                                <textarea
                                  placeholder={field.placeholder || `Write ${field.label}...`}
                                  rows={3}
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none resize-none"
                                />
                              ) : field.fieldType === "Number" || field.fieldType === "Decimal" ? (
                                <input
                                  type="number"
                                  placeholder={field.placeholder || "0"}
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none"
                                />
                              ) : field.fieldType === "Dropdown" ? (
                                <select className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none">
                                  <option value="">-- Choose Option --</option>
                                  {field.selectOptions?.map(o => (
                                    <option key={o} value={o}>{o}</option>
                                  ))}
                                </select>
                              ) : field.fieldType === "Checkbox" ? (
                                <div className="flex items-center gap-2 pt-1">
                                  <input type="checkbox" className="h-4.5 w-4.5 rounded text-orange-500" />
                                  <span className="text-slate-600 dark:text-slate-400 font-medium">Enable this option</span>
                                </div>
                              ) : field.fieldType === "Multi Select" ? (
                                <div className="space-y-1.5 pt-1 pl-1">
                                  {field.selectOptions?.map(o => (
                                    <div key={o} className="flex items-center gap-2">
                                      <input type="checkbox" className="h-4.5 w-4.5 rounded text-orange-500" />
                                      <span className="text-slate-650 dark:text-slate-450 font-medium">{o}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : field.fieldType === "Radio Button" ? (
                                <div className="space-y-1.5 pt-1 pl-1">
                                  {field.selectOptions?.map(o => (
                                    <div key={o} className="flex items-center gap-2">
                                      <input type="radio" name={field.fieldName} className="h-4.5 w-4.5 text-orange-500" />
                                      <span className="text-slate-650 dark:text-slate-450 font-medium">{o}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : field.fieldType === "Date" || field.fieldType === "Time" || field.fieldType === "Datetime" ? (
                                <input
                                  type={field.fieldType === "Date" ? "date" : field.fieldType === "Time" ? "time" : "datetime-local"}
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950 text-slate-800 dark:text-white text-xs outline-none"
                                />
                              ) : field.fieldType === "Color Picker" ? (
                                <div className="flex items-center gap-2">
                                  <input type="color" className="h-8 w-12 border-none rounded cursor-pointer" />
                                  <span className="text-slate-500 font-medium">Select dynamic color value</span>
                                </div>
                              ) : field.fieldType.includes("Upload") ? (
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-6 px-4 text-center hover:bg-slate-50/30 dark:hover:bg-slate-950/20 transition cursor-pointer">
                                  <SlidersHorizontal size={20} className="mx-auto text-slate-400 mb-1" />
                                  <span className="text-[10px] font-bold text-slate-500 block">Drag & drop files or click to upload</span>
                                  {field.validationRules?.maxFileSizeMB && <span className="text-[8px] text-slate-400 block mt-0.5">Max allowed size: {field.validationRules.maxFileSizeMB} MB</span>}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  placeholder={field.placeholder || `Enter ${field.label}...`}
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950 text-slate-850 dark:text-white text-xs outline-none"
                                />
                              )}

                              {field.description && (
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-normal">{field.description}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-12 text-center shadow-sm space-y-4">
              <div className="h-16 w-16 bg-orange-500/5 text-orange-500 border border-orange-500/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Sliders size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">No Category Selected</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                  Select a category node from the taxonomy directory sidebar to view settings, customize attributes, or manage rules.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Categories;

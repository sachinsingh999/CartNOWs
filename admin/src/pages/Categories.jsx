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
  Info,
  Archive,
  RotateCcw,
  Sparkles,
  BarChart2,
  Lock
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
  const [panelTab, setPanelTab] = useState("settings"); // "settings", "attributes", "preview_form", "preview_filters"

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
        selectOptions: newField.selectOptions,
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
      <div className={`space-y-1.5 ${level > 0 ? "pl-5 border-l border-slate-100 mt-1" : ""}`}>
        {list.map((cat, index) => {
          const isSelected = selectedCategory?._id === cat._id;
          return (
            <div key={cat._id} className="space-y-1">
              <div 
                onClick={() => handleSelectCategory(cat)}
                className={`py-2 px-3 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition ${
                  isSelected ? "bg-orange-500 text-white shadow-md shadow-orange-500/10" : "hover:bg-slate-50 text-slate-700 bg-white border border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FolderTree size={14} className={isSelected ? "text-white" : "text-slate-400"} />
                  <span className="text-xs font-bold truncate">{cat.name}</span>
                  {cat.isFeatured && (
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${
                      isSelected ? "bg-white text-orange-500" : "bg-orange-100 text-orange-600"
                    }`}>
                      Featured
                    </span>
                  )}
                   {cat.status === "disabled" && (
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-400">
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
                      className="p-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white transition flex items-center justify-center cursor-pointer"
                    >
                      <Check size={11} className="stroke-[3]" />
                    </button>
                  )}
                  <button
                    onClick={() => moveCategory(categories.indexOf(cat), -1)}
                    disabled={index === 0}
                    className={`p-1 rounded hover:bg-slate-100 ${isSelected ? "text-orange-200 hover:text-white" : "text-slate-400 hover:text-slate-800"} disabled:opacity-20`}
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button
                    onClick={() => moveCategory(categories.indexOf(cat), 1)}
                    disabled={index === list.length - 1}
                    className={`p-1 rounded hover:bg-slate-100 ${isSelected ? "text-orange-200 hover:text-white" : "text-slate-400 hover:text-slate-800"} disabled:opacity-20`}
                  >
                    <ArrowDown size={11} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(cat._id)}
                    title="Clone Category"
                    className={`p-1 rounded hover:bg-slate-100 ${isSelected ? "text-orange-200 hover:text-white" : "text-slate-400 hover:text-slate-850"}`}
                  >
                    <Copy size={11} />
                  </button>
                  <button
                    onClick={() => handleEdit(cat)}
                    className={`p-1 rounded hover:bg-slate-100 ${isSelected ? "text-orange-200 hover:text-white" : "text-slate-450 hover:text-slate-850"}`}
                  >
                    <Edit3 size={11} />
                  </button>
                  {cat.status === "archived" ? (
                    <button
                      onClick={() => handleRestore(cat._id)}
                      title="Restore from archive"
                      className={`p-1 rounded hover:bg-emerald-50 ${isSelected ? "text-white" : "text-emerald-500"}`}
                    >
                      <RotateCcw size={11} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleArchive(cat._id)}
                      title="Archive Category"
                      className={`p-1 rounded hover:bg-amber-50 ${isSelected ? "text-white" : "text-amber-500"}`}
                    >
                      <Archive size={11} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className={`p-1 rounded hover:bg-red-50 ${isSelected ? "text-red-200 hover:text-white" : "text-red-400 hover:text-red-500"}`}
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

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Category Architect</h1>
            <p className="text-xs text-slate-400">Build parent/sub taxonomies, dynamic seller forms, custom validation rules, and filter presets.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewArchived(!viewArchived)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewArchived ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
            }`}
          >
            <Archive size={13} />
            <span>{viewArchived ? "Hide Archived" : "Show Archived"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CATEGORY FORM BUILDER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
            <Sparkles size={14} className="text-orange-500" />
            <span>{editingId ? "Edit Category Details" : "Create Product Taxonomy"}</span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Name *</label>
                <button
                  type="button"
                  onClick={handleAIFill}
                  disabled={aiLoading || !name.trim()}
                  className="text-[9px] font-black uppercase tracking-wider bg-orange-50 text-[#FF5100] hover:bg-orange-100 disabled:opacity-50 border border-orange-100 px-2 py-0.5 rounded transition flex items-center gap-1 cursor-pointer select-none"
                >
                  <Sparkles size={10} className={aiLoading ? "animate-spin" : ""} />
                  <span>{aiLoading ? "AI Filling..." : "AI Auto-Fill"}</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. Electronics, Laptops, Keyboards"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parent Category</label>
                <select
                  value={parentCategoryId}
                  onChange={(e) => setParentCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500 bg-white"
                >
                  <option value="">None (Top-Level)</option>
                  {categories
                    .filter(c => c._id !== editingId)
                    .map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Display Order</label>
                <input
                  type="number"
                  placeholder="0"
                  value={parentCategoryId ? "" : undefined}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
              <textarea
                placeholder="Short taxonomy summary..."
                value={description}
                rows={2}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Icon Class/Name</label>
                <input
                  type="text"
                  placeholder="e.g. laptop, smartphone"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Banner Image URL</label>
                <input
                  type="text"
                  placeholder="URL link"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* SEO SECTION */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">SEO Metadata Optimizer</span>
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">SEO Meta Title</label>
                <input
                  type="text"
                  placeholder="e.g. Shop Premium Laptops Online"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">SEO Keywords (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. laptop, macbook, electronics"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">SEO Meta Description</label>
                <textarea
                  placeholder="Meta description for search indexes..."
                  value={seoDescription}
                  rows={2}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
                <span className="text-xs font-bold text-slate-700">Featured</span>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className="text-slate-500 hover:text-slate-800 transition"
                >
                  {isFeatured ? <ToggleRight className="text-orange-500" size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>

              <div className="flex items-center justify-between border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
                <span className="text-xs font-bold text-slate-700">Active</span>
                <button
                  type="button"
                  onClick={() => setStatus(status === "active" ? "disabled" : "active")}
                  className="text-slate-500 hover:text-slate-800 transition"
                >
                  {status === "active" ? <ToggleRight className="text-orange-500" size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md hover:shadow-orange-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-center"
              >
                {loading ? "Saving..." : editingId ? "Save Changes" : "Create Category"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="px-4 py-3 bg-slate-100 text-slate-650 font-bold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* HIERARCHICAL TREE VIEW */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-850 tracking-tight">Interactive Taxonomy Tree</h2>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {categories.length} Categories
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[650px] pr-1 space-y-2">
            {categories.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center space-y-2">
                <FolderMinus className="mx-auto text-slate-350" size={40} />
                <p className="text-xs font-bold text-slate-800">No categories found</p>
                <p className="text-[11px] text-slate-400">Initialize your taxonomy system by creating a category.</p>
              </div>
            ) : (
              renderCategoryTree(null, 0)
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Categories;

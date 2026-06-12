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
                </div>

                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
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

      {/* METADATA SCHEMAS AND ATTRIBUTES CONFIGURATION */}
      {selectedCategory && (
        <div className="border border-slate-200 rounded-3xl bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <Settings className="text-orange-500" size={18} />
              <h2 className="text-sm font-black text-slate-800 tracking-tight">
                Taxonomy Blueprint: <span className="text-orange-500">{selectedCategory.name}</span>
              </h2>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/50">
              {[
                { id: "settings", label: "Global Settings" },
                { id: "attributes", label: "Custom Attributes" },
                { id: "preview_form", label: "Seller Form Preview" },
                { id: "preview_filters", label: "Search Filters Preview" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPanelTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    panelTab === tab.id
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200/20"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: CATEGORY GLOBAL SETTINGS */}
          {panelTab === "settings" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Media & Verification Rules</h3>
                
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Min Images</label>
                      <input
                        type="number"
                        value={catSettings.minImages}
                        onChange={(e) => setCatSettings({...catSettings, minImages: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-850 text-xs outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Max Images</label>
                      <input
                        type="number"
                        value={catSettings.maxImages}
                        onChange={(e) => setCatSettings({...catSettings, maxImages: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-850 text-xs outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Require Admin Approval</span>
                        <span className="text-[10px] text-slate-450">Submitted listings remain hidden until moderation is complete.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCatSettings({...catSettings, requiresApproval: !catSettings.requiresApproval})}
                        className="text-slate-500 hover:text-slate-850 transition"
                      >
                        {catSettings.requiresApproval ? <ToggleRight className="text-orange-500" size={26} /> : <ToggleLeft size={26} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Inventory Tracking</span>
                        <span className="text-[10px] text-slate-450">Decrement inventory counts on successful user checkouts.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCatSettings({...catSettings, inventoryTrackingEnabled: !catSettings.inventoryTrackingEnabled})}
                        className="text-slate-500 hover:text-slate-850 transition"
                      >
                        {catSettings.inventoryTrackingEnabled ? <ToggleRight className="text-orange-500" size={26} /> : <ToggleLeft size={26} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Require Stock Keeping Unit (SKU)</span>
                        <span className="text-[10px] text-slate-455">Listing publishes are blocked if SKU code is blank.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCatSettings({...catSettings, skuRequired: !catSettings.skuRequired})}
                        className="text-slate-500 hover:text-slate-850 transition"
                      >
                        {catSettings.skuRequired ? <ToggleRight className="text-orange-500" size={26} /> : <ToggleLeft size={26} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Require UPC Barcode</span>
                        <span className="text-[10px] text-slate-450">Validate UPC / EAN values prior to catalog saves.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCatSettings({...catSettings, barcodeRequired: !catSettings.barcodeRequired})}
                        className="text-slate-500 hover:text-slate-850 transition"
                      >
                        {catSettings.barcodeRequired ? <ToggleRight className="text-orange-500" size={26} /> : <ToggleLeft size={26} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-850 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ShieldCheck size={14} />
                    <span>Save Global Rules</span>
                  </button>
                </form>
              </div>

              {/* Statistics & Info cards */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4 h-fit">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <BarChart2 size={13} className="text-indigo-650" />
                  <span>Category Usage Analytics</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white p-3 border border-slate-150 rounded-xl">
                    <span className="text-lg font-black text-slate-900 block">{templateFields.length}</span>
                    <span className="text-[9px] font-bold text-slate-450 uppercase">Attributes defined</span>
                  </div>
                  <div className="bg-white p-3 border border-slate-150 rounded-xl">
                    <span className="text-lg font-black text-slate-900 block">12k+</span>
                    <span className="text-[9px] font-bold text-slate-455 uppercase">Total Listings</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-2 leading-relaxed border-t border-slate-200/50 pt-3.5">
                  <p className="flex items-start gap-1.5">
                    <Info size={12} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span>Adding custom fields on the next tab will generate matching fields for sellers dynamically.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <Lock size={12} className="text-orange-500 shrink-0 mt-0.5" />
                    <span>Role-based visibility presets block specific fields from guest views or basic sellers.</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM CATEGORY ATTRIBUTES */}
          {panelTab === "attributes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* LIST OF ATTRIBUTES */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Defined Attribute Schema</h3>
                  <button
                    onClick={handleAITemplateFill}
                    disabled={aiTemplateLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-750 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-sm hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles size={11} className={aiTemplateLoading ? "animate-spin" : ""} />
                    {aiTemplateLoading ? "Generating Blueprint..." : "AI Generate Blueprint"}
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {templateFields.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-400 text-xs italic">
                      No attributes defined yet. Create attributes to collect detailed product specifications.
                    </div>
                  ) : (
                    templateFields.map((field, idx) => (
                      <div key={field._id} className="flex items-center justify-between p-3 border border-slate-150 rounded-xl bg-slate-50 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{field.label || field.fieldName}</span>
                            <span className="text-[9px] font-bold bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-500">
                              {field.fieldType}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Key: <code className="font-mono">{field.fieldName}</code>
                            {field.isRequired && <strong className="text-red-500 ml-1.5">* Required</strong>}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => moveField(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-slate-200 text-slate-400 disabled:opacity-20"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            onClick={() => moveField(idx, 1)}
                            disabled={idx === templateFields.length - 1}
                            className="p-1 rounded hover:bg-slate-200 text-slate-400 disabled:opacity-20"
                          >
                            <ArrowDown size={11} />
                          </button>
                          <button
                            onClick={() => handleEditField(field)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteField(field._id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ATTRIBUTE CREATION & VALIDATION FORM */}
              <div className="border border-slate-200/80 rounded-2xl p-5 bg-white space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1">
                  <PlusCircle size={13} className="text-orange-500" />
                  <span>{editingFieldId ? "Modify Attribute Parameters" : "Define New Category Attribute"}</span>
                </h4>

                <form onSubmit={handleAddOrUpdateField} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-450 uppercase block">Field Name (DB key) *</label>
                      <input
                        type="text"
                        placeholder="e.g. storage_size, is_waterproof"
                        value={newField.fieldName}
                        onChange={(e) => setNewField({...newField, fieldName: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-850 text-xs outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-450 uppercase block">Label (UI Display) *</label>
                      <input
                        type="text"
                        placeholder="e.g. Storage Size, Waterproof"
                        value={newField.label}
                        onChange={(e) => setNewField({...newField, label: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-855 text-xs outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-450 uppercase block">Field Type</label>
                      <select
                        value={newField.fieldType}
                        onChange={(e) => setNewField({...newField, fieldType: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500 bg-white"
                      >
                        {fieldTypes.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-455 uppercase block">Default Value</label>
                      <input
                        type="text"
                        placeholder="e.g. 16GB, false"
                        value={newField.defaultValue}
                        onChange={(e) => setNewField({...newField, defaultValue: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {["Dropdown", "Multi Select", "Radio Button", "Checkbox"].includes(newField.fieldType) && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-450 uppercase block">Dynamic Options (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. S, M, L, XL or 8GB, 16GB, 32GB"
                        value={newField.selectOptions}
                        onChange={(e) => setNewField({...newField, selectOptions: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-450 uppercase block">Placeholder Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Select storage capacity"
                        value={newField.placeholder}
                        onChange={(e) => setNewField({...newField, placeholder: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-450 uppercase block">Help Text tooltip</label>
                      <input
                        type="text"
                        placeholder="e.g. Select sizes matching fit guides"
                        value={newField.helpText}
                        onChange={(e) => setNewField({...newField, helpText: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* ADVANCED RULES ACCORDION */}
                  <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-3">
                    <span className="text-[9px] font-black uppercase text-indigo-650 tracking-wider block">Validation & Constraints Builder</span>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-bold text-slate-450 block uppercase">Min Length</label>
                        <input
                          type="number"
                          value={newField.minLength}
                          onChange={(e) => setNewField({...newField, minLength: e.target.value})}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-bold text-slate-450 block uppercase">Max Length</label>
                        <input
                          type="number"
                          value={newField.maxLength}
                          onChange={(e) => setNewField({...newField, maxLength: e.target.value})}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-bold text-slate-450 block uppercase">Min Value</label>
                        <input
                          type="number"
                          value={newField.minVal}
                          onChange={(e) => setNewField({...newField, minVal: e.target.value})}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-bold text-slate-450 block uppercase">Max Value</label>
                        <input
                          type="number"
                          value={newField.maxVal}
                          onChange={(e) => setNewField({...newField, maxVal: e.target.value})}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-bold text-slate-455 block uppercase">Regex Pattern (JS format)</label>
                        <input
                          type="text"
                          placeholder="e.g. ^[0-9]{5}$"
                          value={newField.regexPattern}
                          onChange={(e) => setNewField({...newField, regexPattern: e.target.value})}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* VISIBILITY & SEARCH RULES */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <label className="flex flex-col items-center gap-1 border border-slate-100 p-2 rounded-xl bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newField.isRequired}
                        onChange={(e) => setNewField({...newField, isRequired: e.target.checked})}
                        className="rounded text-orange-500"
                      />
                      <span className="text-[8px] font-bold uppercase text-slate-500">Required</span>
                    </label>

                    <label className="flex flex-col items-center gap-1 border border-slate-100 p-2 rounded-xl bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newField.isSearchable}
                        onChange={(e) => setNewField({...newField, isSearchable: e.target.checked})}
                        className="rounded text-orange-500"
                      />
                      <span className="text-[8px] font-bold uppercase text-slate-500">Searchable</span>
                    </label>

                    <label className="flex flex-col items-center gap-1 border border-slate-100 p-2 rounded-xl bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newField.isFilterable}
                        onChange={(e) => setNewField({...newField, isFilterable: e.target.checked})}
                        className="rounded text-orange-500"
                      />
                      <span className="text-[8px] font-bold uppercase text-slate-500">Filterable</span>
                    </label>

                    <label className="flex flex-col items-center gap-1 border border-slate-100 p-2 rounded-xl bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newField.isSortable}
                        onChange={(e) => setNewField({...newField, isSortable: e.target.checked})}
                        className="rounded text-orange-500"
                      />
                      <span className="text-[8px] font-bold uppercase text-slate-500">Sortable</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-650 transition active:scale-98 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus size={14} />
                      <span>{editingFieldId ? "Update Attribute Parameters" : "Add custom attribute"}</span>
                    </button>
                    {editingFieldId && (
                      <button
                        type="button"
                        onClick={resetAttributeForm}
                        className="px-3 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: SELLER FORM PREVIEW */}
          {panelTab === "preview_form" && (
            <div className="border border-slate-250 border-dashed rounded-3xl p-6 bg-slate-50/50 max-w-xl">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-450 block mb-4 flex items-center gap-1">
                <Eye size={12} className="text-orange-500" />
                <span>Live Seller Form Preview (Category: {selectedCategory.name})</span>
              </span>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">Product Name *</label>
                  <input type="text" placeholder="e.g. iPhone 15 Pro" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white disabled:opacity-50" disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">Price (₹) *</label>
                    <input type="number" placeholder="0.00" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white disabled:opacity-50" disabled />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">Stock Count</label>
                    <input type="number" placeholder="10" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white disabled:opacity-50" disabled />
                  </div>
                </div>

                {/* DYNAMIC FIELDS FORM IN PREVIEW */}
                <div className="border-t border-slate-200/60 pt-4 space-y-4">
                  <span className="text-[10px] font-extrabold text-indigo-650 uppercase tracking-wider block">Category Dynamic Inputs</span>
                  
                  {templateFields.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No custom attributes defined. Add fields on the "Custom Attributes" tab.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {templateFields.map(field => {
                        const selectOptsList = field.selectOptions || [];
                        return (
                          <div key={field._id} className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-600 block">
                              {field.label || field.fieldName} {field.isRequired && <span className="text-red-500">*</span>}
                            </label>
                            
                            {["Dropdown"].includes(field.fieldType) && (
                              <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none">
                                <option value="">Select option</option>
                                {selectOptsList.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            )}

                            {["Radio Button"].includes(field.fieldType) && (
                              <div className="flex flex-wrap gap-3 py-1">
                                {selectOptsList.map(o => (
                                  <label key={o} className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold">
                                    <input type="radio" name={field._id} className="text-orange-500" />
                                    <span>{o}</span>
                                  </label>
                                ))}
                              </div>
                            )}

                            {["Multi Select"].includes(field.fieldType) && (
                              <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-xl bg-white">
                                {selectOptsList.map(o => (
                                  <span key={o} className="px-2 py-0.5 rounded-full border border-slate-200 text-[10px] text-slate-650 font-bold bg-slate-50 flex items-center gap-1">
                                    <input type="checkbox" className="rounded text-orange-500" />
                                    <span>{o}</span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {["Checkbox"].includes(field.fieldType) && (
                              <label className="flex items-center gap-2 text-xs font-semibold text-slate-650 cursor-pointer pt-1">
                                <input type="checkbox" className="rounded text-orange-500" />
                                <span>{field.label || field.fieldName}</span>
                              </label>
                            )}

                            {["Color Picker"].includes(field.fieldType) && (
                              <div className="flex items-center gap-2">
                                <input type="color" defaultValue={field.defaultValue || "#ff0000"} className="w-8 h-8 rounded border border-slate-200 cursor-pointer" />
                                <span className="text-[10px] font-mono text-slate-400">#ff0000</span>
                              </div>
                            )}

                            {!["Dropdown", "Radio Button", "Multi Select", "Checkbox", "Color Picker"].includes(field.fieldType) && (
                              <input
                                type={field.fieldType === "Number" || field.fieldType === "Decimal" ? "number" : "text"}
                                placeholder={field.placeholder || `Enter ${field.label || field.fieldName}...`}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                              />
                            )}

                            {field.helpText && (
                              <span className="text-[9px] text-slate-400 block">{field.helpText}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEARCH FILTERS PREVIEW */}
          {panelTab === "preview_filters" && (
            <div className="border border-slate-250 border-dashed rounded-3xl p-6 bg-slate-50/50 max-w-xs">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-450 block mb-4 flex items-center gap-1">
                <Eye size={12} className="text-orange-500" />
                <span>Live Buyer Filter Sidebar Preview</span>
              </span>

              <div className="space-y-4">
                <div className="border border-slate-200 bg-white rounded-2xl p-4 space-y-3 shadow-sm text-xs">
                  <span className="font-extrabold text-slate-900 tracking-tight block pb-2 border-b border-slate-100 text-sm">Filters</span>
                  
                  {/* Dynamic search filters based on filterable parameters */}
                  {templateFields.filter(f => f.isFilterable).length === 0 ? (
                    <p className="text-[11px] text-slate-450 italic">No attributes marked as filterable for this category.</p>
                  ) : (
                    templateFields.filter(f => f.isFilterable).map(field => {
                      const selectOptsList = field.selectOptions || [];
                      return (
                        <div key={field._id} className="space-y-1.5 pt-2 border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-800 uppercase text-[9px] tracking-wider block">{field.label || field.fieldName}</span>
                          
                          {["Dropdown", "Multi Select", "Radio Button"].includes(field.fieldType) && (
                            <div className="flex flex-wrap gap-1">
                              {selectOptsList.map(o => (
                                <button key={o} type="button" className="px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 transition">
                                  {o}
                                </button>
                              ))}
                            </div>
                          )}

                          {["Checkbox"].includes(field.fieldType) && (
                            <label className="flex items-center gap-1.5 text-[10px] text-slate-650 cursor-pointer">
                              <input type="checkbox" className="rounded text-orange-500" />
                              <span>Show only Waterproof</span>
                            </label>
                          )}

                          {!["Dropdown", "Multi Select", "Radio Button", "Checkbox"].includes(field.fieldType) && (
                            <input
                              type="text"
                              placeholder={`Filter by ${field.label || field.fieldName}`}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-[10px] outline-none"
                            />
                          )}
                        </div>
                      );
                    })
                  )}

                  <button type="button" className="w-full py-2 bg-indigo-650 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition">
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Categories;

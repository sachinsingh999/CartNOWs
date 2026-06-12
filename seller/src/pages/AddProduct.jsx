import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Upload, 
  ArrowLeft, 
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";

const AddProduct = ({ token, addProduct }) => {
  const [newProduct, setNewProduct] = useState({
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

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [templateFields, setTemplateFields] = useState([]);
  const [categorySettings, setCategorySettings] = useState(null);
  const [dynamicAttributes, setDynamicAttributes] = useState({});

  const [uploadedFiles, setUploadedFiles] = useState([]); 
  const [dragActive, setDragActive] = useState(false);

  const allowedFormats = ["jpg", "jpeg", "png", "webp"];
  const maxImageSizeMB = 5;

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

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [uploadedFiles]);

  const handleCategoryChange = async (catId) => {
    setSelectedCategoryId(catId);
    setTemplateFields([]);
    setCategorySettings(null);
    setDynamicAttributes({});

    const selectedCat = categories.find(c => c._id === catId);
    setNewProduct(prev => ({
      ...prev,
      category: selectedCat ? selectedCat.name : ""
    }));

    if (!catId) return;

    try {
      const response = await axios.get(`${backendUrl}/api/seller/category/${catId}/template`, {
        headers: { token }
      });
      if (response.data.success) {
        setTemplateFields(response.data.fields || []);
        setCategorySettings(response.data.settings || null);
      }
    } catch (err) {
      console.error("Failed to fetch category template:", err.message);
    }
  };

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
    const minLimit = categorySettings ? categorySettings.minImages : 3;
    const maxLimit = categorySettings ? categorySettings.maxImages : 10;

    if (uploadedFiles.length + filesList.length > maxLimit) {
      toast.warning(`Maximum ${maxLimit} images allowed for this category.`);
      return;
    }

    const validFiles = [];
    for (const file of filesList) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!allowedFormats.includes(ext)) {
        toast.error(`"${file.name}" is not a supported format (JPG, PNG, WEBP).`);
        continue;
      }

      if (file.size > maxImageSizeMB * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the ${maxImageSizeMB}MB file size limit.`);
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
        // Auto check the first item as cover if no cover is selected
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
      // If deleted item was cover, set the first element as cover
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

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      toast.error("Please select a category first.");
      return;
    }
    if (!newProduct.name || !newProduct.price) return;

    // Check dynamic attribute validations
    for (const field of templateFields) {
      if (field.isRequired) {
        const value = dynamicAttributes[field.fieldName];
        if (value === undefined || value === null || value === "") {
          toast.error(`"${field.fieldName}" is required.`);
          return;
        }
      }
    }
    
    const minLimit = categorySettings ? categorySettings.minImages : 3;
    if (uploadedFiles.length < minLimit) {
      toast.error(`At least ${minLimit} images are required for this category.`);
      return;
    }

    const coverIndex = uploadedFiles.findIndex(f => f.isCover);

    const success = await addProduct({
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
      images: uploadedFiles.map(f => f.file),
      coverIndex: coverIndex >= 0 ? coverIndex : 0,
      attributes: JSON.stringify(dynamicAttributes)
    });

    if (success) {
      setNewProduct({
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
      setSelectedCategoryId("");
      setTemplateFields([]);
      setCategorySettings(null);
      setDynamicAttributes({});
      setUploadedFiles([]);
    }
  };

  const shouldShowField = (field) => {
    if (!field.conditionalRules || !field.conditionalRules.dependsOn) return true;
    const dependencyVal = dynamicAttributes[field.conditionalRules.dependsOn];
    const expectedVal = field.conditionalRules.expectedValue;
    const isMatch = String(dependencyVal) === String(expectedVal);
    if (field.conditionalRules.action === "show") return isMatch;
    if (field.conditionalRules.action === "hide") return !isMatch;
    return true;
  };

  const renderDynamicField = (field) => {
    if (!shouldShowField(field)) return null;

    const value = dynamicAttributes[field.fieldName] !== undefined ? dynamicAttributes[field.fieldName] : "";
    
    const onChange = (val) => {
      setDynamicAttributes(prev => ({
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

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Add New Product</h2>
        <p className="text-xs text-slate-400 mt-0.5">Publish a product matching custom category templates.</p>
      </div>

      <form onSubmit={handleCreateProduct} className="space-y-5 max-w-xl">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Category</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 bg-white transition"
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {selectedCategoryId && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
              <input
                type="text"
                placeholder="Type here"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collection</label>
                <select
                  value={newProduct.collection}
                  onChange={(e) => setNewProduct({ ...newProduct, collection: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition bg-white"
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
                  placeholder="e.g. Shoes, Watch, Top"
                  value={newProduct.subCategory}
                  onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</label>
                <input
                  type="text"
                  placeholder="e.g. CAT-HD-001"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Stock</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Description</label>
              <textarea
                rows={3}
                placeholder="Describe features, size details, warranty, etc."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition resize-none"
              />
            </div>

            {/* Render Category Specific Dynamic Attributes */}
            {templateFields.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 uppercase tracking-wider">
                  <Layers size={13} />
                  <span>Category Specifications</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {templateFields.map((field) => (
                    <div key={field._id} className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {field.fieldName} {field.isRequired && <span className="text-red-500">*</span>}
                      </label>
                      {renderDynamicField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Category Settings Rule Summary */}
            {categorySettings && (
              <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 text-xs text-slate-500 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Sparkles size={13} className="text-orange-500" />
                  <span>Category System Rules</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>Minimum images required: <strong className="text-slate-800">{categorySettings.minImages}</strong></li>
                  <li>Maximum images allowed: <strong className="text-slate-800">{categorySettings.maxImages}</strong></li>
                  <li>Auto Approval: 
                    {categorySettings.autoApprove ? (
                      <span className="text-emerald-600 font-bold ml-1 inline-flex items-center gap-0.5"><CheckCircle size={10} /> Enabled (Instantly Published)</span>
                    ) : (
                      <span className="text-amber-600 font-bold ml-1 inline-flex items-center gap-0.5"><AlertCircle size={10} /> Pending Admin Moderation</span>
                    )}
                  </li>
                </ul>
              </div>
            )}

            {/* Image Gallery Upload Workflow */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Product Gallery Images</label>
              
              {/* Drag-and-drop workspace container */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
                  dragActive ? "border-orange-500 bg-orange-500/5" : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => document.getElementById("file-upload-input").click()}
              >
                <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <Upload size={18} />
                </div>
                <p className="text-xs font-bold text-slate-700">Drag & drop your images here</p>
                <p className="text-[10px] text-slate-400">or click to browse from files (JPG, PNG, WEBP)</p>
                <input
                  type="file"
                  id="file-upload-input"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Uploaded Gallery Grid */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3.5 pt-2">
                  {uploadedFiles.map((fileObj, idx) => (
                    <div key={idx} className="relative group border border-slate-200 rounded-xl overflow-hidden p-1.5 flex flex-col gap-1.5 shadow-sm bg-white">
                      <img
                        src={fileObj.preview}
                        alt="Preview"
                        className="w-full h-16 object-cover rounded-lg"
                      />
                      <div className="flex flex-col gap-1 text-[9px]">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCoverFile(idx)}
                            className={`px-1.5 py-0.5 rounded-full font-bold transition ${
                              fileObj.isCover ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {fileObj.isCover ? "Cover" : "Set Cover"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeUploadedFile(idx)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded transition"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveUploadedFile(idx, -1)}
                            className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          >
                            <ArrowLeft size={12} />
                          </button>
                          <span className="font-semibold text-slate-400">Idx: {idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === uploadedFiles.length - 1}
                            onClick={() => moveUploadedFile(idx, 1)}
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

            <button
              type="submit"
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-md flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={15} />
              <span>Publish Product Listing</span>
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default AddProduct;

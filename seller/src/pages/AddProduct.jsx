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
  const [categorySettings, setCategorySettings] = useState(null);
  const [customAttributes, setCustomAttributes] = useState([]);

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
    setCategorySettings(null);
    setCustomAttributes([]);

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
    if (!newProduct.name || !newProduct.price || !newProduct.description.trim()) {
      toast.error("Product name, price, and description are required.");
      return;
    }

    const minLimit = categorySettings ? categorySettings.minImages : 3;
    if (uploadedFiles.length < minLimit) {
      toast.error(`At least ${minLimit} images are required for this category.`);
      return;
    }

    const coverIndex = uploadedFiles.findIndex(f => f.isCover);
    const finalAttributes = customAttributes.filter(a => a.key.trim() !== "");

    const success = await addProduct({
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
      images: uploadedFiles.map(f => f.file),
      coverIndex: coverIndex >= 0 ? coverIndex : 0,
      attributes: JSON.stringify(finalAttributes)
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
      setCategorySettings(null);
      setCustomAttributes([]);
      setUploadedFiles([]);
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Description *</label>
              <textarea
                rows={3}
                placeholder="Describe features, size details, warranty, etc."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-orange-500 transition resize-none"
                required
              />
            </div>

            {/* Custom Dynamic Specifications Builder */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-indigo-650 uppercase tracking-wider">
                  <Layers size={13} />
                  <span>Dynamic Product Attributes</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomAttributes(prev => [...prev, { key: "", value: "" }])}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-sm animate-fade-in"
                >
                  <Plus size={11} />
                  <span>Add Attribute</span>
                </button>
              </div>

              {customAttributes.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-2xl py-8 text-center text-slate-400 text-xs italic bg-slate-50/50">
                  No attributes added yet. Click "Add Attribute" to add custom key-value specifications.
                </div>
              ) : (
                <div className="space-y-3">
                  {customAttributes.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3.5 border border-slate-150 rounded-2xl bg-white shadow-sm transition hover:shadow-md animate-fade-in">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-450 uppercase block">Attribute Name</label>
                          <input
                            type="text"
                            placeholder="e.g. RAM, Material, Color"
                            value={attr.key}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomAttributes(prev => {
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
                              setCustomAttributes(prev => {
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
                            setCustomAttributes(prev => {
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
                          disabled={idx === customAttributes.length - 1}
                          onClick={() => {
                            setCustomAttributes(prev => {
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
                          onClick={() => setCustomAttributes(prev => prev.filter((_, i) => i !== idx))}
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
                    {!categorySettings.requiresApproval ? (
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

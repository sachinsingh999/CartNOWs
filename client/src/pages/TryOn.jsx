import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Sparkles, Upload, ShoppingCart, Download, Check, AlertCircle, RefreshCw } from "lucide-react";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { useLanguage } from "../context/LanguageContext";

const presetModels = [
  {
    id: "model1",
    name: "Female (Style A)",
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "model2",
    name: "Male (Style A)",
    url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "model3",
    name: "Female (Style B)",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "model4",
    name: "Male (Style B)",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  },
];

const stepsKeys = ["step_1", "step_2", "step_3", "step_4"];

const TryOn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [modelType, setModelType] = useState("preset"); // preset or upload
  const [selectedModel, setSelectedModel] = useState(presetModels[0]);
  const [customFile, setCustomFile] = useState(null);
  const [customPreview, setCustomPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [resultImage, setResultImage] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [demoMessage, setDemoMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all products on load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/product/list`);
        if (res.data.success) {
          // Filter to only include fashion items (since VTON model works on upper_body/lower_body/dresses/accessories/footwear)
          const fashionItems = res.data.products.filter((p) => {
            const cat = (p.category || "").toLowerCase();
            const col = (p.collection || "").toLowerCase();
            return (
              cat.includes("clothing") ||
              cat.includes("fashion") ||
              cat.includes("apparel") ||
              cat.includes("men") ||
              cat.includes("women") ||
              cat.includes("kid") ||
              cat.includes("footwear") ||
              cat.includes("accessories") ||
              col.includes("men") ||
              col.includes("women") ||
              col.includes("kid")
            );
          });
          setProducts(fashionItems);

          // If navigated from product detail page, select that product automatically
          const targetId = location.state?.productId;
          if (targetId) {
            setSelectedProductId(targetId);
            const selected = fashionItems.find((p) => p._id === targetId);
            setSelectedProduct(selected);
          } else if (fashionItems.length > 0) {
            setSelectedProductId(fashionItems[0]._id);
            setSelectedProduct(fashionItems[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, [location.state]);

  // Update selected product info when dropdown changes
  useEffect(() => {
    if (selectedProductId) {
      const selected = products.find((p) => p._id === selectedProductId);
      setSelectedProduct(selected);
    }
  }, [selectedProductId, products]);

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomFile(file);
      setCustomPreview(URL.createObjectURL(file));
      setModelType("upload");
    }
  };

  // Convert preset URL to a File Object so we can upload it seamlessly to multer backend
  const getFileFromUrl = async (url, name, defaultType = "image/jpeg") => {
    const response = await fetch(url);
    const data = await response.blob();
    return new File([data], name, { type: data.type || defaultType });
  };

  // Run Virtual Try-On API
  const handleGenerate = async () => {
    if (!token) {
      toast.error(t("please_login_vton"));
      navigate("/login");
      return;
    }

    if (!selectedProductId) {
      toast.error(t("please_select_clothing"));
      return;
    }

    try {
      setLoading(true);
      setLoadingStep(0);
      setLoadingProgress(0);
      setResultImage("");
      setDemoMode(false);

      // Start animation sequence
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 98) {
            clearInterval(progressInterval);
            return 98;
          }
          return prev + 1;
        });
      }, 150);

      // Stepper progress indicator
      const stepInterval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev >= stepsKeys.length - 1) {
            clearInterval(stepInterval);
            return stepsKeys.length - 1;
          }
          return prev + 1;
        });
      }, 4000);

      const formData = new FormData();
      formData.append("productId", selectedProductId);
      
      // Category detection based on product category
      let category = "upper_body";
      if (selectedProduct?.subCategory?.toLowerCase()?.includes("dress") || 
          selectedProduct?.category?.toLowerCase()?.includes("dress")) {
        category = "dresses";
      } else if (selectedProduct?.subCategory?.toLowerCase()?.includes("pant") || 
                 selectedProduct?.subCategory?.toLowerCase()?.includes("jean")) {
        category = "lower_body";
      }
      formData.append("category", category);

      if (modelType === "upload") {
        if (!customFile) {
          toast.error(t("please_upload_photo"));
          clearInterval(progressInterval);
          clearInterval(stepInterval);
          setLoading(false);
          return;
        }
        formData.append("humanImage", customFile);
      } else {
        // Fetch preset model and append as file
        const file = await getFileFromUrl(selectedModel.url, "preset_model.jpg");
        formData.append("humanImage", file);
      }

      const res = await axios.post(
        `${backendUrl}/api/service/tryon`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      clearInterval(progressInterval);
      clearInterval(stepInterval);
      setLoadingProgress(100);

      if (res.data.success) {
        setResultImage(res.data.tryOnUrl);
        setDemoMode(res.data.demo || false);
        setDemoMessage(res.data.message || "");
        toast.success(t("ai_generation_complete"));
      } else {
        toast.error(res.data.message || t("ai_generation_failed"));
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        toast.error(t("session_expired"));
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || err.message || t("ai_generation_failed"));
      }
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    const size = selectedProduct.sizes?.[0] || "M";

    const localToken = localStorage.getItem("token") || token;
    if (!localToken) {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${selectedProduct._id}_${size}`;
      guestCart[key] = (guestCart[key] || 0) + 1;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      toast.success(t("added_to_cart"));
      navigate("/cart");
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId: selectedProduct._id, size, qty: 1 },
        { headers: { Authorization: `Bearer ${localToken}` } }
      );
      toast.success(t("added_to_cart"));
      navigate("/cart");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        toast.error(t("session_expired"));
        navigate("/login");
      } else {
        toast.error(t("failed_add_cart"));
      }
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement("a");
    a.href = resultImage;
    a.download = `tryon-${selectedProduct?.name || "garment"}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-955 px-6 py-12 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400 flex items-center gap-1.5 font-semibold">
              <Sparkles className="h-4 w-4" /> {t("smart_studio")}
            </p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900 dark:text-slate-50 font-extrabold">{t("ai_tryon_title")}</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              {t("ai_tryon_subtitle")}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[450px_1fr]">
          {/* CONTROL SIDEBAR */}
          <div className="space-y-6">
            {/* STEP 1: CHOOSE CLOTHING */}
            <section className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 shadow-sm dark:shadow-slate-950/20">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-4 font-bold">
                {t("select_clothing_step")}
              </h2>
              <div className="space-y-4">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-955 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-slate-955 dark:focus:border-slate-100 focus:ring-1 focus:ring-slate-955 dark:focus:ring-slate-100"
                >
                  <option value="" disabled className="bg-white dark:bg-slate-900">{t("select_store_products")}</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id} className="bg-white dark:bg-slate-900">
                      {p.name} (₹{p.price})
                    </option>
                  ))}
                </select>

                {selectedProduct && (
                  <div className="flex gap-4 rounded-md bg-gray-50 dark:bg-slate-950/40 p-3 border border-gray-100 dark:border-slate-800">
                    <img
                      src={
                        selectedProduct.images?.[0]?.startsWith("http")
                          ? selectedProduct.images[0]
                          : `${backendUrl}/${selectedProduct.images?.[0]}`
                      }
                      alt={selectedProduct.name}
                      className="h-16 w-16 rounded object-contain bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {selectedProduct.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 capitalize">
                        {selectedProduct.category} · {selectedProduct.collection}
                      </p>
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-50 mt-1">
                        ₹{selectedProduct.price}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* STEP 2: CHOOSE PERSON MODEL */}
            <section className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 shadow-sm dark:shadow-slate-950/20">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-4 font-bold">
                {t("choose_body_photo_step")}
              </h2>

              <div className="mb-4 flex border-b border-gray-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModelType("preset")}
                  className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                    modelType === "preset"
                      ? "border-black dark:border-orange-500 text-black dark:text-orange-400"
                      : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                  }`}
                >
                  {t("model_presets")}
                </button>
                <button
                  type="button"
                  onClick={() => setModelType("upload")}
                  className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                    modelType === "upload"
                      ? "border-black dark:border-orange-500 text-black dark:text-orange-400"
                      : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                  }`}
                >
                  {t("upload_photo")}
                </button>
              </div>

              {modelType === "preset" ? (
                <div className="grid grid-cols-2 gap-3">
                  {presetModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model)}
                      className={`group relative overflow-hidden rounded-md border text-left transition h-40 cursor-pointer ${
                        selectedModel.id === model.id
                          ? "border-black dark:border-orange-500 ring-1 ring-black dark:ring-orange-500"
                          : "border-gray-200 dark:border-slate-800 hover:border-gray-400 dark:hover:border-slate-700"
                      }`}
                    >
                      <img
                        src={model.url}
                        alt={model.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-white text-[11px] font-medium truncate">
                        {model.name}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/40 hover:bg-gray-100 dark:hover:bg-slate-900 cursor-pointer p-4 transition">
                    <Upload className="h-8 w-8 text-gray-400 dark:text-slate-500 mb-2" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                      {t("upload_body_photo")}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      {t("upload_constraints")}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {customPreview && (
                    <div className="relative h-44 rounded-md border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/40 overflow-hidden">
                      <img
                        src={customPreview}
                        alt="Uploaded preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedProductId}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-black dark:bg-orange-600 py-4 text-sm font-semibold text-white transition hover:bg-orange-600 dark:hover:bg-orange-500 hover:shadow-lg disabled:opacity-60 disabled:hover:bg-black cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? t("ai_processing") : t("generate_virtual_fit")}
            </button>
          </div>

          {/* VISUALIZER RESULT SCREEN */}
          <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm dark:shadow-slate-950/20 p-6 flex flex-col justify-between min-h-[500px]">
            {loading ? (
              /* Futurist Loading State */
              <div className="flex-1 flex flex-col justify-center items-center py-12">
                <div className="relative h-60 w-60 rounded-lg border border-orange-200 dark:border-orange-950/50 bg-orange-50/20 dark:bg-orange-950/10 overflow-hidden flex items-center justify-center shadow-inner">
                  {/* Laser scan animation overlay */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent top-0 animate-[bounce_3s_infinite_linear]" />
                  
                  {/* Person preview inside loading frame */}
                  <img
                    src={modelType === "upload" ? customPreview : selectedModel.url}
                    alt="Loading model"
                    className="h-full w-full object-contain opacity-40 blur-[1px]"
                  />

                  <div className="absolute flex flex-col items-center">
                    <RefreshCw className="h-10 w-10 text-orange-600 dark:text-orange-400 animate-spin" />
                    <span className="text-sm font-bold text-orange-850 dark:text-orange-400 mt-3">{loadingProgress}%</span>
                  </div>
                </div>

                <div className="max-w-sm mt-8 space-y-3 w-full">
                  <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-orange-500 dark:bg-orange-600 rounded transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <p className="text-center font-bold text-gray-900 dark:text-slate-100 text-sm animate-pulse">
                    {t(stepsKeys[loadingStep])}
                  </p>
                </div>
              </div>
            ) : resultImage ? (
              /* Output Image display */
              <div className="flex-1 flex flex-col items-center">
                <div className="grid gap-6 md:grid-cols-2 w-full">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">{t("original_frame")}</h3>
                    <div className="relative h-[380px] rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/40 overflow-hidden">
                      <img
                        src={modelType === "upload" ? customPreview : selectedModel.url}
                        alt="Input frame"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-3 w-3" /> {t("fitted_virtual_result")}
                    </h3>
                    <div className="relative h-[380px] rounded-lg border-2 border-orange-400 dark:border-orange-500 bg-gray-50 dark:bg-slate-900/40 overflow-hidden shadow-md">
                      <img
                        src={resultImage}
                        alt="AI virtual try-on result"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {demoMode && (
                  <div className="w-full mt-6 flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-4">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-900 dark:text-amber-300">{t("developer_demo_active")}</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-5">
                        {demoMessage} If you want to connect to a live generative backend model, please add your Replicate API token to your server env file.
                      </p>
                    </div>
                  </div>
                )}

                <div className="w-full mt-8 flex flex-wrap gap-4 border-t border-gray-100 dark:border-slate-800 pt-6 justify-end">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-gray-900 dark:text-slate-200 transition hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> {t("download_photo")}
                  </button>

                  <button
                    onClick={handleAddToCart}
                    className="inline-flex items-center gap-2 rounded-md bg-black dark:bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:hover:bg-orange-500 cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4" /> {t("add_fitted_to_cart")}
                  </button>
                </div>
              </div>
            ) : (
              /* Idle screen */
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
                <div className="h-20 w-20 rounded-full bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50 flex items-center justify-center mb-6">
                  <Sparkles className="h-10 w-10 text-orange-500 dark:text-orange-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-extrabold">{t("enter_dressing_room")}</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-slate-400 leading-6 font-medium">
                  {t("dressing_room_desc")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryOn;

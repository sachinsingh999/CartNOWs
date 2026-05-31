import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { 
  ClipboardList, 
  Trash2, 
  Search, 
  Box, 
  AlertTriangle, 
  Layers,
  Edit,
  Check,
  X
} from "lucide-react";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Stock editor states
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState(0);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Update stock handler
  const updateProductStock = async (id, newStock) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/update-stock`,
        { id, stock: Number(newStock) },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setEditingStockId(null);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    let active = true;

    axios.get(`${backendUrl}/api/product/list`)
      .then((response) => {
        if (!active) return;

        if (response.data.success) {
          setList(response.data.products);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        if (active) {
          toast.error(error.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Filter list based on search
  const filteredList = list.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.brand || "").toLowerCase().includes(query) ||
      (item.category || "").toLowerCase().includes(query) ||
      (item.sku || "").toLowerCase().includes(query)
    );
  });

  // Stats calculation
  const totalProducts = list.length;
  const outOfStock = list.filter((item) => (item.stock ?? 0) <= 0).length;
  const uniqueCategories = new Set(list.map((item) => item.category).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450">
            Inventory Management
          </p>
          <div className="flex items-center gap-2.5 mt-1">
            <ClipboardList size={22} className="text-slate-900" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h2>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Manage {totalProducts} products listed live on the storefront
        </p>
      </div>

      {/* Dashboard Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
            <Box size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Items</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{totalProducts}</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${outOfStock > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-700"}`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Out of Stock</p>
            <p className={`text-lg font-bold mt-0.5 ${outOfStock > 0 ? "text-rose-600" : "text-slate-900"}`}>{outOfStock}</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Categories</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{uniqueCategories}</p>
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name, brand, SKU, category..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 bg-white text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-950/5"
        />
      </div>

      {/* Catalog Grid */}
      <div className="grid gap-4">
        {filteredList.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500 shadow-sm flex flex-col items-center justify-center gap-2">
            <Box size={32} className="text-slate-300" />
            <div>
              <p className="font-semibold text-slate-700">No products match your search</p>
              <p className="text-xs text-slate-400 mt-0.5">Try adjusting your filters or add a new product.</p>
            </div>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col sm:flex-row items-center sm:items-stretch gap-6"
            >
              {/* Product Image */}
              <div className="relative h-20 w-20 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden p-2 flex items-center justify-center shadow-inner">
                <img
                  src={item.images?.[0]?.startsWith('http') ? item.images[0] : `${backendUrl}/${item.images?.[0]}`}
                  alt={item.name}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Title & Category info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between text-center sm:text-left">
                <div>
                  <p className="text-base font-bold text-slate-900 truncate tracking-tight">{item.name}</p>
                  <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-1.5">
                    {item.stock === 0 && (
                      <span className="rounded-lg bg-rose-50 text-rose-700 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border border-rose-100 animate-pulse">
                        Out of Stock
                      </span>
                    )}
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {item.category}
                    </span>
                    {item.subCategory && (
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        {item.subCategory}
                      </span>
                    )}
                    {item.collection && (
                      <span className="rounded-lg bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">
                        {item.collection}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Specs */}
              <div className="flex-1 space-y-1 text-xs text-slate-600 flex flex-col justify-center border-y border-slate-100 sm:border-y-0 py-3 sm:py-0">
                <p><span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider block">Brand</span> <span className="text-slate-800 font-medium">{item.brand || "—"}</span></p>
                <p><span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider block">SKU</span> <span className="text-slate-800 font-mono font-medium">{item.sku || "—"}</span></p>
                <p>
                  <span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider block">Sizes / Variants</span>
                  <span className="text-slate-800 font-medium">
                    {item.sizes?.length ? (Array.isArray(item.sizes) ? item.sizes.join(", ") : item.sizes) : "—"}
                  </span>
                </p>
              </div>

              {/* Price & Stock Adjustment Section */}
              {editingStockId === item._id ? (
                <div className="flex flex-col justify-center text-center sm:text-left min-w-[130px]">
                  <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Adjust Stock</span>
                  <div className="flex items-center justify-center sm:justify-start gap-1 mt-1.5">
                    <button 
                      type="button"
                      onClick={() => setTempStockValue(prev => Math.max(0, prev - 1))}
                      className="w-7 h-7 bg-slate-100 text-slate-800 rounded-lg font-bold text-xs flex items-center justify-center hover:bg-slate-200 cursor-pointer transition select-none active:scale-90"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={tempStockValue}
                      onChange={(e) => setTempStockValue(Math.max(0, Number(e.target.value)))}
                      className="w-12 h-7 rounded-lg border border-slate-200 bg-white text-center text-xs font-extrabold text-slate-800 outline-none focus:border-slate-900"
                    />
                    <button 
                      type="button"
                      onClick={() => setTempStockValue(prev => prev + 1)}
                      className="w-7 h-7 bg-slate-100 text-slate-800 rounded-lg font-bold text-xs flex items-center justify-center hover:bg-slate-200 cursor-pointer transition select-none active:scale-90"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex justify-center sm:justify-start gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => updateProductStock(item._id, tempStockValue)}
                      className="flex items-center justify-center w-7 h-6 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      title="Save"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStockId(null)}
                      className="flex items-center justify-center w-7 h-6 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                      title="Cancel"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center text-center sm:text-left min-w-[100px]">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</span>
                  <span className="text-lg font-black text-slate-900 mt-0.5">₹{item.price}</span>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${item.stock > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${item.stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                      Stock: {item.stock ?? 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStockId(item._id);
                        setTempStockValue(item.stock ?? 0);
                      }}
                      className="text-slate-400 hover:text-slate-900 p-0.5 rounded transition cursor-pointer hover:bg-slate-50 active:scale-95"
                      title="Update stock count"
                    >
                      <Edit size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => removeProduct(item._id)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-600 hover:text-white border border-rose-100 hover:border-rose-600 bg-rose-50/50 hover:bg-rose-600 rounded-xl transition duration-200 cursor-pointer w-full sm:w-auto h-fit shadow-sm"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default List;

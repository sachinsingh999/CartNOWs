import React, { useState } from "react";
import { Search, AlertTriangle, ArrowUpDown, Edit2, Check, X, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../config";

const Inventory = ({ token, products = [], fetchProducts }) => {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState(0);
  const [updating, setUpdating] = useState(false);

  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

  const handleUpdateStock = async (productId) => {
    if (editStock < 0) {
      toast.error("Stock cannot be negative");
      return;
    }
    setUpdating(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/seller/inventory/update-stock`,
        { id: productId, stock: editStock },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Stock level updated successfully!");
        setEditingId(null);
        if (fetchProducts) fetchProducts();
      } else {
        toast.error(res.data.message || "Failed to update stock");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setUpdating(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "All" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Stock & Inventory</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Monitor product availability, adjust stock counts, and check replenishment logs.
          </p>
        </div>
        {fetchProducts && (
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 dark:text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
          >
            <RefreshCw size={14} />
            <span>Sync Catalog</span>
          </button>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search items by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          />
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 outline-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid view of inventory status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Unit Price</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400 font-semibold">
                    No products found matching your inventory filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = (p.stock ?? 15) < 10;
                  const isEditing = editingId === p._id;

                  return (
                    <tr
                      key={p._id}
                      className="border-b border-slate-50 text-xs text-slate-700 hover:bg-slate-50/30 transition duration-150"
                    >
                      {/* Product Detail */}
                      <td className="py-4 px-4 font-bold flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Item</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-900 dark:text-slate-100 font-black truncate max-w-[200px]">{p.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">#{p._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                          {p.category || "Beverages"}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-4 px-4 text-center font-black text-slate-900 dark:text-slate-100">
                        ₹{p.price?.toFixed(2) || "0.00"}
                      </td>

                      {/* Current Stock */}
                      <td className="py-4 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                              className="w-16 border border-slate-300 rounded px-1.5 py-0.5 text-center text-xs font-bold"
                            />
                            <button
                              onClick={() => handleUpdateStock(p._id)}
                              disabled={updating}
                              className="p-1 rounded bg-emerald-500 text-slate-100 dark:text-white hover:bg-emerald-600 transition"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 transition"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className={`font-black text-sm ${(p.stock ?? 15) < 10 ? "text-red-600" : "text-slate-900"}`}>
                            {p.stock ?? 15} units
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${ isLow ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100" }`}
                        >
                          {isLow ? "Low Stock" : "Healthy"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        {!isEditing && (
                          <button
                            onClick={() => {
                              setEditingId(p._id);
                              setEditStock(p.stock ?? 15);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-[10px] font-bold text-slate-700 transition cursor-pointer"
                          >
                            <Edit2 size={10} />
                            <span>Quick Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;

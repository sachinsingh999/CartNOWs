import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Plus, Trash2, ToggleLeft, ToggleRight, Megaphone, Calendar, Percent, AlertTriangle } from "lucide-react";

const PRESET_COLORS = [
  { label: "Indigo", bg: "#6366f1", text: "#ffffff" },
  { label: "Purple", bg: "#8b5cf6", text: "#ffffff" },
  { label: "Rose", bg: "#f43f5e", text: "#ffffff" },
  { label: "Orange", bg: "#f97316", text: "#ffffff" },
  { label: "Emerald", bg: "#10b981", text: "#ffffff" },
  { label: "Sky", bg: "#0ea5e9", text: "#ffffff" },
  { label: "Amber", bg: "#f59e0b", text: "#ffffff" },
  { label: "Slate Dark", bg: "#0f172a", text: "#ffffff" },
];

const empty = {
  title: "", subtitle: "", badge: "SALE", discountPercent: "",
  discountLabel: "", bgColor: "#6366f1", textColor: "#ffffff",
  buttonText: "Shop Now", buttonLink: "/product",
  image: "", category: "", validFrom: "", validTo: "", priority: 0,
};

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const isExpired = (d) => new Date(d) < new Date();

const Sales = ({ token }) => {
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSales = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/sale/all`, { headers: { token } });
      if (data.success) setSales(data.sales);
    } catch { toast.error("Failed to load sales"); }
  };

  useEffect(() => { fetchSales(); }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.validTo) return toast.error("Title and End Date are required");
    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/sale/create`, form, { headers: { token } });
      if (data.success) {
        toast.success("Sale banner created!");
        setForm(empty);
        setShowForm(false);
        fetchSales();
      } else toast.error(data.message);
    } catch { toast.error("Failed to create sale"); }
    setLoading(false);
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await axios.patch(`${backendUrl}/api/sale/toggle/${id}`, {}, { headers: { token } });
      if (data.success) { toast.success(data.message); fetchSales(); }
    } catch { toast.error("Toggle failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale banner?")) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/sale/delete/${id}`, { headers: { token } });
      if (data.success) { toast.success("Deleted"); fetchSales(); }
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900 dark:text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-sm shrink-0">
            <Megaphone size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Sale & Promotions</h1>
            <p className="text-xs text-slate-500 mt-0.5">{sales.length} banner{sales.length !== 1 ? "s" : ""} total</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-sm ${ showForm ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700" : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-slate-100 dark:text-white shadow-md shadow-indigo-500/25" }`}
        >
          <Plus size={16} />
          <span>{showForm ? "Cancel" : "New Sale Banner"}</span>
        </button>
      </div>

      {/* Create Sale Banner Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4 animate-scaleUp">
          <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Create Sale Banner</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Banner Title *" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Summer Flash Sale" />
              <Field label="Subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="e.g. Limited time only!" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Badge Text" name="badge" value={form.badge} onChange={handleChange} placeholder="SALE / FLASH DEAL" />
              <Field label="Discount %" name="discountPercent" type="number" min="0" max="100" value={form.discountPercent} onChange={handleChange} placeholder="e.g. 40" />
              <Field label="Discount Label" name="discountLabel" value={form.discountLabel} onChange={handleChange} placeholder="Up to 40% off" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Button Text" name="buttonText" value={form.buttonText} onChange={handleChange} placeholder="Shop Now" />
              <Field label="Button Link" name="buttonLink" value={form.buttonLink} onChange={handleChange} placeholder="/product or /product/men" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Category (optional)" name="category" value={form.category} onChange={handleChange} placeholder="Men / Women / Kids" />
              <Field label="Start Date" name="validFrom" type="date" value={form.validFrom} onChange={handleChange} />
              <Field label="End Date *" name="validTo" type="date" value={form.validTo} onChange={handleChange} />
            </div>

            <div>
              <Field label="Banner Image URL (optional)" name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
            </div>

            {/* Color presets */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Banner Color</label>
              <div className="flex gap-2.5 flex-wrap items-center">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.bg}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, bgColor: c.bg, textColor: c.text }))}
                    title={c.label}
                    className="w-8 h-8 rounded-lg cursor-pointer transition transform active:scale-90 border-2"
                    style={{
                      backgroundColor: c.bg,
                      borderColor: form.bgColor === c.bg ? "#6366f1" : "transparent",
                      boxShadow: form.bgColor === c.bg ? "0 0 0 2px #c7d2fe" : "none",
                    }}
                  />
                ))}
                <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 bg-slate-50/50 dark:bg-gray-900">
                  <input 
                    type="color" 
                    name="bgColor" 
                    value={form.bgColor} 
                    onChange={handleChange}
                    className="w-7 h-7 rounded border border-slate-200 dark:border-slate-800 cursor-pointer p-0 bg-transparent" 
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Custom</span>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Banner Preview</label>
              <BannerPreview sale={form} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-slate-100 dark:text-white font-bold text-xs uppercase tracking-wider transition active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-md hover:shadow-indigo-500/25"
            >
              {loading ? "Creating…" : "Create Sale Banner"}
            </button>
          </form>
        </div>
      )}

      {/* Banners List */}
      {sales.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm flex flex-col items-center justify-center gap-3">
          <Megaphone size={40} className="text-indigo-200 dark:text-slate-700" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">No sale banners yet</p>
            <p className="text-slate-400 mt-1">Create your first promotion to show on the storefront home page.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sales.map(sale => {
            const expired = isExpired(sale.validTo);
            return (
              <div 
                key={sale._id} 
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 transition duration-200 shadow-xs hover:shadow-md ${ expired ? "border-amber-300 dark:border-amber-500/20 bg-amber-50/10 dark:bg-amber-500/5" : sale.active ? "border-indigo-200 dark:border-indigo-500/20" : "border-slate-200 dark:border-slate-800" } ${(!sale.active || expired) ? "opacity-70" : ""}`}
              >
                <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                  {/* Swatch */}
                  <div 
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5 shadow-inner"
                    style={{ backgroundColor: sale.bgColor || "#6366f1" }}
                  >
                    <Percent size={18} style={{ color: sale.textColor || "#fff" }} />
                  </div>

                  <div className="min-w-0 flex-1 sm:flex-initial">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">{sale.title}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider leading-none ${ expired ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" : sale.active ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30" }`}>
                        {expired ? "Expired" : sale.active ? "Active" : "Paused"}
                      </span>
                      {sale.discountPercent > 0 && (
                        <span className="text-xs font-black text-rose-500 dark:text-rose-400">{sale.discountPercent}% OFF</span>
                      )}
                    </div>
                    {sale.subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">{sale.subtitle}</p>}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-slate-400" />
                        <span>{fmt(sale.validFrom)} → {fmt(sale.validTo)}</span>
                      </span>
                      {sale.category && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">📦 {sale.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleToggle(sale._id)}
                    title={sale.active ? "Pause" : "Activate"}
                    className={`p-1 rounded-lg transition cursor-pointer ${sale.active ? "text-indigo-500 hover:text-indigo-600" : "text-slate-400 hover:text-slate-600 dark:text-slate-500"}`}
                  >
                    {sale.active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                  </button>
                  <button
                    onClick={() => handleDelete(sale._id)}
                    className="px-3.5 py-1.5 rounded-xl border border-red-200 hover:border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition cursor-pointer flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Field = ({ label, name, value, onChange, type = "text", placeholder, min, max }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-gray-900 px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:bg-white dark:focus:bg-slate-900 dark: placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
    />
  </div>
);

const BannerPreview = ({ sale }) => (
  <div 
    className="rounded-2xl overflow-hidden p-6 flex flex-col sm:flex-row items-center justify-between gap-5 min-h-[90px] relative shadow-inner select-none transition-all duration-200"
    style={{
      backgroundColor: sale.bgColor || "#6366f1",
      color: sale.textColor || "#fff",
    }}
  >
    <div className="absolute right-[-30px] top-[-30px] width-[120px] height-[120px] rounded-full bg-white/10 blur pointer-events-none" />
    <div className="absolute right-[60px] bottom-[-40px] width-[80px] height-[80px] rounded-full bg-white/5 blur pointer-events-none" />

    <div className="relative space-y-1.5 text-center sm:text-left">
      {sale.badge && (
        <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full border border-white/10 inline-block">{sale.badge}</span>
      )}
      <p className="text-base font-black tracking-tight leading-tight">{sale.title || "Banner Title"}</p>
      {sale.subtitle && <p className="text-xs font-semibold opacity-80 leading-relaxed">{sale.subtitle}</p>}
    </div>

    <div className="flex flex-col items-center sm:items-end gap-2.5 shrink-0 relative">
      {sale.discountPercent > 0 && (
        <span className="text-3xl font-black leading-none">{sale.discountPercent}%<span className="text-xs font-bold uppercase tracking-wider"> OFF</span></span>
      )}
      <span className="text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-xs transition hover:bg-white hover:text-slate-900 cursor-pointer">
        {sale.buttonText || "Shop Now"} →
      </span>
    </div>
  </div>
);

export default Sales;

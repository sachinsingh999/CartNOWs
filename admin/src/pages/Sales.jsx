import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Megaphone, Calendar, Percent } from "lucide-react";

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
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Megaphone size={20} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Sale & Promotions</h1>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{sales.length} banner{sales.length !== 1 ? "s" : ""} total</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 12,
            background: showForm ? "#f1f5f9" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: showForm ? "#475569" : "#fff",
            border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 700,
            boxShadow: showForm ? "none" : "0 4px 14px rgba(99,102,241,0.4)",
          }}
        >
          <Plus size={16} />
          {showForm ? "Cancel" : "New Sale Banner"}
        </button>
      </div>

      {/* ── Create Form ── */}
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e9eaec", padding: 24, marginBottom: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Create Sale Banner</h2>

          <form onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <Field label="Banner Title *" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Summer Flash Sale" />
              <Field label="Subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="e.g. Limited time only!" />
            </div>

            {/* Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
              <Field label="Badge Text" name="badge" value={form.badge} onChange={handleChange} placeholder="SALE / FLASH DEAL" />
              <Field label="Discount %" name="discountPercent" type="number" min="0" max="100" value={form.discountPercent} onChange={handleChange} placeholder="e.g. 40" />
              <Field label="Discount Label" name="discountLabel" value={form.discountLabel} onChange={handleChange} placeholder="Up to 40% off" />
            </div>

            {/* Row 3 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <Field label="Button Text" name="buttonText" value={form.buttonText} onChange={handleChange} placeholder="Shop Now" />
              <Field label="Button Link" name="buttonLink" value={form.buttonLink} onChange={handleChange} placeholder="/product or /product/men" />
            </div>

            {/* Row 4 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
              <Field label="Category (optional)" name="category" value={form.category} onChange={handleChange} placeholder="Men / Women / Kids" />
              <Field label="Start Date" name="validFrom" type="date" value={form.validFrom} onChange={handleChange} />
              <Field label="End Date *" name="validTo" type="date" value={form.validTo} onChange={handleChange} />
            </div>

            {/* Row 5 — Image URL */}
            <div style={{ marginBottom: 14 }}>
              <Field label="Banner Image URL (optional)" name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
            </div>

            {/* Color presets */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>Banner Color</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.bg}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, bgColor: c.bg, textColor: c.text }))}
                    title={c.label}
                    style={{
                      width: 30, height: 30, borderRadius: 8, background: c.bg,
                      border: form.bgColor === c.bg ? "3px solid #6366f1" : "2px solid transparent",
                      cursor: "pointer", outline: form.bgColor === c.bg ? "2px solid #c7d2fe" : "none",
                      transition: "transform 0.15s",
                    }}
                  />
                ))}
                {/* Custom hex */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="color" name="bgColor" value={form.bgColor} onChange={handleChange}
                    style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer" }} />
                  <span style={{ fontSize: 12, color: "#64748b" }}>Custom</span>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>Preview</p>
              <BannerPreview sale={form} />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px 28px", borderRadius: 12,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
                fontSize: 13, fontWeight: 700, opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
              }}
            >
              {loading ? "Creating…" : "Create Sale Banner"}
            </button>
          </form>
        </div>
      )}

      {/* ── Banners List ── */}
      {sales.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16, border: "1px dashed #e2e8f0" }}>
          <Megaphone size={40} color="#c7d2fe" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>No sale banners yet</p>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>Create your first promotion to show on the home page.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sales.map(sale => {
            const expired = isExpired(sale.validTo);
            return (
              <div key={sale._id} style={{
                background: "#fff", borderRadius: 14,
                border: `1px solid ${expired ? "#fde68a" : sale.active ? "#e0e7ff" : "#f1f5f9"}`,
                padding: "16px 20px",
                display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
                opacity: (!sale.active || expired) ? 0.7 : 1,
              }}>
                {/* Color swatch */}
                <div style={{ width: 48, height: 48, borderRadius: 10, background: sale.bgColor, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Percent size={20} color={sale.textColor || "#fff"} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{sale.title}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                      background: expired ? "#fef3c7" : sale.active ? "#eef2ff" : "#f1f5f9",
                      color: expired ? "#92400e" : sale.active ? "#4338ca" : "#64748b",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                      {expired ? "Expired" : sale.active ? "Active" : "Paused"}
                    </span>
                    {sale.discountPercent > 0 && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#f43f5e" }}>{sale.discountPercent}% OFF</span>
                    )}
                  </div>
                  {sale.subtitle && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{sale.subtitle}</p>}
                  <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={11} /> {fmt(sale.validFrom)} → {fmt(sale.validTo)}
                    </span>
                    {sale.category && (
                      <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600 }}>📦 {sale.category}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggle(sale._id)}
                    title={sale.active ? "Pause" : "Activate"}
                    style={{ background: "none", border: "none", cursor: "pointer", color: sale.active ? "#6366f1" : "#94a3b8", padding: 4 }}
                  >
                    {sale.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                  <button
                    onClick={() => handleDelete(sale._id)}
                    title="Delete"
                    style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}
                  >
                    <Trash2 size={14} />
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

// ── Small reusable input field ────────────────────────────────────────────────
const Field = ({ label, name, value, onChange, type = "text", placeholder, min, max }) => (
  <div>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: 6 }}>{label}</label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} min={min} max={max}
      style={{
        width: "100%", boxSizing: "border-box",
        border: "1.5px solid #e2e8f0", borderRadius: 10,
        padding: "9px 12px", fontSize: 13, color: "#0f172a",
        outline: "none", background: "#fafafa",
        transition: "border-color 0.15s",
      }}
      onFocus={e => e.target.style.borderColor = "#6366f1"}
      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
    />
  </div>
);

// ── Live Banner Preview ───────────────────────────────────────────────────────
const BannerPreview = ({ sale }) => (
  <div style={{
    borderRadius: 14, overflow: "hidden",
    background: sale.bgColor || "#6366f1",
    color: sale.textColor || "#fff",
    padding: "20px 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 16, flexWrap: "wrap",
    minHeight: 90,
    position: "relative",
  }}>
    {/* Decorative circle */}
    <div style={{ position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", right: 60, bottom: -40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

    <div style={{ position: "relative" }}>
      {sale.badge && (
        <span style={{
          fontSize: 9, fontWeight: 900, letterSpacing: "0.12em",
          background: "rgba(255,255,255,0.25)", padding: "3px 10px", borderRadius: 20,
          display: "inline-block", marginBottom: 6, textTransform: "uppercase",
        }}>{sale.badge}</span>
      )}
      <p style={{ margin: 0, fontSize: 16, fontWeight: 900, lineHeight: 1.2 }}>{sale.title || "Banner Title"}</p>
      {sale.subtitle && <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.8 }}>{sale.subtitle}</p>}
    </div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, position: "relative" }}>
      {sale.discountPercent > 0 && (
        <span style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{sale.discountPercent}%<span style={{ fontSize: 14 }}> OFF</span></span>
      )}
      <span style={{
        fontSize: 12, fontWeight: 700, padding: "7px 16px",
        background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.3)",
        borderRadius: 20, backdropFilter: "blur(4px)",
      }}>{sale.buttonText || "Shop Now"} →</span>
    </div>
  </div>
);

export default Sales;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Ticket, Plus, Trash2, ToggleLeft, ToggleRight, Calendar, Percent, ShieldAlert } from "lucide-react";

const empty = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  expiryDate: "",
};

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "No Expiry";
const isExpired = (d) => d ? new Date(d) < new Date() : false;

const Coupons = ({ token }) => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/coupon/list`);
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch {
      toast.error("Failed to load coupons");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) {
      return toast.error("Coupon Code and Discount Value are required");
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/coupon/create`, form, { headers: { token } });
      if (data.success) {
        toast.success("Coupon created successfully!");
        setForm(empty);
        setShowForm(false);
        fetchCoupons();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to create coupon");
    }
    setLoading(false);
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/coupon/toggle`, { id }, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        fetchCoupons();
      }
    } catch {
      toast.error("Toggle failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon code?")) return;
    try {
      const { data } = await axios.post(`${backendUrl}/api/coupon/delete`, { id }, { headers: { token } });
      if (data.success) {
        toast.success("Coupon deleted");
        fetchCoupons();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #f97316, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ticket size={20} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Promo Coupons</h1>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((f) => !f)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 12,
            background: showForm ? "#f1f5f9" : "linear-gradient(135deg, #f97316, #ef4444)",
            color: showForm ? "#475569" : "#fff",
            border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 700,
            boxShadow: showForm ? "none" : "0 4px 14px rgba(249,115,22,0.4)",
          }}
        >
          <Plus size={16} />
          {showForm ? "Cancel" : "New Coupon"}
        </button>
      </div>

      {/* Create Coupon Form */}
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e9eaec", padding: 24, marginBottom: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Create Coupon</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: 6 }}>Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. WELCOME10"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    border: "1.5px solid #e2e8f0", borderRadius: 10,
                    padding: "9px 12px", fontSize: 13, color: "#0f172a",
                    outline: "none", background: "#fafafa",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: 6 }}>Discount Type</label>
                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    border: "1.5px solid #e2e8f0", borderRadius: 10,
                    padding: "9px 12px", fontSize: 13, color: "#0f172a",
                    outline: "none", background: "#fafafa",
                    height: 38,
                  }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
              <Field label="Discount Value *" name="discountValue" type="number" min="1" value={form.discountValue} onChange={handleChange} placeholder="e.g. 10 or 150" />
              <Field label="Min Order Amount (₹)" name="minOrderAmount" type="number" min="0" value={form.minOrderAmount} onChange={handleChange} placeholder="e.g. 500" />
              <Field label="Expiry Date" name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px 28px", borderRadius: 12,
                background: "linear-gradient(135deg, #f97316, #ef4444)",
                color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
                fontSize: 13, fontWeight: 700, opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
              }}
            >
              {loading ? "Creating…" : "Create Coupon"}
            </button>
          </form>
        </div>
      )}

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16, border: "1px dashed #e2e8f0" }}>
          <Ticket size={40} color="#fed7aa" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>No coupons yet</p>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>Create your first discount coupon to promote shopping.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {coupons.map((coupon) => {
            const expired = isExpired(coupon.expiryDate);
            return (
              <div key={coupon._id} style={{
                background: "#fff", borderRadius: 14,
                border: `1px solid ${expired ? "#fde68a" : coupon.isActive ? "#ffedd5" : "#f1f5f9"}`,
                padding: "16px 20px",
                display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
                opacity: (!coupon.isActive || expired) ? 0.7 : 1,
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: "linear-gradient(135deg, #fff7ed, #ffedd5)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ffedd5" }}>
                  <Percent size={20} color="#f97316" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", letterSpacing: "0.02em" }}>{coupon.code}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                      background: expired ? "#fef3c7" : coupon.isActive ? "#ffedd5" : "#f1f5f9",
                      color: expired ? "#92400e" : coupon.isActive ? "#ea580c" : "#64748b",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                      {expired ? "Expired" : coupon.isActive ? "Active" : "Paused"}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#ea580c" }}>
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap", fontSize: 12, color: "#64748b" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={11} /> Expires: {fmt(coupon.expiryDate)}
                    </span>
                    <span>•</span>
                    <span>Min Order: ₹{coupon.minOrderAmount}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggle(coupon._id)}
                    title={coupon.isActive ? "Pause" : "Activate"}
                    style={{ background: "none", border: "none", cursor: "pointer", color: coupon.isActive ? "#f97316" : "#94a3b8", padding: 4 }}
                  >
                    {coupon.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
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
      onFocus={e => e.target.style.borderColor = "#f97316"}
      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
    />
  </div>
);

export default Coupons;

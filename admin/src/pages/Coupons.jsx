import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Ticket, Plus, Trash2, ToggleLeft, ToggleRight, Calendar, Percent } from "lucide-react";

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
    <div className="space-y-6 animate-fadeIn text-slate-900 dark:text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-orange-500/10 text-orange-505 dark:text-orange-400 rounded-xl flex items-center justify-center border border-orange-500/20 shadow-sm shrink-0">
            <Ticket size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Promo Coupons</h1>
            <p className="text-xs text-slate-500 mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((f) => !f)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-sm ${
            showForm
              ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md shadow-orange-500/25"
          }`}
        >
          <Plus size={16} />
          <span>{showForm ? "Cancel" : "New Coupon"}</span>
        </button>
      </div>

      {/* Create Coupon Form */}
      {showForm && (
        <div className="bg-white dark:bg-[#151b26] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4 animate-scaleUp">
          <h2 className="text-sm font-black text-slate-850 dark:text-white tracking-tight">Create Coupon</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. WELCOME10"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111827] px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:bg-white dark:focus:bg-[#151b26] focus:border-orange-500 dark:focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 placeholder:text-slate-450 dark:placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Discount Type</label>
                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111827] px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:bg-white dark:focus:bg-[#151b26] focus:border-orange-500 dark:focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Discount Value *" name="discountValue" type="number" min="1" value={form.discountValue} onChange={handleChange} placeholder="e.g. 10 or 150" />
              <Field label="Min Order Amount (₹)" name="minOrderAmount" type="number" min="0" value={form.minOrderAmount} onChange={handleChange} placeholder="e.g. 500" />
              <Field label="Expiry Date" name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider transition active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-md hover:shadow-orange-500/25"
            >
              {loading ? "Creating…" : "Create Coupon"}
            </button>
          </form>
        </div>
      )}

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151b26] py-16 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm flex flex-col items-center justify-center gap-3">
          <Ticket size={40} className="text-orange-200 dark:text-slate-700" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">No coupons yet</p>
            <p className="text-slate-400 mt-1">Create your first discount coupon to promote shopping.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon.expiryDate);
            return (
              <div 
                key={coupon._id} 
                className={`bg-white dark:bg-[#151b26] rounded-2xl border p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 transition duration-200 shadow-xs hover:shadow-md ${
                  expired 
                    ? "border-amber-200 dark:border-amber-500/20 bg-amber-50/10 dark:bg-amber-500/5" 
                    : coupon.isActive 
                      ? "border-orange-200 dark:border-orange-500/20" 
                      : "border-slate-200 dark:border-slate-800"
                } ${(!coupon.isActive || expired) ? "opacity-70" : ""}`}
              >
                <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                  <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20 shadow-xs">
                    <Percent size={18} />
                  </div>

                  <div className="min-w-0 flex-1 sm:flex-initial">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">{coupon.code}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider leading-none ${
                        expired 
                          ? "bg-amber-500/15 text-amber-605 dark:text-amber-405 border-amber-500/30" 
                          : coupon.isActive 
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
                            : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30"
                      }`}>
                        {expired ? "Expired" : coupon.isActive ? "Active" : "Paused"}
                      </span>
                      <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                        {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-slate-400" />
                        <span>Expires: {fmt(coupon.expiryDate)}</span>
                      </span>
                      <span>•</span>
                      <span>Min Order: ₹{coupon.minOrderAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleToggle(coupon._id)}
                    title={coupon.isActive ? "Pause" : "Activate"}
                    className={`p-1 rounded-lg transition cursor-pointer ${coupon.isActive ? "text-orange-500 hover:text-orange-655" : "text-slate-400 hover:text-slate-600 dark:text-slate-500"}`}
                  >
                    {coupon.isActive ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
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
      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111827] px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:bg-white dark:focus:bg-[#151b26] focus:border-orange-500 dark:focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 placeholder:text-slate-450 dark:placeholder:text-slate-600"
    />
  </div>
);

export default Coupons;

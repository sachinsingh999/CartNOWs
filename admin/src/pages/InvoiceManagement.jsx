import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import {
  FileText, Search, Calendar, Filter, Download, RotateCw, CheckCircle,
  Clock, X, ArrowUpRight, DollarSign, Receipt, CreditCard, ChevronRight, User
} from "lucide-react";

const InvoiceManagement = ({ token }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState("all");

  // Selected invoice for detailed view
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (q) params.q = q;
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get(`${backendUrl}/api/invoice/admin-invoices`, {
        headers: { token },
        params
      });

      if (res.data.success) {
        setInvoices(res.data.invoices);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [q, status, startDate, endDate]);

  const handlePreset = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      const todayStr = now.toISOString().split("T")[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "week") {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (preset === "month") {
      const past = new Date();
      past.setMonth(now.getMonth() - 1);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    }
  };

  const handleRegenerate = async (id) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/invoice/regenerate`,
        { id },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Invoice PDF successfully re-generated!");
        fetchInvoices();
        if (selectedInvoice && selectedInvoice._id === id) {
          setSelectedInvoice(prev => ({ ...prev, pdfUrl: `/invoices/${selectedInvoice.invoiceNumber}.pdf` }));
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) {
      toast.warning("No invoices to export.");
      return;
    }

    const headers = [
      "Invoice Number", "Invoice Date", "Order ID", "Customer Name", "Customer Email",
      "Payment Method", "Transaction ID", "Subtotal", "Tax Amount", "CGST", "SGST",
      "Discount", "Shipping Charges", "Grand Total", "Payment Status"
    ];

    const rows = invoices.map(inv => [
      inv.invoiceNumber,
      new Date(inv.invoiceDate).toLocaleDateString(),
      inv.orderId?._id || inv.orderId || "N/A",
      inv.customerId?.name || "N/A",
      inv.customerId?.email || "N/A",
      inv.paymentMethod,
      inv.transactionId || "N/A",
      inv.subtotal,
      inv.taxAmount,
      inv.cgst,
      inv.sgst,
      inv.discount,
      inv.shippingCharges,
      inv.grandTotal,
      inv.paymentStatus
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Invoices_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats computation
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalCGST = invoices.reduce((acc, inv) => acc + (inv.cgst || 0), 0);
  const totalSGST = invoices.reduce((acc, inv) => acc + (inv.sgst || 0), 0);
  const totalTax = totalCGST + totalSGST;

  return (
    <div className="flex flex-col md:h-[calc(100vh-80px)] h-auto space-y-4 text-slate-800 dark:text-slate-100 pb-4">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Finance & Auditing</p>
          <div className="flex items-center gap-2 mt-0.5">
            <FileText size={18} className="text-slate-900 dark:text-slate-100" />
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Invoice Management</h2>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-100 dark:text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Download size={13} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Receipt size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Invoices</p>
            <h3 className="text-lg font-black text-slate-950 mt-0.5">{invoices.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed Amount</p>
            <h3 className="text-lg font-black text-slate-950 mt-0.5">₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CreditCard size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collected GST</p>
            <h3 className="text-lg font-black text-slate-950 mt-0.5">₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Invoices</p>
            <h3 className="text-lg font-black text-slate-950 mt-0.5">
              {invoices.filter(i => i.paymentStatus === "Paid").length}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <Calendar size={13} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">Date Preset:</span>
          {[
            { id: "all", label: "All" },
            { id: "today", label: "Today" },
            { id: "week", label: "7 Days" },
            { id: "month", label: "30 Days" },
            { id: "custom", label: "Custom" }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => p.id === "custom" ? setDatePreset("custom") : handlePreset(p.id)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${ datePreset === p.id ? "bg-slate-900 text-slate-100 dark:text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 border border-slate-100" }`}
            >
              {p.label}
            </button>
          ))}

          {datePreset === "custom" && (
            <div className="flex items-center gap-1.5 ml-2">
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1 text-[10px] font-bold outline-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900" 
              />
              <span className="text-slate-400 text-[10px] font-black">→</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1 text-[10px] font-bold outline-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900" 
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-slate-400" />
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs outline-none font-bold bg-slate-50/50 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search INV No / Method..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-56 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 outline-none transition focus:bg-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium">
              <RotateCw className="animate-spin mr-2" size={16} /> Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <FileText size={32} className="text-slate-300" />
              <p className="text-sm font-bold">No Invoices Found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters or dates.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/75 sticky top-0 border-b border-slate-100 z-10">
                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3.5">Invoice Info</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5">GST (CGST+SGST)</th>
                  <th className="px-5 py-3.5">Grand Total</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {invoices.map(inv => (
                  <tr 
                    key={inv._id}
                    onClick={() => { setSelectedInvoice(inv); setIsDrawerOpen(true); }}
                    className="hover:bg-slate-50/60 transition cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{inv.customerId?.name || "Guest"}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{inv.customerId?.email}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-500">
                      #{String(inv.orderId?._id || inv.orderId).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-100 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      ₹{((inv.cgst || 0) + (inv.sgst || 0)).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-slate-900 dark:text-slate-100">
                      ₹{inv.grandTotal.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${ inv.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100" }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-2">
                        <a
                          href={`${backendUrl}/api/invoice/download/${inv._id}?token=${token}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Download PDF"
                          className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 transition active:scale-90"
                        >
                          <Download size={13} />
                        </a>
                        <button
                          onClick={() => handleRegenerate(inv._id)}
                          title="Re-generate PDF"
                          className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-white flex items-center justify-center text-slate-500 hover:text-indigo-600 transition active:scale-90 cursor-pointer"
                        >
                          <RotateCw size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-out Invoice Details Drawer */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isDrawerOpen ? "visible" : "invisible pointer-events-none"}`}>
        <div 
          className={`absolute inset-0 bg-slate-950/45 backdrop-blur-xs transition-opacity duration-300 ${isDrawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => { setIsDrawerOpen(false); setSelectedInvoice(null); }}
        />
        
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
          {selectedInvoice && (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {selectedInvoice.invoiceNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 mt-1">Invoice Details</h3>
                </div>
                <button 
                  onClick={() => { setIsDrawerOpen(false); setSelectedInvoice(null); }}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                
                {/* Status Card */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Status</p>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${ selectedInvoice.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200" }`}>
                      {selectedInvoice.paymentStatus === "Paid" ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {selectedInvoice.paymentStatus}
                    </span>
                  </div>
                  <a
                    href={`${backendUrl}/api/invoice/download/${selectedInvoice._id}?token=${token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-slate-900 text-slate-100 dark:text-white font-bold uppercase tracking-wider text-[10px] px-3.5 py-2 rounded-lg hover:bg-slate-800 transition shadow-xs"
                  >
                    <span>PDF Download</span>
                    <ArrowUpRight size={11} />
                  </a>
                </div>

                {/* Customer Info */}
                <div className="space-y-2">
                  <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Customer Details</p>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span className="font-bold text-slate-800 dark:text-slate-100">{selectedInvoice.customerId?.name || "Guest User"}</span>
                    </div>
                    <div>
                      <p className="text-slate-500">Email: <span className="font-bold text-slate-800 dark:text-slate-100">{selectedInvoice.customerId?.email || "N/A"}</span></p>
                      <p className="text-slate-500 mt-1">Client ID: <span className="font-mono text-slate-800 dark:text-slate-100">{selectedInvoice.customerId?._id || "N/A"}</span></p>
                    </div>
                  </div>
                </div>

                {/* Transaction details */}
                <div className="space-y-2">
                  <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Payment & Transaction</p>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Method:</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 uppercase">{selectedInvoice.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transaction ID:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100 select-all">{selectedInvoice.transactionId || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order ID:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100 select-all">#{selectedInvoice.orderId?._id || selectedInvoice.orderId}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="space-y-2">
                  <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Price Breakdown</p>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">₹{selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CGST (9.0%):</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">₹{(selectedInvoice.cgst || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SGST (9.0%):</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">₹{(selectedInvoice.sgst || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Shipping Charges:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">₹{(selectedInvoice.shippingCharges || 0).toFixed(2)}</span>
                    </div>
                    {selectedInvoice.discount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Discount:</span>
                        <span>-₹{selectedInvoice.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-200/60 pt-2 flex justify-between text-sm">
                      <span className="font-bold text-slate-700">Grand Total:</span>
                      <span className="font-black text-slate-950">₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 dark:bg-slate-950 flex gap-3">
                <button
                  onClick={() => handleRegenerate(selectedInvoice._id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900 rounded-xl px-4 py-3 text-xs font-bold uppercase text-slate-700 hover:text-indigo-600 transition active:scale-95 cursor-pointer"
                >
                  <RotateCw size={13} />
                  <span>Regenerate Invoice</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default InvoiceManagement;

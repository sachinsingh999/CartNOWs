import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import {
  FileText, Search, Download, CheckCircle, Clock, X,
  ArrowUpRight, DollarSign, Receipt, CreditCard, ChevronRight, User
} from "lucide-react";

const SellerInvoices = ({ token }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Drawer for invoice details
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchSellerInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/invoice/seller-invoices`, {
        headers: { token }
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
    fetchSellerInvoices();
  }, []);

  const filteredInvoices = invoices
    .filter(inv => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.paymentMethod.toLowerCase().includes(q) ||
        String(inv.orderId?._id || inv.orderId).toLowerCase().includes(q)
      );
    })
    .filter(inv => {
      if (!statusFilter) return true;
      return inv.paymentStatus === statusFilter;
    });

  // Financial aggregates
  const totalBilled = filteredInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalPaidCount = filteredInvoices.filter(i => i.paymentStatus === "Paid").length;

  return (
    <div className="flex flex-col lg:h-[calc(100vh-160px)] space-y-4 text-slate-800 dark:text-slate-100 pb-24 lg:pb-0">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order Manifests</p>
          <div className="flex items-center gap-2 mt-0.5">
            <FileText size={18} className="text-brand" />
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Tax Invoices</h2>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-brand flex items-center justify-center">
            <Receipt size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Invoices</p>
            <h3 className="text-lg font-black text-slate-950 dark:text-slate-100 mt-0.5">{filteredInvoices.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-605 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Order Value</p>
            <h3 className="text-lg font-black text-slate-950 dark:text-slate-100 mt-0.5">₹{totalBilled.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Status Invoices</p>
            <h3 className="text-lg font-black text-slate-950 dark:text-slate-100 mt-0.5">{totalPaidCount}</h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search Invoice No / Order ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 outline-none transition focus:bg-white dark:focus:bg-slate-900 font-bold"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl px-2.5 py-1.5 text-xs outline-none font-bold bg-slate-50/50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="">All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium">
              <span className="animate-pulse mr-2">Fetching invoices...</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <FileText size={32} className="text-slate-300" />
              <p className="text-sm font-bold">No Invoices Located</p>
              <p className="text-xs text-slate-500">Orders must be Paid or COD-Delivered to issue invoices.</p>
            </div>
          ) : (
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50/75 dark:bg-slate-950/80 sticky top-0 z-10">
                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3.5">Invoice</th>
                  <th className="px-5 py-3.5">Order Ref</th>
                  <th className="px-5 py-3.5">Payment Mode</th>
                  <th className="px-5 py-3.5">Taxes Billed</th>
                  <th className="px-5 py-3.5">Order Total</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {filteredInvoices.map(inv => (
                  <tr
                    key={inv._id}
                    onClick={() => { setSelectedInvoice(inv); setIsDrawerOpen(true); }}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-500">
                      #{String(inv.orderId?._id || inv.orderId).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-100 dark:bg-slate-950 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${ inv.paymentStatus === "Paid" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-950/20 text-amber-705 dark:text-amber-400" }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <a
                        href={`${backendUrl}/api/invoice/download/${inv._id}?token=${token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-950 items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition active:scale-90"
                      >
                        <Download size={13} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>

      {/* Drawer */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isDrawerOpen ? "visible" : "invisible pointer-events-none"}`}>
        <div 
          className={`absolute inset-0 bg-slate-950/45 backdrop-blur-xs transition-opacity duration-300 ${isDrawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => { setIsDrawerOpen(false); setSelectedInvoice(null); }}
        />
        
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
          {selectedInvoice && (
            <>
              {/* Header */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded">
                      {selectedInvoice.invoiceNumber}
                    </span>
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 mt-1">Invoice Details</h3>
                </div>
                <button 
                  onClick={() => { setIsDrawerOpen(false); setSelectedInvoice(null); }}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                {/* Status card */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed Status</p>
                    <span className="font-black text-sm text-slate-900 dark:text-slate-100 mt-1 block">
                      ₹{selectedInvoice.grandTotal.toFixed(2)}
                    </span>
                  </div>
                  <a
                    href={`${backendUrl}/api/invoice/download/${selectedInvoice._id}?token=${token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-brand text-white font-bold uppercase tracking-wider text-[10px] px-3.5 py-2 rounded-lg hover:bg-orange-600 transition shadow-xs"
                  >
                    <span>Download PDF</span>
                    <ArrowUpRight size={11} />
                  </a>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Metadata</p>
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-xl p-4 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-550 dark:text-slate-400">Transaction:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">{selectedInvoice.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550 dark:text-slate-400">Order Date:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550 dark:text-slate-400">Order Reference:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100 select-all">#{selectedInvoice.orderId?._id || selectedInvoice.orderId}</span>
                    </div>
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="space-y-2">
                  <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Order Totals</p>
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-xl p-4 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-550 dark:text-slate-400">Order Subtotal:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">₹{selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550 dark:text-slate-400">CGST (9.0%):</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">₹{(selectedInvoice.cgst || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550 dark:text-slate-400">SGST (9.0%):</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">₹{(selectedInvoice.sgst || 0).toFixed(2)}</span>
                    </div>
                    {selectedInvoice.discount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Discount:</span>
                        <span>-₹{selectedInvoice.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-2 flex justify-between text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-350">Gross Total:</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default SellerInvoices;

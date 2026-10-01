import React from "react";
import { X, Printer, Download, CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PackingSlipModal = ({
  isOpen,
  onClose,
  order,
  seller
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const orderId = order._id || "";
  const orderNum = order.orderNumber || `ORD-${orderId.slice(-8).toUpperCase()}`;
  const items = order.items || [];
  const customerName = `${order.address?.firstName || "Valued"} ${order.address?.lastName || "Customer"}`.trim();
  const customerPhone = order.address?.phone || order.address?.mobile || "—";
  const street = order.address?.street || "";
  const city = order.address?.city || "";
  const state = order.address?.state || "";
  const pin = order.address?.zipCode || order.address?.zipcode || order.address?.pincode || "";

  const orderDate = new Date(order.createdAt || order.date || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs print:hidden"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 text-left print:border-none print:shadow-none print:max-h-none print:p-0 print:m-0 print:w-full print:max-w-none print:bg-white print:text-black"
        >
          {/* Top Control Bar (Hidden on print) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <Printer size={16} className="text-amber-500" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Print Packing Manifest & Shipping Slip
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Document</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Printable Packing Slip Sheet */}
          <div className="p-6 sm:p-8 overflow-y-auto bg-white text-slate-900 custom-scrollbar space-y-6 print:p-0 print:space-y-4 font-sans text-xs">
            {/* Manifest Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  CART<span className="text-amber-600">NOW</span> EXPRESS
                </h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Official Merchant Dispatch Slip
                </p>
                <div className="mt-2 text-[11px] leading-tight text-slate-600">
                  <p className="font-bold text-slate-900">{seller?.shopName || "CartNOW Partner Merchant"}</p>
                  <p>Seller ID: {seller?._id || "SELLER-999"}</p>
                  <p>{seller?.email || "seller@cartnow.in"}</p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="inline-block border-2 border-slate-900 px-3 py-1 text-center">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Order Number
                  </span>
                  <span className="font-mono font-black text-sm text-slate-900">
                    {orderNum}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Date: <strong>{orderDate}</strong></p>
                <p className="text-[10px] text-slate-500">Payment: <strong className="uppercase">{order.paymentMethod || "Prepaid"}</strong></p>
              </div>
            </div>

            {/* Delivery Destination & Courier Route */}
            <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 rounded-lg bg-slate-50">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                  Deliver To (Customer)
                </span>
                <p className="font-black text-xs text-slate-900">{customerName}</p>
                <p className="text-[11px] text-slate-700 leading-tight mt-0.5">
                  {street && <span>{street}<br/></span>}
                  {city}, {state} - <strong>{pin}</strong>
                </p>
                <p className="text-[11px] font-bold text-slate-900 mt-1">Contact: {customerPhone}</p>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                  Logistics & Courier Routing
                </span>
                <p className="font-bold text-xs text-slate-900">CartNOW Local Express Dispatch</p>
                <p className="text-[11px] text-slate-600">
                  Agent: <strong>{order.deliverymanId?.name || "Automated Courier Assigned"}</strong>
                </p>
                <p className="text-[11px] text-slate-600">
                  Vehicle: <strong>{order.deliverymanId?.vehicleType || "Standard Delivery"}</strong>
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Verification Code: <strong>{order.verificationCode || "AUTO-VERIFIED"}</strong></p>
              </div>
            </div>

            {/* Itemized Packing Table */}
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">
                Warehouse Pick & Pack Contents
              </span>
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-[9px] font-black uppercase text-slate-600">
                    <th className="py-2 px-2.5">#</th>
                    <th className="py-2 px-2.5">Item Description</th>
                    <th className="py-2 px-2.5">Size / Variant</th>
                    <th className="py-2 px-2.5 text-center">Qty</th>
                    <th className="py-2 px-2.5 text-right">Price</th>
                    <th className="py-2 px-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => {
                    const name = item.name || item.productName || "Product Item";
                    const price = Number(item.price || item.unitPrice || 0);
                    const qty = Number(item.qty || item.quantity || 1);

                    return (
                      <tr key={idx}>
                        <td className="py-2 px-2.5 font-mono text-[10px]">{idx + 1}</td>
                        <td className="py-2 px-2.5 font-bold text-slate-900">
                          {name}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 text-[11px]">
                          {item.size ? `Size: ${item.size}` : "Standard"}
                        </td>
                        <td className="py-2 px-2.5 text-center font-black text-slate-900">
                          {qty}
                        </td>
                        <td className="py-2 px-2.5 text-right font-medium">
                          ₹{price.toFixed(2)}
                        </td>
                        <td className="py-2 px-2.5 text-right font-bold text-slate-900">
                          ₹{(price * qty).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals & Signature */}
            <div className="flex justify-between items-end pt-2">
              <div className="w-1/2 space-y-1 text-[10px] text-slate-500">
                <p>• Please inspect packaging seal upon delivery handoff.</p>
                <p>• Questions? Visit <strong>cartnow.in/support</strong></p>
                <div className="pt-6">
                  <div className="border-t border-slate-400 w-40 pt-1 text-[9px] font-bold uppercase text-slate-600">
                    Authorized Signatory
                  </div>
                </div>
              </div>

              <div className="w-1/3 border border-slate-300 p-2.5 rounded bg-slate-50 text-right space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold">₹{(Number(order.subtotal || order.amount) || 0).toFixed(2)}</span>
                </div>
                {Number(order.shippingFee) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping:</span>
                    <span className="font-bold">₹{Number(order.shippingFee).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-slate-300 pt-1 flex justify-between font-black text-sm text-slate-900">
                  <span>Total Amount:</span>
                  <span>₹{(Number(order.amount) || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PackingSlipModal;

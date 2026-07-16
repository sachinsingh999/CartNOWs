import React from "react";
import { ShoppingBag } from "lucide-react";

const Orders = ({ orders = [] }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Customer Orders</h2>
        <p className="text-xs text-slate-400 mt-0.5">Track, monitor, and fulfill customer orders placed at your shop.</p>
      </div>

      {orders.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3 bg-white dark:bg-slate-900">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 border border-slate-100">
            <ShoppingBag size={20} />
          </div>
          <div className="max-w-xs mx-auto">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">No orders received yet</p>
            <p className="text-xs text-slate-400 mt-1">Customer orders will appear here as soon as they purchase your products.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order ID</span>
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">#{order._id.slice(-8)}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-405 dark:text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ order.orderStatus === "Delivered" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50" : order.orderStatus === "Cancelled" ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50" : "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-100/50 dark:border-orange-900/40" }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Items Ordered</div>
                <div className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="space-y-2 bg-slate-50/50 dark:bg-slate-950/30 p-3 rounded-lg border border-slate-100 dark:border-slate-805">
                      <div className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <div>
                          <span className="text-slate-800 dark:text-slate-100 font-bold">{item.name}</span>
                          {item.qty && <span className="text-slate-400 dark:text-slate-500 ml-1.5">x {item.qty}</span>}
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">₹{(item.price * (item.qty || 1)).toFixed(2)}</span>
                      </div>
                      
                      {/* Product Rating & Reviews summary */}
                      {item.averageRating > 0 && (
                        <div className="border-t border-slate-200/50 dark:border-slate-800/60 pt-2 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Product Rating:</span>
                            <div className="flex items-center text-amber-500 gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < Math.round(item.averageRating) ? "★" : "☆"} />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">({item.averageRating.toFixed(1)} / 5)</span>
                          </div>

                          {/* Reviews List */}
                          {item.reviews && item.reviews.length > 0 && (
                            <div className="space-y-1 pl-2 border-l border-orange-500/30">
                              {item.reviews.slice(0, 2).map((rev, rIdx) => (
                                <div key={rIdx} className="text-[10px] text-slate-600 dark:text-slate-400">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{rev.name}:</span> "{rev.comment}"
                                  <span className="text-amber-550 dark:text-amber-450 font-semibold ml-1">({rev.rating}★)</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping, Delivery Agent & Payment details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs border-t border-slate-50 dark:border-slate-800/80">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Shipping Destination</div>
                  <p className="text-slate-700 dark:text-slate-300 leading-normal">
                    <strong className="text-slate-900 dark:text-slate-100">{order.address?.firstName} {order.address?.lastName}</strong><br/>
                    {order.address?.street}, {order.address?.city}<br/>
                    {order.address?.state}, {order.address?.zipCode || order.address?.zipcode || order.address?.pincode || ""}<br/>
                    Phone: {order.address?.phone || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned Delivery Agent</div>
                  {order.deliverymanId ? (
                    <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{order.deliverymanId.name || "Assigned"}</p>
                      <p>Phone: {order.deliverymanId.phone || "—"}</p>
                      <p>Vehicle: {order.deliverymanId.vehicleType || "—"}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 italic">No agent assigned yet</p>
                  )}
                </div>
                <div className="space-y-1 sm:text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Value</div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">₹{order.amount?.toFixed(2)}</h3>
                  <p className="text-[10px] text-slate-400">Payment status: <span className="font-bold text-slate-600 dark:text-slate-400 uppercase">{(order.paymentStatus === "paid" || order.paymentStatus === "Paid") ? "Paid" : "Pending"}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;

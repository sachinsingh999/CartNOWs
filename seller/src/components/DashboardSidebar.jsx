import React from "react";

const DashboardSidebar = ({
  lowStockItems,
  topSellers,
  navigate
}) => {
  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 tracking-tight">Low Stock Warning</h3>
        {lowStockItems.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">All product stock levels are healthy.</p>
        ) : (
          <div className="space-y-2">
            {lowStockItems.slice(0, 3).map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-500/5 text-xs">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-bold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-red-600 font-extrabold mt-0.5">Critical: {item.stock} left</p>
                </div>
                <button
                  onClick={() => navigate("/inventory")}
                  className="bg-red-600 hover:bg-red-750 hover:bg-red-750 text-white font-black text-[9px] uppercase px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer shadow-sm shadow-red-500/10 hover:shadow-md"
                >
                  Replenish
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Selling Products */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 tracking-tight">Top Performing Items</h3>
        {topSellers.length === 0 ? (
          <p className="text-xs text-slate-550 py-2">Add items to view performance metrics.</p>
        ) : (
          <div className="space-y-3.5">
            {topSellers.map((item) => (
              <div key={item._id} className="flex items-center gap-3.5 hover:bg-slate-50/50 p-1 rounded-xl transition duration-150">
                <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 uppercase font-black">Item</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-slate-800 text-xs truncate">{item.name}</p>
                  <p className="text-[10px] text-[#FF5100] font-black mt-0.5">₹{item.price?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;

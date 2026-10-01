import React from "react";
import { 
  PlusCircle, 
  Package, 
  Tag, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const QuickActionsGrid = ({ 
  navigate, 
  onOpenOfferModal, 
  onOpenPayoutModal 
}) => {
  const actions = [
    {
      id: "add_product",
      label: "Add Product",
      desc: "Create new listing",
      icon: PlusCircle,
      iconColor: "text-slate-950",
      bgGradient: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black",
      isPrimary: true,
      onClick: () => navigate("/add-product")
    },
    {
      id: "manage_products",
      label: "Manage Products",
      desc: "Edit catalog & SKUs",
      icon: Package,
      iconColor: "text-amber-500 dark:text-amber-400",
      bgGradient: "bg-white dark:bg-[#0F172A] hover:bg-amber-50/50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80",
      onClick: () => navigate("/products")
    },
    {
      id: "create_offer",
      label: "Create Offer",
      desc: "Boost store conversions",
      icon: Tag,
      iconColor: "text-amber-500 dark:text-amber-400",
      bgGradient: "bg-white dark:bg-[#0F172A] hover:bg-amber-50/50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80",
      onClick: () => onOpenOfferModal ? onOpenOfferModal() : navigate("/revenue")
    },
    {
      id: "view_analytics",
      label: "View Analytics",
      desc: "Deep-dive trends",
      icon: TrendingUp,
      iconColor: "text-slate-700 dark:text-slate-300",
      bgGradient: "bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80",
      onClick: () => navigate("/analytics")
    },
    {
      id: "withdraw_earnings",
      label: "Withdraw Earnings",
      desc: "Request bank payout",
      icon: DollarSign,
      iconColor: "text-amber-600 dark:text-amber-400",
      bgGradient: "bg-white dark:bg-[#0F172A] hover:bg-amber-50/50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80",
      onClick: () => onOpenPayoutModal ? onOpenPayoutModal() : navigate("/revenue")
    },
    {
      id: "manage_inventory",
      label: "Manage Inventory",
      desc: "Stock & low alerts",
      icon: Layers,
      iconColor: "text-slate-700 dark:text-slate-300",
      bgGradient: "bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80",
      onClick: () => navigate("/inventory")
    }
  ];

  return (
    <div className="space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-500" />
          <span>Quick Actions</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <motion.button
              key={act.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={act.onClick}
              className={`p-2 sm:p-2.5 rounded-xl flex flex-col justify-between items-start text-left min-h-[70px] shadow-xs transition-all cursor-pointer ${act.bgGradient}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-1 rounded-md ${act.isPrimary ? "bg-slate-950/10 text-slate-950" : "bg-slate-100 dark:bg-slate-800"}`}>
                  <Icon size={13} className={act.iconColor} />
                </div>
                <ArrowRight size={12} className={act.isPrimary ? "text-slate-950/80" : "text-slate-400"} />
              </div>

              <div className="mt-1">
                <p className="text-xs font-black tracking-tight leading-tight">
                  {act.label}
                </p>
                <p className={`text-[9px] truncate mt-0.5 ${act.isPrimary ? "text-slate-900 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
                  {act.desc}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsGrid;

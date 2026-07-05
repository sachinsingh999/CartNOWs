import React from "react";
import { NavLink } from "react-router-dom";
import { 
  BarChart3,
  ClipboardList, 
  ShoppingBag, 
  RotateCcw, 
  MessageSquare,
  Users,
  Megaphone,
  Ticket,
  Layers,
  Award,
  Store,
  UserCheck,
  Box,
  DollarSign,
  Bell,
  Shield,
  FileText,
  Settings,
  Flame
} from "lucide-react";



const Sidebar = ({ isCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-colors duration-150 group relative overflow-hidden shrink-0
     ${isActive
       ? "bg-slate-900 dark:bg-blue-600 text-white shadow-sm"
       : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:text-slate-900 dark:hover:text-white"}`;

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const groups = [
    {
      title: "Operations",
      links: [
        { path: "/", label: "Dashboard", icon: BarChart3 },
        { path: "/orders", label: "Orders Board", icon: ShoppingBag },
        { path: "/returns", label: "Returns", icon: RotateCcw },
        { path: "/deliverymen", label: "Deliverymen", icon: Users },
        { path: "/invoices", label: "Invoices", icon: FileText },
      ]
    },
    {
      title: "Commerce",
      links: [
        { path: "/list", label: "Product List", icon: ClipboardList },
        { path: "/categories", label: "Categories", icon: Layers },
        { path: "/collections-brands", label: "Collections & Brands", icon: Award },
        { path: "/product-moderation", label: "Moderation", icon: Box },
        { path: "/sellers", label: "Sellers", icon: Store },
        { path: "/customers", label: "Customers", icon: UserCheck },
        { path: "/hero-slideshow", label: "Hero Models", icon: Megaphone },
        { path: "/banners", label: "Hero Banners", icon: Megaphone },
        { path: "/deal-of-the-day", label: "Deal of Day", icon: Flame },
      ]
    },
    {
      title: "Finance & Promos",
      links: [
        { path: "/finance", label: "Finance & Fees", icon: DollarSign },
        { path: "/sales", label: "Sales & Promos", icon: Megaphone },
        { path: "/coupons", label: "Promo Coupons", icon: Ticket },
      ]
    },
    {
      title: "Support",
      links: [
        { path: "/support", label: "Tickets", icon: MessageSquare },
      ]
    },
    {
      title: "System",
      links: [
        { path: "/settings", label: "System Settings", icon: Settings },
        { path: "/notifications", label: "Notifications", icon: Bell },
        { path: "/logs", label: "Audit Logs", icon: Shield },
      ]
    }
  ];

  return (
    <aside 
      className={`bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-white/[0.08] p-3 flex flex-col justify-between overflow-y-auto custom-scrollbar shrink-0 transition-all duration-300 /* Desktop stickiness */ md:sticky md:top-0 md:z-auto ${isCollapsed ? "md:w-[64px]" : "md:w-[210px]"} /* Mobile sliding drawer overlay */ fixed top-[60px] bottom-0 left-0 w-[240px] z-45 ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      <div className="space-y-5">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5 flex flex-col">
            {/* Show title on mobile sidebar since it's fully expanded, and on expanded desktop sidebar */}
            {(!isCollapsed || window.innerWidth < 768) && (
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1 shrink-0">
                {group.title}
              </p>
            )}
            <div className="space-y-1 flex flex-col">
              {group.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink 
                    key={link.path} 
                    to={link.path} 
                    className={linkClass}
                    onClick={handleLinkClick}
                    end={link.path === "/"}
                  >
                    <Icon size={18} className="shrink-0" />
                    
                    {(!isCollapsed || window.innerWidth < 768) ? (
                      <span className="truncate">{link.label}</span>
                    ) : (
                      <span className="absolute left-[60px] rounded-lg bg-slate-900 dark:bg-slate-900 border border-slate-700 dark:border-white/[0.08] px-2.5 py-1.5 text-xs font-bold text-slate-100 dark:text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 shadow-lg">
                        {link.label}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {(!isCollapsed || window.innerWidth < 768) && (
        <div className="border-t border-slate-200 dark:border-white/[0.06] pt-3 px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>v1.2.0-Prod</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      )}
    </aside>
  );
};


export default Sidebar;

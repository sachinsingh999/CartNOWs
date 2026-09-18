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
  Flame,
  ShieldCheck,
  Sparkles,
  Image as ImageIcon
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { hasPermission, isSuperAdmin } = useAuth();

  const linkClass = ({ isActive }) =>
    `relative flex items-center h-10 px-2.5 rounded-xl font-medium text-xs transition-colors duration-150 group shrink-0 select-none ${
      isActive
        ? "bg-blue-600 text-white shadow-xs"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
    }`;

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const groups = [
    {
      title: "Operations",
      links: [
        { path: "/", label: "Dashboard", icon: BarChart3, superAdminOnly: true },
        { path: "/orders", label: "Orders Board", icon: ShoppingBag, permission: "orders" },
        { path: "/returns", label: "Returns", icon: RotateCcw, permission: "returns" },
        { path: "/deliverymen", label: "Deliverymen", icon: Users, permission: "deliverymen" },
        { path: "/invoices", label: "Invoices", icon: FileText, permission: "finance" },
      ]
    },
    {
      title: "Catalog & Merchants",
      links: [
        { path: "/list", label: "Product List", icon: ClipboardList, permission: "products" },
        { path: "/categories", label: "Categories", icon: Layers, permission: "products" },
        { path: "/collections-brands", label: "Collections & Brands", icon: Award, permission: "products" },
        { path: "/product-moderation", label: "Moderation", icon: Box, permission: "products" },
        { path: "/sellers", label: "Sellers", icon: Store, permission: "sellers" },
        { path: "/customers", label: "Customers", icon: UserCheck, permission: "customers" },
      ]
    },
    {
      title: "Marketing & Campaigns",
      links: [
        { path: "/hero-slideshow", label: "Hero Models", icon: Sparkles, permission: "promos" },
        { path: "/banners", label: "Hero Banners", icon: Megaphone, permission: "promos" },
        { path: "/brand-posters", label: "Brand Posters", icon: Award, permission: "promos" },
        { path: "/deal-of-the-day", label: "Deal of Day", icon: Flame, permission: "promos" },
        { path: "/featured-showcase", label: "Featured Deals", icon: Award, permission: "promos" },
        { path: "/promo-banners", label: "Ad Banners", icon: ImageIcon, permission: "promos" },
        { path: "/sales", label: "Sales & Promos", icon: Megaphone, permission: "promos" },
        { path: "/coupons", label: "Promo Coupons", icon: Ticket, permission: "promos" },
      ]
    },
    {
      title: "Finance & Support",
      links: [
        { path: "/finance", label: "Finance & Fees", icon: DollarSign, permission: "finance" },
        { path: "/support", label: "Support Tickets", icon: MessageSquare, permission: "support" },
      ]
    },
    {
      title: "System & Governance",
      links: [
        { path: "/sub-admins", label: "Sub-Admins & Team", icon: ShieldCheck, permission: "subadmins" },
        { path: "/notifications", label: "Notifications", icon: Bell },
        { path: "/settings", label: "System Settings", icon: Settings, superAdminOnly: true },
        { path: "/logs", label: "Audit Logs", icon: Shield, superAdminOnly: true },
      ]
    }
  ];

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => {
        if (isSuperAdmin) return true;
        if (link.superAdminOnly) return false;
        if (!link.permission) return true;
        return hasPermission(link.permission);
      }),
    }))
    .filter((group) => group.links.length > 0);

  return (
    <aside 
      className={`bg-white/95 dark:bg-slate-900/95 border-r border-slate-200/80 dark:border-slate-800/80 p-3 flex flex-col justify-between overflow-y-auto overflow-x-hidden custom-scrollbar shrink-0 select-none
        transition-[width,min-width,transform] duration-280 ease-[cubic-bezier(0.2,0,0,1)] will-change-[width,min-width,transform]
        md:sticky md:top-0 md:z-auto ${isCollapsed ? "md:w-[68px] md:min-w-[68px]" : "md:w-[240px] md:min-w-[240px]"}
        fixed top-[64px] bottom-0 left-0 w-[250px] z-40 ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      <div className="space-y-4">
        {visibleGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-0.5 flex flex-col">
            {/* Stable height section header with smooth opacity fade */}
            <div className="h-5 px-2.5 flex items-center overflow-hidden shrink-0">
              <span 
                className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap transition-opacity duration-180 ${
                  isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                {group.title}
              </span>
            </div>

            {/* Menu Links */}
            <div className="space-y-0.5 flex flex-col">
              {group.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink 
                    key={link.path} 
                    to={link.path} 
                    className={linkClass}
                    onClick={handleLinkClick}
                    end={link.path === "/"}
                    title={isCollapsed ? link.label : undefined}
                  >
                    {/* Fixed 24px icon box prevents horizontal jitter */}
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <Icon size={18} />
                    </div>
                    
                    {/* Smooth fading label without reflow or max-width stutter */}
                    <span 
                      className={`ml-3 truncate whitespace-nowrap text-xs font-medium transition-opacity duration-180 ${
                        isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                      }`}
                    >
                      {link.label}
                    </span>

                    {/* Floating Tooltip when collapsed */}
                    {isCollapsed && (
                      <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 border border-slate-700/60 text-white text-xs font-semibold whitespace-nowrap shadow-xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        {link.label}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Version & Health Status */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-3 px-2.5 h-10 flex items-center justify-between overflow-hidden shrink-0">
        <span 
          className={`text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate whitespace-nowrap transition-opacity duration-180 ${
            isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          v2.5 Enterprise
        </span>
        <span 
          className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" 
          title="System Online" 
        />
      </div>
    </aside>
  );
};

export default Sidebar;

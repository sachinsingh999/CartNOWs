import React from "react";
import { NavLink } from "react-router-dom";
import { 
  BarChart3,
  PlusCircle, 
  ClipboardList, 
  ShoppingBag, 
  RotateCcw, 
  MessageSquare,
  Users,
  Megaphone,
  Ticket
} from "lucide-react";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200
   ${isActive
     ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]"
     : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`;

const Sidebar = () => {
  return (
    <aside className="bg-white border-r border-slate-200/80 p-4 w-16 md:w-60 transition-all duration-300 space-y-2">
      
      {/* Dashboard */}
      <NavLink to="/" className={linkClass} end>
        <BarChart3 size={18} className="shrink-0" />
        <span className="hidden md:inline">Dashboard</span>
      </NavLink>

      {/* Add Product */}
      <NavLink to="/add" className={linkClass}>
        <PlusCircle size={18} className="shrink-0" />
        <span className="hidden md:inline">Add Product</span>
      </NavLink>

      {/* Product List */}
      <NavLink to="/list" className={linkClass}>
        <ClipboardList size={18} className="shrink-0" />
        <span className="hidden md:inline">Product List</span>
      </NavLink>

      {/* Orders */}
      <NavLink to="/orders" className={linkClass}>
        <ShoppingBag size={18} className="shrink-0" />
        <span className="hidden md:inline">Orders</span>
      </NavLink>

      {/* Returns */}
      <NavLink to="/returns" className={linkClass}>
        <RotateCcw size={18} className="shrink-0" />
        <span className="hidden md:inline">Returns</span>
      </NavLink>

      {/* Deliverymen */}
      <NavLink to="/deliverymen" className={linkClass}>
        <Users size={18} className="shrink-0" />
        <span className="hidden md:inline">Deliverymen</span>
      </NavLink>

      {/* Support */}
      <NavLink to="/support" className={linkClass}>
        <MessageSquare size={18} className="shrink-0" />
        <span className="hidden md:inline">Support Tickets</span>
      </NavLink>

      {/* Sales & Promotions */}
      <NavLink to="/sales" className={linkClass}>
        <Megaphone size={18} className="shrink-0" />
        <span className="hidden md:inline">Sales & Promos</span>
      </NavLink>

      {/* Coupons */}
      <NavLink to="/coupons" className={linkClass}>
        <Ticket size={18} className="shrink-0" />
        <span className="hidden md:inline">Promo Coupons</span>
      </NavLink>

    </aside>
  );
};

export default Sidebar;

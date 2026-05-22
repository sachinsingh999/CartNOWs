import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-md transition
   ${isActive
     ? "bg-gray-200 text-gray-900"
     : "text-gray-700 hover:bg-gray-100"}`;

const Sidebar = () => {
  return (
    <aside className="min-h-screen bg-gray-100 border-r p-2 md:p-4
                     w-14 md:w-56 transition-all duration-300">
      
      {/* Add Product */}
      <NavLink to="/add" className={linkClass}>
        <img
          src={assets.add_icon}
          alt="Add Product"
          className="w-5 h-5 flex-shrink-0"
        />
        {/* Text hidden on phone */}
        <span className="hidden md:inline text-sm font-medium">
          Add Product
        </span>
      </NavLink>

      {/* Product List */}
      <NavLink to="/list" className={linkClass}>
        <img
          src={assets.order_icon}
          alt="Product List"
          className="w-5 h-5 flex-shrink-0"
        />
        <span className="hidden md:inline text-sm font-medium">
          Product List
        </span>
      </NavLink>

      {/* Orders */}
      <NavLink to="/orders" className={linkClass}>
        <img
          src={assets.order_icon}
          alt="Orders"
          className="w-5 h-5 flex-shrink-0"
        />
        <span className="hidden md:inline text-sm font-medium">
          Orders
        </span>
      </NavLink>

      <NavLink to="/returns" className={linkClass}>
        <img
          src={assets.parcel_icon}
          alt="Returns"
          className="w-5 h-5 flex-shrink-0"
        />
        <span className="hidden md:inline text-sm font-medium">
          Returns
        </span>
      </NavLink>

      <NavLink to="/support" className={linkClass}>
        <img
          src={assets.order_icon}
          alt="Support"
          className="w-5 h-5 flex-shrink-0"
        />
        <span className="hidden md:inline text-sm font-medium">
          Support
        </span>
      </NavLink>

    </aside>
  );
};

export default Sidebar;

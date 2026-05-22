import React from "react";
import { NavLink } from "react-router-dom";

const Category = () => {
  const baseClass =
    "px-6 py-2 border rounded-full transition-all duration-300";

  const activeClass =
    "bg-black text-white scale-105 shadow-md";

  const inactiveClass =
    "text-gray-700 hover:bg-gray-200";

  return (
    <div className="flex justify-center gap-6 mb-12">
      <NavLink
        to="/product/men"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        Men
      </NavLink>

      <NavLink
        to="/product/women"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        Women
      </NavLink>

      <NavLink
        to="/product/kid"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        Kid
      </NavLink>
    </div>
  );
};

export default Category;

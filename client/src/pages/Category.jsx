import React from "react";
import { NavLink } from "react-router-dom";

const Category = () => {
  const baseClass =
    "px-6 py-2 border border-gray-200 dark:border-slate-800 rounded-full transition-all duration-300";

  const activeClass =
    "bg-black dark:bg-orange-500 text-white dark:text-slate-950 scale-105 shadow-md dark:shadow-slate-950/40";

  const inactiveClass =
    "text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-900";

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

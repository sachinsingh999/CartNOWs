import React from "react";

const NavBar = ({setToken}) => {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-gray-900 text-white shadow-md">
      {/* Left */}
      <div className="flex flex-col leading-tight">
        <span className="text-xl font-bold">CartNow</span>
        <span className="text-xs text-gray-400">Admin Panel</span>
      </div>

      {/* Right */}
      <button  onClick={()=>setToken('')}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition">
        Logout
      </button>
    </nav>
  );
};

export default NavBar;

import React from "react";
import logoImg from "../assets/logo.webp";

const Logo = ({ variant = "horizontal", className = "", forceWhite = false, ...props }) => {
  const isIcon = variant === "icon";

  const filterClass = forceWhite 
    ? "brightness-0 invert" 
    : "dark:brightness-0 dark:invert";

  if (isIcon) {
    return (
      <div 
        className={`overflow-hidden flex items-center justify-start rounded-lg ${className}`} 
        {...props}
      >
        <img
          src={logoImg}
          alt="CartNow Icon"
          className={`h-[480%] max-w-none object-cover ${filterClass}`}
          style={{ 
            transform: "scale(4.8) translate(-10.5%, 0%)", 
            transformOrigin: "left center" 
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center aspect-[3.2/1] ${className}`} 
      {...props}
    >
      <img
        src={logoImg}
        alt="CartNow Logo"
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[220%] w-[150%] object-cover object-center ${filterClass}`}
        style={{ transform: "scale(1.2)" }}
      />
    </div>
  );
};

export default Logo;

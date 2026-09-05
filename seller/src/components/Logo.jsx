import React from "react";
import logoImg from "../assets/logo.png";
import logoIcon from "../assets/logo_icon.png";

const Logo = ({ variant = "horizontal", className = "", forceWhite = false, ...props }) => {
  const isIcon = variant === "icon";

  if (isIcon) {
    return (
      <div 
        className={`relative overflow-hidden flex items-center justify-center shrink-0 ${className}`} 
        {...props}
      >
        <img
          src={logoIcon}
          alt="CartNow Icon"
          className="h-full w-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 overflow-hidden ${className}`} 
      {...props}
    >
      <img
        src={logoImg}
        alt="CartNow Logo"
        className="h-full w-auto max-w-none object-contain drop-shadow-sm"
      />
    </div>
  );
};

export default Logo;

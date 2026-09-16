import React from "react";
import logoLight from "../assets/logo_light.webp";
import logoDark from "../assets/logo_dark.webp";
import logoIcon from "../assets/logo_icon.webp";

const Logo = ({ variant = "horizontal", className = "", forceWhite = false, ...props }) => {
  const isIcon = variant === "icon";

  if (isIcon) {
    return (
      <div 
        className={`relative flex items-center justify-center shrink-0 ${className}`} 
        {...props}
      >
        <img
          src={logoIcon}
          alt="CartNow Icon"
          className="h-full w-auto max-h-full object-contain"
        />
      </div>
    );
  }

  if (forceWhite) {
    return (
      <div 
        className={`relative flex items-center justify-center shrink-0 ${className}`} 
        {...props}
      >
        <img
          src={logoDark}
          alt="CartNow Logo"
          className="h-full w-auto max-h-full object-contain drop-shadow-xs"
        />
      </div>
    );
  }

  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 ${className}`} 
      {...props}
    >
      <img
        src={logoLight}
        alt="CartNow Logo"
        className="h-full w-auto max-h-full object-contain drop-shadow-xs dark:hidden block"
      />
      <img
        src={logoDark}
        alt="CartNow Logo"
        className="h-full w-auto max-h-full object-contain drop-shadow-xs dark:block hidden"
      />
    </div>
  );
};

export default Logo;

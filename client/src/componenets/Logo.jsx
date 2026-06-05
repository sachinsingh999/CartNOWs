import React from "react";

const Logo = ({ variant = "horizontal", className = "", ...props }) => {
  const isIcon = variant === "icon";

  return (
    <svg
      viewBox={isIcon ? "2 14 96 59" : "0 0 240 80"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Wind trails (speed lines) */}
      <line
        x1="10"
        y1="30"
        x2="26"
        y2="30"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="4"
        y1="38"
        x2="20"
        y2="38"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="12"
        y1="46"
        x2="28"
        y2="46"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Cart Handle */}
      <path
        d="M 34 24 L 24 17 L 22 22"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Cart Basket */}
      <path
        d="M 34 24 H 96 L 84 52 H 44 Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Chassis & Wheel Mounts */}
      <path
        d="M 38 52 L 44 59 H 84"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Wheels as perfect rings using strokeWidth="4" and r="4" so the center is transparent */}
      <circle
        cx="46"
        cy="66"
        r="4.5"
        stroke="currentColor"
        strokeWidth="4.5"
        fill="none"
      />
      <circle
        cx="82"
        cy="66"
        r="4.5"
        stroke="currentColor"
        strokeWidth="4.5"
        fill="none"
      />

      {/* Text inside basket */}
      <text
        x="65"
        y="42"
        fill="#f97316"
        fontSize="23"
        fontWeight="900"
        fontFamily="'Inter', 'Arial Black', sans-serif"
        fontStyle="italic"
        textAnchor="middle"
      >
        cart
      </text>

      {!isIcon && (
        <>
          {/* Rope / Connection leash */}
          <line
            x1="96"
            y1="36"
            x2="114"
            y2="36"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Pulling Figure 'n' */}
          <path
            d="M 112 56 L 118 44 L 125 32 C 128 27 134 27 137 32 L 142 44 L 148 56"
            stroke="currentColor"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 121 39 H 114"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Letters 'ow' */}
          <text
            x="154"
            y="52"
            fill="currentColor"
            fontSize="28"
            fontWeight="900"
            fontFamily="'Inter', 'Arial Black', sans-serif"
          >
            ow
          </text>
        </>
      )}
    </svg>
  );
};

export default Logo;

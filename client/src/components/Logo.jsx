import React from "react";

const Logo = ({ variant = "horizontal", className = "", ...props }) => {
  const isIcon = variant === "icon";

  return (
    <svg
      viewBox={isIcon ? "2 14 96 59" : "0 0 240 80"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cart-logo ${className}`}
      {...props}
    >
      <defs>
        {/* Brand gradient: Vibrant Rose to Energetic Orange */}
        <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff3f6c" />
          <stop offset="50%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>

        {/* Soft background fill gradient for the basket */}
        <linearGradient id="basket-fill-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff3f6c" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
        </linearGradient>

        {/* Wind trails fade-out gradient */}
        <linearGradient id="trail-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="40%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      <style>{`
        @keyframes logo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes logo-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(3px); }
        }
        @keyframes logo-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.2px); }
        }
        @keyframes logo-dash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -8; }
        }
        .logo-wheel {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .logo-wheel-1 {
          transform-origin: 46px 65.5px;
        }
        .logo-wheel-2 {
          transform-origin: 82px 65.5px;
        }
        .logo-trail {
          transition: transform 0.5s ease, opacity 0.5s ease;
        }
        .logo-basket {
          transition: transform 0.3s ease;
        }
        .logo-runner-n {
          transition: transform 0.3s ease;
        }
        .logo-leash {
          stroke-dasharray: 4, 3;
        }

        /* Trigger micro-animations on hover */
        .group:hover .logo-wheel,
        svg:hover .logo-wheel {
          animation: logo-spin 1s linear infinite;
        }
        .group:hover .logo-trail-1,
        svg:hover .logo-trail-1 {
          animation: logo-slide 0.6s ease-in-out infinite alternate;
        }
        .group:hover .logo-trail-2,
        svg:hover .logo-trail-2 {
          animation: logo-slide 0.6s ease-in-out infinite alternate 0.15s;
        }
        .group:hover .logo-trail-3,
        svg:hover .logo-trail-3 {
          animation: logo-slide 0.6s ease-in-out infinite alternate 0.3s;
        }
        .group:hover .logo-basket,
        svg:hover .logo-basket {
          animation: logo-bounce 0.8s ease-in-out infinite;
        }
        .group:hover .logo-leash,
        svg:hover .logo-leash {
          animation: logo-dash 0.6s linear infinite;
        }
        .group:hover .logo-runner-n,
        svg:hover .logo-runner-n {
          transform: skewX(-2deg) translateX(0.5px);
        }
      `}</style>

      {/* Wind trails (speed lines) */}
      <line
        x1="6"
        y1="30"
        x2="26"
        y2="30"
        stroke="url(#trail-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="logo-trail logo-trail-1"
      />
      <line
        x1="2"
        y1="38"
        x2="20"
        y2="38"
        stroke="url(#trail-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        className="logo-trail logo-trail-2"
      />
      <line
        x1="8"
        y1="46"
        x2="28"
        y2="46"
        stroke="url(#trail-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        className="logo-trail logo-trail-3"
      />

      {/* Cart Group (contains basket, handle, chassis, wheels, text inside) */}
      <g className="logo-basket">
        {/* Cart Handle */}
        <path
          d="M 34 24 L 24 17 L 22 22"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Cart Basket - Gradient filled and outlined */}
        <polygon
          points="34,24 96,24 84,52 44,52"
          fill="url(#basket-fill-grad)"
        />
        <path
          d="M 34 24 H 96 L 84 52 H 44 Z"
          stroke="url(#brand-grad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Text inside basket */}
        <text
          x="64"
          y="41"
          fill="url(#brand-grad)"
          fontSize="21"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, 'Inter', sans-serif"
          fontStyle="italic"
          textAnchor="middle"
          letterSpacing="-0.5px"
        >
          cart
        </text>

        {/* Chassis & Wheel Mounts */}
        <path
          d="M 38 52 L 44 59 H 84"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Wheels - concentric tech wheels */}
        <g className="logo-wheel logo-wheel-1">
          <circle
            cx="46"
            cy="65.5"
            r="5.5"
            stroke="url(#brand-grad)"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="46"
            cy="65.5"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
          <circle
            cx="46"
            cy="65.5"
            r="1"
            fill="currentColor"
          />
        </g>
        <g className="logo-wheel logo-wheel-2">
          <circle
            cx="82"
            cy="65.5"
            r="5.5"
            stroke="url(#brand-grad)"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="82"
            cy="65.5"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
          <circle
            cx="82"
            cy="65.5"
            r="1"
            fill="currentColor"
          />
        </g>
      </g>

      {!isIcon && (
        <>
          {/* Rope / Connection leash */}
          <path
            d="M 92 36 C 98 34, 106 34, 114 36"
            stroke="url(#brand-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="logo-leash"
          />

          {/* Pulling Figure 'n' */}
          <path
            d="M 112 56 L 118 43 L 125 31 C 129 26 135 26 139 31 L 143 43 L 147 56"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="logo-runner-n"
          />
          {/* Pulling Arm */}
          <path
            d="M 120 37 H 114"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            className="logo-runner-n"
          />

          {/* Letters 'ow' */}
          <text
            x="152"
            y="53"
            fill="currentColor"
            fontSize="30"
            fontWeight="950"
            fontFamily="system-ui, -apple-system, 'Inter', sans-serif"
            letterSpacing="-1.5px"
          >
            ow
          </text>
        </>
      )}
    </svg>
  );
};

export default Logo;

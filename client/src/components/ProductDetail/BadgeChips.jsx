import React from "react";

const BadgeChips = ({ product }) => {
  if (!product?.attributes?.badges || product.attributes.badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pt-0.5">
      {product.attributes.badges.map((badge, idx) => {
        const badgeTexts = badge.values || (badge.value ? [badge.value] : []);
        return badgeTexts.map((text, sIdx) => (
          <span
            key={`${idx}-${sIdx}`}
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 px-2.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 shadow-xs uppercase tracking-wider"
          >
            {text}
          </span>
        ));
      })}
    </div>
  );
};

export default BadgeChips;

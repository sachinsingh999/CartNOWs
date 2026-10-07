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
            className="inline-flex items-center gap-1 rounded-none bg-amber-100/70 dark:bg-amber-950/40 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider"
          >
            {text}
          </span>
        ));
      })}
    </div>
  );
};

export default BadgeChips;

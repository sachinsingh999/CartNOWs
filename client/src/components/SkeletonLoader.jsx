import React from "react";

/* ─────────────── 1. HERO SECTION SKELETON ─────────────── */
export const HeroSkeleton = () => (
  <div className="w-full min-h-[500px] lg:min-h-[600px] bg-slate-100 dark:bg-slate-900/40 animate-pulse relative flex items-center py-12 px-6 sm:px-12 lg:px-20 overflow-hidden">
    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left side text items */}
      <div className="space-y-6">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
        <div className="h-16 bg-slate-200 dark:bg-slate-800 w-3/4 rounded-xl" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 w-1/2 rounded" />
        <div className="h-14 bg-slate-200 dark:bg-slate-800 w-2/3 rounded-2xl" />
        <div className="flex gap-4 pt-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 w-32 rounded-full" />
          <div className="h-12 bg-slate-200 dark:bg-slate-800 w-32 rounded-full" />
        </div>
      </div>
      {/* Right side media display */}
      <div className="hidden lg:flex justify-center items-end h-[450px]">
        <div className="w-3/4 h-[90%] bg-slate-200 dark:bg-slate-800 rounded-b-full rounded-t-3xl" />
      </div>
    </div>
  </div>
);

/* ─────────────── 2. CATEGORIES HORIZONTAL SKELETON ─────────────── */
export const CategoriesSkeleton = () => (
  <div className="w-full flex gap-4 overflow-x-auto py-2 animate-pulse no-scrollbar">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="flex flex-col items-center gap-2 shrink-0 w-24">
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 w-3/4 rounded" />
      </div>
    ))}
  </div>
);

/* ─────────────── 3. BRANDS GRID SKELETON ─────────────── */
export const BrandsSkeleton = () => (
  <div className="w-full py-4 animate-pulse">
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl h-16" />
      ))}
    </div>
  </div>
);

/* ─────────────── 4. SINGLE PRODUCT CARD SKELETON ─────────────── */
export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/50 dark:border-slate-800/80 space-y-4 animate-pulse">
    <div className="bg-slate-200 dark:bg-slate-800 h-48 w-full rounded-2xl" />
    <div className="space-y-2">
      <div className="bg-slate-200 dark:bg-slate-800 h-4 w-3/4 rounded" />
      <div className="bg-slate-200 dark:bg-slate-800 h-3 w-1/2 rounded" />
    </div>
    <div className="flex justify-between items-center pt-2">
      <div className="bg-slate-200 dark:bg-slate-800 h-5 w-1/3 rounded" />
      <div className="bg-slate-200 dark:bg-slate-800 h-8 w-8 rounded-full" />
    </div>
  </div>
);

/* ─────────────── 5. PRODUCTS GRID SKELETON ─────────────── */
export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

/* ─────────────── 6. COLLECTIONS SKELETON ─────────────── */
export const CollectionsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse w-full">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white dark:bg-slate-900 h-72 rounded-[32px] border border-slate-200/50 dark:border-slate-800/80 p-8 space-y-4">
        <div className="bg-slate-200 dark:bg-slate-800 h-6 w-1/3 rounded" />
        <div className="bg-slate-200 dark:bg-slate-800 h-10 w-3/4 rounded" />
        <div className="bg-slate-200 dark:bg-slate-800 h-12 w-28 rounded-xl" />
      </div>
    ))}
  </div>
);

/* ─────────────── 7. DEAL OF THE DAY SKELETON ─────────────── */
export const DealSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/50 dark:border-slate-800/80 p-6 flex flex-col md:flex-row gap-6 items-center animate-pulse w-full">
    <div className="w-full md:w-1/3 aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    <div className="w-full md:w-2/3 space-y-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-800 w-3/4 rounded" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/2 rounded" />
      <div className="h-8 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
      <div className="h-10 bg-slate-200 dark:bg-slate-800 w-1/2 rounded-xl" />
    </div>
  </div>
);

/* ─────────────── 8. SELLER SPOTLIGHT SKELETON ─────────────── */
export const SpotlightSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/50 dark:border-slate-800/80 p-6 h-[220px] animate-pulse space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
      </div>
    </div>
    <div className="h-12 bg-slate-200 dark:bg-slate-800 w-full rounded" />
    <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/2 rounded" />
  </div>
);

/* ─────────────── 9. TESTIMONIALS SKELETON ─────────────── */
export const TestimonialSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse w-full">
    {[1, 2].map((i) => (
      <div key={i} className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/50 dark:border-slate-800/80 p-6 h-[200px] flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="w-3.5 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
            ))}
          </div>
          <div className="h-14 bg-slate-200 dark:bg-slate-800 w-full rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
            <div className="h-2.5 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ─────────────── 10. WISHLIST SKELETON ─────────────── */
export const WishlistSkeleton = () => (
  <div className="space-y-6 py-8 animate-pulse w-full">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 w-1/4 rounded mb-8" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <div className="bg-slate-200 dark:bg-slate-800 h-44 w-full rounded-2xl" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 w-3/4 rounded" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────── 11. CART SKELETON ─────────────── */
export const CartSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8 animate-pulse w-full">
    {/* Left Column (Items) */}
    <div className="lg:col-span-2 space-y-6">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl items-center">
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/2 rounded" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/5 rounded" />
          </div>
          <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      ))}
    </div>
    {/* Right Column (Summary) */}
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 h-fit space-y-6">
      <div className="h-5 bg-slate-200 dark:bg-slate-800 w-1/2 rounded" />
      <div className="space-y-3 pt-2">
        <div className="flex justify-between">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/5 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/5 rounded" />
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-between">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
      </div>
      <div className="h-12 bg-slate-200 dark:bg-slate-800 w-full rounded-xl" />
    </div>
  </div>
);

/* ─────────────── 12. PRODUCT DETAIL SKELETON ─────────────── */
export const ProductDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse w-full">
    {/* Left Column (Images) */}
    <div className="space-y-4">
      <div className="w-full aspect-[4/5] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
    </div>
    {/* Right Column (Info) */}
    <div className="space-y-6">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
      <div className="h-10 bg-slate-200 dark:bg-slate-800 w-3/4 rounded" />
      <div className="flex items-center gap-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 w-16 rounded" />
      </div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
      <div className="h-20 bg-slate-200 dark:bg-slate-800 w-full rounded" />
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-12 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <div className="h-12 bg-slate-200 dark:bg-slate-800 w-1/2 rounded-xl" />
        <div className="h-12 bg-slate-200 dark:bg-slate-800 w-1/2 rounded-xl" />
      </div>
    </div>
  </div>
);

/* ─────────────── 13. PROFILE SKELETON ─────────────── */
export const ProfileSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse w-full space-y-8">
    {/* Profile Header */}
    <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
      <div className="space-y-2">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 w-32 rounded" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 w-48 rounded" />
      </div>
    </div>
    {/* Grid Content */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Sidebar Links */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 h-fit space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 bg-slate-200 dark:bg-slate-800 w-full rounded" />
        ))}
      </div>
      {/* Detail Form */}
      <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 space-y-6">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
              <div className="h-10 bg-slate-200 dark:bg-slate-800 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

/* ─────────────── 14. ORDERS LIST SKELETON ─────────────── */
export const OrderListSkeleton = () => (
  <div className="w-full space-y-6 py-6 animate-pulse">
    <div className="h-6 bg-slate-200 dark:bg-slate-800 w-48 rounded" />
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 w-36 rounded" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 w-20 rounded" />
            </div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 w-24 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 w-16 rounded" />
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 w-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const DealRowSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse w-full">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/50 dark:border-slate-800/80 p-6 h-[220px]" />
    ))}
  </div>
);

export const BenefitsSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[28px] p-6 h-20 w-full animate-pulse" />
);

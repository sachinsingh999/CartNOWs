import React from "react";

/* ─────────────── SHIMMER SKELETON BASE UTILITY ─────────────── */
export const SkeletonPulse = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-slate-200/80 dark:bg-slate-800/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 dark:before:via-white/10 before:to-transparent ${className}`}
  />
);

/* ─────────────── 1. HERO SPLIT BANNER SKELETON (EXACT 1-TO-1) ─────────────── */
export const HeroSplitBannerSkeleton = () => (
  <div className="w-full px-0 pt-0 pb-1 sm:pb-1.5 select-none animate-pulse flex flex-col">
    {/* 1. Full-Width Main Hero Banner Skeleton */}
    <div className="relative w-full h-[47vh] min-h-[390px] md:min-h-[420px] max-h-[530px] overflow-hidden">
      <div className="relative w-full h-full rounded-none border-b border-stone-200/70 dark:border-slate-800 bg-[#FAF7F2] dark:bg-slate-950 overflow-hidden flex flex-row items-stretch justify-between pl-3 sm:pl-5 md:pl-6 lg:pl-7 xl:pl-8 pr-2 py-3.5 sm:py-5 md:py-6">
        {/* Left Text Block */}
        <div className="relative w-[75%] sm:w-[68%] md:w-[62%] lg:w-[58%] xl:w-[56%] flex flex-col justify-between h-full z-10 max-w-[580px]">
          <div className="space-y-3 sm:space-y-4">
            {/* Orange dash + Tagline */}
            <div className="flex items-center gap-2.5">
              <div className="w-5 sm:w-6 h-[2px] bg-orange-400 rounded-full" />
              <div className="h-3 w-36 bg-orange-200/80 dark:bg-orange-950/70 rounded-none" />
            </div>

            {/* Editorial Title (2 large lines) */}
            <div className="space-y-2 pt-1">
              <div className="h-10 sm:h-12 md:h-14 lg:h-16 w-3/5 bg-slate-300/80 dark:bg-slate-700/80 rounded-none" />
              <div className="h-10 sm:h-12 md:h-14 lg:h-16 w-4/5 bg-slate-300/80 dark:bg-slate-700/80 rounded-none" />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5 pt-1">
              <div className="h-3.5 w-full max-w-[420px] bg-slate-200 dark:bg-slate-800 rounded-none" />
              <div className="h-3.5 w-4/5 max-w-[340px] bg-slate-200 dark:bg-slate-800 rounded-none" />
            </div>

            {/* Dual Action Pill Buttons */}
            <div className="flex items-center gap-3 sm:gap-4 pt-2">
              <div className="h-9 sm:h-10 w-28 sm:w-32 bg-orange-400/80 dark:bg-orange-600/80 rounded-full" />
              <div className="h-9 sm:h-10 w-36 sm:w-40 border border-slate-300 dark:border-slate-700 bg-transparent rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Model Silhouette Cutout */}
        <div className="absolute right-0 bottom-0 top-0 h-full w-[80%] sm:w-[75%] md:w-[68%] lg:w-[62%] xl:w-[58%] flex items-end justify-end pointer-events-none pr-2 md:pr-4 overflow-hidden">
          <div className="h-[96%] w-[65%] max-w-[420px] bg-gradient-to-t from-slate-300/80 via-slate-200/50 to-transparent dark:from-slate-700/80 dark:via-slate-850/50 rounded-t-3xl" />
        </div>

        {/* Left/Right Arrow Skeleton Controls */}
        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-none bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700" />
        <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-none bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700" />
      </div>
    </div>

    {/* 2. Products Showcase Skeleton (Below Hero Banner) */}
    <div className="w-full bg-[#FAFAFA] dark:bg-slate-950 border-b border-slate-200/90 dark:border-slate-800 px-1 sm:px-1.5 md:px-2 pt-1 pb-3 sm:pb-3.5">
      {/* 4 Cards Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="flex flex-col justify-between bg-white dark:bg-slate-900 rounded-[3px] border border-slate-200/80 dark:border-slate-800 p-2.5 sm:p-3"
          >
            <div>
              {/* 3D Stage Box */}
              <div className="w-full h-[205px] rounded-[2px] bg-slate-100 dark:bg-slate-800/60" />
              {/* 4 Thumbnails */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 pb-1.5">
                {[1, 2, 3, 4].map((t) => (
                  <div key={t} className="h-10 rounded-[2px] bg-slate-100 dark:bg-slate-800/80" />
                ))}
              </div>
              {/* Info */}
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 w-14 bg-slate-200 dark:bg-slate-800 rounded-[2px]" />
                <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-[2px]" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-[2px]" />
                <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-[2px]" />
                <div className="h-4.5 w-28 bg-orange-200 dark:bg-orange-950/70 rounded-[2px]" />
              </div>
            </div>
            {/* Buttons */}
            <div className="grid grid-cols-[1fr_auto] gap-1.5 pt-2.5">
              <div className="h-8 bg-orange-400/80 dark:bg-orange-600/80 rounded-[3px]" />
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-[3px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─────────────── 2. TECH AD BANNER SKELETON (EXACT 1-TO-1) ─────────────── */
export const TechAdBannerSkeleton = () => (
  <section className="w-full px-0 py-0.5 sm:py-1 select-none animate-pulse">
    <div className="relative w-full rounded-none overflow-hidden border border-x-0 border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-[#F9F7FF] via-[#F4F1FD] to-[#EDF2FE] dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 min-h-[300px] min-[400px]:min-h-[320px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[430px] xl:min-h-[440px] px-3.5 sm:px-8 md:px-10 lg:px-12 pt-3.5 sm:pt-6 md:pt-7 pb-10 sm:pb-14 lg:pb-14 flex flex-row items-center justify-between">
      
      {/* Left Column: Text & CTA */}
      <div className="w-[58%] min-[480px]:w-[54%] sm:w-[50%] lg:w-[44%] flex flex-col justify-center space-y-2 sm:space-y-3 z-10 pr-2 sm:pr-4">
        <div className="h-4 sm:h-5 w-32 sm:w-48 bg-indigo-200/70 dark:bg-indigo-950/70 rounded-none" />
        <div className="space-y-1.5 sm:space-y-2">
          <div className="h-5 sm:h-8 md:h-10 w-4/5 bg-slate-300/80 dark:bg-slate-700/80 rounded-none" />
          <div className="h-5 sm:h-8 md:h-10 w-3/5 bg-slate-300/80 dark:bg-slate-700/80 rounded-none" />
        </div>
        <div className="h-3 sm:h-4 w-3/4 max-w-sm bg-slate-200 dark:bg-slate-800 rounded-none" />
        
        {/* Spec chips */}
        <div className="flex items-center gap-1 sm:gap-2 pt-1">
          <div className="h-4 sm:h-6 w-16 sm:w-24 bg-slate-200/80 dark:bg-slate-800/80 rounded-none" />
          <div className="h-4 sm:h-6 w-16 sm:w-28 bg-slate-200/80 dark:bg-slate-800/80 rounded-none" />
          <div className="hidden sm:block h-6 w-20 bg-slate-200/80 dark:bg-slate-800/80 rounded-none" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
          <div className="h-7 sm:h-11 w-24 sm:w-36 bg-indigo-400/80 dark:bg-indigo-600/80 rounded-none" />
          <div className="hidden min-[360px]:block h-7 sm:h-11 w-20 sm:w-28 bg-slate-200/80 dark:bg-slate-800/80 rounded-none" />
        </div>
      </div>

      {/* Right Column: 3D Floating Showcase Stage Silhouette */}
      <div className="w-[42%] min-[480px]:w-[46%] sm:w-[50%] lg:w-[56%] h-full flex items-end justify-center pb-1">
        <div className="w-[120px] min-[400px]:w-[140px] sm:w-[200px] md:w-[220px] h-[160px] min-[400px]:h-[190px] sm:h-[240px] md:h-[280px] bg-slate-300/60 dark:bg-slate-800/60 rounded-xl" />
      </div>

    </div>
  </section>
);

/* ─────────────── 3. FEATURED DEALS CAROUSEL SKELETON ─────────────── */
export const FeaturedDealsSkeleton = () => (
  <section className="w-full px-0 py-1.5 select-none animate-pulse">
    <div className="w-full bg-white dark:bg-slate-900 border border-x-0 border-slate-200/90 dark:border-slate-800 rounded-none p-3.5 sm:p-4.5 lg:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-1">
          <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-none" />
          <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800/60 rounded-none" />
        </div>
        <div className="flex gap-1.5">
          <div className="w-20 h-7 rounded-none bg-slate-200 dark:bg-slate-800" />
          <div className="w-7 h-7 rounded-none bg-slate-200 dark:bg-slate-800" />
          <div className="w-7 h-7 rounded-none bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        <div className="lg:col-span-5 space-y-2.5">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-none" />
          <div className="h-6 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-none" />
          <div className="h-3.5 w-1/3 bg-slate-100 dark:bg-slate-800/60 rounded-none" />
          <div className="h-7 w-36 bg-slate-200 dark:bg-slate-800 rounded-none" />
          <div className="h-8 w-full max-w-sm bg-slate-100 dark:bg-slate-800/60 rounded-none" />
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-none" />
        </div>
        <div className="lg:col-span-7 h-[285px] sm:h-[300px] lg:h-[315px] bg-slate-100 dark:bg-slate-800/40 rounded-none" />
      </div>
    </div>
  </section>
);

/* ─────────────── 4. RECOMMENDED CATEGORIES SKELETON ─────────────── */
export const RecommendedCategoriesSkeleton = () => (
  <section className="w-full px-0 py-1 select-none animate-pulse">
    <div className="w-full bg-white dark:bg-slate-900 border border-x-0 border-slate-200/90 dark:border-slate-800 rounded-none p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-none" />
        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800/60 rounded-none" />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-2 rounded-none border border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 dark:bg-slate-800 rounded-none" />
            <div className="h-3 w-14 bg-slate-200 dark:bg-slate-800 rounded-none" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────── 5. FLASH DEALS SECTION SKELETON ─────────────── */
export const FlashDealsSectionSkeleton = () => (
  <section className="w-full px-0 py-1 select-none animate-pulse">
    <div className="w-full bg-white dark:bg-slate-900 border border-x-0 border-slate-200/90 dark:border-slate-800 rounded-none p-3.5 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-none bg-rose-200 dark:bg-rose-900/60" />
          <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-none" />
          <div className="h-5 w-28 bg-slate-100 dark:bg-slate-800/60 rounded-none" />
        </div>
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-none" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-none border border-slate-200/80 dark:border-slate-800 p-2.5 space-y-2">
            <div className="aspect-square w-full bg-slate-200 dark:bg-slate-800 rounded-none" />
            <div className="h-3.5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-none" />
            <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded-none" />
            <div className="flex justify-between items-center pt-1">
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-none" />
              <div className="h-3.5 w-12 bg-rose-100 dark:bg-rose-950/60 rounded-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────── 6. FULL HOMEPAGE COMPOSITE SKELETON (EXACT) ─────────────── */
export const HomePageSkeleton = () => (
  <div className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen text-[#0F172A] dark:text-slate-100 font-sans pb-8 antialiased text-left">
    <HeroSplitBannerSkeleton />
    <TechAdBannerSkeleton />
    <FeaturedDealsSkeleton />
    <RecommendedCategoriesSkeleton />
    <FlashDealsSectionSkeleton />
  </div>
);

/* ─────────────── 7. LEGACY & REUSABLE INDIVIDUAL SKELETONS ─────────────── */
export const HeroSkeleton = HeroSplitBannerSkeleton;

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

export const BrandsSkeleton = () => (
  <div className="w-full py-4 animate-pulse">
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl h-16" />
      ))}
    </div>
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-md p-4 border border-slate-200/50 dark:border-slate-800/80 space-y-4 animate-pulse">
    <div className="bg-slate-200 dark:bg-slate-800 h-48 w-full rounded-md" />
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

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const CollectionsSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 animate-pulse w-full">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-none flex flex-col justify-between space-y-4 shadow-xs"
      >
        <div className="space-y-3">
          {/* Top Row: Category tag and trending pill */}
          <div className="flex justify-between items-center">
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-none" />
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-none" />
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1.5">
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-none" />
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/60 rounded-none" />
          </div>

          {/* Main Composite Image Area */}
          <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800/50 rounded-none border border-slate-200/60 dark:border-slate-800 flex items-center justify-center">
            <div className="w-24 h-24 bg-slate-200/60 dark:bg-slate-700/50 rounded-none" />
          </div>

          {/* Sample Products Mini Deck */}
          <div className="bg-slate-50 dark:bg-slate-950 p-2 border border-slate-200/60 dark:border-slate-800 rounded-none space-y-1.5">
            <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-800 rounded-none" />
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-none" />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-3.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-2.5 w-12 bg-slate-200 dark:bg-slate-800 rounded-none" />
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-none" />
          </div>
          <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-none" />
        </div>
      </div>
    ))}
  </div>
);

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

export const CartSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8 animate-pulse w-full">
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

export const ProductDetailSkeleton = () => (
  <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300 overflow-x-hidden pb-32 animate-pulse select-none text-left">
    {/* Background radial overlays */}
    <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
    <div className="absolute top-1/2 left-1/4 w-[650px] h-[650px] bg-violet-500/5 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

    <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 pt-6">
      {/* Premium Breadcrumb bar skeleton */}
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">
        <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded-xs" />
        <span>&gt;</span>
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-xs" />
        <span>&gt;</span>
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-xs" />
        <span>&gt;</span>
        <div className="h-3 w-36 bg-slate-300 dark:bg-slate-700 rounded-xs" />
      </div>

      {/* 3-Column Split Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.1fr_0.8fr] gap-8 items-start">
        
        {/* COLUMN 1: E-commerce Image Showcase & Tabs */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start min-w-0 max-w-full">
          <div className="flex gap-2.5 items-stretch">
            
            {/* Vertical Thumbnail Deck (Desktop) */}
            <div className="hidden sm:flex flex-col gap-2 w-20 shrink-0 justify-between">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="relative w-full aspect-[3/4] bg-slate-200 dark:bg-slate-800 rounded-none overflow-hidden"
                />
              ))}
              
              {/* Mock Video Thumbnail */}
              <div className="relative w-full aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-none flex flex-col items-center justify-center p-1">
                <div className="w-4 h-4 rounded-none bg-slate-300 dark:bg-slate-700 mb-1" />
                <div className="w-8 h-2 rounded-none bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Mock 360 Thumbnail */}
              <div className="relative w-full aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-none flex flex-col items-center justify-center p-1">
                <div className="w-4 h-4 rounded-none bg-slate-300 dark:bg-slate-700 mb-1" />
                <div className="w-10 h-2 rounded-none bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>

            {/* Main Media Showcase Window */}
            <div className="flex-1 relative aspect-[3/4] overflow-hidden rounded-none bg-slate-100 dark:bg-slate-900">
              
              {/* Float overlays top-left */}
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <div className="h-6 w-28 rounded-none bg-white/95 dark:bg-slate-900/95 shadow-xs" />
                <div className="h-6 w-20 rounded-none bg-rose-100/80 dark:bg-rose-950/40" />
              </div>

              {/* Action buttons on image */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <div className="h-10 w-10 rounded-none bg-white/95 dark:bg-slate-900/95 shadow-xs" />
                <div className="h-10 w-10 rounded-none bg-white/95 dark:bg-slate-900/95 shadow-xs" />
              </div>

              {/* Center image placeholder silhouette */}
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="w-4/5 h-4/5 bg-slate-200/70 dark:bg-slate-800/70 rounded-none" />
              </div>

              {/* Bottom right zoom expand icon */}
              <div className="absolute bottom-4 right-4 z-20 h-10 w-10 bg-slate-900/40 dark:bg-slate-800/80 rounded-none" />
            </div>
          </div>

          {/* Horizontal Swipeable thumbnails (Mobile view) */}
          <div className="sm:hidden flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] w-14 bg-slate-200 dark:bg-slate-800 rounded-none shrink-0"
              />
            ))}
          </div>

          {/* Nav Tabs Section (Under Images) */}
          <div className="w-full text-left mt-6 pt-4">
            <div className="flex items-center gap-8 overflow-x-auto pb-3">
              <div className="h-4 w-20 bg-indigo-200 dark:bg-indigo-900/60 rounded-none" />
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-none" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-none" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-none" />
            </div>

            <div className="mt-5 space-y-3">
              <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded-none" />
              <div className="h-3.5 w-11/12 bg-slate-200 dark:bg-slate-800 rounded-none" />
              <div className="h-3.5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-none" />
              
              <div className="pt-4 mt-4 space-y-2.5">
                <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded-none mb-3" />
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-none bg-slate-200 dark:bg-slate-800 shrink-0" />
                      <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-850 rounded-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMN 2: Center Details Panel & Buying CTA options */}
        <div className="space-y-5 text-left lg:sticky lg:top-24 lg:self-start">
          
          {/* Store brand / Category Badge */}
          <div className="flex items-center justify-between pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-none bg-slate-200 dark:bg-slate-800" />
              <div className="h-3.5 w-24 bg-blue-100 dark:bg-blue-950/60 rounded-none" />
            </div>
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-none" />
          </div>

          {/* Title & Review stars metrics */}
          <div className="space-y-2">
            <div className="h-6 sm:h-7 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-none" />
            <div className="h-6 sm:h-7 w-3/5 bg-slate-300 dark:bg-slate-700 rounded-none" />

            {/* Badge Chips */}
            <div className="flex gap-1.5 pt-1">
              <div className="h-4.5 w-20 bg-amber-100 dark:bg-amber-950/40 rounded-none" />
              <div className="h-4.5 w-24 bg-amber-100 dark:bg-amber-950/40 rounded-none" />
            </div>

            {/* Review metrics */}
            <div className="flex items-center gap-2 pt-1">
              <div className="h-3.5 w-6 bg-slate-300 dark:bg-slate-700 rounded-none" />
              <div className="h-3 w-16 bg-amber-200 dark:bg-amber-900/60 rounded-none" />
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded-none" />
            </div>
          </div>

          {/* Pricing Info block */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2.5">
              <div className="h-8 sm:h-9 w-28 bg-red-200 dark:bg-red-950/70 rounded-none" />
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-none" />
              <div className="h-5 w-16 bg-rose-100 dark:bg-rose-950/60 rounded-none" />
            </div>
            <div className="h-2.5 w-28 bg-slate-100 dark:bg-slate-800/60 rounded-none" />
          </div>

          {/* Availability & Stock status block */}
          <div className="flex items-center gap-3 pt-3.5">
            <div className="h-4.5 w-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-none" />
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded-none" />
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-none" />
          </div>

          {/* Trust Badges Card */}
          <div className="rounded-none p-3 bg-slate-100/70 dark:bg-slate-950/20 grid grid-cols-3 text-center gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center justify-center p-1 space-y-1">
                <div className="w-4 h-4 rounded-none bg-slate-300 dark:bg-slate-700" />
                <div className="h-2.5 w-16 bg-blue-100 dark:bg-blue-950/60 rounded-none" />
                <div className="h-2 w-12 bg-slate-100 dark:bg-slate-800/60 rounded-none" />
              </div>
            ))}
          </div>

          {/* Feature List Skeleton */}
          <div className="space-y-3 pt-4">
            <div className="h-3.5 w-28 bg-slate-300 dark:bg-slate-700 rounded-none" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-7 w-28 bg-slate-100/70 dark:bg-slate-900 rounded-none" />
              ))}
            </div>
          </div>

          {/* Variant Selector */}
          <div className="space-y-4 pt-3">
            {/* Color */}
            <div className="space-y-1.5">
              <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-800 rounded-none" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-7 w-20 bg-slate-100 dark:bg-slate-900 rounded-none flex items-center gap-1.5 px-2">
                    <div className="w-3.5 h-3.5 rounded-none bg-slate-200 dark:bg-slate-700" />
                    <div className="h-2.5 w-10 bg-slate-200 dark:bg-slate-800 rounded-none" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-none" />
                <div className="h-2.5 w-14 bg-indigo-100 dark:bg-indigo-950/60 rounded-none" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-7 w-12 bg-slate-100 dark:bg-slate-900 rounded-none" />
                ))}
              </div>
            </div>

            {/* Dynamic Selected Variant Card */}
            <div className="relative overflow-hidden bg-slate-100/70 dark:bg-slate-950/30 rounded-none p-3.5 mt-3 space-y-2">
              <div className="flex justify-between items-center pl-2">
                <div className="h-2.5 w-24 bg-indigo-100 dark:bg-indigo-950/60 rounded-none" />
                <div className="h-3.5 w-20 bg-indigo-50 dark:bg-indigo-950/50 rounded-none" />
              </div>
              <div className="pl-2 space-y-2">
                <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded-none" />
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="h-8 bg-white dark:bg-slate-900 rounded-none" />
                  <div className="h-8 bg-white dark:bg-slate-900 rounded-none" />
                  <div className="h-8 bg-white dark:bg-slate-900 rounded-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2.5 pt-4.5 flex items-center gap-4 text-left">
            <div className="h-3.5 w-16 bg-slate-300 dark:bg-slate-700 rounded-none" />
            <div className="w-32 h-10 rounded-none bg-slate-100 dark:bg-slate-950/40" />
          </div>

          {/* Buying Action buttons */}
          <div className="grid gap-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="h-11 rounded-none bg-slate-200 dark:bg-slate-800" />
              <div className="h-11 rounded-none bg-amber-400 dark:bg-amber-600" />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="h-8 rounded-none bg-slate-100 dark:bg-slate-900" />
              <div className="h-8 rounded-none bg-indigo-50/40 dark:bg-indigo-950/20" />
            </div>

            <div className="h-9.5 rounded-none bg-gradient-to-r from-orange-300 via-amber-300 to-orange-300 dark:from-orange-800 dark:via-amber-800 dark:to-orange-800" />
          </div>

        </div>

        {/* COLUMN 3: Seller, Shipping, and Specifications Sidebar cards */}
        <div className="space-y-4 text-left lg:sticky lg:top-24 lg:self-start">

          {/* 1. Seller Info card */}
          <div className="bg-slate-100/70 dark:bg-slate-900 rounded-none p-5 text-left space-y-3">
            <div className="h-3.5 w-32 bg-slate-300 dark:bg-slate-700 rounded-none pb-2" />
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 bg-slate-300 dark:bg-slate-700 rounded-none" />
                  <div className="h-2.5 w-16 bg-amber-100 dark:bg-amber-950/60 rounded-none" />
                </div>
              </div>
              <div className="h-7 w-20 rounded-none bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

          {/* 2. Shipping Information card */}
          <div className="bg-slate-100/70 dark:bg-slate-900 rounded-none p-5 text-left space-y-3">
            <div className="h-3.5 w-36 bg-slate-300 dark:bg-slate-700 rounded-none pb-2" />
            <div className="space-y-2">
              <div className="py-2 flex justify-between">
                <div className="h-3 w-14 bg-slate-200 dark:bg-slate-800 rounded-none" />
                <div className="h-3 w-10 bg-slate-300 dark:bg-slate-700 rounded-none" />
              </div>
              <div className="py-2 flex justify-between">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-none" />
                <div className="h-3 w-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-none" />
              </div>
              <div className="py-2 flex justify-between">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-none" />
                <div className="h-3 w-16 bg-slate-300 dark:bg-slate-700 rounded-none" />
              </div>
            </div>
          </div>

          {/* 3. Product Specifications card */}
          <div className="bg-slate-100/70 dark:bg-slate-900 rounded-none p-5 text-left space-y-3">
            <div className="flex items-center justify-between pb-2">
              <div className="h-3.5 w-36 bg-slate-300 dark:bg-slate-700 rounded-none" />
              <div className="h-4 w-20 bg-amber-100 dark:bg-amber-950/50 rounded-none" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="py-2 flex justify-between">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-none" />
                  <div className="h-3 w-24 bg-slate-300 dark:bg-slate-700 rounded-none" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* SECTION: Related Products Horizontal Carousel Slider */}
      <section className="mt-12 pt-10 text-left">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="h-3 w-20 bg-indigo-100 dark:bg-indigo-950/60 rounded-none mb-1.5" />
            <div className="h-6 sm:h-7 w-48 bg-slate-300 dark:bg-slate-700 rounded-none" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-none">
              <div className="w-6 h-6 rounded-none bg-slate-200 dark:bg-slate-800" />
              <div className="w-6 h-6 rounded-none bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-8.5 w-28 rounded-none bg-slate-100 dark:bg-slate-900" />
          </div>
        </div>

        <div className="flex gap-5 overflow-hidden pb-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="min-w-[220px] sm:min-w-[260px] md:min-w-[285px] max-w-[285px] flex-shrink-0 bg-white dark:bg-slate-900 rounded-none overflow-hidden space-y-3"
            >
              <div className="px-4 pt-4 pb-1 space-y-1.5">
                <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded-none" />
                <div className="h-3.5 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-none" />
              </div>
              <div className="h-[210px] w-full bg-slate-100 dark:bg-slate-850 p-3 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-slate-200/80 dark:bg-slate-800/80 rounded-none" />
              </div>
              <div className="p-4 pt-0 space-y-2">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-none" />
                <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-none" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 w-20 bg-red-200 dark:bg-red-950/60 rounded-none" />
                  <div className="h-8 w-8 rounded-none bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: Recently Viewed Products Horizontal Carousel Slider */}
      <section className="mt-10 pt-8 text-left">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-none mb-1.5" />
            <div className="h-6 sm:h-7 w-40 bg-slate-300 dark:bg-slate-700 rounded-none" />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-none">
            <div className="w-6 h-6 rounded-none bg-slate-200 dark:bg-slate-800" />
            <div className="w-6 h-6 rounded-none bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        <div className="flex gap-5 overflow-hidden pb-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="min-w-[220px] sm:min-w-[260px] md:min-w-[285px] max-w-[285px] flex-shrink-0 bg-white dark:bg-slate-900 rounded-none overflow-hidden space-y-3"
            >
              <div className="px-4 pt-4 pb-1 space-y-1.5">
                <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded-none" />
                <div className="h-3.5 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-none" />
              </div>
              <div className="h-[210px] w-full bg-slate-100 dark:bg-slate-850 p-3 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-slate-200/80 dark:bg-slate-800/80 rounded-none" />
              </div>
              <div className="p-4 pt-0 space-y-2">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-none" />
                <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-none" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 w-20 bg-red-200 dark:bg-red-950/60 rounded-none" />
                  <div className="h-8 w-8 rounded-none bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: Footer Features Bar */}
      <div className="mt-12 pt-8 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-slate-100/70 dark:bg-slate-900/60 rounded-none p-4 text-left"
            >
              <div className="h-11 w-11 rounded-none bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-none" />
                <div className="h-2.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>

    {/* Floating AI Stylist trigger badge */}
    <div className="fixed bottom-6 right-6 z-[90] h-14 w-14 rounded-full bg-gradient-to-r from-violet-600/70 to-indigo-600/70 shadow-xl flex items-center justify-center text-white" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="w-full max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6 pt-3 sm:pt-4 animate-pulse space-y-3 sm:space-y-4">
    <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      <div className="h-32 sm:h-40 md:h-44 bg-slate-200 dark:bg-slate-800" />
      <div className="px-4 pb-4 pt-1 sm:px-6 sm:pb-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 sm:gap-4 -mt-10 sm:-mt-14">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-md bg-slate-300 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-900" />
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="h-6 w-44 bg-slate-200 dark:bg-slate-800 rounded-sm" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-3 sm:px-6 py-2 sm:py-2.5 flex gap-2 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8.5 w-32 bg-slate-200 dark:bg-slate-800 rounded shrink-0" />
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-20 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 space-y-2" />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
      <div className="lg:col-span-5 h-64 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
      <div className="lg:col-span-7 h-64 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
    </div>
  </div>
);

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

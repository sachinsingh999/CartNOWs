import React, { useState, useEffect } from 'react';
import { optimizeImageUrl, isImageCached, markImageCached } from '../../utils/imageOptimizer';

/**
 * FastImage Component
 * 
 * High-performance image component with:
 * - Automatic modern CDN query optimization (Unsplash/Cloudinary)
 * - Zero layout shift (CLS prevention) via smooth skeleton shimmer
 * - Instant re-renders via memory cache tracker
 * - Native lazy loading and asynchronous image decoding
 * - Support for Fetch Priority API (fetchPriority="high" on LCP hero images)
 * - Safe fallback handling for broken URLs
 */
const FastImage = ({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  width = 400,
  height,
  quality = 75,
  fit = 'crop',
  priority = false,
  fetchPriority,
  loading,
  decoding = 'async',
  skeleton = true,
  fallbackSrc = '/cartnow-logo.svg',
  onLoad,
  onError,
  style = {},
  ...rest
}) => {
  const optimizedSrc = React.useMemo(() => {
    return optimizeImageUrl(src, { width, height, quality, fit });
  }, [src, width, height, quality, fit]);

  const [isLoaded, setIsLoaded] = useState(() => isImageCached(optimizedSrc));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isImageCached(optimizedSrc)) {
      setIsLoaded(true);
      setHasError(false);
    } else {
      setIsLoaded(false);
      setHasError(false);
    }
  }, [optimizedSrc]);

  const handleLoad = (e) => {
    markImageCached(optimizedSrc);
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    setIsLoaded(true);
    if (onError) onError(e);
  };

  const computedFetchPriority = fetchPriority || (priority ? 'high' : undefined);
  const computedLoading = loading || (priority ? 'eager' : 'lazy');

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Skeleton Shimmer */}
      {skeleton && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200/70 dark:bg-slate-800/70 animate-pulse z-0 pointer-events-none" />
      )}

      {/* Actual Image */}
      <img
        src={hasError ? fallbackSrc : (optimizedSrc || fallbackSrc)}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading={computedLoading}
        decoding={decoding}
        fetchPriority={computedFetchPriority}
        onLoad={handleLoad}
        onError={handleError}
        style={style}
        {...rest}
      />
    </div>
  );
};

export default React.memo(FastImage);

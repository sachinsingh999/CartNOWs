import React, { useState, useEffect, useRef } from "react";

const LazySection = ({ children, placeholderHeight = "250px", rootMargin = "200px" }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // If IntersectionObserver is not supported, render immediately as fallback
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.01 // Trigger as soon as 1% is visible
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (observer && currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin]);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: !isIntersecting ? placeholderHeight : "auto",
        width: "100%"
      }}
    >
      {isIntersecting ? children : null}
    </div>
  );
};

export default LazySection;

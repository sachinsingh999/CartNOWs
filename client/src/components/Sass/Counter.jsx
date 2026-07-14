import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useTransform, animate } from "framer-motion";

const Counter = ({ value, duration = 1.5, prefix = "", suffix = "" }) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, {
        duration: duration,
        ease: [0.16, 1, 0.3, 1] // Custom premium ease-out curve
      });
      return controls.stop;
    }
  }, [inView, value, motionValue, duration]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toLocaleString()}${suffix}`;
      }
    });
  }, [rounded, prefix, suffix]);

  return <span ref={ref} className="font-mono">{prefix}0{suffix}</span>;
};

export default Counter;

"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";
import { usd } from "@/lib/cost/estimate";

/**
 * A dollar amount that tweens to its new value.
 * Money represents a quantity, not a state, so a short ease-out tween is
 * right: it should settle, not bounce. Reduced motion snaps.
 */
export function Money({ value, sign = false, className = "" }: { value: number; sign?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => usd(Math.round(v), { sign }));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.45, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, reduce, mv]);

  return (
    <span className={`tabular ${className}`}>
      <span className="sr-only">{usd(value, { sign })}</span>
      <motion.span aria-hidden>{text}</motion.span>
    </span>
  );
}

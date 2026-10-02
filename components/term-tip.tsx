"use client";

import { useId, useState, type ReactNode } from "react";
import { TERMS, type TermKey } from "@/lib/terms";

/**
 * Plain words first, the insurance word on demand.
 * Renders a dotted-underline button; hover or focus reveals the definition.
 * The definition is always in the DOM (aria-describedby) so screen readers
 * get it without the hover.
 */
export function Term({ k, children, className = "" }: { k: TermKey; children?: ReactNode; className?: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const t = TERMS[k];
  return (
    <span className={`relative inline-block ${className}`}>
      <button
        type="button"
        aria-describedby={id}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help rounded-xs underline decoration-line-strong decoration-dotted underline-offset-[3px] hover:decoration-ink"
      >
        {children ?? t.word}
      </button>
      <span
        role="tooltip"
        id={id}
        className={`pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-md bg-dark px-3 py-2 text-left text-xs leading-relaxed font-normal text-on-dark shadow-overlay transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="block font-semibold">{t.word}</span>
        {t.plain}
      </span>
    </span>
  );
}

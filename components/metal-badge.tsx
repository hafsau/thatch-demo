import type { Metal } from "@/lib/plans/types";

const COLOR: Record<Metal, string> = {
  Bronze: "var(--bronze)",
  "Expanded Bronze": "var(--bronze)",
  Silver: "var(--silver)",
  Gold: "var(--gold)",
  Platinum: "var(--platinum)",
  Catastrophic: "var(--ink-dim)",
};

export function MetalBadge({ metal }: { metal: Metal }) {
  const label = metal === "Expanded Bronze" ? "Bronze" : metal;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
      <span aria-hidden className="inline-block size-2.5 rounded-full" style={{ background: COLOR[metal] }} />
      {label}
    </span>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Prototype" },
  { href: "/about", label: "Case study" },
  { href: "/docs/plan-card", label: "Plan card spec" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="wordmark text-[19px] leading-none text-brand">Thatch</span>
          <span className="text-[15px] font-medium text-ink">Fitting Room</span>
          <span className="hidden text-xs text-dim md:inline">unofficial concept</span>
        </Link>
        <nav aria-label="Site">
          <ul className="flex items-center gap-1 text-[15px]">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-3 py-1.5 transition-colors ${active ? "bg-ink text-bg" : "text-muted hover:bg-well hover:text-ink"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

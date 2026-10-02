"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Prototype", short: "Demo" },
  { href: "/about", label: "Case study", short: "Case study" },
  { href: "/docs/plan-card", label: "Plan card spec", short: "Spec" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-baseline gap-3">
          <span className="wordmark text-[19px] leading-none text-brand">Thatch</span>
          <span className="hidden text-[15px] font-medium text-ink sm:inline">Fitting Room</span>
          <span className="hidden text-xs text-dim md:inline">unofficial concept</span>
        </Link>
        <nav aria-label="Site">
          <ul className="flex items-center gap-0.5 text-sm sm:gap-1 sm:text-[15px]">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-full px-2.5 py-1.5 whitespace-nowrap transition-colors sm:px-3 ${active ? "bg-ink text-bg" : "text-muted hover:bg-well hover:text-ink"}`}
                  >
                    <span className="sm:hidden">{item.short}</span>
                    <span className="hidden sm:inline">{item.label}</span>
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

import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// Thatch's headline face is Selecta (licensed). Inter, which thatch.com also loads, stands in.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600"] });
// The THATCH wordmark is set in Montserrat with wide tracking.
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["700"] });

export const metadata: Metadata = {
  title: { default: "Fitting Room: try a health plan on before you buy it", template: "%s · Fitting Room" },
  description:
    "An unofficial product design concept for Thatch by Hafsa Usmani. Pick a health plan by what the year will really cost, not the monthly premium, and see what's left for your care.",
  metadataBase: new URL("https://thatch-demo-navy.vercel.app"),
};

export const viewport: Viewport = { themeColor: "#fcfbf8", colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans text-body">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-3 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-xs text-dim sm:px-6">
            <span>
              An unofficial concept by{" "}
              <a className="text-muted underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink" href="https://hafsausmani.com">
                Hafsa Usmani
              </a>
              . Not affiliated with Thatch. Nothing here is insurance advice.
            </span>
            <a className="text-muted underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink" href="https://github.com/hafsau/thatch-demo">
              Source
            </a>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}

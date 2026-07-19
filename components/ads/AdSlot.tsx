"use client";

import Script from "next/script";
import { useEffect } from "react";

export type AdFormat = "banner" | "in-content" | "sidebar";

interface AdSlotProps {
  /** AdSense ad unit ID. */
  slot: string;
  format: AdFormat;
  className?: string;
}

const FORMAT_MIN_HEIGHT: Record<AdFormat, number> = {
  banner: 100,
  "in-content": 280,
  sidebar: 250,
};

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Reusable ad unit. Reserves `minHeight` up front so the layout doesn't
 * shift once the ad script paints (CLS). Renders a labeled placeholder
 * until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set post-approval.
 *
 * The loader script uses a fixed `id`, so next/script dedupes it across
 * every AdSlot instance on a page — it only loads once no matter how many
 * slots are rendered.
 *
 * Placement rule (enforced by callers, not this component): never render
 * two AdSlots back-to-back with no content between them, and keep to 2-3
 * slots per page, never sandwiching a live data widget on its own.
 */
export function AdSlot({ slot, format, className }: AdSlotProps) {
  const minHeight = FORMAT_MIN_HEIGHT[format];
  const isLive = Boolean(ADSENSE_CLIENT_ID);

  useEffect(() => {
    if (!isLive) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Script blocked or not yet loaded — the reserved container still
      // prevents layout shift either way.
    }
  }, [isLive]);

  return (
    <div
      role="complementary"
      aria-label="Advertisement"
      className={`w-full flex flex-col items-center gap-1.5 ${className ?? ""}`}
    >
      {isLive ? (
        <>
          <Script
            id="adsbygoogle-script"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", minHeight }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot={slot}
            data-ad-format={format === "banner" ? "horizontal" : "auto"}
            data-full-width-responsive="true"
          />
        </>
      ) : (
        <div
          className="w-full flex items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground"
          style={{ minHeight }}
        >
          Ad slot ({format}) — reserved, pending AdSense approval
        </div>
      )}
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        Advertisement
      </span>
    </div>
  );
}

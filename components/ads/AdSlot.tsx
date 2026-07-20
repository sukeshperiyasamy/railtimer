"use client";

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
 * The AdSense loader script itself is loaded once, sitewide, in
 * app/layout.tsx — this component only pushes an ad request for its own
 * <ins> tag, so it never re-loads the library.
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
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format={format === "banner" ? "horizontal" : "auto"}
          data-full-width-responsive="true"
        />
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

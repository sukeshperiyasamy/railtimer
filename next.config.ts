import type { NextConfig } from "next";

/**
 * AdSense's own ad-serving/rendering scripts require a fairly permissive
 * script-src (including 'unsafe-inline') to function — Google does not
 * currently support a nonce/strict-CSP integration for display ads. This
 * CSP is as tight as we can make it while keeping AdSense, PostHog, and
 * Vercel Analytics working; script-src is the one directive that can't be
 * fully locked down without breaking ads.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.googletagservices.com https://us.i.posthog.com https://us-assets.i.posthog.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.google.com https://*.googlesyndication.com https://*.gstatic.com",
  "font-src 'self' data:",
  "connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP_DIRECTIVES },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/tools/chart-time-calculator",
        destination: "/tools/current-booking-calculator",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

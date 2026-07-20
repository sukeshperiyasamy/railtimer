import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
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

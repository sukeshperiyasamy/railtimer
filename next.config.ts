import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

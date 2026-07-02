import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Login is now unified across engineer/contractor/supplier — old
      // role-specific login URLs redirect to the single sign-in page.
      { source: '/supplier/login', destination: '/login', permanent: true },
      { source: '/engineer/login', destination: '/login', permanent: true },
      { source: '/contractor/login', destination: '/login', permanent: true },
    ];
  },
};

export default nextConfig;

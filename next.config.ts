import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Standalone output for minimal production footprint (reduces memory ~40%)
  output: "standalone",



  // Prevent Next.js from rebuilding unnecessarily on every request
  poweredByHeader: false,

  // Recommended for production on single-vCPU VPS
  experimental: {
    // Reduce memory usage by limiting worker threads
    workerThreads: false,
  },
};

export default nextConfig;

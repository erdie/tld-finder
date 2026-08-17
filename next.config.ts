import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.roots = [path.resolve(__dirname)];
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
    ];
    return config;
  },
};

export default nextConfig;

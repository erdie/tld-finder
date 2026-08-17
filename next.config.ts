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

    // Alias legacy Next.js polyfills for modern browser targets to pass Lighthouse Legacy JS audit
    config.resolve.alias = {
      ...config.resolve.alias,
      [path.resolve(__dirname, "node_modules/next/dist/build/polyfills/polyfill-module.js")]: path.resolve(__dirname, "lib/empty-polyfill.js"),
      [path.resolve(__dirname, "node_modules/next/dist/build/polyfills/polyfill-nomodule.js")]: path.resolve(__dirname, "lib/empty-polyfill.js"),
      [path.resolve(__dirname, "node_modules/next/dist/build/polyfills/object.assign/polyfill.js")]: path.resolve(__dirname, "lib/empty-polyfill.js"),
    };

    return config;
  },
};

export default nextConfig;

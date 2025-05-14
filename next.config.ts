import type { NextConfig } from "next";
import type { Configuration as WebpackConfiguration } from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  webpack: (config: WebpackConfiguration, { isServer }: { isServer: boolean }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      // config.node = { fs: 'empty' }; // Deprecated
    }
    if (isServer) {
      const externals = config.externals || [];
      if (Array.isArray(externals)) {
        externals.push('cpu-features', 'ssh2');
      } else {
        // If externals is an object, string, regex, or function, we can't simply push to it.
        // We'll create a new array with the existing externals and the new ones.
        // This might need adjustment for complex existing externals configurations.
        config.externals = [externals, 'cpu-features', 'ssh2'].flat();
      }
    }
    return config;
  },
};

export default nextConfig;

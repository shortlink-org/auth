import type { NextConfig } from "next"

// ENVIRONMENT VARIABLE ================================================================================================
const isProd = process.env.NODE_ENV === "production"
const AUTH_URI = process.env.AUTH_URI || "http://127.0.0.1:4433"

const nextConfig: NextConfig = {
  basePath: '/auth',
  reactStrictMode: true,
  generateEtags: false,
  output: 'export',
  compress: isProd,
  productionBrowserSourceMaps: isProd,
  transpilePackages: ['@shortlink-org/ui-kit'],
  compiler: {
    // ssr and displayName are configured by default
    emotion: true,
  },
  trailingSlash: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  bundlePagesRouterDependencies: true,
  
  // Allow cross-origin requests from localhost and 127.0.0.1 during development
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  
  // Enable React Compiler for improved performance
  reactCompiler: true,
  
  experimental: {
    webVitalsAttribution: ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'],
    clientTraceMetadata: ['sentry-trace', 'baggage'],
  
    // Forward browser logs to the terminal for easier debugging
    browserDebugInfoInTerminal: true,
  
    // Enable support for `global-not-found`
    globalNotFound: true,
  },
  
  // If you truly need a CDN path for static assets only, set assetPrefix as well,
  // but usually basePath is sufficient for an app mounted at /auth.
  // async rewrites() {
  //   if (isProd) return []
  //   // Proxy ORY Kratos locally; basePath is stripped for matching due to basePath: false.
  //   return {
  //   beforeFiles: [
  //     {
  //     source: '/api/auth/:uri*',
  //     destination: `${AUTH_URI}/api/auth/:uri*`,
  //     },
  //   ],
  //   }
  // },
}

export default nextConfig

import type { NextConfig } from "next"

// ENVIRONMENT VARIABLE ================================================================================================
const isProd = process.env.NODE_ENV === "production"
const AUTH_URI = process.env.AUTH_URI || "http://127.0.0.1:4433"

const nextConfig: NextConfig = {
  // If you truly need a CDN path for static assets only, set assetPrefix as well,
  // but usually basePath is sufficient for an app mounted at /auth.
  async rewrites() {
    if (isProd) return []
    // Proxy ORY Kratos locally; basePath is stripped for matching due to basePath: false.
    return {
      beforeFiles: [
        {
          source: `/api/auth/:uri*`,
          destination: `${AUTH_URI}/:uri*`,
          basePath: false,
        },
      ],
    }
  },
}

export default nextConfig

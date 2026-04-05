/** @type {import('next').NextConfig} */

/**
 * Same rules as `src/lib/appBasePath.ts`: pathname of NEXT_PUBLIC_NEXTAUTH_URL / NEXTAUTH_URL,
 * or NEXT_PUBLIC_BASE_PATH. Empty → app served at / (local `next dev`). /isep → hosted path.
 */
function resolveBasePath() {
  const explicit = process.env.NEXT_PUBLIC_BASE_PATH;
  if (explicit !== undefined && String(explicit).trim() !== '') {
    const p = String(explicit).replace(/\/$/, '');
    if (p === '/' || p === '') return undefined;
    return p;
  }
  const u = process.env.NEXT_PUBLIC_NEXTAUTH_URL || process.env.NEXTAUTH_URL;
  if (!u) return undefined;
  try {
    const p = new URL(u).pathname.replace(/\/$/, '');
    if (!p || p === '/') return undefined;
    return p;
  } catch {
    return undefined;
  }
}

const basePath = resolveBasePath();

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  ...(basePath ? { basePath } : {}),
  trailingSlash: true, // avoid 308 redirect /isep/ -> /isep which causes loop behind proxy
  /**
   * Webpack’s filesystem cache can fail with PackFileCacheStrategy / “Unable to snapshot resolve
   * dependencies” (e.g. project path quirks). That may leave client chunks unregistered so
   * /_next/static/chunks/main-app.js returns 404 while webpack.js still 200 — blank hydrated UI.
   * Disabling cache in dev avoids that; production builds still use the default cache.
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  async rewrites() {
    const yjsWsProxyTarget = (
      process.env.YJS_WEBSOCKET_PROXY_TARGET || 'http://localhost:1234'
    ).replace(/\/$/, '');
    return [
      {
        source: '/api/proxy/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
          : 'http://localhost:8000/:path*',
      },
      // Dev: browser uses ws://localhost:3000/collab/{documentId}; Next proxies WebSocket to y-websocket (e.g. :1234).
      {
        source: '/collab/:path*',
        destination: `${yjsWsProxyTarget}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

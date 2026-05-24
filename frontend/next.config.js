/** @type {import('next').NextConfig} */
const path = require('path');

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
   * Dev static 404 (login unstyled): HTML points at chunk names that are not on disk when the
   * webpack cache and .next manifest drift. Avoid `cache: false` (causes the same drift).
   * - Filesystem cache under `node_modules/.cache` (not .next) reduces PackFile “snapshot” issues
   *   on paths with spaces and keeps emits aligned with the dev server manifest.
   * - If assets still 404: stop dev, run `npm run dev:clean`, wait for “Ready”, hard-refresh the browser.
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = {
        type: 'filesystem',
        cacheDirectory: path.join(__dirname, 'node_modules', '.cache', 'webpack'),
        buildDependencies: {
          config: [__filename],
        },
      };
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

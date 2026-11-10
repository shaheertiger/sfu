import CDN from './lib/figures-cdn.json' with { type: 'json' };

/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Browsers must not guess content types (stops script execution from mislabelled uploads).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // The app and the preview links are never meant to be framed by other sites.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Don't leak full URLs (preview-link tokens, OAuth states) to the sites people click through to.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The site never needs these device features.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  // Keep everything on https once it has been seen over https.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig = {
  // The screens keep timers and listeners in class components, matching the prototype.
  reactStrictMode: false,
  poweredByHeader: false,
  // Illustration cards are stored in Vercel Blob but served on our own domain, so image search
  // credits scheduleforyou.com (lib/figure-url.js). afterFiles: a card rendered locally into
  // public/ wins, which is what `next dev` shows before an upload.
  async rewrites() {
    if (!CDN.base) return [];
    const base = CDN.base.replace(/\/$/, '');
    return { afterFiles: [{ source: '/images/:dir(blog|tools|figures)/:file([\\w.-]+-(?:1200|720)x\\d+\\.webp)', destination: `${base}/images/:dir/:file` }] };
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      // Cards keep their URL when re-rendered, so cache for a day at the edge and revalidate in the background.
      { source: '/images/:dir(blog|tools|figures)/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800' }] },
      // API responses are never cacheable by shared caches.
      // /api/md is the markdown version of public pages and sets its own cache headers (lib/md/http.js).
      { source: '/api/((?!md(?:/|$)).*)', headers: [{ key: 'Cache-Control', value: 'no-store' }, { key: 'X-Robots-Tag', value: 'noindex' }] },
    ];
  },
};
export default nextConfig;

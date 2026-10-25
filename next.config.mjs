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
  // Where AI agents find the site map for models, the full content and the usage policy (see lib/md).
  { key: 'Link', value: '</llms.txt>; rel="describedby"; type="text/plain", </llms-full.txt>; rel="describedby"; type="text/markdown", </ai.txt>; rel="describedby"; type="text/plain"' },
];

const nextConfig = {
  // The screens keep timers and listeners in class components, matching the prototype.
  reactStrictMode: false,
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      // API responses are never cacheable by shared caches.
      // /api/md is the markdown version of public pages and sets its own cache headers (lib/md/http.js).
      { source: '/api/((?!md(?:/|$)).*)', headers: [{ key: 'Cache-Control', value: 'no-store' }, { key: 'X-Robots-Tag', value: 'noindex' }] },
    ];
  },
};
export default nextConfig;

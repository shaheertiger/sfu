import { DESCRIPTION, SITE_NAME } from '@/lib/seo';

export default function manifest() {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: DESCRIPTION,
    start_url: '/app',
    display: 'standalone',
    background_color: '#0f1012',
    theme_color: '#0f1012',
    // Once installed, the app appears in the phone's or desktop's Share sheet; the share opens the composer.
    share_target: { action: '/app', method: 'GET', params: { title: 'title', text: 'text', url: 'url' } },
    icons: [
      { src: '/logos/schedule-for-you-glyph.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/brand/logo-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/logo-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}

import './globals.css';
import './fonts.css';
import { Analytics } from '@vercel/analytics/next';
import { siteUrl } from '@/lib/site';
import { DESCRIPTION, SITE_NAME, TAGLINE } from '@/lib/seo';

/** Search Console / Bing Webmaster Tools ownership tags, when the codes are set in the environment. */
function verification() {
  const v = {};
  if (process.env.GOOGLE_SITE_VERIFICATION) v.google = process.env.GOOGLE_SITE_VERIFICATION;
  if (process.env.BING_SITE_VERIFICATION) v.other = { 'msvalidate.01': process.env.BING_SITE_VERIFICATION };
  return v;
}

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  category: 'business',
  icons: { icon: '/logos/schedule-for-you.svg', apple: '/apple-icon.png' },
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en_US', title: TAGLINE, description: DESCRIPTION, url: '/' },
  twitter: { card: 'summary_large_image', title: TAGLINE, description: DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  formatDetection: { telephone: false },
  verification: verification(),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f1012',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts are self-hosted (app/fonts.css) and preloaded, so text is laid out in its final font
            on first paint instead of reflowing when a web font arrives. */}
        <link rel="preload" href="/fonts/geist-normal-100-900-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/geist-mono-normal-400-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

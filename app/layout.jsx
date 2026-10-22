import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { siteUrl } from '@/lib/site';

const description = 'Write once, schedule everywhere. Plan, preview and publish to ten social platforms from one queue.';

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'Schedule For You', template: '%s · Schedule For You' },
  description,
  applicationName: 'Schedule For You',
  icons: { icon: '/logos/schedule-for-you.svg' },
  openGraph: { type: 'website', siteName: 'Schedule For You', title: 'Schedule For You', description, url: '/' },
  twitter: { card: 'summary', title: 'Schedule For You', description },
  robots: { index: true, follow: true },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&display=swap"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

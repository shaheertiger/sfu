import './globals.css';

export const metadata = {
  title: 'Schedule For You',
  description: 'Write once, schedule everywhere. Plan, preview and publish to ten social platforms from one queue.',
  icons: { icon: '/logos/schedule-for-you.svg' },
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
      <body>{children}</body>
    </html>
  );
}

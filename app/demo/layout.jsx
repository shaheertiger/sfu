export const metadata = {
  title: 'Demo',
  description: 'Try the Schedule For You dashboard with sample data. Nothing is saved.',
  alternates: { canonical: '/demo' },
  // Sample-data dashboard: useful to visitors, not a search result.
  robots: { index: false, follow: true },
};
export default function Layout({ children }) { return children; }

'use client';
import dynamic from 'next/dynamic';

// Rendered in the browser only: the screen reads window size, scroll and the clock.
const LiveDashboard = dynamic(() => import('../../components/LiveDashboard'), { ssr: false });

export default function Page() {
  return <LiveDashboard />;
}

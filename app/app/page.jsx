'use client';
import dynamic from 'next/dynamic';

// Rendered in the browser only: the screen reads window size, scroll and the clock.
const Dashboard = dynamic(() => import('../../components/Dashboard'), { ssr: false });

export default function Page() {
  return <Dashboard />;
}

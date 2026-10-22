'use client';
import dynamic from 'next/dynamic';

// Rendered in the browser only: the screen reads window size, scroll and the clock.
const Landing = dynamic(() => import('../components/Landing'), { ssr: false });

export default function Page() {
  return <Landing />;
}

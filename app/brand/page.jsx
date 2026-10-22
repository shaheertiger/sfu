'use client';
import dynamic from 'next/dynamic';

// Rendered in the browser only: the screen reads window size, scroll and the clock.
const Brand = dynamic(() => import('../../components/Brand'), { ssr: false });

export default function Page() {
  return <Brand />;
}

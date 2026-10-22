'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Rendered in the browser only: the screens read window size, scroll and the clock.
const Landing = dynamic(() => import('../components/Landing'), { ssr: false });
const LandingMobile = dynamic(() => import('../components/LandingMobile'), { ssr: false });

/** Phones get the mobile landing page; "Desktop site" (?desktop=1) shows the full one. */
function pickMobile() {
  if (new URLSearchParams(window.location.search).get('desktop') === '1') return false;
  return window.matchMedia('(max-width: 640px)').matches;
}

export default function Page() {
  const [mobile, setMobile] = useState(null);
  useEffect(() => {
    setMobile(pickMobile());
    // Rotating a phone or resizing a window can cross the breakpoint.
    const mq = window.matchMedia('(max-width: 640px)');
    const onChange = () => setMobile(pickMobile());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  if (mobile === null) return null;
  return mobile ? <LandingMobile /> : <Landing />;
}

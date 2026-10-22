'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Both variants render on the server (crawlers and the first paint get the full page);
// the browser then keeps the choice in step with the viewport.
const Landing = dynamic(() => import('./Landing'));
const LandingMobile = dynamic(() => import('./LandingMobile'));

const QUERY = '(max-width: 640px)';

/** Phones get the mobile landing page; "Desktop site" (?desktop=1) shows the full one. */
function pickMobile() {
  if (new URLSearchParams(window.location.search).get('desktop') === '1') return false;
  return window.matchMedia(QUERY).matches;
}

export default function LandingSwitch({ initialMobile }) {
  const [mobile, setMobile] = useState(initialMobile);
  useEffect(() => {
    setMobile(pickMobile());
    // Rotating a phone or resizing a window can cross the breakpoint.
    const mq = window.matchMedia(QUERY);
    const onChange = () => setMobile(pickMobile());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return mobile ? <LandingMobile /> : <Landing />;
}

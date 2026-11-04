'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import m from './marketing.module.css';

/**
 * A slim call-to-action bar pinned to the bottom of the screen on phones and small tablets (CSS
 * hides it on wide screens, where the sidebar card shows instead). It only appears once the element
 * with id `watch` has scrolled above the viewport, so it never covers the tool while it's in use,
 * and it can be dismissed for the rest of the visit.
 */
export default function StickyCtaBar({ watch, text, button, href }) {
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const el = document.getElementById(watch);
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [watch]);

  if (closed) return null;
  return (
    <div className={m.ctaBar} data-show={show ? 'true' : 'false'} role="complementary" aria-label="Start free" aria-hidden={!show}>
      <span className={m.ctaBarText}>{text}</span>
      <Link href={href} className={m.ctaBarBtn} tabIndex={show ? 0 : -1}>{button}</Link>
      <button type="button" className={m.ctaBarClose} aria-label="Dismiss" tabIndex={show ? 0 : -1} onClick={() => setClosed(true)}>×</button>
    </div>
  );
}

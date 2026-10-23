'use client';
import { useEffect } from 'react';

/**
 * Marks the sidebar link of the section being read and closes the mobile menu after a link is
 * picked. The navigation itself is plain server-rendered anchors and works without this.
 */
export default function DocsNav() {
  useEffect(() => {
    const links = Array.from(document.querySelectorAll('[data-docs-nav] a[href^="#"]'));
    const ids = [...new Set(links.map((a) => a.getAttribute('href').slice(1)))];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    let current = null;
    let frame = 0;

    const update = () => {
      frame = 0;
      let id = sections[0]?.id;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= 140) id = el.id;
        else break;
      }
      if (id === current) return;
      current = id;
      for (const a of links) {
        if (a.getAttribute('href') === `#${id}`) {
          a.setAttribute('aria-current', 'true');
          const box = a.closest('[data-docs-scroll]');
          if (box) {
            const r = a.getBoundingClientRect();
            const b = box.getBoundingClientRect();
            if (r.top < b.top || r.bottom > b.bottom) box.scrollTop += r.top - b.top - b.height / 3;
          }
        } else a.removeAttribute('aria-current');
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onClick = (e) => {
      const details = e.target.closest?.('details[data-docs-nav]');
      if (details && e.target.closest('a')) details.open = false;
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}

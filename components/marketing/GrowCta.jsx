import Link from 'next/link';
import m from './marketing.module.css';
import StickyCtaBar from './StickyCtaBar';

/**
 * The sign-up card that sits beside a tool page's long-form copy on wide screens (sticky, so it
 * stays in view while people read), plus the slim bar phones get instead once the tool has
 * scrolled away. Every line here must stay true of the Free plan (lib/plan-limits.js).
 */
const POINTS = [
  'Schedule to 10 platforms from one composer',
  'A different caption for each platform',
  'Calendar and queue for the whole week',
  'Free for 3 accounts, no card',
];

export function GrowCard() {
  return (
    <aside className={m.growAside} aria-label="Schedule For You">
      <div className={m.growCard}>
        <p className={m.growKicker}>Schedule For You</p>
        <h2 className={m.growTitle}>Post Everywhere Without Opening Every App</h2>
        <p className={m.growText}>Write once, tweak it for each network and let it publish on time.</p>
        <ul className={m.growList}>
          {POINTS.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <Link href="/signup" className={m.growBtn}>Start free</Link>
        <Link href="/demo" className={m.growLink}>See the dashboard first →</Link>
      </div>
    </aside>
  );
}

/** `watch` is the id of the element (the tool) the phone bar waits to scroll past. */
export function GrowBar({ watch }) {
  return <StickyCtaBar watch={watch} text="Post to 10 platforms from one place" button="Start free" href="/signup" />;
}

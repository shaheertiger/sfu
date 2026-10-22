import { headers } from 'next/headers';
import LandingSwitch from '../components/LandingSwitch';

export const metadata = { alternates: { canonical: '/' } };

// Phones (by user agent) get the mobile design, everything else the full one. Both are rendered
// on the server, so search engines and link previews see the real page, not an empty shell.
// `?desktop=1` forces the full design; the browser re-checks the viewport after loading.
const PHONE = /iPhone|iPod|Windows Phone|Android.+Mobile|Mobi/i;

export default async function Page({ searchParams }) {
  const [sp, h] = await Promise.all([searchParams, headers()]);
  const forceDesktop = sp?.desktop === '1';
  const mobile = !forceDesktop && PHONE.test(h.get('user-agent') || '');
  return <LandingSwitch initialMobile={mobile} />;
}

import { headers } from 'next/headers';
import LandingSwitch from '../components/LandingSwitch';
import JsonLd from '../components/JsonLd';
import { DESCRIPTION, TAGLINE, landingLd } from '../lib/seo';
import { agentMetadata } from '../lib/seo-pages';

export const metadata = {
  title: { absolute: `Schedule For You · Social media scheduler for ten platforms` },
  description: DESCRIPTION,
  alternates: { canonical: '/', ...agentMetadata('/', DESCRIPTION).alternates },
  other: agentMetadata('/', DESCRIPTION).other,
  openGraph: { title: TAGLINE, description: DESCRIPTION, url: '/' },
};

// Phones (by user agent) get the mobile design, everything else the full one. Both are rendered
// on the server, so search engines and link previews see the real page, not an empty shell.
// `?desktop=1` forces the full design; the browser re-checks the viewport after loading.
const PHONE = /iPhone|iPod|Windows Phone|Android.+Mobile|Mobi/i;

export default async function Page({ searchParams }) {
  const [sp, h] = await Promise.all([searchParams, headers()]);
  const forceDesktop = sp?.desktop === '1';
  const mobile = !forceDesktop && PHONE.test(h.get('user-agent') || '');
  return (
    <>
      {/* The FAQ is part of the mobile design only, so FAQPage data is sent only with that variant. */}
      <JsonLd data={landingLd({ withFaq: mobile })} />
      <LandingSwitch initialMobile={mobile} />
    </>
  );
}

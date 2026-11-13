import { headers } from 'next/headers';
import LandingSwitch from '../components/LandingSwitch';
import JsonLd from '../components/JsonLd';
import { DESCRIPTION, META_DESCRIPTION, TAGLINE, landingLd } from '../lib/seo';
import { agentMetadata } from '../lib/seo-pages';

const TITLE = 'Schedule For You · Social media scheduler for nine platforms';

export const metadata = {
  title: { absolute: TITLE },
  description: META_DESCRIPTION,
  alternates: { canonical: '/', ...agentMetadata('/', DESCRIPTION).alternates },
  other: agentMetadata('/', DESCRIPTION).other,
  // Social previews use the same title as search results (the tagline stays the page's headline).
  openGraph: { title: TITLE, description: META_DESCRIPTION, url: '/' },
  twitter: { card: 'summary_large_image', title: TITLE, description: META_DESCRIPTION },
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

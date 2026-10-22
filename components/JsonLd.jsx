import { jsonLd } from '@/lib/seo';

/** Structured data for search engines. Server component: rendered into the HTML, no client JavaScript. */
export default function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}

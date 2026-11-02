import { notFound } from 'next/navigation';
import SpecPage, { specCopy } from '@/components/marketing/SpecPage';
import { allSpecPages, specBySlug, specPath, specPlatformBySlug } from '@/lib/specs';
import { pageMetadata } from '@/lib/seo-pages';

export const dynamicParams = false;
export function generateStaticParams() { return allSpecPages(); }

export async function generateMetadata({ params }) {
  const { platform, spec } = await params;
  const p = specPlatformBySlug(platform); const sp = specBySlug(platform, spec);
  if (!p || !sp) return {};
  const copy = specCopy(p, sp);
  return pageMetadata({ title: copy.title, description: copy.description, path: specPath(platform, spec), absolute: true, keyword: copy.keyword });
}

export default async function Page({ params }) {
  const { platform, spec } = await params;
  const p = specPlatformBySlug(platform); const sp = specBySlug(platform, spec);
  if (!p || !sp) notFound();
  return <SpecPage platform={p} spec={sp} />;
}

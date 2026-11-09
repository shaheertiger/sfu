import { notFound } from 'next/navigation';
import NotifyPage from '@/components/marketing/NotifyPage';
import { allNotifyPages, notifyActionBySlug, notifyCopy, notifyEntry, notifyPath, notifyPlatformBySlug } from '@/lib/notify';
import { pageMetadata } from '@/lib/seo-pages';

export const dynamicParams = false;
export function generateStaticParams() { return allNotifyPages(); }

export async function generateMetadata({ params }) {
  const { platform, action } = await params;
  const p = notifyPlatformBySlug(platform); const a = notifyActionBySlug(action); const e = notifyEntry(platform, action);
  if (!p || !a || !e) return {};
  const copy = notifyCopy(p, a, e);
  return pageMetadata({ title: copy.title, description: copy.description, path: notifyPath(platform, action), absolute: true, keyword: copy.keyword });
}

export default async function Page({ params }) {
  const { platform, action } = await params;
  const p = notifyPlatformBySlug(platform); const a = notifyActionBySlug(action);
  if (!p || !a || !notifyEntry(platform, action)) notFound();
  return <NotifyPage platform={p} action={a} />;
}

import ContentPage, { contentMetadata } from '@/components/marketing/ContentPage';

const SLUG = 'best-cross-posting-tools';

export const generateMetadata = () => contentMetadata(SLUG);

export default function Page() {
  return <ContentPage slug={SLUG} />;
}

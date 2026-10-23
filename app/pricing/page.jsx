import ContentPage, { contentMetadata } from '@/components/marketing/ContentPage';

const SLUG = 'pricing';

export const generateMetadata = () => contentMetadata(SLUG);

export default function Page() {
  return <ContentPage slug={SLUG} />;
}

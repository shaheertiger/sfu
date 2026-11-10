import ContentPage, { contentMetadata } from '@/components/marketing/ContentPage';

const SLUG = 'terms';

export const generateMetadata = () => contentMetadata(SLUG);

export default function Page() {
  return <ContentPage slug={SLUG} />;
}

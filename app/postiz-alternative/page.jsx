import ContentPage, { contentMetadata } from '@/components/marketing/ContentPage';

const SLUG = 'postiz-alternative';

export const generateMetadata = () => contentMetadata(SLUG);

export default function Page() {
  return <ContentPage slug={SLUG} />;
}

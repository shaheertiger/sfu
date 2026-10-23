import ContentPage, { contentMetadata } from '@/components/marketing/ContentPage';

const SLUG = 'post-to-multiple-instagram-accounts';

export const generateMetadata = () => contentMetadata(SLUG);

export default function Page() {
  return <ContentPage slug={SLUG} />;
}

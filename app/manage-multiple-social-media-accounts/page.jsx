import ContentPage, { contentMetadata } from '@/components/marketing/ContentPage';

const SLUG = 'manage-multiple-social-media-accounts';

export const generateMetadata = () => contentMetadata(SLUG);

export default function Page() {
  return <ContentPage slug={SLUG} />;
}

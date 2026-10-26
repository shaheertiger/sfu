import { localizedBlogRoute } from '@/components/marketing/Localized';

/** Spanish blog posts (/es/blog/<slug>); copy in content/i18n/es/blog. */
const route = localizedBlogRoute('es');

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;

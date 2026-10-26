import { localizedPlatformRoute } from '@/components/marketing/Localized';

/** Localized platform scheduler pages (/ja/instagram, …); copy in content/i18n/ja/platforms. */
const route = localizedPlatformRoute('ja');

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;

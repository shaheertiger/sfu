import { localizedPlatformRoute } from '@/components/marketing/Localized';

/** Localized platform scheduler pages (/de/instagram, …); copy in content/i18n/de/platforms. */
const route = localizedPlatformRoute('de');

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;

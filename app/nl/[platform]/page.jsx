import { localizedPlatformRoute } from '@/components/marketing/Localized';

/** Localized platform scheduler pages (/nl/instagram, …); copy in content/i18n/nl/platforms. */
const route = localizedPlatformRoute('nl');

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;

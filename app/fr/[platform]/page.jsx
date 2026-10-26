import { localizedPlatformRoute } from '@/components/marketing/Localized';

/** Localized platform scheduler pages (/fr/instagram, …); copy in content/i18n/fr/platforms. */
const route = localizedPlatformRoute('fr');

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;

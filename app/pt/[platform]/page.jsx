import { localizedPlatformRoute } from '@/components/marketing/Localized';

/** Localized platform scheduler pages (/pt/facebook, …); copy in content/i18n/pt/platforms. */
const route = localizedPlatformRoute('pt');

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;

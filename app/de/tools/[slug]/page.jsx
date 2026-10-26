import { localizedToolRoute } from '@/components/marketing/Localized';

/** Localized free tool pages (/de/tools/<slug>); copy in content/i18n/de/tools. */
const route = localizedToolRoute('de');

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;

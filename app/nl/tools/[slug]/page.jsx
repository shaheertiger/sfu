import { localizedToolRoute } from '@/components/marketing/Localized';

/** Localized free tool pages (/nl/tools/<slug>); copy in content/i18n/nl/tools. */
const route = localizedToolRoute('nl');

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;

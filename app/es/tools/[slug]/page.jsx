import { localizedToolRoute } from '@/components/marketing/Localized';

/** Localized free tool pages (/es/tools/<slug>); copy in content/i18n/es/tools. */
const route = localizedToolRoute('es');

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;

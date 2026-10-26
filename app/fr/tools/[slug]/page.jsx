import { localizedToolRoute } from '@/components/marketing/Localized';

/** Localized free tool pages (/fr/tools/<slug>); copy in content/i18n/fr/tools. */
const route = localizedToolRoute('fr');

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;

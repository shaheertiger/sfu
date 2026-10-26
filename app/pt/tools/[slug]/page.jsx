import { localizedToolRoute } from '@/components/marketing/Localized';

/** Localized free tool pages (/pt/tools/<slug>); copy in content/i18n/pt/tools. */
const route = localizedToolRoute('pt');

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;

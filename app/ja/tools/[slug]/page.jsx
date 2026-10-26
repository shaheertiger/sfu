import { localizedToolRoute } from '@/components/marketing/Localized';

/** Localized free tool pages (/ja/tools/<slug>); copy in content/i18n/ja/tools. */
const route = localizedToolRoute('ja');

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;

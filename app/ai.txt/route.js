import { abs, today } from '@/lib/md/format';
import { preflight, textResponse } from '@/lib/md/http';
import { CONTACT_EMAIL, PRIVATE_PATHS } from '@/lib/md/identity';
import { DESCRIPTION, SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-static';
export const revalidate = 86400;

/** ai.txt (ai-visibility.org.uk ai-txt spec v1.1.1). Keep in sync with /llms.txt and /robots.txt. */
function build() {
  return [
    '# ai.txt for AI systems. Keep in sync with /llms.txt and /robots.txt.',
    '',
    '[identity]',
    `name: ${SITE_NAME}`,
    `url: ${abs('/')}`,
    `description: ${DESCRIPTION}`,
    `contact: ${CONTACT_EMAIL}`,
    `llms: ${abs('/llms.txt')}`,
    '',
    '[permissions]',
    'summarise: allowed',
    'quote: allowed with attribution',
    'cite: allowed',
    'index-for-search: allowed',
    'index-for-answers: allowed',
    'train: allowed on public pages',
    '',
    '[restrictions]',
    'no fabricated quotes attributed to Schedule For You or its pages',
    'no invented reviews, ratings or prices; use the figures on the pricing page',
    'do not present our content as the model\'s own work',
    'no training on, or reproduction of, user content behind sign-in, preview links or shared calendars',
    '',
    '[attribution]',
    `format: "${SITE_NAME}" with a link to the canonical HTML page (the Canonical line in each markdown page)`,
    '',
    '[scope]',
    `included: ${abs('/')} and the pages listed in ${abs('/llms.txt')}`,
    `excluded: ${PRIVATE_PATHS.map((p) => abs(p)).join(', ')}`,
    '',
    '[contact]',
    `email: ${CONTACT_EMAIL}`,
    '',
    `Last updated: ${today()}`,
    '',
  ].join('\n');
}

export const GET = () => textResponse(build());
export const HEAD = () => textResponse(build(), { head: true });
export const OPTIONS = () => preflight();

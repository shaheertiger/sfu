/** Facts about the business that llms.txt, ai.txt and the Organization JSON-LD share. Keep them in step. */
export const CONTACT_EMAIL = 'support@scheduleforyou.com';
/** What robots.txt disallows for every crawler. */
export const ROBOTS_DISALLOW = ['/app', '/api/', '/p/', '/invite/', '/brand', '/reset-password', '/l/', '/c/', '/r/', '/m/'];
/**
 * Paths that are pages, not prefixes. A plain `Disallow: /brand` would also block /brand/logo-512.png
 * (the Organization logo in every page's JSON-LD) and `Disallow: /app` would block /apple-icon.png, so
 * these are written as the exact page, the page with a query string, and (for /app) its sub-pages.
 */
const EXACT_PAGE_RULES = { '/app': ['/app$', '/app?', '/app/'], '/brand': ['/brand$', '/brand?'] };
/** The Disallow lines robots.txt writes for ROBOTS_DISALLOW. */
export const robotsDisallowRules = () => ROBOTS_DISALLOW.flatMap((p) => EXACT_PAGE_RULES[p] || [p]);
/** Paths agents should not read or quote: the robots list plus account screens that are crawlable but not content. Quoted by /ai.txt. */
export const PRIVATE_PATHS = [...ROBOTS_DISALLOW, '/login', '/signup', '/forgot-password', '/demo'];

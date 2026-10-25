/** Facts about the business that llms.txt, ai.txt and the Organization JSON-LD share. Keep them in step. */
export const CONTACT_EMAIL = 'support@scheduleforyou.com';
/** What robots.txt disallows for every crawler. */
export const ROBOTS_DISALLOW = ['/app', '/api/', '/p/', '/invite/', '/brand', '/reset-password', '/l/', '/c/', '/r/', '/m/'];
/** Paths agents should not read or quote: the robots list plus account screens that are crawlable but not content. Quoted by /ai.txt. */
export const PRIVATE_PATHS = [...ROBOTS_DISALLOW, '/login', '/signup', '/forgot-password', '/demo'];

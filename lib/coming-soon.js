/**
 * Platforms shown on the site and in the app but not open for posting yet.
 * Remove an id here (and in COMING_SOON_SLUGS) when it goes live, then update the
 * platform counts below and the copy that says "coming soon".
 */
export const COMING_SOON = ['google_business'];
/** The same platforms by the slugs the marketing pages use (logos, /google-business-profile). */
export const COMING_SOON_SLUGS = ['googlemybusiness', 'google-business-profile'];
export const isComingSoon = (idOrSlug) => COMING_SOON.includes(idOrSlug) || COMING_SOON_SLUGS.includes(idOrSlug);
/** How many platforms people can post to today. */
export const LIVE_PLATFORM_COUNT = 9;

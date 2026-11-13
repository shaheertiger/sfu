/**
 * Sign-up links from marketing pages carry where they were clicked, so analytics can say which
 * page family and which placement brings sign-ups (Vercel Analytics reads utm_* parameters).
 * placement: nav, hero, blog-inline, blog-end, page-end, tool-card, sticky-bar, footer.
 * page: the path of the page the link is on, when known.
 */
export function signupHref(placement, page = '') {
  const q = new URLSearchParams({ utm_source: 'site', utm_medium: placement });
  if (page) q.set('utm_content', page);
  return `/signup?${q}`;
}

/**
 * The Free plan and the features that need a paid plan (Solo or Studio). Shared by the server
 * (lib/server/billing.ts enforces it), the dashboard and the marketing pages, so they never disagree.
 *
 * Free is the hook: the composer, per-platform captions, calendar, queue, posting slots, first
 * comments and threads all work. What a growing account or an agency reaches for next is paid.
 */
export const FREE_PLAN = {
  id: 'free',
  name: 'Free',
  /** Connected accounts. Accounts past this (after a downgrade) are paused, oldest kept. */
  accountLimit: 3,
  /** Posts waiting to publish at any one time. Drafts and published posts don't count. */
  queueLimit: 10,
};

/** Each paid-only feature: a short label (lists, lock badges) and the sentence a refusal shows. */
export const PAID_FEATURES = {
  bulk: { label: 'Bulk scheduling and CSV import', is: 'are' },
  api: { label: 'The API and MCP server', is: 'are' },
  webhooks: { label: 'Webhooks', is: 'are' },
  rss: { label: 'RSS auto-post', is: 'is' },
  preview: { label: 'Client preview links', is: 'are' },
  approvals: { label: 'Approvals', is: 'are' },
  calendar: { label: 'The shared calendar', is: 'is' },
  repeat: { label: 'Repeating and evergreen posts', is: 'are' },
  links: { label: 'Link click tracking', is: 'is' },
};

/** "Webhooks are part of the paid plans. Start a 7-day free trial of Solo or Studio to use them." */
export function paidOnlyMessage(feature) {
  const f = PAID_FEATURES[feature];
  if (!f) return 'This is part of the paid plans.';
  return `${f.label} ${f.is} part of the paid plans. Start a 7-day free trial of Solo or Studio to use ${f.is === 'are' ? 'them' : 'it'}.`;
}

export const queueLimitMessage = () =>
  `The Free plan holds up to ${FREE_PLAN.queueLimit} scheduled posts at a time. Upgrade for unlimited scheduling, or wait for some to publish.`;

export const accountLimitMessage = () =>
  `The Free plan connects up to ${FREE_PLAN.accountLimit} accounts. Upgrade to connect up to 15 on Solo or 100 on Studio.`;

/**
 * Added on its own paragraph to posts published from a Free workspace, when it fits the platform's
 * character limit (see withSignature). Paid plans never add it.
 */
export const freeBrandLine = (url = 'https://scheduleforyou.com') => `Scheduled with Schedule For You: ${url}`;

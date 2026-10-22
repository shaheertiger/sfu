/** Public shape of a webhook. The secret is shown in full only when the webhook is created. */
export const webhookRow = (h: any, revealSecret = false) => ({
  id: h.id,
  url: h.url,
  events: h.events,
  active: h.active,
  secret: revealSecret ? h.secret : `${String(h.secret).slice(0, 10)}…`,
  last_status: h.last_status,
  last_error: h.last_error,
  last_sent_at: h.last_sent_at,
  created_at: h.created_at,
});

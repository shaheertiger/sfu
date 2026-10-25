# Schedule For You

Post scheduler: write once, publish to ten social platforms from one queue. Next.js 16 on **Vercel Pro**, **Neon Postgres** for data, **Neon Auth** for sign-in, **Vercel Cron** for publishing, **Neon Object Storage** for media.

| Route              | What it is                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `/`                | Landing page, server-rendered. Phones get the mobile design (`LandingMobile`, chosen by user agent, then kept in step with the viewport); `/?desktop=1` shows the full one |
| `/signup`, `/login` | Email + password accounts (Neon Auth)                                                         |
| `/app`             | The dashboard on your real data (signed in)                                                    |
| `/demo`            | The same dashboard with sample data, nothing saved                                             |
| `/app/automations` | Signature, RSS auto-post, webhooks (workspace menu → Automations)                              |
| `/p/<token>`       | Client preview link: view a post, approve, ask for changes or comment (no account)             |
| `/c/<token>`       | Shared calendar: read-only schedule for clients and teammates; `/c/<token>/feed.ics` is the iCal feed |
| `/brand`           | Logo sheet                                                                                     |
| `/api/v1/*`        | REST API (session or `Authorization: Bearer sfy_…` API key)                                    |
| `/api/cron/publish` | Publishing job, run by Vercel Cron every minute                                               |

On phones the dashboard switches to a top bar, a bottom tab bar and a slide-in menu.

## How publishing works

1. A post is saved in Postgres with one *target* per social account.
2. Every minute Vercel Cron calls `/api/cron/publish` (with `CRON_SECRET`). It claims due posts with `FOR UPDATE SKIP LOCKED`, so overlapping runs never post twice.
3. Each target is published through its platform adapter (`lib/server/adapters`). Media is read from the storage bucket. Tokens are refreshed when close to expiry.
4. Failures retry up to 3 times, 2 minutes apart. Auth errors mark the account "Reconnect needed". Repeating (weekly/monthly) and evergreen posts get their next copy scheduled after publishing.
5. Posts waiting for approval and workspaces with a paused queue are skipped.
6. The same run sends reminder and digest emails, checks RSS feeds (with a time budget so the function never overruns its limit) and removes stale rows (uploads that never finished, abandoned OAuth handshakes, long-expired preview links).

"Publish now" in the dashboard publishes immediately in the request instead of waiting for the cron.

## Setup on Vercel

1. **Neon:** in the Vercel project, add the Neon integration (Storage → Neon). It sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`. Migrations run automatically on every build (`scripts/migrate.mjs`).
2. **Neon Auth (sign-in):** `neon.ts` declares `auth: true`. Add `NEON_AUTH_BASE_URL` (the branch's Auth URL from the Neon Console → Auth, e.g. `https://ep-….neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth`) and `NEON_AUTH_COOKIE_SECRET` (`openssl rand -base64 32`). Neon Auth only accepts sign-ins from trusted domains: add your production domain (and any preview domain you use) in the Neon Console → Auth → Domains, or with `neon neon-auth domain add https://your-domain.com`. Localhost is allowed by default.

   Neon Auth stores users, passwords and sessions in the `neon_auth` schema. The app's `users` table keeps a profile row with the same id, created on first sign-in together with the user's first workspace. Workspaces, team invites and API keys work as before. Before launch, turn on branded auth emails (see [Branded auth emails](#branded-auth-emails)); Neon's shared sender is for development.
3. **Secrets:** add `TOKEN_ENCRYPTION_KEY` (`openssl rand -base64 32`; don't change it later or saved platform logins stop working) and `CRON_SECRET` (any long random string).
4. **Media storage (Neon Object Storage):** the private bucket `sfy-media` is declared in `neon.ts` (`neon deploy` creates it). In the Neon Console, open **Connect → Storage** and add the values to Vercel under these names (Vercel reserves the `AWS_*` names Neon shows): `STORAGE_ENDPOINT` (= `AWS_ENDPOINT_URL_S3`), `STORAGE_ACCESS_KEY_ID` (= `AWS_ACCESS_KEY_ID`), `STORAGE_SECRET_ACCESS_KEY` (= `AWS_SECRET_ACCESS_KEY`), `STORAGE_REGION` (= `AWS_REGION`). Set `STORAGE_BUCKET` only if you use a different bucket name. Browsers upload with presigned URLs, so the bucket needs this CORS rule (already set on the production branch):
   ```json
   [{ "AllowedOrigins": ["*"], "AllowedMethods": ["PUT", "GET", "HEAD"], "AllowedHeaders": ["*"], "ExposeHeaders": ["ETag"], "MaxAgeSeconds": 3600 }]
   ```
   Instagram, Threads, TikTok photos and Google Business fetch media by URL; they get 24-hour signed URLs. To serve media from a CDN instead, set `STORAGE_PUBLIC_URL`. Locally, Neon's own `AWS_*` names also work. Cloudflare R2 still works: leave the storage variables unset and set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
5. **Domain:** set `APP_URL` to your production URL (used for OAuth callbacks and invite links).
6. **Cron:** `vercel.json` already schedules `/api/cron/publish` every minute. Every-minute crons need the Pro plan. The same run sends reminder and digest emails.
7. **Email (Resend):** verify your domain in Resend (Domains), then add `RESEND_API_KEY` and `EMAIL_FROM` (an address on that domain, e.g. `Schedule For You <notifications@scheduleforyou.com>`). The app sends:
   - a reminder before each scheduled post (Settings → Email reminders; lead time per workspace; to the post's author, or the owner for API posts),
   - an alert right away when a post fails for good (to the owner and the author),
   - a daily digest after 6 PM workspace time when something published or failed (to the owner),
   - team invite emails (the invite link is still shown in the dashboard).
   Without `RESEND_API_KEY` these are skipped and logged. Password reset, email confirmation and sign-in link emails also go through Resend once the Neon Auth webhook is set up (see [Branded auth emails](#branded-auth-emails)).
8. **Billing (Stripe):** plans Solo $19/mo (15 accounts) and Studio $59/mo (100 accounts, team members), one subscription per workspace. The 7-day free trial needs a card: after signing up, the owner picks a plan in Stripe Checkout (card required), Stripe runs the trial and charges on day 8 unless they cancel. One free trial per workspace.
   - Add `STRIPE_SECRET_KEY` (Stripe → Developers → API keys). Until it is set, billing is off and nothing is blocked.
   - Stripe → Developers → Webhooks → add endpoint `https://scheduleforyou.com/api/stripe/webhook` with events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
   - Stripe → Settings → Billing → Customer portal: save the settings once (the portal needs a saved configuration), and under "Subscriptions → Customers can switch plans" list only the Solo and Studio prices.
   - Until a card is added, the dashboard opens the plan picker and a banner explains publishing is off; workspaces can still connect accounts and draft. Billing lives in the workspace menu → Billing.
   - Without an active or trialing subscription, scheduled posts wait (nothing is deleted) and "publish now" is refused. Failed payments (`past_due`) keep publishing while Stripe retries. Team invites need Studio.
   - Free access by hand: `UPDATE workspaces SET subscription_status='comped', plan='studio', account_limit=100 WHERE id='…';`
9. **Platforms:** add the developer keys for each platform you want (see below). Bluesky needs none.

All variables are listed in `.env.example`.

## Branded auth emails

By default Neon Auth sends password reset and confirmation emails itself, from `auth@mail.myneon.app`, with Neon's branding and a link to Neon's domain. The webhook at `/api/webhooks/neon-auth` replaces them with our own emails, sent through Resend from `EMAIL_FROM`. The reset email links straight to `APP_URL/reset-password?token=…`.

1. Make sure `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL` and `NEON_AUTH_BASE_URL` are set in Vercel and deployed (the webhook checks Neon's signature with the public keys at `NEON_AUTH_BASE_URL/.well-known/jwks.json`; no secret to copy).
2. Neon Console → your project → the production branch → **Auth → Configuration → Webhooks**:
   - Enable webhooks.
   - **Webhook URL:** `https://scheduleforyou.com/api/webhooks/neon-auth`
   - **Events:** `send.magic_link` only.
   - **Timeout:** 10 seconds.
   - Save.
3. Neon Console → same branch → **Settings → Better Auth → Project Info**: set **Application Name** to `Schedule For You` (it defaults to the Neon project name and is shown wherever Neon still names the app).
4. Test: on `/forgot-password`, request a reset for your own address. The email should come from `EMAIL_FROM`, say "Reset your Schedule For You password" and link to `scheduleforyou.com/reset-password?token=…`. Vercel logs show `[neon-auth webhook] sent forget-password email`.

Same settings by CLI: `neon neon-auth config webhook update --enabled --url https://scheduleforyou.com/api/webhooks/neon-auth --enabled-events send.magic_link --timeout 10`.

Once `send.magic_link` is subscribed, Neon stops sending these emails itself, so the webhook must work: if Resend isn't configured or a send fails, the webhook answers 5xx, Neon retries twice (15 seconds in total), and then the user sees an error. To go back to Neon's emails, turn the webhook off. Each event is sent once (event ids are kept in `neon_auth_events`); bad signatures and requests older than 5 minutes get 401. Each Neon branch has its own webhook setting, so preview branches keep Neon's default emails unless you set one up there too.

## Platform setup

Every OAuth callback URL is `APP_URL/api/connect/<platform>/callback`.

| Platform        | Env keys                                    | Notes |
| --------------- | ------------------------------------------- | ----- |
| Bluesky         | none                                        | Users connect with their handle and an app password. |
| X               | `X_CLIENT_ID`, `X_CLIENT_SECRET`            | developer.x.com, OAuth 2.0 confidential client; scopes `tweet.write offline.access media.write`. |
| Facebook Pages  | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` (+ optional `FACEBOOK_CONFIG_ID`) | Needs `pages_manage_posts`; App Review to post for other people's Pages. Set `FACEBOOK_CONFIG_ID` only if your app uses a Facebook Login for Business configuration; it then replaces the scope list. |
| Instagram       | same Meta app as Facebook                   | Business/Creator account linked to a Page; media by public URL. Asks for `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, `business_management`. |
| Threads         | `THREADS_APP_ID`, `THREADS_APP_SECRET`      | Separate Threads app in Meta developers. |
| LinkedIn        | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | Products "Share on LinkedIn" + "Sign In with LinkedIn using OpenID Connect". |
| TikTok          | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` | Content Posting API; posts are private until the app passes audit. |
| YouTube         | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`  | YouTube Data API v3; unverified apps upload as private. |
| Google Business | same Google client                          | Business Profile API quota approval required. |
| Pinterest       | `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET`  | Trial access posts only to your own account. |

The adapters were ported from the Fanout codebase and follow each platform's public API docs, but they have only been run in dry-run mode so far. Watch the Vercel logs (`[publish] … failed`) on the first real post to each platform.

## Run locally

```bash
npm install
cp .env.example .env.local     # fill in DATABASE_URL, NEON_AUTH_*, TOKEN_ENCRYPTION_KEY, CRON_SECRET (storage optional)
npm run db:migrate
npm run dev                    # http://localhost:3000
```

Set `SFY_DRY_RUN=1` to "publish" without calling any platform. To run the publisher by hand:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/publish
```

## Checks

```bash
npm run typecheck   # tsc over the app, server code and tests
npm test            # unit tests (node:test) for the pure server logic: post bodies, URL safety, billing access, signatures, webhooks, RSS templates
npm run check       # both
npm run build       # production build; migrations are skipped when DATABASE_URL is unset
```

`.github/workflows/ci.yml` runs all of these on every push and pull request. Tests live in `tests/` and load the TypeScript server modules directly (Node 22 strips the types; `tests/hooks.mjs` resolves extensionless imports and stubs `server-only`).

## REST API

Create a key in **Settings → API keys**, then:

```bash
curl -H "Authorization: Bearer sfy_..." https://your-domain.com/api/v1/accounts

curl -H "Authorization: Bearer sfy_..." -H "Content-Type: application/json" \
  -d '{"caption":"Hello","account_ids":["acc_..."],"scheduled_at":"2026-11-01T14:00:00Z"}' \
  https://your-domain.com/api/v1/posts
```

| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/api/v1/accounts` | Connected accounts |
| GET | `/api/v1/platforms` | Limits and whether each platform is configured |
| GET | `/api/v1/posts?status=&from=&to=&limit=` | List posts |
| POST | `/api/v1/posts` | `{ caption, account_ids \| targets:[{account_id, caption?, options?}], media?:[id], scheduled_at?, publish_now?, status? }`; 422 with `errors[]` if a platform rule fails |
| GET / PATCH / DELETE | `/api/v1/posts/:id` | |
| POST | `/api/v1/posts/:id/publish` | Publish now or retry failed targets |
| GET / POST | `/api/v1/media` | POST `{filename, mime, size, folder?}` returns `upload_url`; PUT the file there, then PATCH `/api/v1/media/:id {uploaded:true}` |
| PATCH / DELETE | `/api/v1/media/:id` | Confirm upload, move folder, delete |
| GET | `/api/v1/keys` | Keys can only be created or revoked from the dashboard |
| POST | `/api/v1/posts/:id/share` | Client preview link `{ url, expires_at }` (30 days; reused while valid) |
| GET | `/api/v1/posts/:id/comments` | Comments, approvals and change requests left on the preview link |
| PUT | `/api/v1/signature` | `{ signature }` added to every post when it publishes; `""` turns it off. Per post: `signature: false` |
| GET / POST | `/api/v1/webhooks` | POST `{ url, events?: ["post.published","post.partial","post.failed"] }`; the secret is returned once |
| PATCH / DELETE | `/api/v1/webhooks/:id` | `{ active?, events? }` |
| POST | `/api/v1/webhooks/:id/test` | Sends a `ping` event |
| GET / POST | `/api/v1/feeds` | POST `{ url, mode: "draft" \| "queue", template?, account_ids? }`; items already in the feed are skipped |
| PATCH / DELETE | `/api/v1/feeds/:id` | `{ active?, mode?, template?, account_ids? }` |
| POST | `/api/v1/feeds/:id/check` | Check now instead of waiting for the 15-minute run |

Owners, editors and API keys can change signature, webhooks and feeds; members can only read them.

## Composer extras

- **First comment:** every X, Bluesky, Threads, Instagram, Facebook and LinkedIn account in the composer has a "First comment" field (and the API takes `options.first_comment` on a target). It is posted by the same account right after the post goes live, which is where hashtags, links and calls to action usually go. A comment that fails never fails the post: the target stays published and its `error` says what happened.
- **Threads:** on X, Bluesky and Threads a caption with a line holding only `---` is published as a thread. Each part becomes a reply to the one before, media goes on the first post, and each part has to fit the platform's limit (the composer counter shows "3-post thread · longest 262/280"). A run that is cut off mid-thread continues from the next part instead of posting the first ones again. Up to 25 parts.
- **Link clicks** (Automations → Link clicks): when on, links in captions and first comments are swapped for short links on the app's domain (`/l/<code>`) as the post publishes, and each visit is counted. Analytics shows real clicks per post; the API returns `stats.clicks` per target and workspace totals in `GET /automations`. A link is only swapped when the short link is not longer than it, so a post can never grow past a character limit. Migration `011_links.sql`.

## For frequent posters

- **Default first comments** (Automations → Default first comments): a hashtag set or standing link per account, posted under every post to it unless the post has its own first comment. A post skips the default with a first comment of just `-` (API: `first_comment: false`). `PATCH /api/v1/accounts/{id}`.
- **Queue runway** on Home: when the queue has 2 or more open slots in the next 7 days, an attention item says when the queue runs dry and how many slots are open, with "Add to queue" ready.
- **Reconnect alerts**: when a platform rejects an account's sign-in, or a non-renewing token expires within 3 days, the owners get an email naming the account, the reason and the scheduled posts that would fail. One email per account per week; sent by the publishing cron.
- **Slack and Discord webhooks**: a webhook's `format` can be `slack` or `discord`, so an incoming webhook URL from either works as the endpoint and you get a readable message ("✅ Published: … • X @harbor → link") instead of raw JSON. Migration `012_webhook_format.sql`.

## Sharing the schedule

- **Shared calendar** (Automations → Shared calendar): one read-only link to the workspace's upcoming and recent posts (captions, accounts, media, approval state) for clients and teammates, no account needed. The same token serves an iCal feed, so the schedule appears in Google Calendar, Apple Calendar or Outlook and refreshes about hourly. Rotate the link to cut off old copies; turn it off and both URLs answer 404. API: `GET/POST/DELETE /api/v1/calendar-link`. Migration `013_calendar_link.sql`.
- **UTM tags** (Automations → Link clicks): with link tracking on, tracked links can carry `utm_source=<platform>`, `utm_medium=social` and `utm_campaign=<first label>` for attribution in Google Analytics and similar tools. Tags a link already has are kept.
- **Stale drafts nudge** on Home: three or more drafts untouched for a week bring an attention item with "Open drafts".

## Growth without gimmicks

- **Referral program** ("give a month, get a month"): every workspace has a link, `/r/<code>`, shown under Automations with copy, X, Bluesky, LinkedIn and email buttons. Opening it sets a 30-day cookie and lands on `/signup`; the workspace created there records `referred_by` and gets a 14-day trial instead of 7 (`REFERRED_TRIAL_DAYS` in `lib/server/billing.ts`, used by Checkout). The first time that workspace's subscription is `active`, the Stripe webhook credits the sender's customer balance with one month of their plan (`rewardReferrer` in `lib/server/referrals.ts`). The reward is claimed with one atomic update, so a replayed webhook never pays twice, and a Stripe failure releases the claim so the retry can. Your own link on your own account does nothing.
- **Share to queue**: the installed app registers a Web Share Target (`app/manifest.js`), so Android and desktop Chrome and Edge list it in the Share menu; a bookmarklet (Automations → Share to queue) does the same from any browser, with the page title, selected text and address. Both open `/app?share=1&title=…&text=…&url=…`, which the dashboard turns into a new post (`lib/share-caption.js`). Signed-out visitors keep the query through the login redirect (`proxy.ts`).

## Automations

- **Signature:** added on its own paragraph when a post publishes; skipped if the post already contains it or it would exceed the platform's character limit.
- **RSS auto-post:** each feed is checked every 15 minutes by the publishing cron. The first check only records what's already there. New items (up to 5 per check) become drafts, or queued posts in the next open posting slot, for the chosen accounts. Template placeholders: `{title}`, `{link}`, `{description}` (HTML stripped, 280 characters).
- **Webhooks:** a JSON POST per event with `X-SFY-Event` and `X-SFY-Signature: t=<unix>,v1=<hex HMAC-SHA256 of "<t>.<body>">`. One attempt, 5-second timeout; the last result shows in Automations.
- **Client preview links:** "Share for review" on a saved post in the composer. Approving clears the post's approval hold; "Request changes" puts it back on hold. The owner and the post's author get an email for each response.
- Webhook and feed URLs must be public `https://` addresses; private and internal addresses are refused, and each redirect is checked. For local testing only, `ALLOW_PRIVATE_URLS=1` lifts this.

## MCP server (Claude, Cursor…)

```json
{ "mcpServers": { "scheduleforyou": { "command": "node", "args": ["/path/to/sfu/mcp/server.mjs"],
  "env": { "SFY_URL": "https://your-domain.com", "SFY_API_KEY": "sfy_..." } } } }
```

Tools: `list_accounts`, `create_post`, `list_posts`, `publish_post`, `delete_post`.

## Code map

- `components/DashboardView.jsx`, `LandingView.jsx`, `LandingMobileView.jsx`, `BrandView.jsx`, `Dashboard.jsx`, `Landing.jsx`, `LandingMobile.jsx`, `Brand.jsx`: generated from `design/*.dc.html` by `npm run design:convert`. Don't hand-edit; change the design file and regenerate.
- `components/LiveDashboard.jsx`: runs the generated dashboard on real data. It loads `/api/app/state`, saves changes (posts, settings, media folders, accounts) and swaps the demo actions for real ones.
- `lib/server/`: database, auth, encryption, media storage, posts, publisher and platform adapters.
- `db/migrations/`: SQL migrations, applied in order on each build.

## Search engines

What Google and Bing get, and where it lives:

- **Server-rendered landing page** (`app/page.jsx`): the full HTML for both the desktop and the phone design, picked by user agent.
- **Structured data** (`lib/seo.js`, rendered by `components/JsonLd.jsx`): `Organization`, `WebSite` and `SoftwareApplication` (with the Solo and Studio prices) on `/`, plus `FAQPage` on the phone design, which is the one that shows the FAQ. A test checks the prices against `lib/server/billing.ts` and the FAQ against the landing component, so the markup can never drift from what the page shows.
- **Titles and descriptions** per public page, canonical URLs, Open Graph and Twitter cards with a generated preview image (`app/opengraph-image.jsx`), a web manifest and PNG icons (`public/brand/`, `app/apple-icon.png`; regenerate from the SVG glyph if the logo changes).
- **Indexing rules**: `robots.txt` and `sitemap.xml` (`app/robots.js`, `app/sitemap.js`) list `/` and `/signup`; the dashboard, API, preview links, invites, sign-in and the logo sheet are `noindex`. API responses also send `X-Robots-Tag: noindex`.
- **Ownership**: set `GOOGLE_SITE_VERIFICATION` (Search Console → HTML tag) and `BING_SITE_VERIFICATION` (Bing Webmaster Tools → meta tag) and the tags are rendered. Bing can also import the Search Console property directly.
- **IndexNow (Bing)**: set `INDEXNOW_KEY` (`openssl rand -hex 16`), deploy, then run `npm run seo:indexnow` after changing public pages so Bing recrawls within minutes. The key is served at `/indexnow-key.txt`.

After the first deploy: submit `https://scheduleforyou.com/sitemap.xml` in Search Console and Bing Webmaster Tools, and check `/` with Google's Rich Results Test and Bing's URL Inspection.

## Layout stability

- Fonts (Geist, Geist Mono, Bodoni Moda) are self-hosted from `public/fonts` with `font-display: optional` and preloaded in `app/layout.jsx`: text is laid out in its final font on first paint, and on a slow first visit the fallback font is kept for that page view rather than swapped in later. `node scripts/fonts.mjs` refreshes the files and `app/fonts.css`.
- `html { scrollbar-gutter: stable }` keeps the page from shifting sideways when a short view loses its scrollbar, and every dashboard screen keeps a minimum height so switching screens or tabs never collapses the page (`app/globals.css`).
- Thumbnails, avatars and media grids are sized by their containers, so images arriving later don't move content.

## Security notes

- Sign-in: Neon Auth (Managed Better Auth) stores users, passwords and sessions; the app keeps httpOnly session cookies on its own domain.
- Cross-site requests: every cookie-authenticated write (dashboard API, login, logout, signup) must carry an `Origin` matching the site's host; other origins get 403. API-key requests are exempt (a Bearer token can't be forged by another site).
- Response headers (`next.config.mjs`): HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, a strict referrer policy, a locked-down `Permissions-Policy`, and `Cache-Control: no-store` on every API response.
- Errors: only messages written for the user (`HttpError`) are returned; database and network errors are logged and answered with a generic message.
- Request bodies: post writes are validated with a schema (`lib/server/posts.ts` → `PostBody`); malformed input answers 400 with the first problem named.
- Platform tokens: AES-256-GCM encrypted at rest with `TOKEN_ENCRYPTION_KEY`.
- API keys: only their SHA-256 is stored; shown once.
- Login: at most 10 failed attempts per email per 15 minutes (per server instance), on top of Neon Auth's own limits.
- Webhooks and RSS: outbound requests only to public addresses (IPv4 and IPv6, including IPv4-mapped, NAT64 and 6to4 forms), each redirect re-checked, size and time limited.
- Platform calls time out (60 s for API calls, 180 s for uploads) so a hung platform never stalls the publishing run; timeouts count as retryable failures.
- Preview links: unguessable tokens, expire after 30 days, rate limited, not indexed by search engines. `/app`, `/api`, `/p` and `/invite` are excluded in `robots.txt`.

## Not built yet

- Engagement analytics from the platforms (Analytics shows publishing stats; impressions show "—").
- Real image thumbnails in the queue and calendar (they show coloured tiles).

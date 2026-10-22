# Schedule For You

Post scheduler: write once, publish to ten social platforms from one queue. Next.js 16 on **Vercel Pro**, **Neon Postgres** for data, **Neon Auth** for sign-in, **Vercel Cron** for publishing, **Neon Object Storage** for media.

| Route              | What it is                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `/`                | Landing page                                                                                   |
| `/signup`, `/login` | Email + password accounts (Neon Auth)                                                         |
| `/app`             | The dashboard on your real data (signed in)                                                    |
| `/demo`            | The same dashboard with sample data, nothing saved                                             |
| `/app/automations` | Signature, RSS auto-post, webhooks (workspace menu → Automations)                              |
| `/p/<token>`       | Client preview link: view a post, approve, ask for changes or comment (no account)             |
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

"Publish now" in the dashboard publishes immediately in the request instead of waiting for the cron.

## Setup on Vercel

1. **Neon:** in the Vercel project, add the Neon integration (Storage → Neon). It sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`. Migrations run automatically on every build (`scripts/migrate.mjs`).
2. **Neon Auth (sign-in):** `neon.ts` declares `auth: true`. Add `NEON_AUTH_BASE_URL` (the branch's Auth URL from the Neon Console → Auth, e.g. `https://ep-….neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth`) and `NEON_AUTH_COOKIE_SECRET` (`openssl rand -base64 32`). Neon Auth only accepts sign-ins from trusted domains: add your production domain (and any preview domain you use) in the Neon Console → Auth → Domains, or with `neon neon-auth domain add https://your-domain.com`. Localhost is allowed by default.

   Neon Auth stores users, passwords and sessions in the `neon_auth` schema. The app's `users` table keeps a profile row with the same id, created on first sign-in together with the user's first workspace. Workspaces, team invites and API keys work as before. Before launch, set up custom SMTP in Neon Auth (the shared sender is for development).
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
   Without `RESEND_API_KEY` these are skipped and logged. Optional: use Resend for Neon Auth's emails too (Neon Console → Auth → Email/SMTP: host `smtp.resend.com`, port 465, user `resend`, password = a Resend API key, sender on your verified domain).
8. **Billing (Stripe):** plans Solo $19/mo (15 accounts) and Studio $59/mo (100 accounts, team members), one subscription per workspace. The 7-day free trial needs a card: after signing up, the owner picks a plan in Stripe Checkout (card required), Stripe runs the trial and charges on day 8 unless they cancel. One free trial per workspace.
   - Add `STRIPE_SECRET_KEY` (Stripe → Developers → API keys). Until it is set, billing is off and nothing is blocked.
   - Stripe → Developers → Webhooks → add endpoint `https://scheduleforyou.com/api/stripe/webhook` with events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
   - Stripe → Settings → Billing → Customer portal: save the settings once (the portal needs a saved configuration), and under "Subscriptions → Customers can switch plans" list only the Solo and Studio prices.
   - Until a card is added, the dashboard opens the plan picker and a banner explains publishing is off; workspaces can still connect accounts and draft. Billing lives in the workspace menu → Billing.
   - Without an active or trialing subscription, scheduled posts wait (nothing is deleted) and "publish now" is refused. Failed payments (`past_due`) keep publishing while Stripe retries. Team invites need Studio.
   - Free access by hand: `UPDATE workspaces SET subscription_status='comped', plan='studio', account_limit=100 WHERE id='…';`
9. **Platforms:** add the developer keys for each platform you want (see below). Bluesky needs none.

All variables are listed in `.env.example`.

## Platform setup

Every OAuth callback URL is `APP_URL/api/connect/<platform>/callback`.

| Platform        | Env keys                                    | Notes |
| --------------- | ------------------------------------------- | ----- |
| Bluesky         | none                                        | Users connect with their handle and an app password. |
| X               | `X_CLIENT_ID`, `X_CLIENT_SECRET`            | developer.x.com, OAuth 2.0 confidential client; scopes `tweet.write offline.access media.write`. |
| Facebook Pages  | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`    | Needs `pages_manage_posts`; App Review to post for other people's Pages. |
| Instagram       | same Meta app as Facebook                   | Business/Creator account linked to a Page; media by public URL. |
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

- `components/DashboardView.jsx`, `LandingView.jsx`, `BrandView.jsx`, `Dashboard.jsx`, `Landing.jsx`, `Brand.jsx`: generated from `design/*.dc.html` by `npm run design:convert`. Don't hand-edit; change the design file and regenerate.
- `components/LiveDashboard.jsx`: runs the generated dashboard on real data. It loads `/api/app/state`, saves changes (posts, settings, media folders, accounts) and swaps the demo actions for real ones.
- `lib/server/`: database, auth, encryption, media storage, posts, publisher and platform adapters.
- `db/migrations/`: SQL migrations, applied in order on each build.

## Security notes

- Sign-in: Neon Auth (Managed Better Auth) stores users, passwords and sessions; the app keeps httpOnly session cookies on its own domain.
- Platform tokens: AES-256-GCM encrypted at rest with `TOKEN_ENCRYPTION_KEY`.
- API keys: only their SHA-256 is stored; shown once.
- Login: at most 10 failed attempts per email per 15 minutes (per server instance), on top of Neon Auth's own limits.
- Webhooks and RSS: outbound requests only to public addresses, size and time limited.
- Preview links: unguessable tokens, expire after 30 days, rate limited, not indexed by search engines.

## Not built yet

- Password reset (Neon Auth supports it; the app has no "forgot password" screen yet).
- Engagement analytics from the platforms (Analytics shows publishing stats; impressions show "—").
- Real image thumbnails in the queue and calendar (they show coloured tiles).

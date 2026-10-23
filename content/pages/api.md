---
layout: feature
title: "Social Media Scheduling API: REST, Webhooks and RSS"
description: "A social media scheduling API for 10 platforms: create, schedule and retry posts over REST, receive signed webhooks and auto-post from RSS. On every plan."
h1: Social media scheduling API
lead: Schedule posts via API to X, Instagram, LinkedIn, TikTok and six more platforms from your own code, and get a signed webhook when each post publishes or fails.
keyword: social media scheduling api
---
## What the social media scheduling API does
Schedule For You includes a social media scheduling API that lets your own code do what the composer does: create posts, schedule them for one or many accounts, publish on demand and retry failures. It's a plain REST API with JSON in and out, and it comes with every workspace on both plans.

### One API for 10 platforms
Posts can go to X, Bluesky, Instagram, LinkedIn, Threads, TikTok, YouTube, Facebook Pages, Pinterest and Google Business Profile. You send one request; Schedule For You handles each platform's publishing.

### The same rules as the composer
The API checks every target against its platform's limits before accepting a post. If something breaks a rule, such as a caption that's too long for X or a Pinterest post without an image, you get a `422` response with a list of errors instead of a post that fails later.

### Authentication with API keys
Create a key in **Settings → API keys** and send it with every request as `Authorization: Bearer sfy_…`. Store it like a password: anyone holding the key can post to the workspace's accounts.

## Schedule posts via API: a quick example
Three calls get you from a new key to a scheduled post.

1. **List your accounts.** `GET /api/v1/accounts` returns the connected accounts and their IDs.
2. **Check the limits.** `GET /api/v1/platforms` returns each platform's limits so your code can validate before sending.
3. **Create the post.** Send a caption, the account IDs and a time.

```bash
curl -X POST https://scheduleforyou.com/api/v1/posts \
  -H "Authorization: Bearer sfy_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Our autumn menu starts Monday.",
    "account_ids": ["acc_123", "acc_456"],
    "scheduled_at": "2026-11-02T14:00:00Z"
  }'
```

Use `publish_now` instead of `scheduled_at` to post straight away. To give each account its own wording, send per-account targets, each with its own caption, rather than a flat list of IDs.

Every endpoint, field, error code and webhook payload is documented in the [API reference](/docs), with request examples in curl, JavaScript and Python.

## Endpoints at a glance
The table is a summary. The [API reference](/docs) has the parameters, responses and errors for each one.

| Endpoint | What it does |
|---|---|
| `GET /api/v1/accounts` | List connected accounts |
| `GET /api/v1/platforms` | Character and media limits per platform |
| `GET`, `POST /api/v1/posts` | List posts or create one (caption, accounts or per-account targets, media IDs, schedule time or publish now) |
| `GET`, `PATCH`, `DELETE /api/v1/posts/:id` | Read, update or delete a post |
| `POST /api/v1/posts/:id/publish` | Publish now, or retry targets that failed |
| `/api/v1/media` | Request a presigned upload URL for images and video |
| Client preview links | Create a preview link for a post and read the comments left on it |
| Signature | Set the signature appended to posts |
| Webhooks and RSS feeds | Manage webhook endpoints and feeds |

### Uploading media
Ask `/api/v1/media` for a presigned URL, upload the file to it, then pass the media ID when you create the post. The platform's media rules still apply, so YouTube needs a video and Pinterest needs an image.

## Webhooks and RSS feeds
### Three webhook events
Register an endpoint and Schedule For You sends a request when something happens to a post:

- `post.published`: every target published.
- `post.partial`: some targets published and at least one failed.
- `post.failed`: no target published.

Each request is signed with HMAC-SHA256 using your webhook secret, so you can confirm it came from Schedule For You before acting on it. Webhooks also work with Zapier, Make and n8n if you'd rather not write code.

### RSS feeds in draft or queue mode
Point a feed at a blog or podcast and new items become posts. Draft mode saves them for you to review; queue mode drops them into your next open time slot.

### MCP server
For tools that speak the Model Context Protocol, there's also an MCP server.

## What teams build with the social media posting API
- **Publishing from a CMS:** schedule a promo post for every article the moment it goes live.
- **Internal tools:** let colleagues queue posts from a form or spreadsheet your team already uses.
- **Client approval flows:** create a client preview link from your own portal and read approvals and comments back.
- **Self-healing jobs:** listen for `post.failed`, alert the right person, then call the publish endpoint to retry once the account is reconnected.

More ideas: [how to automate social media scheduling](/blog/how-to-automate-social-media-scheduling).

## Frequently asked questions
### Is the social media posting API included on every plan?
Yes. Every workspace on Solo and Studio includes the REST API, webhooks and RSS feeds at no extra cost. See [pricing](/pricing) for what else each plan includes.

### How do I authenticate API requests?
Create a key in Settings → API keys, then send it in the `Authorization` header as `Bearer sfy_…` on every request.

### Can I schedule posts via API to several platforms at once?
Yes. Pass several account IDs in one request, or use per-account targets if each account needs its own caption. Each target is checked against its platform's rules.

### What happens if a post breaks a platform's limits?
The API returns a `422` response listing the errors, such as a caption over the limit or missing media. Nothing is scheduled until you fix them.

### Can I upload images and videos through the API?
Yes. Request a presigned upload URL from `/api/v1/media`, upload the file, and reference its media ID when you create the post.

### How do I know when a scheduled post goes live?
Register a webhook. You'll receive `post.published`, `post.partial` or `post.failed`, signed with HMAC-SHA256 so you can verify it.

### Can I retry a failed post through the API?
Yes. Call `POST /api/v1/posts/:id/publish` to retry the targets that failed. If a platform revoked access, reconnect the account from the Accounts screen first.

## Start building with the Schedule For You API
Create an API key on day one of your trial and schedule your first post with a single request. The API, webhooks and RSS feeds come with both plans, alongside the composer and calendar. [Start your 7-day free trial](/signup). A card is required, and you aren't charged until day 8.

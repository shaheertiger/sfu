---
title: "Social Media MCP: How to Schedule Posts With Claude and Your Publishing Queue"
description: Connect Claude to a social media MCP server and let it draft, schedule and check posts on X, LinkedIn, Bluesky, Instagram and more, with your queue as the safety net.
h1: "Social Media MCP: Schedule Posts With Claude"
category: Guides
excerpt: An MCP server gives Claude real tools instead of copy-paste. Here's how to connect Claude to a hosted social media MCP server, then draft, review, schedule and check a week of posts from one conversation.
keyword: mcp social media
date: 2026-10-28
---
A social media MCP server lets an assistant like Claude act on your social accounts instead of only writing text for you to paste. MCP (Model Context Protocol) is an open standard for giving AI agents tools; a social media MCP server exposes tools such as "list my accounts", "create a post" and "list scheduled posts". To use one with Claude, create an API key with the scheduling service, add its MCP server URL to Claude with that key, and ask in plain language: "Turn this blog post into a week of posts for X, LinkedIn and Bluesky and schedule them for 9 a.m." Claude calls the tools, and the posts land in your publishing queue, where you can review, edit or delete them before they go out.

Here's the manual way first, where it breaks down, how the options compare, and a full walkthrough with Schedule For You's hosted MCP server.

## The manual way: Claude writes, you paste

Without MCP, Claude can still do the writing:

1. Paste your source (a blog post, release notes, a transcript) into a chat and ask for posts per network.
2. Ask for revisions until the tone is right.
3. Copy each post into X, LinkedIn, Bluesky or your scheduler, one at a time.
4. Check each one against the network's character limit and media rules, and fix the ones that don't fit.
5. Pick a date and time for each and schedule it.

For one post, that's fine. Claude doesn't know which accounts you have, what's already scheduled, or whether a caption fits X's 280 characters once a link is counted, so the checking stays with you.

<!-- cta -->

## Where copy-paste breaks: a week of posts from one article

A founder publishes one long article a week and wants it promoted every weekday: a short hook on X, a fuller take on LinkedIn, the same idea on Bluesky and Threads. That's 4 networks × 5 days = 20 posts.

Done by hand, that's 20 copy-pastes, 20 date pickers and a fair chance that Wednesday's X post is 296 characters, Friday collides with something already scheduled, or a post goes to the company account instead of the personal one. Claude did the hard part in seconds; the clerical part still takes half an hour, every week.

With an MCP server connected, Claude can look up the accounts, see what's already in the queue, create all 20 posts at once with a version per network, and fix any that a platform rule rejects.

## Your options compared

| Option | What Claude can do | Setup | Watch out for |
| --- | --- | --- | --- |
| Copy-paste from chat | Write and revise text | None | All the scheduling, checking and pasting is manual |
| A separate MCP server per network (community or self-hosted) | Post to that one network | A developer app and credentials for each platform, often run on your own machine | One integration per network to set up and keep working; most post immediately rather than scheduling |
| A general automation MCP (for example Zapier's) | Trigger actions you've configured in that tool | Connect each network inside the automation tool | Each action is a separate step; caption rules per network are up to you |
| A scheduler's MCP server (such as Schedule For You) | List accounts, create drafts or scheduled posts for many networks, check status, retry, delete | One API key, one URL | Only does what the scheduler does: no replies, DMs or platform analytics |

If you only ever post to one network and want Claude to publish immediately, a single-network server can be enough. If you want posts to land in a queue your team can see and check, use a scheduler's server.

## Walkthrough: Claude and Schedule For You's MCP server

Schedule For You runs a hosted MCP server at `https://scheduleforyou.com/api/mcp` (Streamable HTTP). There's nothing to install. Each tool calls the same REST API as the dashboard with your key, so Claude can do exactly what the key can, and every post it creates shows up in your queue and calendar.

![Schedule For You settings showing the "Post from an AI agent" MCP section with the hosted server URL, the Authorization header and the five tools](/images/blog/settings-mcp-1440x900.webp)

### Step 1: Create an API key

In the dashboard, open **Settings → API keys**, name the key after where it'll live ("Claude Desktop", "Claude Code") and create it. The key is shown once. Store it like a password: anyone holding it can post to the workspace's accounts. You can revoke it from the same screen at any time, which cuts Claude off immediately.

### Step 2: Add the server to Claude

**Claude Code:** run one command.

```bash
claude mcp add --transport http scheduleforyou https://scheduleforyou.com/api/mcp \
  --header "Authorization: Bearer sfy_your_key"
```

**Claude (web and desktop apps):** add a custom connector with the URL `https://scheduleforyou.com/api/mcp` and, under **Request headers**, an `Authorization` header with the value `Bearer sfy_your_key`. Anthropic notes that the Request headers section may not be available to every organization yet; if you don't see it, use the bridge below.

**Clients that only run local commands** (including Claude Desktop's config file): use `mcp-remote` to bridge to the hosted server.

```json
{
  "mcpServers": {
    "scheduleforyou": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://scheduleforyou.com/api/mcp", "--header", "Authorization: Bearer sfy_your_key"]
    }
  }
}
```

Other MCP clients that accept a URL and headers use the same URL with `"type": "http"` and the header. The [API reference](/docs#mcp-server) has each format.

### Step 3: Let Claude find your accounts

Ask: *"Which social accounts can you post to?"* Claude calls `list_accounts`, which returns each account's `id`, `platform` and `username`:

```json
[
  { "id": "acc_7d21e0c94b3a6f15", "platform": "x", "username": "mayabuilds", "over_limit": false },
  { "id": "acc_c0a85f3e17d94b26", "platform": "linkedin", "username": "Maya Chen", "over_limit": false },
  { "id": "acc_3b9e5a0d24c71f86", "platform": "bluesky", "username": "maya.bsky.social", "over_limit": false },
  { "id": "acc_5a8d3f61b0c27e94", "platform": "threads", "username": "maya.studio", "over_limit": false }
]
```

Claude uses these IDs from now on, so it can't post to an account you haven't connected, and it can tell the personal profile from the brand account by name.

### Step 4: Draft the week

Paste the article and ask: *"Write five posts promoting this, one per weekday next week. Shorter on X, longer on LinkedIn, same text on Bluesky and Threads. Save them as drafts; don't schedule yet."*

Claude calls `create_post` once per day. Leaving out `scheduled_at` and `publish_now` saves a draft. A single call looks like this:

```json
{
  "caption": "Most teams batch content wrong: they batch writing but not decisions. Decide the week's topics on Monday and writing gets twice as fast.",
  "account_ids": ["acc_7d21e0c94b3a6f15", "acc_c0a85f3e17d94b26", "acc_3b9e5a0d24c71f86", "acc_5a8d3f61b0c27e94"],
  "per_account": {
    "acc_7d21e0c94b3a6f15": { "caption": "Batch decisions, not just writing. Pick the week's topics on Monday and the writing gets twice as fast.", "options": { "first_comment": "Full article: https://example.com/batching" } },
    "acc_c0a85f3e17d94b26": { "caption": "Most teams batch content the wrong way.\n\nThey batch the writing but not the decisions, so every post still starts with \"what should I say?\"\n\nTry this: on Monday, pick the five topics for the week. Then write.\n\nFull article: https://example.com/batching" }
  }
}
```

Each post is checked against every network's rules as it's created. If one version is too long for X (280 characters) or Bluesky (300), the tool returns the error with the platform and the count, and Claude shortens that version and tries again. To attach an image, Claude can pass up to 10 public image or video URLs in `media_urls`; Schedule For You copies them in first. On X, Bluesky and Threads, a caption with a line holding only `---` becomes a thread.

### Step 5: Review in the dashboard

The drafts are now in **Queue → Drafts**, with every account's version visible. Open one to edit a word, swap the image or change the accounts; per-platform tabs show each version and its character count.

![Schedule For You composer with Bluesky, X, Instagram and LinkedIn selected, per-platform tabs, character counters for each network and Schedule, Add to queue and Save draft options](/images/blog/composer-four-platforms-1440x900.webp)

When they're right, schedule each draft for its day, or use **Add to queue** to drop them into your posting slots. The calendar shows the whole week next to everything else that's planned, so collisions are obvious.

![Schedule For You month calendar for October 2026 with scheduled posts on each day marked by platform icons and filters for platform, account and status](/images/blog/calendar-month-1440x900.webp)

If you'd rather skip the draft step, ask Claude to schedule directly: it sends `scheduled_at` with each post (an ISO 8601 time such as `2026-11-02T14:00:00Z`) and the posts go straight into the queue, still editable until they publish. Teams that need sign-off can mark a post as needing approval in the composer, and it won't publish until someone approves it.

### Step 6: Check the result

On Friday, ask: *"Did this week's posts all go out?"* Claude calls `list_posts` with `status: "failed"` or `"published"` and reports back. If a post failed (an expired sign-in, a platform outage), fix the cause, then ask Claude to retry it: `publish_post` publishes a draft now or retries only the targets that failed. `delete_post` removes a draft or scheduled post you no longer want.

### What to keep in mind

- **The key is the permission.** Claude can do what the API key can: create, publish and delete posts in that workspace. Use a separate key per client so you can revoke one without breaking the others.
- **Let Claude ask first.** Claude's apps can ask for your confirmation before each tool call. Keep that on for `publish_post` and `delete_post`.
- **The queue is your safety net.** Everything Claude creates is visible, editable and deletable in the dashboard before it publishes.
- **It publishes, it doesn't engage.** There are no tools for replies, DMs or platform analytics.

Plans start at $19 a month for 15 connected accounts, and the API and MCP server are included on every plan.

## Frequently asked questions

### What is a social media MCP server?
It's a server that speaks the Model Context Protocol and exposes social media actions as tools an assistant can call: listing accounts, creating posts, scheduling them, checking what published. The assistant decides when to call them based on what you ask.

### Can Claude post to social media?
Not on its own. Connected to an MCP server that has posting tools, it can create, schedule and publish posts through that service. With Schedule For You that covers X, Bluesky, Instagram, LinkedIn personal profiles, Threads, TikTok, YouTube, Facebook Pages, Pinterest and Google Business Profile.

### Will Claude publish something without my approval?
Only if you let it. Ask for drafts, keep tool confirmations on, and review in the queue. A post created with `publish_now` goes out straight away, so don't approve that call unless you mean it.

### Does it work with other assistants?
Yes. Any MCP client that supports Streamable HTTP with a header, or local commands through `mcp-remote`, can use the same server and tools.

### Is there a way to do this without MCP?
Yes: the REST API does the same things from your own code, and RSS auto-post can turn new blog posts into queued posts with no code. The previous guide, [social media API](/blog/social-media-api), compares the platform APIs with one scheduling API, and the next step is building a [social media content calendar](/blog/social-media-content-calendar) for Claude to fill.

---
title: "Social Media MCP: Let Claude Schedule Posts, Not Just Write Them"
description: Connect Claude to a social media MCP server and let it draft, schedule and check posts on X, LinkedIn, Bluesky, Instagram and more, with your queue as the safety net.
h1: "Social Media MCP: Let Claude Schedule Your Posts, Not Just Write Them"
category: Guides
excerpt: An MCP server gives Claude real tools instead of copy-paste. Here's what it does, how the options compare, and a 6-step walkthrough to draft, review, schedule and check a week of posts from one conversation.
keyword: mcp social media
date: 2026-10-28
updated: 2026-11-04
---
Claude writes your posts in seconds, then you spend half an hour pasting them into apps. A social media MCP server fixes that: it lets an assistant like Claude act on your social accounts instead of only writing text for you to paste. Create an API key with the scheduling service, add its MCP server URL to Claude with that key, and ask in plain language: "Turn this article into a week of posts for X, LinkedIn and Bluesky and schedule them for 9 a.m."

![Social media MCP: Claude drafts and schedules posts through an MCP server, and they land in your queue for review](/images/blog/social-media-mcp-hero-1200x675.webp)

Claude calls the tools, and the posts land in your publishing queue, where you can review, edit or delete them before they go out. That queue is the important part: nothing has to publish without you seeing it.

This guide covers what an MCP server actually is, the manual way and where it breaks, how the options compare, the risks of unofficial servers, and a full 6-step walkthrough with Schedule For You's hosted MCP server.

## What a Social Media MCP Server Actually Does

MCP (Model Context Protocol) is an open standard for giving AI assistants tools. A social media MCP server exposes tools such as "list my accounts", "create a post" and "list scheduled posts". The assistant decides when to call them based on what you ask.

![Claude without MCP compared with Claude connected to a social media MCP server](/images/blog/social-media-mcp-what-1200x675.webp)

| | Claude without MCP | Claude with a scheduler's MCP server |
|---|---|---|
| Writes and revises posts | Yes | Yes |
| Knows which accounts you have | No | Yes, it lists them |
| Sees what's already scheduled | No | Yes |
| Checks each platform's character limit | Only if you ask it to count | Yes, every post is checked as it's created |
| Schedules the posts | No, you paste them | Yes, or saves them as drafts |

### What Most People Don't Know

Claude can't post to social media on its own. It only does what the connected server's tools allow, and the server only does what your API key allows. So the permission lives in the key, not in Claude: revoke the key and Claude is cut off immediately.

> **Key point:** An MCP server turns Claude from a writer into an assistant that can schedule. Your queue stays the checkpoint between Claude and your audience.

<!-- cta -->

## The Manual Way: Claude Writes, You Paste (5 Steps)

Without MCP, Claude can still do the writing:

![The five manual steps from a Claude draft to a scheduled post](/images/blog/social-media-mcp-manual-1200x675.webp)

1. Paste your source (a blog post, release notes, a transcript) into a chat and ask for posts per network.
2. Ask for revisions until the tone is right.
3. Copy each post into X, LinkedIn, Bluesky or your scheduler, one at a time.
4. Check each one against the network's character limit and media rules, and fix the ones that don't fit.
5. Pick a date and time for each and schedule it.

For one post, that's fine. But Claude doesn't know which accounts you have, what's already scheduled, or whether a caption fits X's 280 characters once a link is counted, so the checking stays with you.

> **Pro tip:** Even without MCP, ask Claude to put each platform's character count next to each post. You'll still need to check X's link weighting yourself, but it catches most of the overruns.

## Where Copy-Paste Breaks: 20 Posts From One Article

A founder publishes one long article a week and wants it promoted every weekday: a short hook on X, a fuller take on LinkedIn, the same idea on Bluesky and Threads. That's 4 networks × 5 days = 20 posts.

Done by hand, that's 20 copy-pastes, 20 date pickers and a fair chance that Wednesday's X post is 296 characters, Friday collides with something already scheduled, or a post goes to the company account instead of the personal one. Claude did the hard part in seconds; the clerical part still takes half an hour, every week.

With an MCP server connected, Claude can look up the accounts, see what's already in the queue, create all 20 posts with a version per network, and fix any that a platform rule rejects.

## Social Media MCP Options Compared (4 Ways)

| Option | What Claude can do | Setup | Watch out for |
|---|---|---|---|
| Copy-paste from chat | Write and revise text | None | All the scheduling, checking and pasting is manual |
| A separate MCP server per network (community or self-hosted) | Post to that one network | A developer app and credentials for each platform, often run on your own machine | One integration per network to set up and maintain; most post immediately rather than scheduling |
| A general automation MCP (for example Zapier's) | Trigger actions you've configured in that tool | Connect each network inside the automation tool | Each action is a separate step; caption rules per network are up to you |
| A scheduler's MCP server (such as Schedule For You) | List accounts, create drafts or scheduled posts for many networks, check status, retry, delete | One API key, one URL | Only does what the scheduler does: no replies, DMs or platform analytics |

![Four ways to post with Claude compared by setup effort and what Claude can do](/images/blog/social-media-mcp-options-1200x675.webp)

If you only post to one network and want Claude to publish immediately, a single-network server can be enough. If you want posts to land in a queue your team can see and check, use a scheduler's server.

## Unofficial MCP Servers and Shared Keys (Use With Caution)

Community MCP servers for individual networks are easy to find. Some are excellent; some are a weekend project.

### The Real Risks

- **Credentials on your machine.** Self-hosted servers often need a developer app and tokens for each platform, stored wherever the server runs.
- **No review step.** Many post immediately, so a misunderstood prompt goes straight to your audience.
- **Keys that never die.** A key pasted into several tools, or shared with a colleague, keeps working until someone remembers to revoke it.

### Safety Checklist

- Prefer servers run by the service you already trust with your accounts.
- Use one API key per client, named after where it lives, so you can revoke one without breaking the others.
- Keep tool confirmations on for anything that publishes or deletes.

> **Bottom line:** Treat an MCP key like a password, and choose a setup where posts land somewhere you can check them first.

## Walkthrough: Claude and Schedule For You's MCP Server in 6 Steps

Schedule For You runs a hosted MCP server at `https://scheduleforyou.com/api/mcp` (Streamable HTTP). There's nothing to install. Each tool calls the same REST API as the dashboard with your key, so Claude can do exactly what the key can, and every post it creates shows up in your queue and calendar. The API and MCP server are part of the paid plans (Solo at $19 a month or Studio at $59 a month, each with a 7-day trial that needs a card).

![Schedule For You settings showing the Post from an AI agent section with the hosted MCP server URL, the Authorization header and the tools](/images/blog/settings-mcp-1440x900.webp)

### Step 1: Create an API Key

In the dashboard, open **Settings → API keys**, name the key after where it'll live ("Claude Desktop", "Claude Code") and create it. The key is shown once. Store it like a password: anyone holding it can post to the workspace's accounts. You can revoke it from the same screen at any time.

### Step 2: Add the Server to Claude

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

### Step 3: Let Claude Find Your Accounts

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

### Step 4: Draft the Week (Don't Schedule Yet)

This is the step to get right. Paste the article and ask: *"Write five posts promoting this, one per weekday next week. Shorter on X, longer on LinkedIn, same text on Bluesky and Threads. Save them as drafts; don't schedule yet."*

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

### Step 5: Review in the Dashboard, Then Schedule

The drafts are now in **Queue → Drafts**, with every account's version visible. Open one to edit a word, swap the image or change the accounts; per-platform tabs show each version and its character count.

![The Schedule For You composer with Bluesky, X, Instagram and LinkedIn selected, per-platform tabs and a character counter for each network](/images/blog/composer-four-platforms-1440x900.webp)

When they're right, schedule each draft for its day, or use **Add to queue** to drop them into your posting slots. If you'd rather skip the draft step, ask Claude to schedule directly: it sends `scheduled_at` with each post (an ISO 8601 time such as `2026-11-02T14:00:00Z`) and the posts go straight into the queue, still editable until they publish. Teams that need sign-off can mark a post as needing approval in the composer, and it won't publish until someone approves it.

### Step 6: Check the Result

On Friday, ask: *"Did this week's posts all go out?"* Claude calls `list_posts` with `status: "failed"` or `"published"` and reports back. If a post failed (an expired sign-in, a platform outage), fix the cause, then ask Claude to retry it: `publish_post` publishes a draft now or retries only the targets that failed. `delete_post` removes a draft or scheduled post you no longer want.

### Schedule For You vs the Alternatives

| | Copy-paste from Claude | Single-network MCP servers | Schedule For You MCP |
|---|---|---|---|
| Networks from one setup | Any, by hand | One per server | X, LinkedIn personal profiles, Bluesky, Threads, Instagram, TikTok, YouTube, Facebook Pages, Pinterest (Google Business Profile coming soon) |
| Drafts and a review queue | Your scheduler, if you use one | Rarely | Yes |
| Character checks per network | You | Varies | Yes, on every post |
| Replies, DMs, analytics | No | Some | No |
| Cost | Free | Usually free, plus your time | Solo $19 a month or Studio $59 a month (MCP isn't on the Free plan) |

Where we're not the best fit: if you want Claude to reply to comments, read DMs or pull platform analytics, our server has no tools for that. It publishes; it doesn't engage. And if you only want to try scheduling without the API, the Free plan's composer and queue do that without MCP.

## What to Do Next

1. **Start with drafts.** Ask Claude to save posts as drafts for the first few weeks, and review them in the queue.
2. **One key per client.** "Claude Desktop" and "Claude Code" get separate keys.
3. **Keep confirmations on** for `publish_post` and `delete_post`.
4. **Give Claude a plan to fill.** A [social media content calendar](/blog/social-media-content-calendar) tells it what to write each week.

## Frequently Asked Questions

### What is a social media MCP server?

It's a server that speaks the Model Context Protocol and exposes social media actions as tools an assistant can call: listing accounts, creating posts, scheduling them, and checking what published.

### Can Claude post to social media?

Not on its own. Connected to an MCP server with posting tools, it can create, schedule and publish posts through that service. With Schedule For You that covers X, Bluesky, Instagram, LinkedIn personal profiles, Threads, TikTok, YouTube, Facebook Pages and Pinterest, with Google Business Profile coming soon.

### Will Claude publish something without my approval?

Only if you let it. Ask for drafts, keep tool confirmations on, and review in the queue. A post created with `publish_now` goes out straight away, so don't approve that call unless you mean it.

### Does it work with other assistants?

Yes. Any MCP client that supports Streamable HTTP with a header, or local commands through `mcp-remote`, can use the same server and tools.

### Is the MCP server on the Free plan?

No. The API and MCP server are part of the paid plans, Solo and Studio, each with a 7-day trial that needs a card. The Free plan covers the composer, queue, calendar and posting slots.

### What happens if Claude writes a post that's too long?

The tool returns an error naming the platform and the character count, and Claude shortens that version and tries again. Nothing is scheduled until every version fits.

### Can I revoke Claude's access?

Yes. Revoke its API key under **Settings → API keys**, and Claude is cut off immediately.

### Is there a way to do this without MCP?

Yes. The REST API does the same things from your own code, and RSS auto-post can turn new blog posts into queued posts with no code. Our guide to the [social media API](/blog/social-media-api) compares the platform APIs with one scheduling API.

## The Bottom Line

![Let Claude draft and schedule through an MCP server, and keep your queue as the checkpoint](/images/blog/social-media-mcp-bottom-line-1200x675.webp)

- **Copy-paste:** fine for one post, slow and error-prone for twenty.
- **Single-network servers:** one integration per network, usually no review step.
- **A scheduler's MCP server:** one key, every network, and a queue you can check.
- **Safety:** drafts first, one key per client, confirmations on.

Next up: [building a social media content calendar](/blog/social-media-content-calendar). For more free tools, try the [X character counter](/tools/x-character-counter), the [LinkedIn text formatter](/tools/linkedin-text-formatter) and the [speech time calculator](/tools/speech-time-calculator).

---
title: "How to Get a Bluesky RSS Feed (and Post Your RSS Feed to Bluesky)"
description: Every Bluesky profile has an RSS feed: add /rss to the profile URL. What the feed includes, its limits, and how to auto-post your blog or newsletter RSS to Bluesky.
h1: How to Get Bluesky on RSS
category: Bluesky
excerpt: Add /rss to any Bluesky profile URL, like bsky.app/profile/handle/rss, and paste it into your RSS reader. Going the other way, an RSS auto-post tool can share new blog posts to Bluesky for you.
keyword: how to get bluesky on rss
date: 2026-10-28
---
To follow a Bluesky account in an RSS reader, take its profile URL and add `/rss` to the end: `https://bsky.app/profile/handle.bsky.social/rss`. Paste that into Feedly, Inoreader, NetNewsWire or any other reader and new posts show up like blog articles. Many readers find it automatically if you paste the plain profile URL, because Bluesky lists the feed in each profile page. If you want the opposite, your blog or newsletter posting to Bluesky by itself, you need an RSS auto-post tool, covered further down.

## How to get a Bluesky profile's RSS feed

1. Open the profile on [bsky.app](https://bsky.app) in a browser.
2. Copy the address, for example `https://bsky.app/profile/example.com`.
3. Add `/rss` to the end: `https://bsky.app/profile/example.com/rss`.
4. Add that URL as a new feed in your RSS reader.

You can also use the account's permanent ID instead of the handle, as in `https://bsky.app/profile/did:plc:abc123/rss`. That version keeps working if the person later [changes their handle](/blog/how-to-change-bluesky-handle), so it's the safer choice for a feed you want to keep.

## What the feed includes and what it doesn't

| Included | Not included or limited |
| --- | --- |
| The account's own posts, newest first | Likes and, typically, reposts of other people's posts |
| Post text and date | Images and video are not reliably embedded |
| A link to each post on Bluesky | Links inside the post text may not be clickable |
| Public accounts | Accounts that ask apps not to show their posts to logged-out users |

Bluesky doesn't document the feed in detail, so behavior can change. If a feed is empty or missing, the likeliest reason is the account's setting that discourages apps from showing it to logged-out visitors, which reportedly turns off the profile's RSS feed as well. A deactivated account has no feed either.

## Other ways to read Bluesky in a feed reader

- **Third-party converters** such as RSS.app build feeds from profiles, and some can do it for searches or hashtags. Most need a paid plan for frequent updates.
- **Custom feeds** inside Bluesky are a different thing: they're algorithmic or curated feeds you subscribe to in the Bluesky app, not RSS.

<!-- cta -->

## How to post your RSS feed to Bluesky automatically

If you run a blog, podcast or newsletter, an RSS auto-post tool can share every new item on Bluesky without you opening the app. In Schedule For You, open **Automations** from the workspace menu, add your feed's URL, pick your Bluesky account (and X, Threads, LinkedIn or others if you want) and write a template using `{title}`, `{link}` and `{description}`. Feeds are checked every 15 minutes. The first check only records what's already there, so old items aren't posted. Each new item becomes a draft for you to review, or goes straight into the next open slot in your queue.

A good Bluesky template keeps within 300 characters with the link included:

```
New on the blog: {title}

{link}
```

Bluesky shortens long links in the post, so a title, a sentence and the link usually fit. Our guide to the [Bluesky character limit](/blog/bluesky-character-limit) explains how links count, and the [Bluesky scheduler page](/bluesky) covers connecting with an app password.

## Frequently asked questions

### Does Bluesky have RSS feeds?
Yes. Every public profile has one at its profile URL plus `/rss`. There's no RSS for the home timeline or custom feeds.

### Can I get an RSS feed for a Bluesky hashtag or search?
Not from Bluesky itself at the time of writing. Third-party converters can build one.

### Why is a Bluesky RSS feed empty?
The account may have no posts, may be deactivated, or may have asked apps not to show its posts to people who aren't logged in.

### Can Bluesky post my blog automatically?
Not on its own. Use an RSS auto-post tool connected to your Bluesky account with an app password.

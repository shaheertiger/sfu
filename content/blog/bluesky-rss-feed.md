---
title: "How to Get Bluesky on RSS: Add /rss to Any Profile (2 Ways)"
description: Every Bluesky profile has an RSS feed you get by adding /rss to the profile URL. What the feed includes, its limits, and how to auto-post your own RSS feed to Bluesky.
h1: "How to Get Bluesky on RSS: Add /rss to Any Profile (and the Reverse)"
category: Bluesky
excerpt: Add /rss to any Bluesky profile URL, like bsky.app/profile/handle/rss, and paste it into your RSS reader. Going the other way, an RSS auto-post tool shares new blog posts to Bluesky for you.
keyword: how to get bluesky on rss
date: 2026-10-28
updated: 2026-11-04
---
You want to follow a Bluesky account without opening the app, or you want your blog to appear on Bluesky by itself. For the first, take the profile URL and add `/rss` to the end: `https://bsky.app/profile/handle.bsky.social/rss`. Paste that into Feedly, Inoreader, NetNewsWire or any other reader, and new posts show up like blog articles.

![How to get Bluesky on RSS: add /rss to the end of any public profile URL](/images/blog/bluesky-rss-feed-hero-1200x675.webp)

Bluesky doesn't advertise this anywhere in the app, which is why most people assume there's no feed at all. Many readers even find it automatically if you paste the plain profile URL, because Bluesky lists the feed in each profile page's code.

This guide covers how to get the feed, what it includes and leaves out, why a feed can come back empty, and how to go the other way: posting your own RSS feed to Bluesky automatically.

## Does Bluesky Have RSS? Yes, But Only for Profiles

Every public Bluesky profile has an RSS feed of that account's own posts. There's no RSS for your home timeline, for custom feeds or for searches.

![What a Bluesky RSS feed covers: public profile posts yes, home timeline and searches no](/images/blog/bluesky-rss-feed-what-1200x675.webp)

| Source | RSS from Bluesky? | Alternative |
|---|---|---|
| A public profile's posts | Yes, profile URL + `/rss` | — |
| Your home timeline | No | Use the Bluesky app |
| Custom feeds | No | Subscribe inside the Bluesky app |
| Hashtags or searches | No, at the time of writing | Third-party converters |

### What Most People Don't Know

Custom feeds inside Bluesky sound like RSS but are a different thing. They're algorithmic or curated feeds you subscribe to in the Bluesky app, and a feed reader can't open them. The only RSS Bluesky itself serves is the per-profile feed.

> **Key point:** The profile feed is a reading tool. It lets you follow posts from outside Bluesky. It can't post anything to Bluesky; that needs a separate RSS auto-post tool.

<!-- cta -->

## How to Get a Bluesky Profile's RSS Feed (4 Steps, Free)

![Four steps to get a Bluesky profile's RSS feed into a feed reader](/images/blog/bluesky-rss-feed-steps-1200x675.webp)

### Step 1: Open the Profile in a Browser

Go to the profile on [bsky.app](https://bsky.app). The app works too, but copying the web address is easier in a browser.

### Step 2: Copy the Profile Address

It looks like `https://bsky.app/profile/example.com`.

### Step 3: Add /rss to the End

The feed address is `https://bsky.app/profile/example.com/rss`. Don't add a trailing slash after `rss`.

### Step 4: Add It to Your Reader

Paste the URL as a new feed in your RSS reader. New posts appear as items, newest first.

> **Pro tip:** Use the account's permanent ID instead of its handle, as in `https://bsky.app/profile/did:plc:abc123/rss`. That version keeps working if the person later [changes their handle](/blog/how-to-change-bluesky-handle), so it's the safer choice for a feed you want to keep.

The step people get wrong is using a handle-based URL for a long-term feed. If the account switches to a custom domain handle, the old URL can stop working, and your reader just goes quiet.

## What the Bluesky RSS Feed Includes (and What It Leaves Out)

| Included | Not included or limited |
| --- | --- |
| The account's own posts, newest first | Likes and, typically, reposts of other people's posts |
| Post text and date | Images and video are not reliably embedded |
| A link to each post on Bluesky | Links inside the post text may not be clickable |
| Public accounts | Accounts that ask apps not to show their posts to logged-out users |

![What a Bluesky RSS feed includes compared with what it leaves out](/images/blog/bluesky-rss-feed-includes-1200x675.webp)

Bluesky doesn't document the feed in detail, so behavior can change.

## Why Is a Bluesky RSS Feed Empty? 3 Likely Reasons

| Problem | Likely cause | Fix |
|---|---|---|
| Feed is empty or missing | The account asks apps not to show its posts to logged-out visitors, which reportedly turns off the RSS feed too | Nothing you can do; follow in the app |
| Feed stopped updating | The account changed its handle | Rebuild the feed with the `did:plc:` URL |
| Feed returns an error | The account is deactivated, or the URL has a typo | Check the profile still exists in a browser |

If you run the account yourself and want your feed to work, check the logged-out visibility setting under your Bluesky moderation or privacy settings. Menu labels change between app versions.

## Other Ways to Read Bluesky in a Feed Reader

- **Third-party converters** such as RSS.app build feeds from profiles, and some can do it for searches or hashtags. Most need a paid plan for frequent updates.
- **Several profiles in one feed:** most readers let you put several feeds in a folder, which works like a mini timeline.
- **Custom feeds** stay inside the Bluesky app; you can't export them as RSS.

## How to Post Your RSS Feed to Bluesky Automatically

Going the other way is the bigger time saver if you publish a blog, podcast or newsletter. Bluesky can't do this on its own, so you need an RSS auto-post tool connected to your Bluesky account with an app password.

Take Dana, who writes a gardening blog and publishes three posts a week. Each time, she opens Bluesky, writes a post, pastes the link, and then does the same on Threads and LinkedIn. That's nine manual posts a week, and the one she forgets is usually the one she's proudest of.

![The Schedule For You composer writing a Bluesky post within the 300-character limit](/images/blog/composer-bluesky-1440x900.webp)

In Schedule For You, Dana opens **Automations**, adds her feed's URL, picks her Bluesky account (plus Threads and LinkedIn) and writes a template using `{title}`, `{link}` and `{description}`. Feeds are checked every 15 minutes. The first check only records what's already in the feed, so old posts aren't shared. Each new item becomes a draft for her to review, or goes straight into the next open slot in her queue.

A Bluesky template has to fit 300 characters with the link included:

```
New on the blog: {title}

{link}
```

Bluesky shortens long links in the post, so a title, a sentence and the link usually fit. Our guide to the [Bluesky character limit](/blog/bluesky-character-limit) explains how links count.

| | Post by hand | Free RSS-to-social scripts | Schedule For You |
|---|---|---|---|
| Cost | Free | Free, plus hosting | RSS auto-post is on paid plans (Solo $19/month), 7-day trial with a card |
| Setup | None | Developer time | A feed URL and a template |
| Review before posting | Always | Usually not | Draft or straight to the queue, your choice |
| Other platforms | Repeat each one | Varies | Threads, X, LinkedIn and more from the same feed |

Where we're not the best fit: if you publish once a month, posting by hand takes two minutes and costs nothing. RSS auto-post isn’t on our Free plan, which covers the composer, queue and calendar for posts you write yourself. See the [Bluesky scheduler page](/bluesky) for connecting with an app password.

## What to Do Next

- ✓ **Following someone:** add `/rss` to their profile URL, using the `did:plc:` version for long-term feeds.
- ✓ **Following a hashtag:** use a third-party converter, since Bluesky has no search RSS.
- ✓ **Sharing your blog:** set up an RSS auto-post tool with a short template and review drafts for the first week.
- ✗ **Don't** give any tool your main Bluesky password. Use an app password you can revoke.

## Frequently Asked Questions

### Does Bluesky have RSS feeds?

Yes, every public profile has one at its profile URL plus `/rss`. There's no RSS for the home timeline or custom feeds.

### Can I get an RSS feed for a Bluesky hashtag or search?

Not from Bluesky itself at the time of writing. Third-party converters can build one, usually on a paid plan.

### Why is a Bluesky RSS feed empty?

The account may have no posts, may be deactivated, or may have asked apps not to show its posts to people who aren't logged in.

### Can Bluesky post my blog automatically?

Not on its own. Use an RSS auto-post tool connected to your Bluesky account with an app password.

### Does the Bluesky RSS feed include images?

Not reliably. Expect the post text, the date and a link back to the post, and open the post on Bluesky to see media.

### Will an RSS auto-post tool share my old blog posts?

A well-built one won't. In Schedule For You, the first check of a new feed only records existing items, so only posts published after that are shared.

### How do I find a Bluesky account's did:plc ID?

Several free lookup sites resolve a handle to its ID, and some feed readers show it after you subscribe. Check you're on a reputable site, and never log in to look one up.

## The Bottom Line

![Add /rss to read Bluesky in a feed reader, and use an auto-post tool to send your RSS to Bluesky](/images/blog/bluesky-rss-feed-bottom-line-1200x675.webp)

- **Reading Bluesky in RSS:** profile URL + `/rss`, free and built in.
- **Long-term feeds:** use the `did:plc:` URL so handle changes don't break them.
- **Hashtags and searches:** third-party converters only.
- **Posting your RSS to Bluesky:** an auto-post tool with an app password.

For more, try our free [X character counter](/tools/x-character-counter) (handy for short Bluesky posts too), the [username checker](/tools/username-checker) and the [font generator](/tools/font-generator). Next up: [how to schedule Bluesky posts](/blog/how-to-schedule-bluesky-posts).

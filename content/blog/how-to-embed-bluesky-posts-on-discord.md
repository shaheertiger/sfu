---
title: "How to Embed Bluesky Posts on Discord: Change One Word"
description: Embed Bluesky posts on Discord with images, video and quotes by changing bsky.app to fxbsky.app in the link. Plus fixes for missing previews and website embeds.
h1: "How to Embed Bluesky Posts on Discord: Change One Word in the Link"
category: Bluesky
excerpt: Paste a bsky.app link and Discord shows a basic preview. Change bsky.app to fxbsky.app and you get video that plays, every image and quoted posts. Here's how, plus fixes and website embeds.
keyword: how to embed bluesky posts on discord
date: 2026-10-28
updated: 2026-11-04
---
You pasted a Bluesky link into Discord and got a plain card with one image and a video that won't play. To embed a Bluesky post on Discord properly, copy the post's link (Share, then Copy link), change `bsky.app` to `fxbsky.app`, and paste it into your message. Discord then shows a richer embed with videos that play, all four images and quoted posts.

![How to embed Bluesky posts on Discord: change bsky.app to fxbsky.app in the link](/images/blog/how-to-embed-bluesky-posts-on-discord-hero-1200x675.webp)

Nothing else in the link changes, and there's no bot to install. The plain link still works too, it just shows less.

This guide covers why the plain link looks basic, the step-by-step method, what to do when the preview doesn't appear, the risks of fix-up services and bots, and how to embed a Bluesky post on a website.

## Why the Plain Bluesky Link Looks Basic on Discord

Discord builds previews from the metadata a web page publishes. Bluesky's post pages publish a simple card: the text, the author's name and an image. That's fine for a text post, but a post with four images or a video loses most of what made it worth sharing.

![What Discord shows for a plain bsky.app link compared with an fxbsky.app link](/images/blog/how-to-embed-bluesky-posts-on-discord-why-1200x675.webp)

| Link you paste | What Discord usually shows |
|---|---|
| `bsky.app/...` | Text, author and one image; videos often show as a still or a link |
| `fxbsky.app/...` | Text, author, all images, playable video, quoted post |

### What Most People Don't Know

fxbsky.app is run by FxEmbed, the open-source project behind FxTwitter. It reads the public post and serves the kind of metadata Discord can turn into a full embed, including a playable video. It doesn't need your Bluesky login, and it only sees the post you link.

> **Key point:** The fix isn't on Bluesky's side or Discord's. It's the link itself: swap one word and Discord gets a preview built for chat apps.

<!-- cta -->

## How to Embed a Bluesky Post on Discord in 4 Steps

![Four steps to embed a Bluesky post on Discord: copy the link, swap the domain, paste, hide the duplicate](/images/blog/how-to-embed-bluesky-posts-on-discord-steps-1200x675.webp)

### Step 1: Copy the Post Link

On the Bluesky app or bsky.app, tap the share icon under the post (or the three-dot menu) and choose **Copy link to post**. Menu labels change between app versions, so look for "Copy link" if the wording differs. The link looks like `https://bsky.app/profile/name.bsky.social/post/3lxyz...`.

### Step 2: Change bsky.app to fxbsky.app

This is the step that makes the difference. Edit the start of the link so it reads `https://fxbsky.app/profile/...`. Keep everything after the domain exactly as it was.

### Step 3: Paste It Into Discord and Send

Discord fetches the page and shows the embed under your message. Videos play inline in most cases, and posts with several images show them all.

### Step 4: Hide the Duplicate Preview (Optional)

If you pasted both links, remove the plain one, or wrap it in `< >` so Discord doesn't preview it. That keeps the channel tidy.

> **Pro tip:** If the fxbsky.app embed doesn't appear within a few seconds, the service may be slow or down. Send the plain bsky.app link instead; it always works, just with a simpler preview.

## Bluesky Preview Not Showing on Discord? 5 Fixes

![What to check when a Bluesky link won't preview on Discord, and the common causes](/images/blog/how-to-embed-bluesky-posts-on-discord-fixes-1200x675.webp)

| Problem | Fix | Why it works |
|---|---|---|
| No preview at all | Check the channel allows embeds (Discord's "Embed links" permission) and that link previews are on in your Discord settings | Discord won't show previews in channels or accounts where they're turned off |
| The video won't play | Use the fxbsky.app link | Plain Bluesky links rarely give Discord a playable video |
| "Post not found" | Check the post still exists | The post was deleted, or the author's account was deactivated or taken down |
| The preview shows an old version | Wait, or share the link again later | Discord caches previews; Bluesky posts can't be edited, so usually the image or profile changed |
| fxbsky.app embed fails | Use the plain bsky.app link | It's a third-party service and can be slow or down at times |

## Embed vs Plain Link vs Screenshot: Which to Use

| Method | Shows media | Stays up to date | Links back to the post | Effort |
|---|---|---|---|---|
| fxbsky.app link | All images, playable video | Yes, until the post is deleted | Yes | 5 seconds |
| Plain bsky.app link | Text and one image | Yes | Yes | 2 seconds |
| Screenshot | Whatever you capture | No | No | 30 seconds |

A screenshot is the only option that survives the post being deleted, but it doesn't link back and it can't be verified. It also cuts the author out: nobody can tap through to follow them or read the replies. For sharing, the link is better, and it's kinder to the person who wrote the post.

Use a screenshot when the record matters more than the reach, for example when you're reporting a post to moderators or saving something you expect to be deleted. In that case, share the link alongside it so people can check the original while it's still up.

## Link Fix-Up Services and Discord Bots (Use With Caution)

Other fix-up services exist besides fxbsky.app, and some Discord servers run bots that reply to every Bluesky link with a fixed version automatically.

### The Real Risks

- **Bots need permissions.** A bot that reads and posts in your channels can see what's posted there. Only add bots you trust, with the fewest permissions they need.
- **Unknown services can change.** A lesser-known fix-up domain could start serving ads, tracking or something worse, and everyone who clicks it goes there.
- **Downtime.** Any third-party service can go down, and then every fixed link in your server shows nothing.

### Safety Checklist

- Prefer well-known, open-source services like FxEmbed.
- Ask a server admin before adding a bot, and review its permissions.
- Never log in to Bluesky through a link-fixing site. None of them need your password.

> **Bottom line:** Swapping the domain by hand is enough for most people. Add a bot only if your server shares Bluesky links all day.

## How to Embed a Bluesky Post on a Website (Official Method)

Bluesky has its own embed for blogs and web pages:

1. Open the post on the web app, tap the three-dot menu and choose **Embed post**.
2. Copy the HTML snippet Bluesky gives you.
3. Paste it into your site's HTML or an HTML block in WordPress, Ghost, Webflow or similar.

The embed shows the post as a card with the author, text, media and a link back to Bluesky. If the author deletes the post, the embed stops showing it. Every Bluesky post is public, since there are no private accounts (see [whether you can make a Bluesky account private](/blog/how-to-make-bluesky-account-private)), so any post can be embedded.

## Post on Bluesky First, Then Share the Link (Schedule For You)

If you run a Discord community alongside a Bluesky account, the simplest routine is to post on Bluesky first, then drop the fxbsky.app link into your announcements channel.

Take Noor, who runs a Discord server for an indie game and announces each update on Bluesky, X and Threads. Every Tuesday at 6 p.m. she writes three versions of the same announcement, posts each one by hand, then copies the Bluesky link into Discord. The writing takes 10 minutes; being at her desk at 6 p.m. every Tuesday is the hard part.

| | Posting by hand | Discord bots | Schedule For You |
|---|---|---|---|
| Schedule the Bluesky, X and Threads posts | No | No | Yes, with a separate version for each |
| Bluesky 300-character check | In the Bluesky app | No | Yes, live |
| Share the link into Discord | You paste it | Some bots fix links you paste | No, you paste it |
| Cost | Free | Usually free | Free plan for 3 accounts and up to 10 scheduled posts at a time, no card |

Where we're not the best fit: Schedule For You doesn't post to Discord at all. It handles the Bluesky, X and Threads side, and sharing the link in Discord stays a manual step.

In Schedule For You, Noor writes the announcement once, trims the Bluesky version to 300 characters, and schedules all three for Tuesday at 6 p.m.:

![The Schedule For You composer with a Bluesky version of the post and a live character counter](/images/blog/composer-bluesky-1440x900.webp)

When the posts go live, she copies the Bluesky link, swaps in fxbsky.app and pastes it into Discord. The [Bluesky scheduler page](/bluesky) lists what's supported, and the [Bluesky character limit guide](/blog/bluesky-character-limit) covers the posting rules.

## What to Do Next

- ✓ Sharing a Bluesky post with video or several images? Use fxbsky.app.
- ✓ Sharing a text-only post? The plain link is fine.
- ✓ Embedding on a website? Use Bluesky's own **Embed post** snippet.
- ✗ Don't add a link-fixing bot without checking its permissions.
- ✗ Don't log in to Bluesky through any link-fixing site.

## Frequently Asked Questions

### Do I need a bot to embed Bluesky posts on Discord?

No. Pasting the link works on its own, and changing bsky.app to fxbsky.app gives a richer embed without a bot. Some servers add bots that fix links automatically, but they're optional.

### Is fxbsky.app safe to use?

It's an open-source project that reads public Bluesky posts and doesn't need your login; it only sees the post you link. As with any third-party service, it can go down, so keep the original link if a share matters.

### Can I embed a Bluesky post with a video on Discord?

Yes. Use the fxbsky.app version of the link, and Discord shows a playable video in most cases. The plain link usually shows a thumbnail or just the text.

### Why does my Bluesky link show no preview on Discord?

Usually because embeds are turned off for that channel or in your settings. Check Discord's "Embed links" permission for the channel and that link previews are on.

### Can I embed a Bluesky post on my website?

Yes. Use **Embed post** from the post's menu on bsky.app, copy the snippet and paste it into an HTML block on your site.

### What happens to the embed if the post is deleted?

The embed stops showing the post, on both Discord and websites. If you need a lasting record, take a screenshot as well.

### Does the author know I shared their post on Discord?

No. Sharing a link outside Bluesky doesn't send the author a notification. Only actions inside Bluesky, such as a repost, quote or reply, notify them.

### Can I embed posts from private Bluesky accounts?

Bluesky doesn't have private accounts, so every post is public and can be embedded. Posts from deactivated or taken-down accounts won't load.

## The Bottom Line

![Swap bsky.app for fxbsky.app to get a full Bluesky embed on Discord](/images/blog/how-to-embed-bluesky-posts-on-discord-bottom-line-1200x675.webp)

- **fxbsky.app:** the best Discord embed, with video, every image and quoted posts.
- **Plain bsky.app link:** always works, with a basic preview.
- **Bots:** optional, and worth checking before you add one.
- **Websites:** use Bluesky's own Embed post snippet.

Next up: [how to post on Bluesky](/blog/how-to-post-on-bluesky). For more free tools, try the [Discord character counter](/tools/discord-character-counter), the [Discord bio generator](/tools/discord-bio-generator) and the [username checker](/tools/username-checker).

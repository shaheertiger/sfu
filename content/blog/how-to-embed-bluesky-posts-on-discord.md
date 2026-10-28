---
title: "How to Embed Bluesky Posts on Discord (With Images and Video That Play)"
description: How to embed Bluesky posts on Discord so images, video and quotes show up, using the fxbsky.app link trick, plus how to embed Bluesky posts on a website.
h1: How to Embed Bluesky Posts on Discord
category: Bluesky
excerpt: Paste a bsky.app link and Discord shows a basic preview. Change bsky.app to fxbsky.app and you get a richer embed with video, multiple images and quoted posts. Here's how, plus website embeds.
keyword: how to embed bluesky posts on discord
date: 2026-10-28
---
To embed a Bluesky post on Discord, copy the post's link (Share, then Copy link) and paste it into a Discord message. Discord shows a preview card on its own. For a better embed, with videos that play, all four images and quoted posts, change `bsky.app` in the link to `fxbsky.app` before you send it. Nothing else in the link changes, and there's no bot to install.

## Step by step

1. **Copy the post link.** On the Bluesky app or bsky.app, tap the share icon under the post (or the three-dot menu) and choose **Copy link to post**. The link looks like `https://bsky.app/profile/name.bsky.social/post/3lxyz...`.
2. **Paste it into Discord.** Discord fetches the page and shows a preview card with the text, the author and usually the first image.
3. **For a richer embed, swap the domain.** Edit the link so it starts `https://fxbsky.app/profile/...` and send it. Discord now gets a preview built for chat apps.
4. **Hide the original preview if you want.** If you paste both links, remove the plain one, or wrap it in `< >` so Discord doesn't preview it.

| Link you paste | What Discord usually shows |
| --- | --- |
| `bsky.app/...` | Text, author and one image; videos often show as a still or a link |
| `fxbsky.app/...` | Text, author, all images, playable video, quoted post |

## Why the plain link looks basic

Discord builds previews from the metadata a web page publishes. Bluesky's post pages publish a simple card: text, name and an image. That's fine for text posts, but a post with four images or a video loses most of what makes it worth sharing.

fxbsky.app is run by FxEmbed, the open-source project behind FxTwitter. It reads the public post and serves Discord metadata it can turn into a full embed, including a playable video. It only works for public posts, and since it's a third-party service, it can be slow or down at times. If it fails, the plain bsky.app link still works.

Other fix-up services exist, and some Discord servers run bots that reply to Bluesky links with a fixed version automatically. Ask a server admin before adding a bot.

<!-- cta -->

## How to embed a Bluesky post on a website

Bluesky has its own embed for blogs and web pages:

1. Open the post, tap the three-dot menu and choose **Embed post** (on the web app).
2. Copy the HTML snippet Bluesky gives you.
3. Paste it into your site's HTML or an HTML block in WordPress, Ghost, Webflow or similar.

The embed shows the post as a card with the author, text, media and a link back to Bluesky. If the author deletes the post, the embed stops showing it. Only public posts can be embedded, which on Bluesky means every post, since there are no private accounts (see [whether you can make a Bluesky account private](/blog/how-to-make-bluesky-account-private)).

## Sharing your own posts to a community

If you run a Discord community alongside a Bluesky account, the simplest routine is to post on Bluesky first and drop the fxbsky.app link in your announcements channel. Schedule For You handles the Bluesky side: write the post once, add X and Threads versions if you want, and publish on a schedule from one queue. The [Bluesky scheduler page](/bluesky) lists what's supported, and the [Bluesky character limit guide](/blog/bluesky-character-limit) covers the posting rules. Sharing the link in Discord stays a manual step.

## Troubleshooting

- **No preview at all.** Check the channel allows embeds (Discord's "Embed links" permission) and that you haven't turned off link previews in Settings, Chat.
- **The video won't play.** Use the fxbsky.app link. Plain Bluesky links rarely give Discord a playable video.
- **"Post not found".** The post was deleted, or the author's account was deactivated or taken down.
- **The preview shows an old version.** Discord caches previews. Bluesky posts can't be edited anyway, so this usually means the image or profile changed after the first share.

## Frequently asked questions

### Do I need a bot to embed Bluesky posts on Discord?
No. Pasting the link works on its own. Changing bsky.app to fxbsky.app gives a richer embed without a bot. Some servers add bots that fix links automatically, but they're optional.

### Is fxbsky.app safe to use?
It's an open-source project that reads public Bluesky posts and doesn't need your login. It only sees the post you link. As with any third-party service, it can go down, so keep the original link if a share matters.

### Can I embed a Bluesky post with a video on Discord?
Yes. Use the fxbsky.app version of the link, and Discord shows a playable video in most cases. The plain link usually shows a thumbnail or just the text.

### Can I embed a Bluesky post on my website?
Yes. Use **Embed post** from the post's menu on bsky.app, copy the snippet and paste it into an HTML block on your site.

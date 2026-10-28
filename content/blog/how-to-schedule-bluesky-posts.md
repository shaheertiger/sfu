---
title: "How to Schedule Bluesky Posts: A Step-by-Step Guide"
description: Bluesky has no built-in scheduler. How to schedule Bluesky posts with an app password, set up a posting queue, schedule threads and adapt one message for Bluesky, X and Threads.
h1: How to Schedule Bluesky Posts
category: Bluesky
excerpt: Bluesky can save drafts but can't publish them on a timer. To schedule Bluesky posts, connect a scheduler with an app password, write the post and pick a time or a queue slot.
keyword: how to schedule bluesky posts
date: 2026-10-28
---
Bluesky has **no built-in scheduler** at the time of writing. The app added drafts in February 2026, but a draft only waits for you to post it by hand. To schedule Bluesky posts, create an **app password** in Bluesky's settings, connect it to a scheduling tool with your handle, write the post and pick a date and time (or a slot in your queue). The tool publishes it for you, including images, video and threads.

Here's the manual route, where it breaks down, how the options compare and a full walkthrough in Schedule For You.

## The native way: drafts, then post by hand

Without a scheduler, the closest Bluesky gets is a draft you publish yourself.

1. **Write the post.** Tap the compose button and write up to 300 characters, with up to four images or one video.
2. **Save it as a draft.** Close the composer and choose to save the draft. Drafts live behind the **Drafts** button at the top of the new-post screen.
3. **Set yourself a reminder.** Use your phone's reminders or calendar for the time you want it out.
4. **Open the draft and post it.** At the reminder, open **Drafts**, pick the post and publish it.

For a thread, recent versions let you add the next part in the same composer before posting; otherwise post the first part and reply to it. Menu labels change between app versions; if you don't see Drafts, update the app.

## Where posting by hand gets inconvenient

Say you write a weekly newsletter that goes out Tuesday at 8:00 AM Eastern. You want a four-part Bluesky thread about the issue at the same moment, plus a shorter version on X and a longer one on Threads.

By hand, that means:

- **Being online at 8:00 AM every Tuesday**, including the weeks you're travelling or in a different time zone.
- **Posting the thread one part at a time** on Bluesky, then rewriting it to fit 280 characters for X and posting it again on Threads.
- **Remembering three apps' drafts** and hoping nothing went wrong in one of them while you were busy in another.
- **No record of what's planned.** If a colleague asks what's going out next week, the answer is in your head.

One quick post a day is easy by hand. A fixed weekly slot across three networks is exactly what a scheduler is for.

## Your options compared

| Option | Real scheduling | Threads | Same post to X and Threads | Alt text on images | Cost |
| --- | --- | --- | --- | --- | --- |
| Bluesky drafts + reminder | No, you post by hand | Yes | No | Yes | Free |
| Browser extension for the Bluesky website | Yes, while you use that extension's service | Varies | No | Varies | Free or paid |
| General scheduling tools (Schedule For You, and others such as Buffer and Hootsuite at the time of writing) | Yes | Varies by tool | Yes | Varies by tool | Mostly paid |

Be aware that Schedule For You publishes image posts to Bluesky without alt text. If a post's images need descriptions for screen-reader users, post that one natively. For everything else, a scheduler that posts to several networks from one draft removes most of the repeat work. Whatever you choose, connect it with an app password rather than your main Bluesky password.

<!-- cta -->

## How to schedule Bluesky posts in Schedule For You

The screenshots below are from the Schedule For You demo workspace, with sample accounts and posts.

### Step 1: Create an app password in Bluesky

In Bluesky, go to **Settings > Privacy and security > App passwords** (older versions: **Settings > App passwords**) and add one. Name it something you'll recognize, such as "Schedule For You", and copy the password it shows. You won't see it again. You can delete it any time to cut off access without changing your login.

### Step 2: Connect Bluesky

In Schedule For You, open **Social accounts** and choose **Connect Bluesky**. Enter your handle (for example `you.bsky.social` or your own domain) and the app password. No developer approval or extra sign-up on Bluesky's side is needed.

![The Social accounts screen in Schedule For You with a Bluesky account marked Connected and a Connect a platform card that says Handle and app password](/images/blog/social-accounts-1440x900.webp)

If you change your Bluesky handle later, reconnect the account with the new handle so scheduled posts keep publishing.

### Step 3: Set up your posting slots

Open **Settings > Posting slots** and choose the days and times you want to post, for example Tuesday 8:00 AM and Thursday 12:30 PM. Pick your time zone in the same screen. **Add to queue** and bulk uploads fill these slots in order, so you can write five posts and let the queue spread them out.

![Schedule For You settings with a time zone menu, posting slot days and times, and the API keys section](/images/blog/settings-posting-slots-api-keys-1440x900.webp)

### Step 4: Write the post and tailor each network

Click **Create post** and select your Bluesky account, plus X and Threads if the post goes there too. Write the main caption once. Each network gets its own tab, and the counters under the text check every version against its own limit as you type: 300 characters for Bluesky, 280 for X and 500 for Threads.

![The composer with Bluesky, X, Instagram and LinkedIn selected, per-platform tabs, character counters for each network and Schedule, Add to queue and Save draft buttons](/images/blog/composer-four-platforms-1440x900.webp)

- **Threads:** put a line with only `---` between parts. On Bluesky, X and Threads each part becomes a reply to the one before, and media goes on the first post. Up to 25 parts, each within the platform's limit.
- **First comment:** add a link or hashtags in the **First comment** field and it's posted as a reply right after the post goes live.
- **Media:** attach up to four images or one video.

### Step 5: Schedule it, or add it to the queue

Choose **Schedule** and pick a date and time, or **Add to queue** to take the next open slot. The queue then shows the post with its accounts and a countdown to the next one going out. If Bluesky is briefly unavailable, Schedule For You retries the post up to three times, two minutes apart. If it still fails, you get an email with the reason and a retry link.

## One message, adapted for Bluesky, X and Threads

Here's the newsletter announcement from the scenario, written once and trimmed per network:

| Network | Limit | Version |
| --- | --- | --- |
| Bluesky | 300 | "This week's issue: why small shops are leaving marketplaces and what they're doing instead. Three case studies, real numbers, no fluff. Read it here: [link]" (about 160 characters, room for a thread below it) |
| X | 280 | "Why small shops are leaving marketplaces, with three case studies and real numbers. New issue: [link]" |
| Threads | 500 | The Bluesky text plus a closing question: "Have you moved off a marketplace? What surprised you?" |

Bluesky shortens links in the post and counts the shortened text, so links take less room than you'd expect. Our [Bluesky character limit](/blog/bluesky-character-limit) guide covers how links, mentions and hashtags count.

## Frequently asked questions

### Does Bluesky have a built-in scheduler?
No, not at the time of writing. Bluesky added drafts in February 2026, but drafts don't publish on a timer. Scheduling needs a third-party tool connected with an app password.

### Is it safe to give a scheduler my Bluesky password?
Give it an app password, never your main password. App passwords can post on your behalf but can't change your account login, and you can revoke one in Bluesky's settings at any time.

### Can you schedule a Bluesky thread?
Yes. In Schedule For You, separate the parts with a line holding only `---`. Each part is checked against the 300-character limit before anything is posted, so a thread is never left half-published over a length rule.

### Can you schedule Bluesky posts with images or video?
Yes: up to four images, or one video, per post. Bluesky's own limits for video length and image size changed during 2026, so the [Bluesky character limit guide](/blog/bluesky-character-limit) has the current figures.

### Why did my scheduled Bluesky post fail?
Usually because the app password was deleted, or the handle changed. Create a new app password or reconnect with the new handle on the Accounts screen, then retry the post from the queue.

### What should I read next?
If you're new to Bluesky, start with [how to post on Bluesky](/blog/how-to-post-on-bluesky). If you're deciding whether it deserves a place in your plan at all, read [is Bluesky worth it](/blog/is-bluesky-worth-it). The [Bluesky scheduler page](/bluesky) lists everything you can schedule there.

---
title: Instagram Failing to Post? Causes and Fixes That Work
description: Instagram failing to post? Find out why posts get stuck or fail, from aspect ratios and video processing to expired sessions, and how to fix and retry them.
h1: Instagram Failing to Post? How to Find the Cause and Fix It
category: Guides
excerpt: Most Instagram posts fail for a handful of reasons: the wrong image shape, missing media, video processing, an expired connection or a changed account. Here's how to fix each.
keyword: instagram failing to post
date: 2026-10-23
---
When Instagram is failing to post, the cause is usually one of a few things: the image or video doesn't meet Instagram's rules, the video hasn't finished processing, the connection between Instagram and the app posting for you has expired, or the account is no longer set up the way Instagram's publishing system expects. Each of these has a specific fix, and most take only a few minutes.

This guide covers posts that fail in the Instagram app and scheduled posts that fail in a tool like Schedule For You, with a troubleshooting table you can work through from top to bottom.

## Why is Instagram not posting? Quick troubleshooting table

Start here. Find the symptom or error that matches yours, then follow the fix.

| Cause | What you'll usually see | How to fix it |
|---|---|---|
| Image outside 4:5 to 1.91:1 | Scheduled post fails with an aspect ratio or media error | Resize to 1080×1350, 1080×1080 or 1080×566 and retry |
| No image or video attached | Post can't be sent to Instagram | Add at least one photo or video; Instagram has no text-only posts |
| Video still processing or failed processing | Post stuck, or fails after a delay | Use MP4 with H.264 video and AAC audio, keep files reasonable, retry |
| Access token expired or session invalid | "Session invalid" or "error validating access token" | Reconnect Instagram from the Accounts screen, then retry |
| Account no longer Business or Creator | Posts start failing suddenly | Switch back to a professional account, then reconnect |
| Account unlinked from its Facebook Page | Posts fail, or the account disappears when you reconnect | Relink the account to the Page, then reconnect |
| Caption over 2,200 characters | Caption rejected | Shorten the caption to 2,200 characters or fewer |
| More than 10 carousel items | Carousel rejected | Keep scheduled carousels to 2–10 items, or split into two posts |

If you post directly in the Instagram app and see "Couldn't post" or a post stuck on "Posting…", skip ahead to the section on app uploads.

## Media problems: the most common reason a scheduled Instagram post failed

When a scheduled Instagram post failed but your account looks fine, check the media first. Instagram is stricter about media coming from scheduling tools than about media you edit in its own app.

### Image aspect ratio outside 4:5 to 1.91:1

Instagram's feed accepts images between 4:5 portrait and 1.91:1 landscape, at the time of writing. In the Instagram app, you're asked to crop anything outside that range. A scheduling tool can't crop on your behalf in the same way, so a 9:16 phone screenshot or a very wide banner is simply rejected.

Schedule For You doesn't crop or resize images. It sends your file as it is, which means you keep control of the framing, but you need to export images at a supported size before uploading. Safe sizes are:

- 1080×1350 (4:5 portrait)
- 1080×1080 (1:1 square)
- 1080×566 (1.91:1 landscape)

Our free [Instagram photo resizer](/tools/instagram-photo-resizer) has presets for all three, with a choice to crop or add a background. For more detail on how Instagram's crop works, see [why Instagram crops your photos](/blog/instagram-aspect-ratio-cropping).

### No media attached

Instagram doesn't support text-only feed posts. Every post needs at least one image or video. If you wrote one caption for several platforms, the Instagram version will fail if there's nothing attached, even though the same post works fine on X or Threads. Add an image, or remove Instagram from that post.

### Video processing time

Videos aren't published instantly. Instagram first uploads and processes the file, and only then publishes it as a Reel. Long or very large files take longer, and files in unusual formats can fail processing altogether. Practical steps:

1. Export as MP4 with H.264 video and AAC audio, which Instagram handles reliably.
2. Use a vertical 9:16 frame at 1080×1920 for Reels.
3. Keep the length within Instagram's current Reel limit (check the upload screen in the app if you're unsure, as the limit has changed several times).
4. Avoid enormous files: export at a sensible bitrate rather than straight from a camera master.

If a video post fails once, retry it before changing anything. Processing failures are sometimes temporary.

### Carousel item limits

Scheduled carousels can hold 2 to 10 photos or videos, and you can mix the two. The Instagram app has allowed more slides for posts made in the app, but the publishing system that third-party tools use caps carousels at 10. If you have more, split the set into two posts.

### Caption length

Instagram captions can be up to 2,200 characters. Anything longer is rejected. Schedule For You checks each platform's limit live as you type, so you'll see the Instagram version go over before you schedule it. If you're reusing a long LinkedIn or Facebook caption, edit the Instagram version separately and trim it there.

<!-- cta -->

## Connection and account problems

If your media is fine and posts still fail, the problem is usually the connection between Instagram and the tool, or a change to the account itself.

### Token expired or "session invalid"

Scheduling tools don't store your Instagram password. When you connect an account, Meta issues an access token that lets the tool publish for you. Meta can cancel that token at any time, most often after a password change, a security check, logging out of all sessions, or removing the app's permissions. The next post then fails with an error such as "session invalid."

The only fix is to reconnect. Open the Accounts screen in Schedule For You, start the Instagram connection again, log in through Meta's window and approve every permission. Our guide to the [400 session invalid error](/blog/instagram-session-invalid-error) walks through the causes and steps in more detail.

### Account no longer Business or Creator

Scheduled posting only works with Instagram Business or Creator accounts. If someone switches the account to a personal account, even briefly, publishing access is removed. Switch back to a professional account in the Instagram app's settings, then reconnect from the Accounts screen.

### Account unlinked from its Facebook Page

Instagram accounts used for scheduling must be linked to a Facebook Page. If the link is removed, or the account is linked to a different Page, existing connections stop working. Relink the account to the right Page (look for "Linked accounts" or "Instagram" in the Page's settings, or use Meta Business Suite), make sure the Facebook login you use has full control of that Page, and then reconnect.

### The account is restricted

If Instagram has restricted or disabled the account, nothing can post to it until that's resolved through Instagram's own appeal flow. Use the in-app options and the [Instagram Help Center](https://help.instagram.com), and never pay a third-party "recovery service."

## When Instagram is failing to post in the app itself

If you're posting by hand and the app shows "Couldn't post. Tap to retry" or hangs on "Posting…", try these in order:

1. **Check your connection.** Switch between Wi-Fi and mobile data. Large videos often stall on weak connections.
2. **Tap retry once.** Then wait. Retrying repeatedly can create duplicate posts.
3. **Update the app.** Older versions sometimes fail on newer features.
4. **Restart the app and your phone.** This clears stuck uploads more often than you'd expect.
5. **Free up storage.** Instagram needs space on your device to prepare uploads.
6. **Check for an outage.** If many people report problems at once, waiting is the fix.
7. **Look for a restriction notice.** Instagram may limit actions if it suspects automated or unusual activity. The notice explains what's affected.

## Failed-post alerts and how to retry

You can't always prevent a failure, but you can catch it quickly. When a scheduled post fails, Schedule For You sends a failed-post alert that tells you which account and post were affected. If the cause is an expired connection, the alert prompts you to reconnect.

Once you've fixed the cause, here's how to recover:

1. Open the failed post from the alert.
2. Fix the issue: resize the image, add media, trim the caption, or reconnect the account.
3. Retry the post to publish it now, or pick a new time.
4. If the same post went to other platforms, only the failed target needs retrying. The others have already published.

The daily digest is also worth keeping on. It summarizes what's coming up and what went wrong, so a broken connection doesn't quietly cost you several days of posts.

## How to stop posts failing in the future

- **Export media at Instagram sizes** before uploading, rather than relying on cropping.
- **Reconnect straight after password changes** to your Instagram or linked Facebook account.
- **Keep the account professional** and linked to the same Facebook Page.
- **Connect with a long-term login**, ideally one owned by the business, so the connection doesn't break when someone leaves.
- **Use one caption per platform** where limits differ, so the Instagram version stays within 2,200 characters.

## Frequently asked questions

### Why is Instagram not posting my scheduled post?

The most common reasons are an image outside Instagram's 4:5 to 1.91:1 range, a post with no image or video, a video that failed processing, or an expired connection. Check the failed-post alert for the error, fix the cause and retry.

### Why does Instagram say my session is invalid?

Meta has cancelled the access token your scheduling tool was using, usually after a password change, a security check or a permission change. Reconnect the account from the Accounts screen to get a new token, then retry failed posts.

### Can I schedule Instagram posts without a Facebook Page?

Not with Schedule For You. Instagram accounts must be Business or Creator accounts linked to a Facebook Page, which is how Meta grants publishing access to scheduling tools.

### Why did my Instagram carousel fail?

Check the number of items and their shapes. Scheduled carousels allow 2 to 10 photos or videos, and every image must sit within Instagram's supported aspect ratio range. Resize any slide that's too tall or too wide.

### Will a failed Instagram post publish later on its own?

No. A failed post stays failed until you retry it or reschedule it. Fix the cause first, then retry from the post or choose a new time.

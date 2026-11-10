---
title: Is Bluesky Down Today? Check status.bsky.app, Then 6 Fixes
description: Is there a problem with Bluesky today? How to check Bluesky's status page, fix feeds that won't load, and why Bluesky signed you out or a connected app stopped working.
h1: "Is Bluesky Down Today? Check status.bsky.app First, Then Try These 6 Fixes"
category: Bluesky
excerpt: Check status.bsky.app first. If Bluesky is up for everyone else, restart the app, check your connection and sign back in. Here's why Bluesky signs you out and how to fix connected apps.
keyword: is there a problem with bluesky today
date: 2026-10-28
updated: 2026-11-04
---
Your Bluesky feed is spinning, a post won't send, or the app has just signed you out. To check whether there's a problem with Bluesky today, open **status.bsky.app**, Bluesky's official status page, which lists current incidents for the app, the website and the servers that host accounts. If it shows an incident, wait it out: nothing you change on your phone will help.

![Is Bluesky down? Check status.bsky.app first, then fix your app, connection or sign-in](/images/blog/is-bluesky-down-hero-1200x675.webp)

If the status page is all clear but Bluesky won't load for you, the problem is usually your app, your connection or your sign-in. That's the part most "is it down" sites can't tell you.

This guide covers how to tell a real outage from a local problem, what each symptom means, why Bluesky signs you out, how to fix connected apps, and six quick fixes.

## Is It Bluesky or Just You? Why the Answer Isn't Obvious

Bluesky isn't one server. Your account lives on a hosting server (a PDS), and many custom feeds are run by their creators on their own servers. So "Bluesky is down" can mean the whole network, the server your account is on, or just one feed you follow.

![Signs that Bluesky is down for everyone compared with signs that the problem is on your side](/images/blog/is-bluesky-down-signs-1200x675.webp)

### What Most People Don't Know

Most Bluesky outages are partial. Feeds load slowly, notifications lag or posting fails while browsing still works. Bluesky has had a handful of notable outages in 2026, including a multi-day disruption in April that it attributed to a DDoS attack, and shorter incidents of an hour or two. And an empty custom feed often isn't an outage at all: its creator's server may simply be down.

> **Key point:** Check status.bsky.app before you change anything. If there's an incident, waiting is the fix. If there isn't, switch to the Following feed: if that works, Bluesky is up and the problem is narrower.

<!-- cta -->

## How to Tell If Bluesky Is Down for Everyone (4 Checks)

![Four checks to tell whether Bluesky is down for everyone](/images/blog/is-bluesky-down-checks-1200x675.webp)

### Check 1: Open status.bsky.app (the Official Answer)

Bluesky posts incidents there, such as site downtime or elevated error rates on the servers that store accounts.

### Check 2: Try bsky.app in a Browser

If the website works and the app doesn't, it's the app.

### Check 3: Look at an Outage Tracker

Sites such as Downdetector show a spike in reports when many people have problems at once.

### Check 4: Look Elsewhere

When Bluesky has a big outage, people talk about it on X, Threads and Reddit within minutes.

> **Pro tip:** The check people skip is switching feeds. If a custom feed is empty but **Following** loads, Bluesky is working and that one feed's server is down. Nothing on your side needs fixing.

## Bluesky Symptoms and What They Mean

| What you see | Likely cause | What to do |
| --- | --- | --- |
| Feeds spin or won't refresh | Outage, or a custom feed's server is down | Check status page; switch to Following |
| One custom feed is empty | That feed's creator runs it on their own server | Wait, or use another feed |
| "Post failed" when posting | Outage, or media too large | Retry later; keep images under 2 MB |
| Profile says "Account not found" | Account deactivated, deleted or taken down | Nothing to fix on your side |
| Notifications missing | Notification delay or settings | Check Settings, Notifications |
| Signed out unexpectedly | See below | Sign in again |

## Why Did Bluesky Sign Me Out? 7 Reasons

Bluesky keeps you signed in with a session that refreshes in the background. You get signed out when that session can't refresh.

![Common reasons Bluesky signs you out, from a password change to an outage during session refresh](/images/blog/is-bluesky-down-signout-1200x675.webp)

- **You changed your password.** That signs out other sessions and, for third-party apps, revokes app passwords.
- **An outage interrupted the session refresh.** Sign in again once the status page is clear.
- **You cleared app data, cookies or reinstalled the app.**
- **Your hosting server changed.** If you moved your account to another server (a PDS), sign in with the new one.
- **You changed your handle** and saved logins still use the old one.
- **The account was suspended or taken down.** You'll usually see a message or get an email explaining why.
- **Age verification.** In some regions Bluesky asks for age verification before you can use certain features, and you may be prompted after signing in.

If you can't sign back in, use **Forgot password** on the sign-in screen. Bluesky emails a reset code.

## When a Connected App Stops Working (App Passwords)

Apps that post for you, such as schedulers and third-party clients, connect with an **app password**. They stop working when that app password is deleted, when you change your main password, or when you change your handle and the app signs in with the old one.

The fix is the same each time:

1. Open **Settings → Privacy and security → App passwords** (menu labels can change between app versions).
2. Create a new app password and give it a name you'll recognize.
3. Reconnect the app with your current handle and the new app password.

## 6 Quick Fixes When Bluesky Is Up but Not for You

1. Force-close and reopen the app.
2. Switch between Wi-Fi and mobile data, or turn off a VPN.
3. Update the app from the App Store or Google Play.
4. Try bsky.app in a browser.
5. Sign out and back in.
6. Reinstall the app as a last resort (you'll need your password).

| Fix | Solves | Time |
| --- | --- | --- |
| Restart the app | Stuck sessions, frozen feeds | 30 seconds |
| Switch network or turn off VPN | Connection and routing problems | 1 minute |
| Update the app | Bugs fixed in newer versions | 2 minutes |
| Try the website | Tells you whether the app is the problem | 1 minute |
| Sign out and in | Expired sessions | 1 minute |
| Reinstall | Corrupted app data | 5 minutes |

## Third-Party Clients and "Status Checker" Apps (Use With Caution)

When Bluesky misbehaves, it's tempting to try another client or an app that promises to check your account.

### The Real Risks

- **Main-password requests.** A legitimate third-party app should ask for an app password, not your main one.
- **They can't fix an outage.** If status.bsky.app shows an incident, no other app gets around it.
- **Unknown apps keep access.** An app password you forgot about still works until you delete it.

### Safety Checklist

- Give third-party apps an app password, never your main password.
- Name each app password after the app, and delete ones you no longer use.
- Trust status.bsky.app over any outside "checker".

> **Bottom line:** App passwords exist so you never have to hand over your real one. If an app asks for your main password, don't use it.

## Scheduled Posts During a Bluesky Outage

Outages are most annoying when you've planned around a time: a launch announcement at 9 AM, or a post tied to an event that's happening now.

![The Schedule For You composer with a Bluesky post and its 300-character counter](/images/blog/composer-bluesky-1440x900.webp)

Take Hana, who runs a small newsletter and announces each issue on Bluesky, Threads and LinkedIn at 9 AM on Tuesdays. One Tuesday, Bluesky has a short incident at 9 AM. Posting by hand, she'd be refreshing the app every few minutes before her first meeting.

In Schedule For You, a post that fails because Bluesky is down is tried again automatically, up to three attempts, two minutes apart, so a short outage usually needs no action. If the problem is the connection itself (a revoked app password or a new handle), the account is marked **Reconnect needed** and she gets an alert, reconnects from the Accounts screen and retries. Her 3 accounts and weekly posts fit the Free plan.

| | Posting by hand | Bluesky's app | Other schedulers | Schedule For You |
| --- | --- | --- | --- | --- |
| Post during an outage | Keep refreshing and retry | Retry manually | Varies | Retried automatically, up to three attempts |
| Alert when the connection breaks | No | No | Varies | Yes, with Reconnect needed |
| Bluesky, Threads, LinkedIn and others together | One by one | Bluesky only | Varies, not all support Bluesky | Yes, with a caption for each platform |
| Cost | Free | Free | Varies | Free for 3 accounts and up to 10 scheduled posts at a time, no card. Paid from $19 a month |

Where we're not the best fit: no scheduler can post while Bluesky is down for longer than its retries. A multi-day outage means retrying once it's over. And if you only post to Bluesky now and then, the app itself is enough.

Failed posts show up in the queue with the reason and a Retry button:

![The Schedule For You queue showing failed posts with their reasons and a Retry button](/images/blog/queue-1440x900.webp)

The [Bluesky scheduler page](/bluesky) has the connection steps, and our guide on [how to schedule Bluesky posts](/blog/how-to-schedule-bluesky-posts) covers the rest.

## What to Do Next: 3 Scenarios

- **status.bsky.app shows an incident.** Wait. Check back in 30 minutes, and retry anything that failed once it's clear.
- **Status is clear, one feed is empty.** Switch to Following. If that works, the custom feed's server is down.
- **Status is clear, nothing works.** Run the six quick fixes in order, then sign out and back in.

## Frequently Asked Questions

### Where is Bluesky's status page?

At status.bsky.app. It lists current and past incidents for the app, the website and Bluesky's hosting servers.

### Why does my Bluesky feed say it can't load?

If it's a custom feed, the feed's own server may be down; feeds are run by their creators, not by Bluesky. Switch to the Following feed to check that Bluesky itself is working.

### Why did my scheduled Bluesky post fail?

Usually because Bluesky was down when the post was due, or because the app password was deleted or the handle changed. Short outages are often handled by automatic retries; for connection problems, create a new app password and reconnect.

### Does Bluesky sign you out after a while?

Not normally. Sessions refresh in the background. A password change, an outage during refresh, clearing app data or an account action can sign you out.

### How do I reset my Bluesky password?

Tap Forgot password on the sign-in screen. Bluesky emails you a reset code.

### Why can't I post images on Bluesky?

Either Bluesky is having an incident or the image is too large. Keep images under 2 MB and try again once the status page is clear.

### Does changing my Bluesky password break connected apps?

Yes. Changing your main password revokes app passwords, so create new ones and reconnect each app.

### Why does Bluesky say "Account not found"?

The account has been deactivated, deleted or taken down. There's nothing to fix on your side.

## The Bottom Line

![Check status.bsky.app first, switch to Following, then work through the quick fixes](/images/blog/is-bluesky-down-bottom-line-1200x675.webp)

- **status.bsky.app:** the official answer, so check it first.
- **Following feed:** tells you whether Bluesky works and only a custom feed is down.
- **Signed out:** usually a password change, cleared data or an outage during refresh.
- **Connected apps:** a new app password fixes most of them.

Check the status page, then fix only what's yours to fix. Next up: [how to post on Bluesky](/blog/how-to-post-on-bluesky). For more free tools, try the [username checker](/tools/username-checker), the [aspect ratio calculator](/tools/aspect-ratio-calculator) and the [remove EXIF data tool](/tools/remove-exif-data).

---
title: "Is Bluesky Down? How to Check, What to Do, and Why Bluesky Signed You Out"
description: Is there a problem with Bluesky today? How to check Bluesky's status page, fix feeds that won't load, and why Bluesky signed you out or a connected app stopped working.
h1: Is Bluesky Down Today?
category: Bluesky
excerpt: Check status.bsky.app first. If Bluesky is up for everyone else, restart the app, check your connection and sign back in. Here's why Bluesky signs you out and how to fix connected apps.
keyword: is there a problem with bluesky today
date: 2026-10-28
---
To check whether there's a problem with Bluesky today, open **status.bsky.app**, Bluesky's official status page, which lists current incidents for the app, the website and the servers that host accounts. If it shows an incident, wait it out; nothing you change on your phone will help. If the status page is all clear but Bluesky won't load for you, the problem is usually your app, your connection or your sign-in, and the steps below fix most cases.

## How to tell if Bluesky is down for everyone

1. **Check status.bsky.app.** Bluesky posts incidents there, such as site downtime or elevated error rates on the servers that store accounts.
2. **Try bsky.app in a browser.** If the website works and the app doesn't, it's the app.
3. **Check an outage tracker** such as Downdetector for a spike in reports.
4. **Look elsewhere.** When Bluesky has a big outage, people talk about it on X, Threads and Reddit within minutes.

Bluesky has had a handful of notable outages in 2026, including a multi-day disruption in April that it attributed to a DDoS attack, and shorter incidents of an hour or two. Most outages are partial: feeds load slowly, notifications lag or posting fails while browsing still works.

## Common symptoms and what they mean

| What you see | Likely cause | What to do |
| --- | --- | --- |
| Feeds spin or won't refresh | Outage, or a custom feed's server is down | Check status page; switch to Following |
| One custom feed is empty | That feed's creator runs it on their own server | Wait, or use another feed |
| "Post failed" when posting | Outage, or media too large | Retry later; keep images under 2 MB |
| Profile says "Account not found" | Account deactivated, deleted or taken down | Nothing to fix on your side |
| Notifications missing | Notification delay or settings | Check Settings, Notifications |
| Signed out unexpectedly | See below | Sign in again |

## Why did Bluesky sign me out?

Bluesky keeps you signed in with a session that refreshes in the background. You get signed out when that session can't refresh. Common reasons:

- **You changed your password.** That signs out other sessions and, for third-party apps, revokes app passwords.
- **An outage interrupted the session refresh.** Sign in again once the status page is clear.
- **You cleared app data, cookies or reinstalled the app.**
- **Your hosting server changed.** If you moved your account to another server (a PDS), sign in with the new one.
- **You changed your handle** and saved logins still use the old one.
- **The account was suspended or taken down.** You'll usually see a message or get an email explaining why.
- **Age verification.** In some regions Bluesky asks for age verification before you can use certain features, and you may be prompted after signing in.

If you can't sign back in, use **Forgot password** on the sign-in screen. Bluesky emails a reset code.

<!-- cta -->

## When a connected app stops working

Apps that post for you, such as schedulers and third-party clients, connect with an **app password**. They stop working when that app password is deleted, when you change your main password, or when you change your handle and the app signs in with the old one. The fix is the same each time: create a new app password in Settings, Privacy and security, App passwords, then reconnect the app.

In Schedule For You, a post that fails because Bluesky is down is retried automatically, up to three times, two minutes apart, so a short outage usually doesn't need any action from you. If the problem is the connection itself (a revoked app password or a new handle), the account is marked "Reconnect needed" and you get an alert, so you can reconnect from the Accounts screen and retry. The [Bluesky scheduler page](/bluesky) has the connection steps.

## Quick fixes when Bluesky is up but not for you

1. Force-close and reopen the app.
2. Switch between Wi-Fi and mobile data, or turn off a VPN.
3. Update the app from the App Store or Google Play.
4. Try bsky.app in a browser.
5. Sign out and back in.
6. Reinstall the app as a last resort (you'll need your password).

## Frequently asked questions

### Where is Bluesky's status page?
At status.bsky.app. It lists current and past incidents for the app, the website and Bluesky's hosting servers.

### Why does my Bluesky feed say it can't load?
If it's a custom feed, the feed's own server may be down; feeds are run by their creators, not by Bluesky. Switch to the Following feed to check that Bluesky itself is working.

### Why did my scheduled Bluesky post fail?
Usually because Bluesky was down when the post was due, or because the app password was deleted or the handle changed. Short outages are retried automatically; for connection problems, create a new app password and reconnect.

### Does Bluesky sign you out after a while?
Not normally. Sessions refresh in the background. A password change, an outage during refresh, clearing app data or an account action can sign you out.

---
title: "Discord Stuck on Starting? 10 Fixes (Most Work in 2 Minutes)"
description: Discord stuck on "Starting" or "Checking for updates"? Fixes for Windows and macOS, in order: end processes, clear the cache, check your network, then a clean reinstall.
h1: "Discord Stuck on Starting? 10 Fixes (Most Work in 2 Minutes)"
category: Discord
excerpt: Discord frozen on the Starting screen? Work through these fixes in order, from a full restart and cache clear to a clean reinstall and network checks. Most cases are fixed in the first two.
keyword: discord stuck on starting
date: 2026-10-23
updated: 2026-11-04
---
You open Discord, the logo spins, and it says "Starting" forever. Your friends are already in voice, and you're staring at a loading screen.

If Discord is stuck on "Starting," fully close every Discord process, then open it again. If that doesn't work, clear Discord's cache folders (on Windows, inside `%AppData%\discord`) and relaunch. Most cases are fixed by one of those two steps. If not, checking your VPN, proxy and firewall, or a clean reinstall, usually solves the rest.

![Discord stuck on starting: end every Discord process, clear the cache, check your network, then reinstall](/images/blog/how-to-fix-discord-stuck-on-starting-hero-1200x675.webp)

It's confusing because closing the Discord window doesn't actually quit the app, and the loading screen looks the same whether the problem is your computer, your network or Discord itself. This guide shows how to tell which it is, then walks through 10 fixes in order, from the quickest to a full reinstall.

## Why Discord Gets Stuck on Starting (Find the Cause in 1 Minute)

Before you start, open Discord in your web browser at discord.com and log in. If the browser version works, your account is fine and the problem is the desktop app on your computer. If the browser version also fails, the issue is more likely your network or a Discord outage.

![Find why Discord is stuck on starting: test in the browser first, then match the symptom to the cause](/images/blog/how-to-fix-discord-stuck-on-starting-cause-1200x675.webp)

| Symptom | Most likely cause | Try first |
| --- | --- | --- |
| Stuck on "Starting" after a crash or sleep | A leftover Discord process | End all Discord processes and relaunch |
| Loops on "Checking for updates" | Interrupted or corrupt update | Clear the cache, then reinstall if needed |
| Stuck only on one network | VPN, proxy or firewall blocking Discord | Disable the VPN or proxy, allow Discord in the firewall |
| Stuck for everyone at once | Discord service outage | Check Discord's status page and wait |
| Stuck after a Windows or macOS update | Permissions or corrupted files | Run as administrator (Windows) or reinstall |

### What Most People Don't Know

Closing the Discord window doesn't quit the app. Discord keeps running in the background, often as several processes, and one stuck background process can stop every new window from loading. That's why clicking the icon again and again does nothing.

> **Key point:** Your messages, servers and friends live on Discord's servers, not your computer. Clearing the cache or reinstalling the app doesn't delete any of them.

<!-- cta -->

## The 2-Minute Fixes: Try These First

![The first Discord fixes to try: check for an outage, end every process, then restart your computer](/images/blog/how-to-fix-discord-stuck-on-starting-quick-1200x675.webp)

### Fix 1: Check Whether Discord Is Down

If Discord's servers are having problems, the desktop app can hang on its loading screen no matter what you do. Check Discord's official status page at discordstatus.com. If there's an active incident, wait for it to be resolved before reinstalling anything.

### Fix 2: End Every Discord Process, Not Just the Window

This is the step most people get wrong: they close the window and assume Discord has quit.

**On Windows:**

1. Press **Ctrl + Shift + Esc** to open Task Manager.
2. In the **Processes** tab, find every entry named **Discord** (there are often several).
3. Select each one and click **End task**.
4. Check the system tray (near the clock) and make sure the Discord icon is gone.
5. Open Discord again.

You can also end every Discord process at once by opening Command Prompt and running `taskkill /F /IM Discord.exe`.

**On macOS:**

1. Right-click the Discord icon in the Dock and choose **Quit**.
2. If it doesn't close, press **Command + Option + Esc**, select Discord, and click **Force Quit**.
3. For leftover helper processes, open **Activity Monitor**, search for "Discord," select each result, click the stop (X) button, then choose **Force Quit**.
4. Open Discord again.

> **Pro tip:** On Windows, the `taskkill /F /IM Discord.exe` command catches processes that are easy to miss in Task Manager. Keep it handy if Discord gets stuck often.

### Fix 3: Restart Your Computer

A full restart clears stuck processes, finishes pending system updates and resets network connections. If you haven't restarted in a while, do it now before moving on.

### Fix 4: Run Discord as Administrator (Windows)

Discord installs and updates itself in your user folder. If a security tool or a permission change blocks the updater from writing files, the app can hang.

1. Make sure Discord is fully closed (Fix 2).
2. Right-click the Discord shortcut on your desktop or in the Start menu.
3. Choose **Run as administrator** (you may need to click **More** first in the Start menu).
4. Confirm the prompt.

If Discord starts this way, the problem is likely permissions or security software. You don't need to run it as administrator every time once the update has finished.

## Fix 5: Clear Discord's Cache (Safe, Keeps Your Messages)

A corrupted cache is one of the most common reasons Discord won't get past "Starting." Clearing it is safe.

![Clear Discord's cache in four steps: quit Discord, open the folder, delete three cache folders, relaunch](/images/blog/how-to-fix-discord-stuck-on-starting-cache-1200x675.webp)

| System | Folder | What to delete |
| --- | --- | --- |
| Windows | `%AppData%\discord` | The `Cache`, `Code Cache` and `GPUCache` folders |
| macOS | `~/Library/Application Support/discord` | The `Cache`, `Code Cache` and `GPUCache` folders |

### On Windows

1. Fully close Discord (Fix 2).
2. Press **Windows + R** to open the Run box.
3. Type `%AppData%\discord` and press **Enter**.
4. Delete the `Cache`, `Code Cache` and `GPUCache` folders.
5. Open Discord again.

### On macOS

1. Fully quit Discord (Fix 2).
2. In Finder, choose **Go > Go to Folder** (or press **Command + Shift + G**).
3. Type `~/Library/Application Support/discord` and press **Return**.
4. Move the `Cache`, `Code Cache` and `GPUCache` folders to the Trash.
5. Open Discord again.

Folder names can vary slightly between Discord versions. If you don't see one of these folders, delete the ones that are there. Avoid deleting the whole `discord` folder at this stage: that works, but it also signs you out and resets local settings. Save it for the clean reinstall.

## Network Fixes: VPN, Firewall, DNS and Clock (Fixes 6–9)

Discord needs to reach its servers to finish starting. If it only gets stuck on one network, start here.

### Fix 6: Turn Off Your VPN or Proxy

- **Disconnect your VPN** and relaunch Discord. If it starts, try a different VPN server or look for a split-tunneling option in your VPN's settings.
- **Check proxy settings.** On Windows, go to **Settings > Network & internet > Proxy** and turn off any manual proxy you don't need. On macOS, check **System Settings > Network**, select your connection, open **Details** and look at **Proxies**.
- **Try another network.** A phone hotspot is a quick test. If Discord starts there, your router, school or work network is likely blocking it.

### Fix 7: Allow Discord Through Your Firewall and Antivirus

1. Open your firewall or antivirus settings.
2. Check the quarantine or blocked-items list for anything related to Discord and restore it if it came from Discord's official installer.
3. Add Discord as an allowed app. In Windows Security, go to **Firewall & network protection > Allow an app through firewall** and make sure Discord is allowed.
4. Relaunch Discord.

Only allow apps you downloaded from Discord's official website. Don't turn off your antivirus permanently.

### Fix 8: Flush Your DNS Cache

- **Windows:** open Command Prompt and run `ipconfig /flushdns`.
- **macOS:** open Terminal and run `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`, then enter your Mac password when asked.

Restart Discord afterward.

### Fix 9: Check Your Date and Time

Secure connections depend on your computer's clock being correct. If your system time is far off, Discord may fail to connect. Turn on automatic date and time in your system settings and try again.

## Fix 10: Clean Reinstall Discord (The Last Resort)

A normal uninstall leaves files behind, so delete the leftover folders too.

### On Windows

1. Fully close Discord.
2. Go to **Settings > Apps > Installed apps**, find **Discord**, and choose **Uninstall**.
3. Press **Windows + R**, type `%AppData%`, and delete the `discord` folder.
4. Press **Windows + R** again, type `%LocalAppData%`, and delete the `Discord` folder. This is where the app itself and its updater live.
5. Restart your computer.
6. Download the latest installer from Discord's official website and install it.

### On macOS

1. Quit Discord.
2. Drag the Discord app from your **Applications** folder to the Trash.
3. Use **Go > Go to Folder** to open `~/Library/Application Support/` and move the `discord` folder to the Trash.
4. Empty the Trash and restart your Mac.
5. Download the latest version from Discord's official website and install it.

After reinstalling, you'll log in again and redo app settings like keybinds and notification preferences. Your servers, friends and messages will still be there.

| Fix | Time | Risk | Signs you out? |
| --- | --- | --- | --- |
| End processes | 1 minute | None | No |
| Restart computer | 3 minutes | None | No |
| Clear cache | 3 minutes | None | No |
| Network checks | 5–10 minutes | None | No |
| Clean reinstall | 10–15 minutes | Lose local settings | Yes |

## "Discord Fixer" Tools and Unofficial Downloads (Use With Caution)

When the app won't start, it's tempting to grab a "Discord repair tool", a modified client, or an installer from a download site that ranks above Discord's own.

![Safe ways to fix Discord compared with risky repair tools and unofficial downloads](/images/blog/how-to-fix-discord-stuck-on-starting-caution-1200x675.webp)

### The Real Risks

- **Malware.** Fake installers and "fixers" are a common way to spread password and token stealers.
- **Account theft.** A stolen Discord token can give someone access to your account without your password.
- **Rules.** Modified clients may break Discord's terms of service.

### A Short Safety Checklist

- Download Discord only from Discord's official website.
- Don't run tools that ask you to paste your token or a script into Discord.
- Turn on two-factor authentication in Discord's settings.
- If you ran something suspicious, change your Discord password and contact Discord support.

> **Bottom line:** Every fix you need is in this guide and uses your own system tools. Nothing you download should promise to fix Discord for you.

### Still Stuck?

Use Discord in your browser while you troubleshoot so you don't miss anything. If the desktop app still won't start after a clean reinstall, contact Discord through the [Discord Help Center](https://support.discord.com) and describe what you've already tried.

## When Discord Breaks on Launch Day: Keep Your Other Channels Running

A frozen Discord app is annoying on a normal day. On the day you've planned an announcement, it costs you.

Take Kai, who runs a community for an indie game and announces each update on X, Bluesky and YouTube as well as in the Discord server. On one update day, Discord sat on "Starting" for forty minutes while Kai worked through Fixes 2 to 5. The social posts didn't wait, because Kai had scheduled them the night before.

Schedule For You doesn't publish to Discord; Discord announcements still go out from Discord itself. What it does is publish to X, Bluesky, Threads, Instagram, TikTok, YouTube, Facebook Pages, LinkedIn (personal profiles), Pinterest and Google Business Profile, so the rest of an announcement goes out on time even when one app on your computer won't open.

![Writing one update for X, Bluesky and other platforms in the Schedule For You composer](/images/blog/composer-four-platforms-1440x900.webp)

| | Posting live from each app | Discord's own tools | Schedule For You |
| --- | --- | --- | --- |
| Discord announcements | Yes | Yes | No, we don't post to Discord |
| X, Bluesky, Threads, YouTube and more | One app at a time | No | Yes, one draft with a caption each |
| Goes out if your computer is having a bad day | No | Depends | Yes, once it's scheduled |
| Cost | Free | Free | Free for 3 accounts and up to 10 scheduled posts; paid plans from $19 a month |

Where we're not the best fit: if Discord is your only channel, we can't help you post there. Use Discord's own features for server announcements.

## What to Do Next

1. **Test in the browser** to see if it's the app, your network or Discord.
2. **End every Discord process** and relaunch.
3. **Clear the three cache folders.**
4. **Check your VPN, firewall, DNS and clock.**
5. **Clean reinstall** if nothing else worked.

Once you're back in, tidy up your profile: our guide to writing a [Discord bio](/blog/discord-bio) has examples that fit the 190-character limit.

## Frequently Asked Questions

### Why does Discord keep getting stuck on "Checking for updates"?

Usually the update was interrupted, or a downloaded file was corrupted or blocked by security software. Close Discord fully, clear the cache folders, and relaunch. If it still loops, do a clean reinstall that removes both `%AppData%\discord` and `%LocalAppData%\Discord` on Windows.

### Will clearing the Discord cache delete my messages?

No. Your messages, servers and friends are stored on Discord's servers. Clearing the `Cache`, `Code Cache` and `GPUCache` folders only removes temporary files, which Discord rebuilds the next time it starts.

### Is it safe to delete the %LocalAppData%\Discord folder?

Yes, after you've uninstalled Discord and closed all its processes. That folder holds the installed app and its updater, so deleting it is part of a clean reinstall.

### Does Discord work in a web browser if the app won't start?

Yes. Go to discord.com, log in, and open Discord in your browser. Most features work there, so it's a good way to stay connected while you fix the desktop app.

### Can a VPN stop Discord from starting?

It can. Some VPN servers, proxies and network filters block or slow the connections Discord needs on startup. Disconnect the VPN and try again, or test on a phone hotspot.

### Why is Discord stuck on starting after a Windows update?

A system update can change permissions or leave files half-updated. Try running Discord as administrator once, then clear the cache, then reinstall.

### How do I know if Discord is down for everyone?

Check discordstatus.com. If there's an active incident, wait rather than reinstalling.

### Will reinstalling Discord sign me out?

Yes. A clean reinstall removes local settings, so you'll log in again and redo keybinds and notification preferences.

## The Bottom Line

![End every Discord process and clear the cache first, then check your network, and reinstall only as a last resort](/images/blog/how-to-fix-discord-stuck-on-starting-bottom-line-1200x675.webp)

- **End every process:** fixes most "Starting" hangs.
- **Clear the cache:** fixes most of the rest, and keeps your messages.
- **Network checks:** for problems on one network only.
- **Clean reinstall:** the last resort.
- **"Fixer" downloads:** never.

Next up: [how to write a Discord bio](/blog/discord-bio). For more free tools, try the [Discord photo resizer](/tools/discord-photo-resizer), the [Discord bio generator](/tools/discord-bio-generator) and the [Discord font generator](/tools/discord-font-generator).

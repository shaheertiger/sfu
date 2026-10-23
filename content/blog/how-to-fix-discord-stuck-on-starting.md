---
title: Discord Stuck on Starting? 10 Fixes for Windows and Mac
description: Discord stuck on "Starting" or "Checking for updates"? Fixes for Windows and macOS: end processes, clear the cache, reinstall and check your network.
h1: How to Fix Discord Stuck on Starting
category: Discord
excerpt: Discord frozen on the Starting screen? Work through these fixes in order, from a full restart and cache clear to a clean reinstall and network checks.
keyword: discord stuck on starting
date: 2026-10-23
---
If Discord is stuck on "Starting," fully close every Discord process, then open it again. If that doesn't work, clear Discord's cache folders (on Windows, inside `%AppData%\discord`) and relaunch. Most cases are fixed by one of those two steps. If not, a clean reinstall, or checking your VPN, proxy and firewall, usually solves the rest.

Work through the fixes below in order. They start with the quickest and least disruptive and end with a full reinstall.

## Quick fixes at a glance

| Symptom | Most likely cause | Try first |
| --- | --- | --- |
| Stuck on "Starting" after a crash or sleep | A leftover Discord process | End all Discord processes and relaunch |
| Loops on "Checking for updates" | Interrupted or corrupt update | Clear the cache, then reinstall if needed |
| Stuck only on one network | VPN, proxy or firewall blocking Discord | Disable the VPN or proxy, allow Discord in the firewall |
| Stuck for everyone at once | Discord service outage | Check Discord's status page and wait |
| Stuck after a Windows or macOS update | Permissions or corrupted files | Run as administrator (Windows) or reinstall |

Before you start, open Discord in your web browser at discord.com and log in. If the browser version works, your account is fine and the problem is with the desktop app on your computer. If the browser version also fails, the issue is more likely your network or a Discord outage.

## Fix 1: Check whether Discord is down

If Discord's servers are having problems, the desktop app can hang on its loading screen no matter what you do on your computer. Check Discord's official status page at discordstatus.com. If there's an active incident, wait for it to be resolved before reinstalling anything.

## Fix 2: Fully close Discord and restart it

Closing the Discord window doesn't always quit the app. It often keeps running in the background, and a stuck background process can stop a new window from loading.

### On Windows

1. Press **Ctrl + Shift + Esc** to open Task Manager.
2. In the **Processes** tab, find every entry named **Discord** (there are often several).
3. Select each one and click **End task**.
4. Check the system tray (the area near the clock) and make sure the Discord icon is gone.
5. Open Discord again.

You can also end every Discord process at once by opening Command Prompt and running `taskkill /F /IM Discord.exe`.

### On macOS

1. Right-click the Discord icon in the Dock and choose **Quit**.
2. If it doesn't close, press **Command + Option + Esc**, select Discord, and click **Force Quit**.
3. For any leftover helper processes, open **Activity Monitor**, search for "Discord," select each result and click the stop (X) button, then choose **Force Quit**.
4. Open Discord again.

## Fix 3: Restart your computer

It sounds obvious, but a full restart clears stuck processes, finishes pending system updates and resets network connections. If you haven't restarted in a while, do it now before moving to the more involved fixes.

## Fix 4: Run Discord as administrator (Windows)

Discord installs and updates itself in your user folder. If a security tool or a permission change blocks the updater from writing files, the app can hang on its startup screen.

1. Make sure Discord is fully closed (see Fix 2).
2. Right-click the Discord shortcut on your desktop or in the Start menu.
3. Choose **Run as administrator** (you may need to click **More** first in the Start menu).
4. Confirm the prompt.

If Discord starts this way, the problem is likely permissions or security software. You don't need to run it as administrator every time once the update has finished.

<!-- cta -->

## Fix 5: Clear Discord's cache

A corrupted cache is one of the most common reasons Discord won't get past "Starting." Clearing the cache folders is safe. It doesn't delete your messages or servers, which are stored on Discord's servers, not on your computer.

### Cache locations

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

Folder names can vary slightly between Discord versions. If you don't see one of these folders, delete the ones that are there and skip the rest. Avoid deleting the whole `discord` folder at this stage. That works, but it also signs you out and resets local settings. Save it for the clean reinstall below.

## Fix 6: Turn off your VPN or proxy

Discord needs to reach its servers to finish starting. A VPN, proxy or network filter can block or slow that connection enough to leave the app hanging.

- **Disconnect your VPN** and relaunch Discord. If it starts, try a different VPN server or check your VPN's settings for a split-tunneling option.
- **Check proxy settings.** On Windows, go to **Settings > Network & internet > Proxy** and turn off any manual proxy you don't need. On macOS, check **System Settings > Network**, select your connection, open **Details** and look at **Proxies**.
- **Try another network.** A phone hotspot is a quick test. If Discord starts on a different network, your router, school or work network is likely blocking it.

## Fix 7: Allow Discord through your firewall and antivirus

Security software sometimes quarantines files that Discord's updater downloads, or blocks the app from going online.

1. Open your firewall or antivirus settings.
2. Check its quarantine or blocked-items list for anything related to Discord and restore it if it's from Discord's official installer.
3. Add Discord as an allowed app. In Windows Security, go to **Firewall & network protection > Allow an app through firewall** and make sure Discord is allowed.
4. Relaunch Discord.

Only allow apps you downloaded from Discord's official website. Don't turn off your antivirus permanently.

## Fix 8: Flush your DNS cache

If Discord connects slowly or not at all, stale network information may be the cause.

- **Windows:** open Command Prompt and run `ipconfig /flushdns`.
- **macOS:** open Terminal and run `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`, then enter your Mac password when asked.

Restart Discord afterward.

## Fix 9: Check your date and time

Secure connections depend on your computer's clock being correct. If your system time is far off, Discord may fail to connect. Turn on automatic date and time in your system settings and try again.

## Fix 10: Do a clean reinstall

If nothing else worked, remove Discord completely and install a fresh copy. A normal uninstall leaves files behind, so delete the leftover folders too.

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

After reinstalling, you'll need to log in again and redo app settings like keybinds and notification preferences. Your servers, friends and messages will all still be there.

### Still stuck?

Use Discord in your browser while you troubleshoot so you don't miss anything. If the desktop app still won't start after a clean reinstall, contact Discord through the [Discord Help Center](https://support.discord.com) and describe what you've already tried. That saves time when support replies.

Once you're back in, it's a good moment to tidy up your profile. Our guide to writing a [Discord bio](/blog/discord-bio) has examples that fit the 190-character limit, and the [Discord photo resizer](/tools/discord-photo-resizer) prepares avatars and banners at the right sizes.

## Frequently asked questions

### Why does Discord keep getting stuck on "Checking for updates"?

Usually the update was interrupted or a downloaded file was corrupted or blocked by security software. Close Discord fully, clear the cache folders, and relaunch. If it still loops, do a clean reinstall that removes both `%AppData%\discord` and `%LocalAppData%\Discord` on Windows.

### Will clearing the Discord cache delete my messages?

No. Your messages, servers and friends are stored on Discord's servers. Clearing the `Cache`, `Code Cache` and `GPUCache` folders only removes temporary files on your computer, which Discord rebuilds the next time it starts.

### Is it safe to delete the %LocalAppData%\Discord folder?

Yes, after you've uninstalled Discord and closed all its processes. That folder holds the installed app and its updater, so deleting it is part of a clean reinstall. You'll then need to download and install Discord again.

### Does Discord work in a web browser if the app won't start?

Yes. Go to discord.com, log in, and open Discord in your browser. Most features work there, so it's a good way to stay connected while you fix the desktop app.

### Can a VPN stop Discord from starting?

It can. Some VPN servers, proxies and network filters block or slow the connections Discord needs on startup. Disconnect the VPN and try again, or test on a different network, such as a phone hotspot.

---
name: use-chrome
description: Attach once to the user's already-running main Google Chrome and reuse that single remote-debugging connection, in background tabs, for the whole task. Use when the user asks to use their Chrome, main browser, logged-in browser, real browser, or existing session, or when another skill needs a browser. Never substitute a new browser, profile, Chromium, or debug-port Chrome; automated test suites keep their own browsers.
---

# Use Chrome

The target is always the Google Chrome the user is using right now: the stable
channel running from its default user data directory. Recognize the request by
meaning, including "use my chrome", "my main browser", "my logged-in Chrome",
"my real browser", and "the same session". Other skills that need a browser use
this skill for every browser step.

## Find the main instance before connecting

1. Use the default Google Chrome user data directory:
   - Linux: `~/.config/google-chrome`
   - macOS: `~/Library/Application Support/Google/Chrome`
   - Windows: `%LOCALAPPDATA%\Google\Chrome\User Data`
2. Confirm that Google Chrome is running from that directory. Find the browser
   process (`pgrep -x chrome` on Linux, `pgrep -x "Google Chrome"` on macOS),
   skip helper processes whose arguments include `--type=`, and check that the
   browser process has no `--user-data-dir` or one equal to the default
   directory. On Linux, read its arguments from `/proc/<pid>/cmdline`, because
   `pgrep -af` also matches the calling shell, and confirm that
   `readlink /proc/<pid>/exe` is the stable binary (`/opt/google/chrome/chrome`),
   since Chrome Beta, Dev, and snap Chromium use the same process name. On
   macOS, read the arguments with `ps -o command= -p <pid>` and confirm the
   path is inside `Google Chrome.app`. On Windows, use PowerShell
   `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'"`, skip entries
   whose `CommandLine` includes `--type=`, and confirm `ExecutablePath` ends in
   `Google\Chrome\Application\chrome.exe`. A Chromium process, another
   channel, or a Chrome with another `--user-data-dir` does not count. If Chrome
   is not running, ask the user to open it and wait. Do not start it yourself.
3. Check only that `DevToolsActivePort` exists in that directory. Chrome writes it
   while remote debugging is on. If it is missing, ask the user to open
   `chrome://inspect/#remote-debugging` in that Chrome and turn remote debugging
   on (Chrome 144 or newer), then wait.
4. Never restart or relaunch Chrome with `--remote-debugging-port` to get a
   connection. Chrome honors that switch only with a non-default
   `--user-data-dir` ([Chrome blog](https://developer.chrome.com/blog/remote-debugging-port)),
   so it always creates a different browser without the user's sessions.

## Connect once

1. Use one long-lived client attached to that instance:
   - Preferred: a `chrome-devtools-mcp` server started with `--autoConnect` on
     the default stable channel. It reads `DevToolsActivePort` from the default
     profile and connects to the running Chrome only.
   - Otherwise: one background helper process that connects to the
     `ws://127.0.0.1:<port><path>` endpoint from `DevToolsActivePort` and stays
     alive for the whole task. Send every later step to that process.
2. When the browser tool's configuration is visible, check it before first use.
   `--browser-url`, `--ws-endpoint` to a fixed port, `--user-data-dir`,
   `--isolated`, a `--channel` other than stable, or a missing `--autoConnect`
   means it targets or launches a different Chrome. Do not use that tool; tell
   the user. An embedded preview or harness-owned browser is not the main Chrome.
3. Chrome asks the user to allow each new remote-debugging connection and does
   not remember the approval. Tell the user once to click **Allow**, then keep
   that connection for every later step and follow-up.
4. Do not connect per step or per command. A fresh script or CLI invocation opens
   its own DevTools socket and triggers the prompt again.
5. Do not hand Chrome work to subagents or parallel workers; the coordinating
   agent runs main-Chrome steps itself, one at a time. Each new agent
   session costs another prompt.

## If the connection drops

If the connection drops, tell the user, reconnect once, and continue. If the
user declines the prompt or the reconnect fails, stop the browser work and say
so. Do not reconnect in a loop or fall back to another browser.

## Work only in your own tabs

- Open new tabs over the held connection for the task, in the background so they
  do not take focus from the user: for example, Chrome DevTools Protocol
  `Target.createTarget` with `background: true`, or the browser tool's background
  option when it has one.
- Do not read, navigate, reload, close, or capture the user's existing tabs.
- Close the tabs you opened when the task ends, unless the user or the calling
  skill wants them left open.
- Do not read, copy, or report credentials, cookies, tokens, or page contents the
  task does not require.

## A second browser for cross-testing

Open a separate Chrome instance with its own temporary `--user-data-dir` only
when all of these hold:

- the main Chrome is already connected through this skill;
- the scenario needs a separate session at the same time, such as testing two
  users, roles, or devices against each other;
- you tell the user why it is needed before opening it.

Never point it at the default user data directory or one of its profiles. Close
it and remove its temporary directory when the scenario ends. The main Chrome connection stays the primary browser.

## Opening a URL without a debugger

Running `google-chrome-stable <url>` on Linux, `open -a "Google Chrome" <url>`
on macOS, or `Start-Process chrome <url>` in PowerShell on Windows while the
main Chrome is running hands the URL to that instance as a new
tab. It opens no DevTools connection and shows no prompt. Use it only after step 2
of **Find the main instance before connecting** confirms the main Chrome is
running; otherwise the launcher would start Chrome. The tab opens in the
foreground and the agent cannot close it, so use this only to show the user a
page they will handle themselves. If this task already holds a connection, open
the tab on that connection instead.

## Other browsers

Playwright, end-to-end suites, and other automated test runners keep their own
headless browsers and do not use this skill.

# Chrome-compatible browser extension

Use for extension work targeting Chrome or another explicitly requested browser.
Inspect the manifest, target browser versions, existing tooling, and permissions
before deciding which execution context owns the feature.

## Stack decisions

Determine whether the feature operates on the current tab, selected sites, or
extension-owned data. That choice determines permissions and which context can
perform each operation. Preserve the existing build system and UI framework.
For new work, select tooling that produces the required entry points and manifest
for the target browser; verify distribution requirements before release packaging.

## Where the work belongs

| Need | Extension entry point or facility |
| --- | --- |
| Short user interaction | Popup |
| Persistent preferences UI | Options page |
| Event-driven background work | Background worker |
| Interaction with a permitted web page | Content script |
| Saved settings or durable state | Extension storage |
| Cross-context request | A validated message contract |
| Browser registration | Source or generated manifest and icon assets |

## Build path

1. Create or extend only the required entry points, following the build tool's
   discovery or explicit entry configuration. Keep popup and page code separate.
2. Map each requested capability to the narrowest permission. Add `storage`,
   `activeTab`, `scripting`, or host access only when the implementation needs it.
3. Define messages and validate inputs and senders at privileged receiving
   boundaries. Treat page-derived content as untrusted.
4. Persist state that must survive worker shutdown. Handle missing permissions,
   unavailable tabs, reloads, and offline operation where relevant.
5. Build the extension, inspect the generated manifest and included assets, and
   load that output unpacked in the intended browser. Prepare store packaging
   only when requested; an ordinary web dev server does not run extension APIs.

## Verify

Exercise popup/options, background events, and content-script behavior where used.
Test permission denial, worker restart, and navigation to permitted/unpermitted
pages. Verify only the permissions and entry points needed by the shipped feature
are present in the built manifest.
For page-to-extension messages, try an unexpected sender and malformed payload.
For stored settings, close the popup and restart the worker before reading them again.

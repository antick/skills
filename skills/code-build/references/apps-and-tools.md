# Apps and tools guidance

Read the matching platform section. Confirm current platform APIs and packaging
requirements in official documentation when needed; follow the existing build
tools and supported versions rather than importing a fixed template.

## Electron desktop

Trace the main process, preload bridge, renderer, and packaging configuration.
Keep OS and filesystem privileges in the main process. Expose narrow operations
through the preload bridge with context isolation; validate IPC inputs and
senders before privileged work. Keep Node integration disabled in renderers that
display web content, and avoid exposing raw IPC or filesystem APIs to them.
Check these boundaries against the [Electron security guidance](https://www.electronjs.org/docs/latest/tutorial/security).

Reuse the existing UI and packaging stack. Add tray behavior, custom window
chrome, updates, or native integrations only when required. Check launch, window
lifecycle, and the changed IPC path. Build and exercise the packaged application
when available: development mode does not establish packaged asset paths,
permissions, persistence, or platform behavior.

## Browser extensions

Inspect the target browsers, manifest version, build tooling, permissions, and
existing popup, options, background, and content-script entry points. Create
only the entry points the feature requires. Request the narrowest permissions
and host access needed for the stated behavior.

Treat page content and messages as untrusted input. Validate messages at the
receiving boundary before privileged operations. Persist required state through
the extension's storage facilities; do not assume a background worker runs
continuously. Test the built extension in its intended browser, including reload,
permission failures, and worker restart when relevant. A web preview of the
popup does not test extension APIs or page integration.
For Chrome, consult the [extension worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
when implementing background persistence and restart behavior.

## Expo and React Native

Determine whether the project uses Expo or a bare React Native setup. Follow its
navigation, state, styling, storage, and native-module conventions. Check native
module and framework compatibility before adding dependencies; a managed preview
may not support every native capability the app needs.

Use appropriate secure platform storage for credentials and request permissions
only for required device capabilities. Exercise navigation, loading/error states,
and changed device behavior on the requested platforms. Distinguish JavaScript
checks from simulator, device, and native-build verification.

## CLI tools and scripts

Use the existing language and argument parser; consider built-in parsing for new
small tools before adding dependencies. Keep normal results on stdout and errors
on stderr, return meaningful exit codes, and support unattended use when needed.
Avoid interactive prompts when input is not a terminal. Validate inputs and
protect existing user files when writing output.

Verify help, one successful invocation, and a meaningful failure from a temporary
directory. Test executable permissions and the installed or packaged entry point
when distributing a command; running the source file alone can miss packaging
errors. Publish only when the user requested it.

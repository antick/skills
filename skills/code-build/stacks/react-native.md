# Expo and React Native application

Use for React Native mobile work, with Expo when selected or already present.
Identify whether this is a managed Expo app, a development build, or a bare native
project before choosing modules or verification steps.

## Stack decisions

| Behavior | Decision |
| --- | --- |
| Screen-local interaction | Keep state with the screen or reusable component |
| Shared navigation/session state | Use the existing navigation and state owners |
| Remote data | Reuse the current fetching/cache layer and define refresh behavior |
| Offline writes | Decide whether to reject, queue, or retry; prevent duplicate side effects |
| Credentials | Use platform-secure storage supported by the selected runtime |
| Native device capability | Establish whether it needs a preview, development build, or native project change |

## Where the work belongs

For Expo Router, follow the existing route root and layouts for stacks, tabs,
modals, and deep links. Otherwise use the installed navigation library's screen
structure. Keep reusable controls in the current components directory, API and
storage boundaries in their owning modules, and device configuration in the
project's app configuration and native projects where applicable.

## Build path

1. For new projects, use the selected framework's official scaffold with verified
   versions. Check the supported runtime and native dependency combinations.
2. Create the requested screens and navigation. Preserve safe-area, keyboard,
   accessibility, and platform behavior through the existing components.
3. Connect remote data and forms with loading, offline, retry, and error behavior
   appropriate to the feature. Keep shared state only where screens need it.
4. Integrate required device features and permissions. Check whether they require
   a development/native build rather than the currently available preview client.
5. Configure persistence and credential storage, then document required app IDs,
   service configuration, and target-platform setup without embedding secrets.

## Verify

Run available tests and type checks. Exercise navigation, forms, permissions, and
changed device behavior on each requested platform when available. Verify a native
build for added native modules; state clearly when only a preview or simulator ran.
For deep links or restored sessions, open the target screen from a cold launch.
For device operations, test returning from the background and denied permissions.

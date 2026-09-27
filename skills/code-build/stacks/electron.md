# Electron desktop application

Use for Electron applications. Identify the main process, renderer, preload,
development runner, and packager before touching a feature.

## Stack decisions

Assign each operation to the process with the required authority. UI interaction
belongs in the renderer; native operations need a narrow, validated privileged
boundary. Establish which windows and origins may call it, and how its resources
are released. Keep the existing renderer framework, packager, and update system.

## Where the work belongs

| Responsibility | Owning part |
| --- | --- |
| Startup, windows, menus, native resources | Main process |
| Narrow privileged interface | Preload bridge |
| Input and sender validation | Main-process IPC handlers |
| Views and interaction | Renderer components |
| Icons, bundled files, installers | Packager configuration and resources |
| Durable settings | Existing application storage boundary |

## Build path

1. For a new project, select a compatible official scaffold or configure the
   chosen tools with separate main, preload, and renderer entry points.
2. Implement the UI in the renderer and route required native operations through
   narrow bridge methods. Apply the [shared Electron guidance](../references/apps-and-tools.md) to IPC,
   context isolation, navigation, and remote content.
3. Handle relevant window lifecycle, close/reopen behavior, and application exit.
   Add tray or custom title-bar behavior only when requested, with native controls
   and keyboard behavior preserved.
4. Resolve resource and data paths in both development and packaged execution.
   Keep user data outside the application bundle.
5. Configure the requested installer targets, such as macOS DMG/ZIP, Windows
   installers, or Linux packages. Signing, notarization, update feeds, and release
   publication depend on the authorized distribution scope and available setup.

## Verify

Run tests and builds, then exercise the affected process boundary. Launch a
packaged build when possible and check assets, persistence, window behavior, and
the changed native feature. State which operating-system targets were actually run.
Attempt an invalid privileged request and confirm it is rejected. For listeners,
windows, or native handles, repeat open/close cycles and check resources are released.

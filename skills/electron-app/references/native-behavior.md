# Native behavior

For macOS targets, apply these native desktop behaviors. Use the implementation
notes and current API references below to verify them.

| Area | Required outcome |
| --- | --- |
| First render | Reveal a ready window without a blank flash. |
| Window restoration | Restore size and location. |
| Dragging | Drag titlebar space; exclude interactive elements. |
| Typography | Use system fonts and desktop density, around 13–14px. |
| Cursor and selection | Arrow for controls; hand for external links; prevent chrome highlighting. |
| Appearance | Follow theme changes; match window and page backgrounds. |
| Inactive windows | Give selected controls an inactive appearance. |
| Menus | Provide the standard macOS application menu. |
| Shortcuts | Expose discoverable menu accelerators. |
| Undo/redo | Reverse meaningful user edits and actions. |
| Preferences | Use a dedicated settings window and Command-comma. |
| Offline | Load local state, queue supported mutations in order, and show unavailable-content fallbacks. |

## Implementation and acceptance notes

- **Window lifecycle:** use `show: false` with `ready-to-show` when appropriate;
  check load failure so a hidden failed window does not leave the app invisible.
  Keep native traffic lights, fullscreen, minimize, keyboard access, and titlebar
  double-click behavior. Prefer standard chrome unless the product needs custom
  chrome. On macOS, closing the last window normally leaves the app running;
  Dock activation reopens a window, while explicit Quit exits. Respect unsaved
  data and distinguish close from quit. Test all three paths.
- **Bounds:** persist normal bounds separately from maximized/fullscreen state.
  Validate restored bounds against current displays and minimum sizes so a removed
  monitor cannot strand the window. Test relaunch after moving or disconnecting
  a display; avoid making a state-management dependency mandatory.
- **Appearance and focus:** use `nativeTheme` and `BrowserWindow` focus/blur
  through the preload boundary. Apply a saved system/light/dark preference
  consistently to native and renderer surfaces. Send initial state as well as
  updates, clean up subscriptions, and verify two windows independently.
  Inactive styling must retain contrast and visible keyboard focus.
- **Commands:** prefer Electron menu roles for standard Edit, Window, and app
  operations. Route custom commands to the intended focused window, with enabled
  states reflecting context. Keep text-field undo local to its editor; route
  domain undo to application history, including persistence effects. Verify
  redo after undo and clearing redo after a new edit. Use local accelerators for
  ordinary app commands; reserve global shortcuts for explicitly needed behavior.
- **Settings:** retain one settings window, focus it on repeated requests, persist
  preferences, and release it on close. Use the platform-appropriate Settings or
  Preferences label. Opening it from the app menu must work with no main window.
- **Offline reliability:** start without waiting on network requests. Persist
  queued writes across restarts; add retry/backoff, idempotency, conflict handling,
  and visible failed-sync state for supported operations. Connectivity events are
  hints, not proof a service is reachable. For inherently online features, show an
  actionable offline state and explain the exception instead of faking success.
- **Accessibility:** use semantic controls, visible focus, keyboard navigation,
  accessible names, sufficient contrast, and reduced-motion behavior. Test zoom,
  long labels, and VoiceOver on macOS when available. Desktop density must not
  make text unreadable or click targets unusable.

## Current API references

- [BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window)
- [App lifecycle](https://www.electronjs.org/docs/latest/api/app)
- [Native theme](https://www.electronjs.org/docs/latest/api/native-theme)
- [Menu roles](https://www.electronjs.org/docs/latest/api/menu-item)
- [Keyboard shortcuts](https://www.electronjs.org/docs/latest/tutorial/keyboard-shortcuts)
- [Custom window interactions](https://www.electronjs.org/docs/latest/tutorial/custom-window-interactions)

Check the installed version's APIs. Expose native capabilities through an isolated
preload bridge. Apply the editing and copying exceptions in
[selection and input](selection-and-input.md).

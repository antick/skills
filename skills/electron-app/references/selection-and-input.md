# Selection and input

App labels, navigation rows, toolbar text, settings headings, and decorative icons
must not accumulate browser text highlights after a drag or repeated click. Keep
selection available in text fields, editors, documents, logs, error details, and
values users reasonably need to copy. Classify each surface deliberately.

## CSS pattern

Prefer an app-shell baseline with explicit content opt-ins. Adapt names to the
project's components; apply the same policy to portaled menus and dialogs.

```css
.app-shell {
  -webkit-user-select: none;
  user-select: none;
  cursor: default;
}

/* Explicit child rules also handle Chromium's selection inheritance quirks. */
.app-shell :is(input, textarea, [contenteditable]:not([contenteditable="false"]),
               .selectable, .selectable *) {
  -webkit-user-select: text;
  user-select: text;
}

.app-shell :is(input, textarea, [contenteditable]:not([contenteditable="false"])) {
  cursor: text;
}

.app-shell :is(button, [role="button"], .nav-item) { cursor: default; }
.app-shell a[data-external] { cursor: pointer; }

.titlebar {
  -webkit-app-region: drag;
  app-region: drag;
  -webkit-user-select: none;
  user-select: none;
}

.titlebar :is(button, a, input, textarea, [contenteditable], [role="button"],
             .no-drag) {
  -webkit-app-region: no-drag;
  app-region: no-drag;
}
```

Use the text cursor for text-entry inputs; apply the arrow to non-text inputs
such as checkboxes, radios, ranges, and color pickers with the project's existing
control styles. Rich editors may require selection rules on their actual editing
root. Keep selectable content outside drag regions or explicitly mark it no-drag.

Do not suppress selection by cancelling all `mousedown`, `selectstart`, or
keyboard events; that breaks focus, editing, drag/drop, and accessibility. Do not
hide highlights with transparent `::selection`; the unwanted selection still
exists. Preserve focus outlines and native input behaviors. Disable image or
anchor dragging only on chrome elements where the ghost drag is unwanted;
preserve document drag/drop and intentional file/link dragging.

## Acceptance matrix

| Action | Expected result |
| --- | --- |
| Drag across sidebar and settings labels; double/triple-click headings | No text highlight; clicks and navigation work |
| Press Cmd/Ctrl+A outside an editor | Chrome labels remain unhighlighted; intentional document selection follows product behavior |
| Select and copy input, textarea, and rich-editor text | Mouse selection, Shift-arrow, Select All, cut/copy/paste, undo/redo work |
| Select copyable output, logs, errors, or document text | Intended range highlights and copies accurately |
| Drag empty titlebar; then click a titlebar button or input | Window moves only from drag region; controls receive events |
| Open a portaled dialog or menu and repeat | Same chrome/content policy; focus and Escape work |
| Navigate by keyboard and assistive technology | Controls retain names, focus indicators, and activation |

Run these in Electron. CSS inspection alone does not prove pointer routing,
editor behavior, or OS menu command dispatch. When automating, use real pointer
and keyboard input, then inspect selected text and clipboard where supported.

[Electron's window-interaction guide](https://www.electronjs.org/docs/latest/tutorial/custom-window-interactions)
explains that drag regions consume pointer events and need no-drag exceptions.

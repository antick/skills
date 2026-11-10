# React Effect Cleanup Review

Apply this when the change touches React web or React Native code: components,
custom hooks, or code that starts work outliving a render. Missing cleanup
leaks memory and keeps work running after unmount. Unmount happens on route
changes, conditional rendering, and a changed `key`.

## Check every effect that starts something

Report a finding when an effect or hook starts one of these resources and no
cleanup releases it on unmount or dependency change:

| Started | Expected release |
| --- | --- |
| `addEventListener` on `window`, `document`, or an element | `removeEventListener` with the same handler and options |
| `setInterval` / `setTimeout` | `clearInterval` / `clearTimeout` with the stored ID |
| `requestAnimationFrame` | `cancelAnimationFrame` |
| Subscriptions such as Firebase `onSnapshot`, stores, or emitters | Call the returned unsubscribe function |
| React Native `AppState`, `Keyboard`, `Dimensions`, or `Linking` listeners | Call `.remove()` on the returned subscription |
| `WebSocket`, `EventSource`, `BroadcastChannel` | `close()` |
| `ResizeObserver`, `IntersectionObserver`, `MutationObserver` | `disconnect()` |
| `fetch` or another cancellable request | `AbortController.abort()`, with `AbortError` ignored in the catch |
| Chart, map, editor, or player instance | The library's `destroy()`, `dispose()`, or `remove()` |
| `URL.createObjectURL` | `URL.revokeObjectURL` |

Also report:

- Cleanup that cannot work, such as `removeEventListener` with a new inline
  function instead of the registered handler.
- A request without cancellation whose late response can overwrite newer state
  after dependencies change.
- An abort that surfaces as a user-visible error because the catch does not
  ignore `AbortError`.
- An `isMounted` ref or `ignore` flag that only suppresses `setState` while the
  timer, subscription, or listener keeps running. An `ignore` flag is
  acceptable only for a request that cannot be cancelled.

## Severity and evidence

Name the effect, the resource, and the unmount or re-render trigger. Use
`MEDIUM` for a leak or stale-state overwrite on a reachable path. Use `HIGH`
when it repeats on every navigation or render cycle and causes duplicate side
effects, such as repeated requests, writes, or notifications. A resource owned
by a library hook that already cleans up, such as TanStack Query with its
`signal` forwarded, is not a finding.

Recommend the smallest fix: return a cleanup from the same effect that releases
the same reference. Suggest a mount-and-unmount test where the project's test
tools support one.

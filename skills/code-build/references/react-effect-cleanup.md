# React Effect Cleanup

Apply this to React web or React Native code that adds or changes an effect, a
custom hook, or any code that starts work which outlives a render. A component
leaks memory when it starts a listener, timer, subscription, request, or
external instance and does not release it on unmount. Unmount happens on route
changes, conditional rendering, and a changed `key`.

## Rule

Every effect that starts something returns a cleanup function that stops it.
Release resources in the same effect that created them, and use the same
reference that registered them.

| Started in the effect | Release in the cleanup |
| --- | --- |
| `addEventListener` on `window`, `document`, or an element | `removeEventListener` with the same handler and options |
| `setInterval` / `setTimeout` | `clearInterval` / `clearTimeout` with the stored ID |
| `requestAnimationFrame` | `cancelAnimationFrame` with the stored ID |
| Subscriptions such as Firebase `onSnapshot`, stores, or emitters | Call the returned unsubscribe function |
| `WebSocket`, `EventSource`, `BroadcastChannel` | `close()` |
| `ResizeObserver`, `IntersectionObserver`, `MutationObserver` | `disconnect()` |
| `fetch` or another cancellable request | `AbortController.abort()` |
| Chart, map, editor, or player instance | The library's `destroy()`, `dispose()`, or `remove()` |
| `URL.createObjectURL` | `URL.revokeObjectURL` |

## Requests

Create an `AbortController` inside the effect, pass `controller.signal` to the
request, and call `controller.abort()` in the cleanup. Treat an abort as
expected, not as a failure:

```js
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then((response) => response.json())
    .then(setData)
    .catch((error) => {
      if (error.name === "AbortError") return;
      setError(error);
    });
  return () => controller.abort();
}, [url]);
```

Aborting also prevents an older, slower response from overwriting newer state
when dependencies change. When the project uses a data library, prefer its
cancellation support, such as forwarding the `signal` that TanStack Query passes
to `queryFn`, over a hand-written effect.

## Working rules

- Define the handler inside the effect, or keep a stable reference, so cleanup
  removes the exact function that was added. An inline arrow passed to
  `removeEventListener` removes nothing.
- Store timer, frame, and subscription handles in effect-local variables, or in
  a ref when another handler must clear them.
- Prefer the existing hook or library that already owns the resource over a new
  effect.
- React 18 and later no longer warn about state updates after unmount. A
  missing warning does not prove a leak is absent.

## Verify

Keep React `StrictMode` enabled in development. It mounts, unmounts, and mounts
again, so missing cleanup appears as duplicated listeners, timers, or requests.
Mount and unmount the changed component several times. Confirm in browser
DevTools that event listener counts and pending network requests return to
baseline. Where the project's test tools support it, add a test that unmounts
the component and asserts the resource was released.

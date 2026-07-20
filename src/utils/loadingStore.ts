/**
 * Tracks how many API requests are currently in flight, so a single global
 * loading overlay can cover the whole screen for any request - not just
 * specific pages. Lives outside React (a plain module) since bankApi.ts's
 * request() function isn't a component and can't call hooks directly;
 * components read this via useIsLoading (useSyncExternalStore), which is
 * the correct, built-in React way to subscribe to state that lives outside
 * React itself - not a hidden side-channel.
 */

type Listener = () => void

let activeRequests = 0
const listeners = new Set<Listener>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

export function startLoading() {
  activeRequests += 1
  emitChange()
}

export function stopLoading() {
  activeRequests = Math.max(0, activeRequests - 1)
  emitChange()
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): boolean {
  return activeRequests > 0
}

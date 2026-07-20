import { useSyncExternalStore } from 'react'
import { subscribe, getSnapshot } from '../utils/loadingStore'

/** true whenever at least one API request is currently in flight. */
export function useIsLoading(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}

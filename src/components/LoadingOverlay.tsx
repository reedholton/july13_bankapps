import { useIsLoading } from '../hooks/useIsLoading'

/**
 * Full-screen overlay shown while any API request is in flight. Sits on top
 * of everything (fixed, covers the viewport), so it also blocks interaction
 * with the rest of the page for the duration - not just a visual indicator.
 */
export default function LoadingOverlay() {
  const isLoading = useIsLoading()

  if (!isLoading) return null

  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label="Loading">
      <div className="loading-spinner" />
    </div>
  )
}

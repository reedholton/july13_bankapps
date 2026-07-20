import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import TopNav from './TopNav'

export interface Crumb {
  label: string
  to?: string
}

interface PassbookFrameProps {
  trail?: Crumb[]
  title?: string
  subtitle?: string
  /** Wider content column for table-heavy pages (Dashboard, transaction history). */
  wide?: boolean
  children: ReactNode
}

/**
 * Shared chrome for every screen inside the app. Used to wrap everything in a
 * narrow bordered "passbook card" sitting in the middle of the page - which is
 * exactly what read as a dialog box, on every screen, not just the landing
 * page. Now it's a full-width shell (shared nav, optional breadcrumb bar,
 * content area) - still ties back to the passbook/ledger visual language via
 * the brass rule under the nav and the serif title, just without the box.
 */
export default function PassbookFrame({
  trail = [],
  title,
  subtitle,
  wide = false,
  children,
}: PassbookFrameProps) {
  return (
    <div className="app-shell">
      <TopNav />

      {trail.length > 0 && (
        <nav className="app-trail" aria-label="Breadcrumb">
          <div className="app-trail-inner">
            {trail.map((crumb, i) => (
              <span key={crumb.label}>
                {i > 0 && ' / '}
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
              </span>
            ))}
          </div>
        </nav>
      )}

      <main className={`app-main${wide ? ' app-main-wide' : ''}`}>
        <div className="app-main-inner">
          {title && <h1 className="app-title">{title}</h1>}
          {subtitle && <p className="app-subtitle">{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  )
}

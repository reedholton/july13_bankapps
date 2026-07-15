import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface Crumb {
  label: string
  to?: string
}

interface PassbookFrameProps {
  trail?: Crumb[]
  title?: string
  subtitle?: string
  children: ReactNode
}

/**
 * Every screen sits inside this same "passbook" chrome - a letterhead up top with
 * a breadcrumb trail, and a body area for the page's own content below.
 */
export default function PassbookFrame({
  trail = [],
  title,
  subtitle,
  children,
}: PassbookFrameProps) {
  return (
    <div className="page-shell">
      <div className="passbook">
        <header className="passbook__letterhead">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="passbook__mark">Simple Bank</div>
          </Link>
          <div className="passbook__tagline">Member Passbook</div>
          {trail.length > 0 && (
            <nav className="passbook__trail" aria-label="Breadcrumb">
              {trail.map((crumb, i) => (
                <span key={crumb.label}>
                  {i > 0 && ' / '}
                  {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
                </span>
              ))}
            </nav>
          )}
        </header>
        <div className="passbook__body">
          {title && <h1 className="passbook__title">{title}</h1>}
          {subtitle && <p className="passbook__subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}

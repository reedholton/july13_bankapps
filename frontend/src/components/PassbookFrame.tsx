import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
 * Every screen sits inside this same "passbook" chrome - a letterhead up top (who's
 * signed in, a logout control) with a breadcrumb trail, and a body area for the page's
 * own content below.
 */
export default function PassbookFrame({
  trail = [],
  title,
  subtitle,
  children,
}: PassbookFrameProps) {
  const { isAuthenticated, isAdmin, name, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Signed-in visitors clicking the wordmark go to their dashboard; signed-out
  // visitors go to the public landing page.
  const brandTarget = isAuthenticated ? '/dashboard' : '/'

  return (
    <div className="page-shell">
      <div className="passbook">
        <header className="passbook__letterhead">
          <div className="passbook__authbar">
            {isAuthenticated ? (
              <>
                <span className="passbook__authbar-name">
                  Signed in as {name}
                  {isAdmin && <span className="admin-tag">Admin</span>}
                </span>
                <button type="button" className="link-button" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login">Log in</Link>
            )}
          </div>
          <Link to={brandTarget} style={{ textDecoration: 'none' }}>
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

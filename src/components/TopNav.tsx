import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Shared across the whole site now - the public landing page and every
 * logged-in screen use the exact same nav, so the site reads as one
 * consistent product instead of "marketing page" + "separate app."
 */
export default function TopNav() {
  const { isAuthenticated, isAdmin, name, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="site-nav-mark">
          Simple Bank
        </Link>
        <div className="site-nav-actions">
          <Link to="/about" className="site-nav-link">
            About
          </Link>
          <Link to="/services" className="site-nav-link">
            Services
          </Link>
          <Link to="/contact" className="site-nav-link">
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="site-nav-cta">
                Dashboard
              </Link>
              <span className="site-nav-status">
                Signed in as {name}
                {isAdmin && <span className="admin-tag">Admin</span>}
              </span>
              <button type="button" className="link-button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="site-nav-cta">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

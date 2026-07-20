import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import SiteFooter from '../components/SiteFooter'

/**
 * The public landing page - no login required, full-width layout. Anyone
 * visiting "/" sees this. Logged-in users land on /dashboard instead
 * (see App.tsx and TopNav's brand link).
 */
export default function Home() {
  return (
    <div className="landing">
      <TopNav />

      <section className="landing-hero">
        <div className="landing-hero-pattern" aria-hidden="true" />
        <div className="landing-hero-inner">
          <div className="landing-hero-tagline">Member Passbook Banking</div>
          <h1 className="landing-hero-title">Banking, kept simple</h1>
          <p className="landing-hero-subtitle">
            Open an account, track every deposit and withdrawal, and manage your money
            in one place.
          </p>
          <div className="landing-hero-actions">
            <Link to="/register" className="btn btn-brass">
              Open an account
            </Link>
            <Link to="/login" className="landing-hero-secondary">
              Log in →
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-stats-band">
        <div className="landing-stats-inner">
          <div className="landing-stat">
            <div className="landing-stat-figure">12,400+</div>
            <div className="landing-stat-label">Members</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-figure">$48M+</div>
            <div className="landing-stat-label">Managed</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-figure">2026</div>
            <div className="landing-stat-label">Founded</div>
          </div>
        </div>
      </section>

      <section className="landing-features-section">
        <div className="landing-features-inner">
          <div className="landing-feature">
            <div className="landing-feature-mark">01</div>
            <h3>Open in minutes</h3>
            <p>Register once, then open a savings or checking account instantly - no paperwork.</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-mark">02</div>
            <h3>Full transaction history</h3>
            <p>Every deposit and withdrawal is recorded in your passbook, ready whenever you need it.</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-mark">03</div>
            <h3>Built on solid rules</h3>
            <p>No overdrafts, no negative deposits - your balance is always accurate.</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

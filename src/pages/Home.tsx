import { Link } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'

/**
 * The public landing page - no login required. Anyone visiting "/" sees this, whether
 * they're a first-time visitor or just logged out. Logged-in users land on /dashboard
 * instead (see App.tsx and PassbookFrame's brand link).
 */
export default function Home() {
  return (
    <PassbookFrame
      title="Banking, kept simple"
      subtitle="Open an account, track every deposit and withdrawal, and manage your money in one place."
    >
      <div className="btn-row">
        <Link to="/register" className="btn btn-primary">
          Open an account
        </Link>
        <Link to="/login" className="btn btn-secondary">
          Log in
        </Link>
      </div>

      <div className="landing-stats">
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

      <div className="landing-features">
        <div className="landing-feature">
          <h3>Open in minutes</h3>
          <p>Register once, then open a savings or checking account instantly - no paperwork.</p>
        </div>
        <div className="landing-feature">
          <h3>Full transaction history</h3>
          <p>Every deposit and withdrawal is recorded in your passbook, ready whenever you need it.</p>
        </div>
        <div className="landing-feature">
          <h3>Built on solid rules</h3>
          <p>No overdrafts, no negative deposits - your balance is always accurate.</p>
        </div>
      </div>
    </PassbookFrame>
  )
}

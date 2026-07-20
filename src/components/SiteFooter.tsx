import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="landing-footer">
      <span className="landing-footer-mark">Simple Bank</span>
      <span className="landing-footer-note">A simple, secure passbook for your everyday banking.</span>
      <nav className="landing-footer-links" aria-label="Footer">
        <Link to="/about">About</Link>
        <Link to="/services">Services</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    </footer>
  )
}

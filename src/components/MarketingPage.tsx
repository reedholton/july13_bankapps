import type { ReactNode } from 'react'
import TopNav from './TopNav'
import SiteFooter from './SiteFooter'

interface MarketingPageProps {
  eyebrow?: string
  title: string
  subtitle?: string
  /** Wider content column - used by Services for its feature-card grid. */
  wide?: boolean
  children: ReactNode
}

/**
 * Full-width like the landing page (not boxed like the app/login pages) -
 * these are public, informational pages, not account screens.
 */
export default function MarketingPage({ eyebrow, title, subtitle, wide = false, children }: MarketingPageProps) {
  return (
    <div className="landing">
      <TopNav />

      <header className="marketing-header">
        <div className="marketing-header-inner">
          {eyebrow && <div className="marketing-eyebrow">{eyebrow}</div>}
          <h1 className="marketing-title">{title}</h1>
          {subtitle && <p className="marketing-subtitle">{subtitle}</p>}
        </div>
      </header>

      <main className={`marketing-body${wide ? ' marketing-body-wide' : ''}`}>
        <div className="marketing-body-inner">{children}</div>
      </main>

      <SiteFooter />
    </div>
  )
}

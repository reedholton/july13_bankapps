import MarketingPage from '../components/MarketingPage'

export default function Services() {
  return (
    <MarketingPage
      wide
      eyebrow="Services"
      title="What you can do with Simple Bank"
      subtitle="A small set of accounts and tools, done well - not a hundred products you'll never use."
    >
      <div className="landing-features-inner" style={{ margin: 0, maxWidth: 'none' }}>
        <div className="landing-feature">
          <div className="landing-feature-mark">01</div>
          <h3>Savings accounts</h3>
          <p>Set money aside and watch your balance build, with every deposit recorded automatically.</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-mark">02</div>
          <h3>Checking accounts</h3>
          <p>Built for everyday spending - deposit, withdraw, and track it all in one place.</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-mark">03</div>
          <h3>Deposits &amp; withdrawals</h3>
          <p>Move money in and out of your account in a few clicks, with validation that keeps your balance accurate.</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-mark">04</div>
          <h3>Full transaction history</h3>
          <p>Every deposit and withdrawal, timestamped and laid out like a real passbook ledger.</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-mark">05</div>
          <h3>Multiple accounts</h3>
          <p>Open as many savings or checking accounts as you need, all under one login.</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-mark">06</div>
          <h3>Secure by design</h3>
          <p>Every session is authenticated, and your accounts are only visible to you - or your bank's administrators.</p>
        </div>
      </div>
    </MarketingPage>
  )
}

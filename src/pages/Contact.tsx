import MarketingPage from '../components/MarketingPage'

export default function Contact() {
  return (
    <MarketingPage
      eyebrow="Contact"
      title="Get in touch"
      subtitle="Have a question about your account, or just want to say hello?"
    >
      <dl style={{ margin: 0 }}>
        <div className="summary-row">
          <dt>Email</dt>
          <dd style={{ fontFamily: 'var(--font-body)' }}>support@simplebank.example</dd>
        </div>
        <div className="summary-row">
          <dt>Phone</dt>
          <dd style={{ fontFamily: 'var(--font-body)' }}>(555) 010-0182</dd>
        </div>
        <div className="summary-row">
          <dt>Address</dt>
          <dd style={{ fontFamily: 'var(--font-body)' }}>412 Ledger Lane, Suite 200, Springfield</dd>
        </div>
        <div className="summary-row">
          <dt>Hours</dt>
          <dd style={{ fontFamily: 'var(--font-body)' }}>Monday - Friday, 9:00 AM - 5:00 PM</dd>
        </div>
      </dl>

      <p style={{ marginTop: '2rem', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
        This is a student project - the contact details above are for demonstration only.
      </p>
    </MarketingPage>
  )
}

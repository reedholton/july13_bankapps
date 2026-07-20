import MarketingPage from '../components/MarketingPage'

export default function About() {
  return (
    <MarketingPage
      eyebrow="About us"
      title="A bank built around the passbook"
      subtitle="We think banking should be as simple as flipping open a ledger and seeing exactly what's there - nothing hidden, nothing complicated."
    >
      <h2>Our story</h2>
      <p>
        Simple Bank was founded in 2026 on a simple idea: banking got more complicated
        than it needed to be. Somewhere between confusing statements and buried fees,
        people lost the ability to just look at their account and understand it. We
        wanted to bring that back.
      </p>
      <p>
        We built Simple Bank around the passbook - the small ledger book that used to
        record every deposit and withdrawal by hand. It's an old idea, but a good one:
        your money, your history, laid out plainly.
      </p>

      <h2>How we operate</h2>
      <p>
        Every account follows the same solid rules: no overdrafts, no negative
        deposits, and a full record of every transaction you make. We don't think good
        banking needs to be flashy - it needs to be accurate, and it needs to be yours
        to see, in full, whenever you want.
      </p>

      <h2>Who we serve</h2>
      <p>
        Today, Simple Bank supports 12,400+ members managing over $48M together, from
        a first savings account to everyday checking. Open an account and see for
        yourself.
      </p>
    </MarketingPage>
  )
}

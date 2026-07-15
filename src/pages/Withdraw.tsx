import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import { getAccount, withdraw, ApiError } from '../api/bankApi'
import { formatMoney } from '../utils/format'
import type { Account } from '../types/bank'

export default function Withdraw() {
  const { accountId } = useParams<{ accountId: string }>()
  const navigate = useNavigate()

  const [account, setAccount] = useState<Account | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!accountId) return
    getAccount(accountId)
      .then((result) => {
        setAccount(result)
        setStatus('ready')
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Something went wrong')
        setStatus('error')
      })
  }, [accountId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!accountId) return

    const value = Number(amount)
    if (!amount || Number.isNaN(value)) {
      setError('Enter an amount')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await withdraw(accountId, value)
      navigate(`/accounts/${accountId}`)
    } catch (err) {
      // Business rules (no overdrafts, amount must be positive) are enforced
      // server-side in AccountService - whatever message it sends back is shown as-is.
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <PassbookFrame trail={[{ label: 'Home', to: '/' }]} title="Withdraw money">
        <p className="status-message">Loading account…</p>
      </PassbookFrame>
    )
  }

  if (status === 'error' || !account) {
    return (
      <PassbookFrame trail={[{ label: 'Home', to: '/' }]} title="Withdraw money">
        <div className="form-banner form-banner-error">{error}</div>
        <Link to="/" className="btn btn-secondary">
          Back to home
        </Link>
      </PassbookFrame>
    )
  }

  return (
    <PassbookFrame
      trail={[
        { label: 'Home', to: '/' },
        { label: `Account #${account.accountId}`, to: `/accounts/${account.accountId}` },
        { label: 'Withdraw' },
      ]}
      title="Withdraw money"
      subtitle={`Current balance: $${formatMoney(account.balance)}`}
    >
      {error && <div className="form-banner form-banner-error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="amount">Amount</label>
          <div className="amount-input">
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </PassbookFrame>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import { useAuth } from '../context/AuthContext'
import { getAccount, withdraw, ApiError } from '../api/bankApi'
import { formatMoney } from '../utils/format'
import type { Account } from '../types/bank'

export default function Withdraw() {
  const { accountId } = useParams<{ accountId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [account, setAccount] = useState<Account | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [amount, setAmount] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!accountId || !token) return
    getAccount(accountId, token)
      .then((result) => {
        setAccount(result)
        setStatus('ready')
      })
      .catch((err) => {
        setFormError(err instanceof ApiError ? err.message : 'Something went wrong')
        setStatus('error')
      })
  }, [accountId, token])

  function validate(value: number): boolean {
    if (!amount || Number.isNaN(value)) {
      setFieldError('Enter an amount')
      return false
    }
    if (value <= 0) {
      setFieldError('Amount must be positive')
      return false
    }
    if (account && value > account.balance) {
      setFieldError(`You only have $${formatMoney(account.balance)} available`)
      return false
    }
    setFieldError('')
    return true
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!accountId || !token) return

    const value = Number(amount)
    setFormError('')
    if (!validate(value)) return

    setSubmitting(true)
    try {
      await withdraw(accountId, value, token)
      navigate(`/accounts/${accountId}`)
    } catch (err) {
      // Business rules (no overdrafts, positive amounts) are enforced server-side too -
      // whatever message the backend sends back for a rejected withdrawal is shown here.
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <PassbookFrame trail={[{ label: 'Dashboard', to: '/dashboard' }]} title="Withdraw money">
        <p className="status-message">Loading account…</p>
      </PassbookFrame>
    )
  }

  if (status === 'error' || !account) {
    return (
      <PassbookFrame trail={[{ label: 'Dashboard', to: '/dashboard' }]} title="Withdraw money">
        <div className="form-banner form-banner-error">{formError}</div>
        <Link to="/dashboard" className="btn btn-secondary">
          Back to dashboard
        </Link>
      </PassbookFrame>
    )
  }

  return (
    <PassbookFrame
      trail={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: `Account #${account.accountId}`, to: `/accounts/${account.accountId}` },
        { label: 'Withdraw' },
      ]}
      title="Withdraw money"
      subtitle={`Current balance: $${formatMoney(account.balance)}`}
    >
      {formError && <div className="form-banner form-banner-error">{formError}</div>}

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
          {fieldError && <div className="field-error">{fieldError}</div>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </PassbookFrame>
  )
}

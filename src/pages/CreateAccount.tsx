import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import { useAuth } from '../context/AuthContext'
import { createAccount, ApiError } from '../api/bankApi'
import type { AccountType } from '../types/bank'

export default function CreateAccount() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [accountType, setAccountType] = useState<AccountType>('SAVINGS')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!token) return

    setSubmitting(true)
    setError('')
    try {
      const account = await createAccount(accountType, token)
      navigate(`/accounts/${account.accountId}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <PassbookFrame
      trail={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Open a new account' }]}
      title="Open a new account"
      subtitle="Choose the type of account to open. It'll be opened under your profile automatically."
    >
      {error && <div className="form-banner form-banner-error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="accountType">Account type</label>
          <select
            id="accountType"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as AccountType)}
          >
            <option value="SAVINGS">Savings</option>
            <option value="CHECKING">Checking</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Opening…' : 'Submit'}
        </button>
      </form>
    </PassbookFrame>
  )
}

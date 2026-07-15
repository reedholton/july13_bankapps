import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import { createUser, createAccount, ApiError } from '../api/bankApi'
import type { AccountType } from '../types/bank'

export default function CreateAccount() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('SAVINGS')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setSubmitting(true)
    try {
      // The backend models users and accounts separately (see USERS/ACCOUNTS tables
      // in the project doc), so opening an account is two calls: create the user,
      // then open an account for them.
      const user = await createUser({ name: name.trim(), email: email.trim() })
      const account = await createAccount({ userId: user.userId, accountType })
      navigate(`/accounts/${account.accountId}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <PassbookFrame
      trail={[{ label: 'Home', to: '/' }, { label: 'Create account' }]}
      title="Open a new account"
      subtitle="Fill in the details below to open a passbook account."
    >
      {error && <div className="form-banner form-banner-error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            autoComplete="email"
          />
        </div>

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
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </PassbookFrame>
  )
}

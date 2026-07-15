import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import { useBankData } from '../context/BankDataContext'
import type { AccountType } from '../types/bank'

export default function CreateAccount() {
  const navigate = useNavigate()
  const { createAccount } = useBankData()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('SAVINGS')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    const account = createAccount({ name: name.trim(), email: email.trim(), accountType })
    navigate(`/accounts/${account.accountId}`)
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
            <option value="CURRENT">Current</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </PassbookFrame>
  )
}

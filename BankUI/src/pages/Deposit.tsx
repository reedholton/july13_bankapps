import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import { useBankData } from '../context/BankDataContext'
import { formatMoney } from '../utils/format'

export default function Deposit() {
  const { accountId } = useParams<{ accountId: string }>()
  const navigate = useNavigate()
  const { getAccount, deposit } = useBankData()
  const account = accountId ? getAccount(accountId) : undefined

  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  if (!account || !accountId) {
    return <Navigate to="/" replace />
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = Number(amount)

    if (!amount || Number.isNaN(value)) {
      setError('Enter an amount')
      return
    }

    const result = deposit(accountId as string, value)
    if (!result.success) {
      setError(result.error ?? 'Something went wrong')
      return
    }

    navigate(`/accounts/${accountId}`)
  }

  return (
    <PassbookFrame
      trail={[
        { label: 'Home', to: '/' },
        { label: `Account #${account.accountId}`, to: `/accounts/${account.accountId}` },
        { label: 'Deposit' },
      ]}
      title="Deposit money"
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

        <button type="submit" className="btn btn-brass">
          Submit
        </button>
      </form>
    </PassbookFrame>
  )
}

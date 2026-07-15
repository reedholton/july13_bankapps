import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import { getAccount, ApiError } from '../api/bankApi'
import { formatMoney } from '../utils/format'
import type { Account } from '../types/bank'

export default function AccountDetails() {
  const { accountId } = useParams<{ accountId: string }>()
  const [account, setAccount] = useState<Account | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accountId) return
    setStatus('loading')
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

  if (status === 'loading') {
    return (
      <PassbookFrame trail={[{ label: 'Home', to: '/' }]} title="Account">
        <p className="status-message">Loading account…</p>
      </PassbookFrame>
    )
  }

  if (status === 'error' || !account) {
    return (
      <PassbookFrame trail={[{ label: 'Home', to: '/' }]} title="Account">
        <div className="form-banner form-banner-error">{error}</div>
        <Link to="/" className="btn btn-secondary">
          Back to home
        </Link>
      </PassbookFrame>
    )
  }

  return (
    <PassbookFrame
      trail={[{ label: 'Home', to: '/' }, { label: `Account #${account.accountId}` }]}
      title={account.userName}
      subtitle={`${account.accountType === 'SAVINGS' ? 'Savings' : 'Checking'} account`}
    >
      <div className="balance-block">
        <div className="balance-label">Current balance</div>
        <div className="balance-figure">${formatMoney(account.balance)}</div>
      </div>

      <dl style={{ margin: 0 }}>
        <div className="summary-row">
          <dt>Account ID</dt>
          <dd>{account.accountId}</dd>
        </div>
        <div className="summary-row">
          <dt>User name</dt>
          <dd style={{ fontFamily: 'var(--font-body)' }}>{account.userName}</dd>
        </div>
      </dl>

      <div className="btn-row" style={{ marginTop: '1.5rem' }}>
        <Link to={`/accounts/${account.accountId}/deposit`} className="btn btn-brass">
          Deposit
        </Link>
        <Link to={`/accounts/${account.accountId}/withdraw`} className="btn btn-secondary">
          Withdraw
        </Link>
      </div>
      <Link
        to={`/accounts/${account.accountId}/transactions`}
        className="btn btn-secondary"
      >
        View transactions
      </Link>
    </PassbookFrame>
  )
}

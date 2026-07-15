import { useParams, Link, Navigate } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import { useBankData } from '../context/BankDataContext'
import { formatMoney } from '../utils/format'

export default function AccountDetails() {
  const { accountId } = useParams<{ accountId: string }>()
  const { getAccount } = useBankData()
  const account = accountId ? getAccount(accountId) : undefined

  if (!account) {
    return <Navigate to="/" replace />
  }

  return (
    <PassbookFrame
      trail={[{ label: 'Home', to: '/' }, { label: `Account #${account.accountId}` }]}
      title={account.userName}
      subtitle={`${account.accountType === 'SAVINGS' ? 'Savings' : 'Current'} account`}
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
        <div className="summary-row">
          <dt>Email</dt>
          <dd style={{ fontFamily: 'var(--font-body)' }}>{account.email}</dd>
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

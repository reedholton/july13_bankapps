import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import StampBadge from '../components/StampBadge'
import { useAuth } from '../context/AuthContext'
import { getAccount, getTransactions, ApiError } from '../api/bankApi'
import { formatMoney, formatDate } from '../utils/format'
import type { Account, Transaction } from '../types/bank'

/**
 * Account overview - balance, summary stats, and actions on the left;
 * full transaction history on the right. Used to be two separate pages
 * (this one, plus a dedicated Transaction History page reached via a
 * button) - merged into one so the wide layout actually has enough real
 * content to justify its width instead of a summary card floating in
 * empty space.
 */
export default function AccountDetails() {
  const { accountId } = useParams<{ accountId: string }>()
  const { token } = useAuth()
  const [account, setAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accountId || !token) return
    setStatus('loading')
    Promise.all([getAccount(accountId, token), getTransactions(accountId, token)])
      .then(([accountResult, transactionsResult]) => {
        setAccount(accountResult)
        setTransactions(transactionsResult)
        setStatus('ready')
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Something went wrong')
        setStatus('error')
      })
  }, [accountId, token])

  if (status === 'loading') {
    return (
      <PassbookFrame wide trail={[{ label: 'Overview', to: '/dashboard' }]} title="Account">
        <p className="status-message">Loading account…</p>
      </PassbookFrame>
    )
  }

  if (status === 'error' || !account) {
    return (
      <PassbookFrame wide trail={[{ label: 'Overview', to: '/dashboard' }]} title="Account">
        <div className="form-banner form-banner-error">{error}</div>
        <Link to="/dashboard" className="btn btn-secondary">
          Back to overview
        </Link>
      </PassbookFrame>
    )
  }

  const totalDeposited = transactions
    .filter((txn) => txn.type === 'DEPOSIT')
    .reduce((sum, txn) => sum + txn.amount, 0)
  const totalWithdrawn = transactions
    .filter((txn) => txn.type === 'WITHDRAW')
    .reduce((sum, txn) => sum + txn.amount, 0)

  return (
    <PassbookFrame
      wide
      trail={[{ label: 'Overview', to: '/dashboard' }, { label: `Account #${account.accountId}` }]}
      title={account.userName}
      subtitle={`${account.accountType === 'SAVINGS' ? 'Savings' : 'Checking'} account`}
    >
      <div className="account-overview-grid">
        <div>
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
              <dt>Account type</dt>
              <dd style={{ fontFamily: 'var(--font-body)' }}>
                {account.accountType === 'SAVINGS' ? 'Savings' : 'Checking'}
              </dd>
            </div>
            <div className="summary-row">
              <dt>Total deposited</dt>
              <dd className="amount-deposit">+${formatMoney(totalDeposited)}</dd>
            </div>
            <div className="summary-row">
              <dt>Total withdrawn</dt>
              <dd className="amount-withdraw">−${formatMoney(totalWithdrawn)}</dd>
            </div>
            <div className="summary-row">
              <dt>Transactions</dt>
              <dd>{transactions.length}</dd>
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
        </div>

        <div>
          <h2 className="account-overview-ledger-title">Transaction history</h2>
          {transactions.length === 0 ? (
            <p className="empty-ledger">No transactions yet. Make a deposit to get started.</p>
          ) : (
            <table className="ledger">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.txnId}>
                    <td>{txn.txnId.slice(-6)}</td>
                    <td>
                      <StampBadge type={txn.type} />
                    </td>
                    <td>{formatDate(txn.date)}</td>
                    <td
                      className={`amount ${
                        txn.type === 'DEPOSIT' ? 'amount-deposit' : 'amount-withdraw'
                      }`}
                    >
                      {txn.type === 'DEPOSIT' ? '+' : '−'}${formatMoney(txn.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PassbookFrame>
  )
}

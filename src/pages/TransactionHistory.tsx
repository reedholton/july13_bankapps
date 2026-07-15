import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import StampBadge from '../components/StampBadge'
import { getAccount, getTransactions, ApiError } from '../api/bankApi'
import { formatMoney, formatDate } from '../utils/format'
import type { Account, Transaction } from '../types/bank'

export default function TransactionHistory() {
  const { accountId } = useParams<{ accountId: string }>()
  const [account, setAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accountId) return
    setStatus('loading')
    Promise.all([getAccount(accountId), getTransactions(accountId)])
      .then(([accountResult, transactionsResult]) => {
        setAccount(accountResult)
        setTransactions(transactionsResult)
        setStatus('ready')
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Something went wrong')
        setStatus('error')
      })
  }, [accountId])

  if (status === 'loading') {
    return (
      <PassbookFrame trail={[{ label: 'Home', to: '/' }]} title="Transaction history">
        <p className="status-message">Loading transactions…</p>
      </PassbookFrame>
    )
  }

  if (status === 'error' || !account) {
    return (
      <PassbookFrame trail={[{ label: 'Home', to: '/' }]} title="Transaction history">
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
        { label: 'Transactions' },
      ]}
      title="Transaction history"
      subtitle={`${account.userName} — Account #${account.accountId}`}
    >
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
    </PassbookFrame>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import StampBadge from '../components/StampBadge'
import { useAuth } from '../context/AuthContext'
import {
  getMyAccounts,
  getTransactions,
  getAllAccountsAdmin,
  getAllUsersAdmin,
  ApiError,
} from '../api/bankApi'
import { formatMoney, formatDate } from '../utils/format'
import type { Account, Transaction, User } from '../types/bank'

interface ActivityRow extends Transaction {
  accountId: string
  accountLabel: string
}

function accountLabel(account: Account): string {
  return `${account.accountType === 'SAVINGS' ? 'Savings' : 'Checking'} · #${account.accountId.slice(-6)}`
}

/**
 * What renders here depends entirely on who's logged in - a regular user sees their
 * own accounts, an admin sees every account and every user instead. There's no
 * separate "/admin" page to navigate to; an admin logging in lands right here, same as
 * anyone else, just with different content.
 */
export default function Dashboard() {
  const { token, name, isAdmin } = useAuth()

  const [accounts, setAccounts] = useState<Account[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityRow[]>([])
  const [transactionCount, setTransactionCount] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    setStatus('loading')

    const request = isAdmin
      ? Promise.all([getAllAccountsAdmin(token), getAllUsersAdmin(token)]).then(
          ([accountsResult, usersResult]) => {
            setAccounts(accountsResult)
            setUsers(usersResult)
          }
        )
      : getMyAccounts(token).then(async (accountsResult) => {
          setAccounts(accountsResult)

          // Pull each account's transactions so the overview can show combined
          // stats and a recent-activity feed - not available from any single
          // endpoint, but cheap to assemble client-side from what's already there.
          const transactionLists = await Promise.all(
            accountsResult.map((account) => getTransactions(account.accountId, token))
          )
          const merged: ActivityRow[] = accountsResult.flatMap((account, i) =>
            transactionLists[i].map((txn) => ({
              ...txn,
              accountId: account.accountId,
              accountLabel: accountLabel(account),
            }))
          )
          merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          setTransactionCount(merged.length)
          setRecentActivity(merged.slice(0, 8))
        })

    request
      .then(() => setStatus('ready'))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Something went wrong')
        setStatus('error')
      })
  }, [token, isAdmin])

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <PassbookFrame
      wide
      title={isAdmin ? 'Admin overview' : `Welcome back, ${name}`}
      subtitle={
        isAdmin
          ? 'Every account and every registered user, across all customers.'
          : "Here's what's in your passbook."
      }
    >
      {!isAdmin && (
        <div className="home-actions">
          <Link to="/accounts/new" className="btn btn-primary">
            Open a new account
          </Link>
        </div>
      )}

      {status === 'loading' && <p className="status-message">Loading…</p>}

      {status === 'error' && (
        <div className="form-banner form-banner-error">
          {error}
          {!isAdmin && ' — make sure the backend is running at http://localhost:8080.'}
        </div>
      )}

      {/* ---- Regular user: their own accounts ---- */}
      {status === 'ready' && !isAdmin && (
        <>
          {accounts.length === 0 ? (
            <p className="status-message">No accounts yet - open one above to get started.</p>
          ) : (
            <>
              <div className="overview-stats">
                <div className="landing-stat">
                  <div className="landing-stat-figure">${formatMoney(totalBalance)}</div>
                  <div className="landing-stat-label">Total balance</div>
                </div>
                <div className="landing-stat">
                  <div className="landing-stat-figure">{accounts.length}</div>
                  <div className="landing-stat-label">
                    {accounts.length === 1 ? 'Account' : 'Accounts'}
                  </div>
                </div>
                <div className="landing-stat">
                  <div className="landing-stat-figure">{transactionCount}</div>
                  <div className="landing-stat-label">Transactions</div>
                </div>
              </div>

              <h2 className="account-overview-ledger-title">Your accounts</h2>
              <div className="account-cards-grid">
                {accounts.map((account) => (
                  <Link
                    key={account.accountId}
                    to={`/accounts/${account.accountId}`}
                    className="account-card"
                  >
                    <div className="account-card-type">{accountLabel(account)}</div>
                    <div className="account-card-balance">${formatMoney(account.balance)}</div>
                    <div className="account-card-id">Account #{account.accountId.slice(-6)}</div>
                  </Link>
                ))}
              </div>

              <h2 className="account-overview-ledger-title" style={{ marginTop: '2.5rem' }}>
                Recent activity
              </h2>
              {recentActivity.length === 0 ? (
                <p className="empty-ledger">No transactions yet across any of your accounts.</p>
              ) : (
                <table className="ledger">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((txn) => (
                      <tr key={`${txn.accountId}-${txn.txnId}`}>
                        <td>
                          <Link to={`/accounts/${txn.accountId}`}>{txn.accountLabel}</Link>
                        </td>
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
            </>
          )}
        </>
      )}

      {/* ---- Admin: everything ---- */}
      {status === 'ready' && isAdmin && (
        <>
          <h2 style={{ fontSize: '1rem', margin: '0 0 0.75rem' }}>
            All accounts ({accounts.length})
          </h2>
          {accounts.length === 0 ? (
            <p className="empty-ledger">No accounts have been opened yet.</p>
          ) : (
            <table className="ledger" style={{ marginBottom: '2rem' }}>
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Balance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.accountId}>
                    <td style={{ fontFamily: 'var(--font-body)' }}>{account.userName}</td>
                    <td>{account.accountType === 'SAVINGS' ? 'Savings' : 'Checking'}</td>
                    <td className="amount">${formatMoney(account.balance)}</td>
                    <td className="actions">
                      <Link to={`/accounts/${account.accountId}`} className="table-link-btn">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h2 style={{ fontSize: '1rem', margin: '0 0 0.75rem' }}>All users ({users.length})</h2>
          {users.length === 0 ? (
            <p className="empty-ledger">No users registered yet.</p>
          ) : (
            <table className="ledger">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userId}>
                    <td style={{ fontFamily: 'var(--font-body)' }}>{user.name}</td>
                    <td style={{ fontFamily: 'var(--font-body)' }}>{user.email}</td>
                    <td>
                      {user.role === 'ADMIN' ? <span className="admin-tag">Admin</span> : 'User'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </PassbookFrame>
  )
}

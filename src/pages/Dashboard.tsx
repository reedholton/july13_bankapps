import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import { useAuth } from '../context/AuthContext'
import { getMyAccounts, getAllAccountsAdmin, getAllUsersAdmin, ApiError } from '../api/bankApi'
import { formatMoney } from '../utils/format'
import type { Account, User } from '../types/bank'

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
      : getMyAccounts(token).then((result) => setAccounts(result))

    request
      .then(() => setStatus('ready'))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Something went wrong')
        setStatus('error')
      })
  }, [token, isAdmin])

  return (
    <PassbookFrame
      title={isAdmin ? 'Admin dashboard' : `Welcome back, ${name}`}
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
        <div className="home-lookup">
          <label>Your accounts</label>
          {accounts.length === 0 ? (
            <p className="status-message">No accounts yet - open one above to get started.</p>
          ) : (
            <dl style={{ margin: 0 }}>
              {accounts.map((account) => (
                <div key={account.accountId} className="summary-row">
                  <dt>
                    <Link to={`/accounts/${account.accountId}`}>
                      {account.accountType === 'SAVINGS' ? 'Savings' : 'Checking'} · #
                      {account.accountId.slice(-6)}
                    </Link>
                  </dt>
                  <dd>${formatMoney(account.balance)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
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

import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import { listAccounts, ApiError } from '../api/bankApi'
import type { Account } from '../types/bank'

export default function Home() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    listAccounts()
      .then((result) => {
        setAccounts(result)
        setSelectedId(result[0]?.accountId ?? '')
        setStatus('ready')
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Something went wrong')
        setStatus('error')
      })
  }, [])

  function handleView(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedId) navigate(`/accounts/${selectedId}`)
  }

  return (
    <PassbookFrame
      title="Welcome back"
      subtitle="Open an account or look up an existing one to get started."
    >
      <div className="home-actions">
        <Link to="/accounts/new" className="btn btn-primary">
          Create account
        </Link>
      </div>

      <div className="home-lookup">
        <label htmlFor="lookup-account">View account</label>

        {status === 'loading' && <p className="status-message">Loading accounts…</p>}

        {status === 'error' && (
          <div className="form-banner form-banner-error">
            {error} — make sure the backend is running at http://localhost:8080.
          </div>
        )}

        {status === 'ready' && (
          <form className="home-lookup-row" onSubmit={handleView}>
            <select
              id="lookup-account"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {accounts.length === 0 && <option value="">No accounts yet</option>}
              {accounts.map((a) => (
                <option key={a.accountId} value={a.accountId}>
                  {a.userName} — #{a.accountId}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary" disabled={!selectedId}>
              View
            </button>
          </form>
        )}
      </div>
    </PassbookFrame>
  )
}

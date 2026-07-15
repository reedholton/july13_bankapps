import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import { useBankData } from '../context/BankDataContext'

export default function Home() {
  const navigate = useNavigate()
  const { listAccounts } = useBankData()
  const accounts = listAccounts()
  const [selectedId, setSelectedId] = useState(accounts[0]?.accountId ?? '')

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
      </div>
    </PassbookFrame>
  )
}

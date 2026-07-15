import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CreateAccount from './pages/CreateAccount'
import AccountDetails from './pages/AccountDetails'
import Deposit from './pages/Deposit'
import Withdraw from './pages/Withdraw'
import TransactionHistory from './pages/TransactionHistory'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/accounts/new" element={<CreateAccount />} />
      <Route path="/accounts/:accountId" element={<AccountDetails />} />
      <Route path="/accounts/:accountId/deposit" element={<Deposit />} />
      <Route path="/accounts/:accountId/withdraw" element={<Withdraw />} />
      <Route path="/accounts/:accountId/transactions" element={<TransactionHistory />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}

export default App

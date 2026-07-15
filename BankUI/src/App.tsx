import { Routes, Route } from 'react-router-dom'
import { BankDataProvider } from './context/BankDataContext'
import Home from './pages/Home'
import CreateAccount from './pages/CreateAccount'
import AccountDetails from './pages/AccountDetails'
import Deposit from './pages/Deposit'
import Withdraw from './pages/Withdraw'
import TransactionHistory from './pages/TransactionHistory'

function App() {
  return (
    <BankDataProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/accounts/new" element={<CreateAccount />} />
        <Route path="/accounts/:accountId" element={<AccountDetails />} />
        <Route path="/accounts/:accountId/deposit" element={<Deposit />} />
        <Route path="/accounts/:accountId/withdraw" element={<Withdraw />} />
        <Route path="/accounts/:accountId/transactions" element={<TransactionHistory />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BankDataProvider>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateAccount from './pages/CreateAccount'
import AccountDetails from './pages/AccountDetails'
import Deposit from './pages/Deposit'
import Withdraw from './pages/Withdraw'
import TransactionHistory from './pages/TransactionHistory'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Logged in - Dashboard shows different content for admins vs regular users */}
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/accounts/new" element={<RequireAuth><CreateAccount /></RequireAuth>} />
        <Route path="/accounts/:accountId" element={<RequireAuth><AccountDetails /></RequireAuth>} />
        <Route path="/accounts/:accountId/deposit" element={<RequireAuth><Deposit /></RequireAuth>} />
        <Route path="/accounts/:accountId/withdraw" element={<RequireAuth><Withdraw /></RequireAuth>} />
        <Route path="/accounts/:accountId/transactions" element={<RequireAuth><TransactionHistory /></RequireAuth>} />

        <Route path="*" element={<Home />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

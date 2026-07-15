import { useParams, Navigate } from 'react-router-dom'
import PassbookFrame from '../components/PassbookFrame'
import StampBadge from '../components/StampBadge'
import { useBankData } from '../context/BankDataContext'
import { formatMoney } from '../utils/format'

export default function TransactionHistory() {
  const { accountId } = useParams<{ accountId: string }>()
  const { getAccount, getTransactions } = useBankData()
  const account = accountId ? getAccount(accountId) : undefined
  const transactions = accountId ? getTransactions(accountId) : []

  if (!account) {
    return <Navigate to="/" replace />
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
                <td>{txn.txnId}</td>
                <td>
                  <StampBadge type={txn.type} />
                </td>
                <td>{txn.date}</td>
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

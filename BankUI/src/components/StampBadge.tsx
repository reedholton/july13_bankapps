import type { TransactionType } from '../types/bank'

interface StampBadgeProps {
  type: TransactionType
}

export default function StampBadge({ type }: StampBadgeProps) {
  const isDeposit = type === 'DEPOSIT'
  return (
    <span className={`stamp ${isDeposit ? 'stamp-deposit' : 'stamp-withdraw'}`}>
      {isDeposit ? 'Deposit' : 'Withdraw'}
    </span>
  )
}

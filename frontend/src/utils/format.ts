export function formatMoney(amount: number): string {
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * The backend serializes transaction timestamps as full ISO-8601 strings
 * (e.g. "2026-07-15T18:40:12.123"). The UI only needs the date portion.
 */
export function formatDate(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10)
}

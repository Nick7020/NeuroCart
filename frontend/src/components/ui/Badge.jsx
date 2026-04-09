const STATUS_STYLES = {
  PENDING:    { bg: '#fffbeb', color: '#d97706' },
  CONFIRMED:  { bg: '#eff6ff', color: '#2563eb' },
  PROCESSING: { bg: '#f5f3ff', color: '#7c3aed' },
  SHIPPED:    { bg: '#ecfeff', color: '#0891b2' },
  DELIVERED:  { bg: '#f0fdf4', color: '#16a34a' },
  CANCELLED:  { bg: '#fef2f2', color: '#dc2626' },
}

export function Badge({ status }) {
  const s = STATUS_STYLES[status?.toUpperCase()] || { bg: '#f3f4f6', color: '#6b7280' }
  return (
    <span className="badge font-semibold" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

export function KpiCard({ label, value, icon, trend, color = 'blue' }) {
  const styles = {
    blue:   { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    green:  { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
    purple: { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
    orange: { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
  }
  const s = styles[color] || styles.blue
  return (
    <div className="bg-white rounded-2xl p-5 border transition-all hover:shadow-md" style={{ borderColor: s.border, boxShadow: '0 2px 12px rgba(26,50,99,0.06)' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-extrabold mt-1 text-gray-900">{value}</p>
          {trend != null && (
            <p className={`text-xs mt-1 font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: s.bg }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

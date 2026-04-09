export function KpiCard({ label, value, icon, trend, color = 'indigo' }) {
  const colors = {
    indigo: 'from-indigo-600/20 to-indigo-600/5 border-indigo-500/30',
    green: 'from-green-600/20 to-green-600/5 border-green-500/30',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/30',
    orange: 'from-orange-600/20 to-orange-600/5 border-orange-500/30',
  }
  return (
    <div className={`card p-5 bg-gradient-to-br ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

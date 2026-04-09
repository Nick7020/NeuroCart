export function KpiCard({ label, value, icon, trend, color = 'blue' }) {
  const styles = {
    blue:   { gradient: 'linear-gradient(135deg,#1a2f6b,#2d4fa0)', glow: 'rgba(26,47,107,0.18)', border: 'rgba(26,47,107,0.12)' },
    green:  { gradient: 'linear-gradient(135deg,#059669,#10b981)', glow: 'rgba(5,150,105,0.18)',  border: 'rgba(5,150,105,0.12)'  },
    purple: { gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)', glow: 'rgba(124,58,237,0.18)', border: 'rgba(124,58,237,0.12)' },
    orange: { gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', glow: 'rgba(217,119,6,0.18)',  border: 'rgba(217,119,6,0.12)'  },
  }
  const s = styles[color] || styles.blue

  return (
    <div
      className="bg-white rounded-2xl p-5 transition-all duration-220 cursor-default"
      style={{
        border: `1px solid ${s.border}`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 6px 22px ${s.glow}, 0 2px 8px rgba(0,0,0,0.05)`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: '#9898a8' }}>{label}</p>
          <p className="text-2xl font-extrabold mt-1 tracking-tight" style={{ color: '#0f0f0f' }}>{value}</p>
          {trend != null && (
            <p className={`text-xs mt-1.5 font-semibold flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] ${trend > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {trend > 0 ? '↑' : '↓'}
              </span>
              {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: s.gradient, boxShadow: `0 4px 12px ${s.glow}` }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

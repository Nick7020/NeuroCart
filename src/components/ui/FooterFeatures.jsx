import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react'

const FEATURES = [
  { icon: Truck,        label: 'Fast Delivery',    desc: 'Within 2–3 days',  gradient: 'linear-gradient(135deg,#2563eb,#3b82f6)', glow: 'rgba(37,99,235,0.15)' },
  { icon: ShieldCheck,  label: 'Secure Payments',  desc: '100% protected',   gradient: 'linear-gradient(135deg,#059669,#10b981)', glow: 'rgba(5,150,105,0.15)' },
  { icon: RefreshCw,    label: 'Easy Returns',     desc: '30-day policy',    gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)', glow: 'rgba(124,58,237,0.15)' },
  { icon: Headphones,   label: '24/7 Support',     desc: 'Always here',      gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', glow: 'rgba(217,119,6,0.15)'  },
]

export function FooterFeatures() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12 mb-6">
      {FEATURES.map(({ icon: Icon, label, desc, gradient, glow }) => (
        <div
          key={label}
          className="flex items-center gap-3.5 bg-white rounded-2xl p-4 transition-all duration-220 cursor-default"
          style={{
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = `0 6px 20px ${glow}, 0 2px 8px rgba(0,0,0,0.05)`
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: gradient, boxShadow: `0 3px 10px ${glow}` }}
          >
            <Icon size={18} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#0f0f0f' }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9898a8' }}>{desc}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react'

const FEATURES = [
  { icon: <Truck size={22} />, label: 'Fast Delivery', desc: 'Within 2-3 days', color: '#2563eb', bg: '#eff6ff' },
  { icon: <ShieldCheck size={22} />, label: 'Secure Payments', desc: '100% protected', color: '#16a34a', bg: '#f0fdf4' },
  { icon: <RefreshCw size={22} />, label: 'Easy Returns', desc: '30-day policy', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: <Headphones size={22} />, label: '24/7 Support', desc: 'Always here', color: '#d97706', bg: '#fffbeb' },
]

export function FooterFeatures() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-6">
      {FEATURES.map(({ icon, label, desc, color, bg }) => (
        <div key={label} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all"
          style={{ boxShadow: '0 2px 8px rgba(26,50,99,0.05)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-400">{desc}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

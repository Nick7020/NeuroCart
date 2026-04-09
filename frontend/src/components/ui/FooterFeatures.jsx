import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react'

const FEATURES = [
  { icon: <Truck size={24} />, label: 'Fast Delivery', desc: 'Within 2-3 days', color: 'text-indigo-400' },
  { icon: <ShieldCheck size={24} />, label: 'Secure Payments', desc: '100% protected', color: 'text-green-400' },
  { icon: <RefreshCw size={24} />, label: 'Easy Returns', desc: '30-day policy', color: 'text-purple-400' },
  { icon: <Headphones size={24} />, label: '24/7 Support', desc: 'Always here', color: 'text-orange-400' },
]

export function FooterFeatures() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-6">
      {FEATURES.map(({ icon, label, desc, color }) => (
        <div key={label} className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-colors">
          <div className={`${color} flex-shrink-0`}>{icon}</div>
          <div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

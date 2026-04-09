import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tv, Shirt, Dumbbell, Sofa, Sparkles, BookOpen } from 'lucide-react'

const CATEGORIES = [
  { label: 'Electronics', icon: Tv,        color: '#fff', bg: '#1A3263' },
  { label: 'Fashion',     icon: Shirt,      color: '#fff', bg: '#1A3263' },
  { label: 'Sports',      icon: Dumbbell,   color: '#fff', bg: '#1A3263' },
  { label: 'Home',        icon: Sofa,       color: '#fff', bg: '#1A3263' },
  { label: 'Beauty',      icon: Sparkles,   color: '#fff', bg: '#1A3263' },
  { label: 'Books',       icon: BookOpen,   color: '#fff', bg: '#1A3263' },
]

export function CategorySection({ onCategorySelect }) {
  const [active, setActive] = useState(null)

  const handleClick = (label) => {
    const next = active === label ? null : label
    setActive(next)
    onCategorySelect?.(next || 'All')
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-sm text-gray-400 mt-0.5">Find what you're looking for</p>
        </div>
        <button
          onClick={() => { setActive(null); onCategorySelect?.('All') }}
          className="text-sm font-semibold transition-colors hover:underline"
          style={{ color: '#1A3263' }}
        >
          View all
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon
          const isActive = active === cat.label
          return (
            <motion.button
              key={cat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleClick(cat.label)}
              className="flex flex-col items-center gap-3 py-5 px-3 rounded-2xl border transition-all duration-200 cursor-pointer"
              style={{
                background:   isActive ? '#1A3263' : '#fff',
                borderColor:  isActive ? '#1A3263' : '#e5e7eb',
                boxShadow:    isActive ? '0 4px 14px rgba(26,50,99,0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ background: '#1A3263' }}
              >
                <Icon size={20} color="#fff" strokeWidth={1.8} />
              </div>
              <span
                className="text-xs font-semibold leading-tight text-center"
                style={{ color: isActive ? '#fff' : '#374151' }}
              >
                {cat.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

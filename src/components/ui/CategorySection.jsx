import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tv, Shirt, Dumbbell, Sofa, Sparkles, BookOpen } from 'lucide-react'

const CATEGORIES = [
  {
    label: 'Electronics',
    icon: Tv,
    count: '1,240+ items',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    lightBg: '#eff6ff',
    lightColor: '#1d4ed8',
    glow: '0 8px 24px rgba(37,99,235,0.28)',
    emoji: '💻',
  },
  {
    label: 'Fashion',
    icon: Shirt,
    count: '3,800+ items',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)',
    lightBg: '#f5f3ff',
    lightColor: '#7c3aed',
    glow: '0 8px 24px rgba(124,58,237,0.28)',
    emoji: '👗',
  },
  {
    label: 'Sports',
    icon: Dumbbell,
    count: '920+ items',
    gradient: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
    lightBg: '#ecfdf5',
    lightColor: '#059669',
    glow: '0 8px 24px rgba(16,185,129,0.28)',
    emoji: '🏋️',
  },
  {
    label: 'Home',
    icon: Sofa,
    count: '2,100+ items',
    gradient: 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)',
    lightBg: '#fffbeb',
    lightColor: '#d97706',
    glow: '0 8px 24px rgba(245,158,11,0.28)',
    emoji: '🛋️',
  },
  {
    label: 'Beauty',
    icon: Sparkles,
    count: '1,560+ items',
    gradient: 'linear-gradient(135deg, #9d174d 0%, #ec4899 100%)',
    lightBg: '#fdf2f8',
    lightColor: '#db2777',
    glow: '0 8px 24px rgba(236,72,153,0.28)',
    emoji: '✨',
  },
  {
    label: 'Books',
    icon: BookOpen,
    count: '680+ items',
    gradient: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)',
    lightBg: '#ecfeff',
    lightColor: '#0891b2',
    glow: '0 8px 24px rgba(6,182,212,0.28)',
    emoji: '📚',
  },
]

export function CategorySection({ onCategorySelect }) {
  const [active, setActive] = useState(null)

  const handleClick = (label) => {
    const next = active === label ? null : label
    setActive(next)
    onCategorySelect?.(next || 'All')
  }

  return (
    <section className="mb-12" style={{ marginTop: '24px' }}>

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon
          const isActive = active === cat.label

          return (
            <motion.button
              key={cat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3, ease: 'easeOut' }}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleClick(cat.label)}
              className="relative flex flex-col items-center text-center rounded-2xl overflow-hidden cursor-pointer"
              style={{
                padding: '22px 12px 18px',
                background: isActive ? cat.gradient : '#ffffff',
                border: isActive ? 'none' : '1px solid rgba(15,23,42,0.08)',
                boxShadow: isActive ? cat.glow : '0 1px 6px rgba(15,23,42,0.06)',
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* Active shimmer overlay */}
              {isActive && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
                  }}
                />
              )}

              {/* Icon container */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 relative z-10"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : cat.lightBg,
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.22s ease',
                }}
              >
                <Icon
                  size={22}
                  strokeWidth={1.8}
                  style={{ color: isActive ? '#ffffff' : cat.lightColor, transition: 'color 0.22s' }}
                />
              </div>

              {/* Label */}
              <span
                className="text-sm font-bold leading-tight relative z-10 mb-1"
                style={{ color: isActive ? '#ffffff' : '#0f172a', transition: 'color 0.22s', fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.01em' }}
              >
                {cat.label}
              </span>

              {/* Count */}
              <span
                className="text-[10px] font-medium relative z-10"
                style={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#94a3b8', transition: 'color 0.22s', fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.01em' }}
              >
                {cat.count}
              </span>

              {/* Active check dot */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.25)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { label: 'Electronics', icon: '💻', color: 'from-blue-600/20 to-indigo-600/20 border-blue-500/30 hover:border-blue-400/60', text: 'text-blue-400' },
  { label: 'Fashion', icon: '👗', color: 'from-pink-600/20 to-rose-600/20 border-pink-500/30 hover:border-pink-400/60', text: 'text-pink-400' },
  { label: 'Sports', icon: '⚽', color: 'from-green-600/20 to-emerald-600/20 border-green-500/30 hover:border-green-400/60', text: 'text-green-400' },
  { label: 'Home', icon: '🏠', color: 'from-orange-600/20 to-amber-600/20 border-orange-500/30 hover:border-orange-400/60', text: 'text-orange-400' },
  { label: 'Beauty', icon: '💄', color: 'from-purple-600/20 to-violet-600/20 border-purple-500/30 hover:border-purple-400/60', text: 'text-purple-400' },
  { label: 'Books', icon: '📚', color: 'from-yellow-600/20 to-amber-600/20 border-yellow-500/30 hover:border-yellow-400/60', text: 'text-yellow-400' },
]

export function CategorySection({ onCategorySelect }) {
  const navigate = useNavigate()

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Shop by Category</h2>
        <span className="text-sm text-indigo-400 cursor-pointer hover:text-indigo-300">View all →</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategorySelect?.(cat.label)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${cat.color} border transition-all duration-300 cursor-pointer`}
          >
            <span className="text-3xl">{cat.icon}</span>
            <span className={`text-xs font-semibold ${cat.text}`}>{cat.label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

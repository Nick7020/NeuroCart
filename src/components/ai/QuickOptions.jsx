import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

export function QuickOptions({ options, onSelect }) {
  if (!options?.length) return null

  return (
    <div className="px-2 mb-3">
      <p className="text-[10px] text-gray-400 font-medium mb-2 px-1">Select an option</p>
      <div className="flex flex-col gap-1.5">
        {options.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(opt)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium text-left transition-all"
            style={{ background: '#fff', color: '#374151', borderColor: '#e9d5ff' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#faf5ff'
              e.currentTarget.style.borderColor = '#7C3AED'
              e.currentTarget.style.color = '#7C3AED'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.borderColor = '#e9d5ff'
              e.currentTarget.style.color = '#374151'
            }}
          >
            <span>{opt.label}</span>
            <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}

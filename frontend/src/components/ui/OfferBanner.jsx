import { motion } from 'framer-motion'
import { Tag, ArrowRight } from 'lucide-react'

export function OfferBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 mb-10 border border-white/10"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
            <Tag size={16} className="text-yellow-300" />
            <span className="text-yellow-300 text-sm font-semibold uppercase tracking-wider">Limited Time Offer</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Get <span className="text-yellow-300">20% OFF</span> 🎉
          </h2>
          <p className="text-white/80 text-sm md:text-base">On your first order. Use code <span className="font-bold text-yellow-300 bg-white/10 px-2 py-0.5 rounded-lg">NEURO20</span></p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-7 py-3.5 rounded-2xl shadow-xl hover:shadow-white/20 transition-all flex-shrink-0"
        >
          Claim Offer <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.section>
  )
}

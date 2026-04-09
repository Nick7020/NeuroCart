import { motion } from 'framer-motion'
import { Tag, ArrowRight } from 'lucide-react'

export function OfferBanner() {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-8 mb-10"
      style={{ background: 'linear-gradient(135deg, #1A3263 0%, #243d75 50%, #547792 100%)' }}>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: '#FFC570', transform: 'translate(40%,-40%)' }} />
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
            <Tag size={16} style={{ color: '#FFC570' }} />
            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#FFC570' }}>Limited Time Offer</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Get <span style={{ color: '#FFC570' }}>20% OFF</span> 🎉
          </h2>
          <p className="text-white/75 text-sm md:text-base">
            On your first order. Use code{' '}
            <span className="font-bold px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,197,112,0.2)', color: '#FFC570' }}>NEURO20</span>
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 font-bold px-7 py-3.5 rounded-2xl shadow-xl flex-shrink-0 transition-all"
          style={{ background: '#FFC570', color: '#1A3263' }}>
          Claim Offer <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.section>
  )
}

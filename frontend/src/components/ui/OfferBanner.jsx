import { motion } from 'framer-motion'
import { Tag, ArrowRight } from 'lucide-react'

export function OfferBanner() {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-8 mb-10"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 100%)', border: '1px solid #C7D2FE' }}>

      <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)', transform: 'translate(20%,-20%)' }} />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-3"
            style={{ background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }}>
            <Tag size={11} /> Limited Time Offer
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: '#0F172A' }}>
            Get <span className="gradient-text">20% OFF</span>
          </h2>
          <p className="text-sm md:text-base" style={{ color: '#475569' }}>
            On your first order. Use code{' '}
            <span className="font-bold px-2 py-0.5 rounded-lg" style={{ background: '#EEF2FF', color: '#4F46E5' }}>NEURO20</span>
          </p>
        </div>

        <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 font-semibold px-7 py-3.5 rounded-2xl flex-shrink-0 btn-primary">
          Claim Offer <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.section>
  )
}

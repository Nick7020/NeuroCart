import { motion } from 'framer-motion'
import { Tag, ArrowRight, Zap } from 'lucide-react'

export function OfferBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl p-8 md:p-10 mb-10"
      style={{
        background: 'linear-gradient(135deg, #1a2f6b 0%, #2d4fa0 50%, #1e3a8a 100%)',
        boxShadow: '0 8px 32px rgba(26,47,107,0.28)',
      }}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,197,112,0.18) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(255,197,112,0.18)', color: '#FFC570', border: '1px solid rgba(255,197,112,0.3)' }}
          >
            <Zap size={11} /> Limited Time Offer
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold mb-2.5 text-white tracking-tight">
            Get{' '}
            <span style={{
              background: 'linear-gradient(135deg,#FFC570,#fde68a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              20% OFF
            </span>
          </h2>

          <p className="text-sm md:text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
            On your first order. Use code{' '}
            <span
              className="font-bold px-2.5 py-0.5 rounded-lg mx-1 font-mono tracking-wider"
              style={{ background: 'rgba(255,197,112,0.2)', color: '#FFC570', border: '1px solid rgba(255,197,112,0.3)' }}
            >
              NEURO20
            </span>
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 font-semibold px-7 py-3.5 rounded-2xl flex-shrink-0 text-sm transition-all"
          style={{
            background: 'linear-gradient(135deg,#FFC570,#e8a020)',
            color: '#1a2f6b',
            boxShadow: '0 6px 20px rgba(255,197,112,0.4)',
          }}
        >
          Claim Offer <ArrowRight size={15} />
        </motion.button>
      </div>
    </motion.section>
  )
}

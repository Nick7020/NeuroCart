import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Sparkles, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function Hero() {
  const { user } = useAuth()
  return (
    <section className="relative overflow-hidden rounded-3xl mb-10 p-8 md:p-12" style={{ background: 'linear-gradient(135deg, #1A3263 0%, #243d75 60%, #547792 100%)' }}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: '#FFC570', transform: 'translate(40%,-40%)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: '#EFD2B0', transform: 'translate(-30%,30%)' }} />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
        {/* Left */}
        <div className="flex-1 text-center md:text-left">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-5" style={{ background: 'rgba(255,197,112,0.2)', border: '1px solid rgba(255,197,112,0.4)', color: '#FFC570' }}>
              <Sparkles size={12} /> AI-Powered Shopping
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-white">
              {user ? <>Welcome back,<br /><span style={{ color: '#FFC570' }}>{user.name?.split(' ')[0]} 👋</span></> : <>Shop Smarter<br /><span style={{ color: '#FFC570' }}>with AI ✨</span></>}
            </h1>
            <p className="text-base md:text-lg mb-8 max-w-md mx-auto md:mx-0" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Discover personalized products powered by AI. Recommendations tailored just for you.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link to="/" className="flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-lg" style={{ background: '#FFC570', color: '#1A3263', boxShadow: '0 8px 24px rgba(255,197,112,0.35)' }}>
                <ShoppingBag size={18} /> Shop Now
              </Link>
              <Link to="/" className="flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all" style={{ border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Explore Deals <ArrowRight size={16} />
              </Link>
            </div>
            <div className="flex gap-8 mt-8 justify-center md:justify-start">
              {[{ value: '50K+', label: 'Products' }, { value: '4.9★', label: 'Rating' }, { value: '2M+', label: 'Customers' }].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-extrabold" style={{ color: '#FFC570' }}>{value}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right floating cards */}
        <div className="flex-1 relative flex items-center justify-center min-h-[280px] w-full max-w-sm mx-auto">
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-20 rounded-2xl p-4 w-44 shadow-2xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="w-full aspect-square rounded-xl mb-3 flex items-center justify-center text-5xl" style={{ background: 'rgba(255,197,112,0.15)' }}>🎧</div>
            <p className="text-xs font-semibold text-white">Sony WH-1000XM5</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: '#FFC570' }}>₹24,990</p>
            <div className="flex mt-1">{[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}</div>
          </motion.div>

          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-0 right-0 z-10 rounded-2xl p-3 w-36 shadow-xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="w-full aspect-square rounded-xl mb-2 flex items-center justify-center text-4xl" style={{ background: 'rgba(255,197,112,0.1)' }}>⌚</div>
            <p className="text-xs font-semibold text-white truncate">Apple Watch</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: '#FFC570' }}>₹41,900</p>
          </motion.div>

          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-0 left-0 z-10 rounded-2xl p-3 w-36 shadow-xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="w-full aspect-square rounded-xl mb-2 flex items-center justify-center text-4xl" style={{ background: 'rgba(255,255,255,0.1)' }}>👟</div>
            <p className="text-xs font-semibold text-white truncate">Nike Air Max</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: '#FFC570' }}>₹10,795</p>
          </motion.div>

          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 right-2 -translate-y-1/2 z-30 text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg"
            style={{ background: '#FFC570', color: '#1A3263' }}>
            🤖 AI Pick
          </motion.div>
        </div>
      </div>
    </section>
  )
}

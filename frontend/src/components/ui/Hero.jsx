import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingBag, Sparkles, ArrowRight, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const floatAnim = {
  animate: { y: [0, -12, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
}

export function Hero() {
  const { user } = useAuth()

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-8 md:p-12 mb-10 border border-indigo-500/20">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
        {/* Left */}
        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Sparkles size={12} /> AI-Powered Shopping Experience
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              {user ? (
                <>Welcome back,<br /><span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{user.name?.split(' ')[0]} 👋</span></>
              ) : (
                <>Shop Smarter<br /><span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">with AI ✨</span></>
              )}
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-md mx-auto md:mx-0">
              Discover personalized products powered by AI. Get recommendations tailored just for you.
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link to="/" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-500/30">
                <ShoppingBag size={18} /> Shop Now
              </Link>
              <Link to="/" className="flex items-center gap-2 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 font-semibold px-6 py-3 rounded-xl transition-all duration-200">
                Explore Deals <ArrowRight size={16} />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-8 justify-center md:justify-start">
              {[
                { value: '50K+', label: 'Products' },
                { value: '4.9★', label: 'Rating' },
                { value: '2M+', label: 'Customers' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — floating product cards */}
        <div className="flex-1 relative flex items-center justify-center min-h-[280px] w-full max-w-sm mx-auto">
          {/* Main card */}
          <motion.div
            {...floatAnim}
            className="relative z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-44 shadow-2xl"
          >
            <div className="w-full aspect-square bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-xl mb-3 flex items-center justify-center text-5xl">
              🎧
            </div>
            <p className="text-white text-xs font-semibold">Sony WH-1000XM5</p>
            <p className="text-indigo-400 text-sm font-bold mt-0.5">₹24,990</p>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
            </div>
          </motion.div>

          {/* Top right card */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-0 right-0 z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 w-36 shadow-xl"
          >
            <div className="w-full aspect-square bg-gradient-to-br from-pink-500/30 to-rose-500/30 rounded-xl mb-2 flex items-center justify-center text-4xl">
              ⌚
            </div>
            <p className="text-white text-xs font-semibold truncate">Apple Watch</p>
            <p className="text-pink-400 text-xs font-bold mt-0.5">₹41,900</p>
          </motion.div>

          {/* Bottom left card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-0 left-0 z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 w-36 shadow-xl"
          >
            <div className="w-full aspect-square bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-xl mb-2 flex items-center justify-center text-4xl">
              👟
            </div>
            <p className="text-white text-xs font-semibold truncate">Nike Air Max</p>
            <p className="text-green-400 text-xs font-bold mt-0.5">₹10,795</p>
          </motion.div>

          {/* AI badge */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 right-2 -translate-y-1/2 z-30 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg shadow-indigo-500/40"
          >
            🤖 AI Pick
          </motion.div>
        </div>
      </div>
    </section>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Store } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const SLIDES = [
  {
    tag: 'AI-Powered Shopping',
    title: (name) => name ? <>Welcome back,<br /><span style={{ color: '#FFC570' }}>{name}</span></> : <>Shop Smarter<br /><span style={{ color: '#FFC570' }}>with AI</span></>,
    sub: 'Discover personalized products powered by AI. Recommendations tailored just for you.',
    cta: { label: 'Shop Now', to: '/', icon: <ShoppingBag size={18} /> },
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80',
    stats: [{ value: '50K+', label: 'Products' }, { value: '4.9★', label: 'Rating' }, { value: '2M+', label: 'Customers' }],
  },
  {
    tag: 'Sell on NeuroCart',
    title: () => <>Start Selling,<br /><span style={{ color: '#fde68a' }}>Grow Faster</span></>,
    sub: 'List your products, reach crores of customers & grow your business online with zero hassle.',
    cta: { label: 'Become a Vendor', to: '/register', icon: <Store size={18} /> },
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80',
    stats: [{ value: '10K+', label: 'Vendors' }, { value: '₹0', label: 'Setup Fee' }, { value: '24/7', label: 'Support' }],
  },
  {
    tag: 'Best Deals Today',
    title: () => <>Unbeatable<br /><span style={{ color: '#6ee7b7' }}>Offers & Discounts</span></>,
    sub: "Up to 80% off on top brands. Limited time deals refreshed every day — don't miss out!",
    cta: { label: 'Explore Deals', to: '/', icon: <ArrowRight size={18} /> },
    img: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1400&q=80',
    stats: [{ value: '80%', label: 'Max Off' }, { value: '500+', label: 'Brands' }, { value: 'Daily', label: 'New Deals' }],
  },
  {
    tag: 'Safe & Secure',
    title: () => <>Shop with<br /><span style={{ color: '#fca5a5' }}>Full Confidence</span></>,
    sub: '100% secure payments, easy 7-day returns & buyer protection on every single order.',
    cta: { label: 'Shop Now', to: '/', icon: <ShoppingBag size={18} /> },
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1400&q=80',
    stats: [{ value: '100%', label: 'Secure Pay' }, { value: '7-Day', label: 'Returns' }, { value: '24/7', label: 'Help' }],
  },
]

export function Hero() {
  const { user } = useAuth()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % SLIDES.length), 4000)
    return () => clearInterval(t)
  }, [])

  const slide = SLIDES[current]
  const firstName = user?.name?.split(' ')[0]

  return (
    <section className="relative overflow-hidden rounded-3xl mb-10" style={{ minHeight: 360 }}>

      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${slide.img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(5,10,30,0.85) 0%, rgba(5,10,30,0.6) 55%, rgba(5,10,30,0.25) 100%)' }} />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={current + '-content'}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 flex flex-col md:flex-row items-center gap-10 p-8 md:p-12">

          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
              {slide.tag}
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-white">
              {slide.title(firstName)}
            </h1>

            <p className="text-base md:text-lg mb-8 max-w-md mx-auto md:mx-0" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {slide.sub}
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link to={slide.cta.to}
                className="flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
                style={{ background: '#FFC570', color: '#1A3263', boxShadow: '0 8px 24px rgba(255,197,112,0.35)' }}>
                {slide.cta.icon} {slide.cta.label}
              </Link>
              <Link to="/"
                className="flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all"
                style={{ border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Explore <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex gap-8 mt-8 justify-center md:justify-start">
              {slide.stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-extrabold" style={{ color: '#FFC570' }}>{value}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-300"
            style={{ width: i === current ? 24 : 8, height: 8, background: i === current ? '#FFC570' : 'rgba(255,255,255,0.4)' }}
          />
        ))}
      </div>
    </section>
  )
}

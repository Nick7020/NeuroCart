import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Store, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const SLIDES = [
  {
    tag: 'AI-Powered Shopping',
    title: (name) => name
      ? <><span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Welcome back,</span><br /><span style={{ color: '#FFC570' }}>{name}</span></>
      : <>Shop Smarter<br /><span style={{ color: '#FFC570' }}>with AI</span></>,
    sub: 'Discover personalized products powered by AI. Recommendations tailored just for you.',
    cta: { label: 'Shop Now', to: '/', icon: <ShoppingBag size={16} /> },
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80',
    accent: '#FFC570',
    stats: [{ value: '50K+', label: 'Products' }, { value: '4.9★', label: 'Rating' }, { value: '2M+', label: 'Customers' }],
  },
  {
    tag: 'Sell on NeuroCart',
    title: () => <>Start Selling,<br /><span style={{ color: '#fde68a' }}>Grow Faster</span></>,
    sub: 'List your products, reach crores of customers & grow your business online with zero hassle.',
    cta: { label: 'Become a Vendor', to: '/register', icon: <Store size={16} /> },
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80',
    accent: '#fde68a',
    stats: [{ value: '10K+', label: 'Vendors' }, { value: '₹0', label: 'Setup Fee' }, { value: '24/7', label: 'Support' }],
  },
  {
    tag: 'Best Deals Today',
    title: () => <>Unbeatable<br /><span style={{ color: '#6ee7b7' }}>Offers & Discounts</span></>,
    sub: "Up to 80% off on top brands. Limited time deals refreshed every day — don't miss out!",
    cta: { label: 'Explore Deals', to: '/', icon: <ArrowRight size={16} /> },
    img: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1400&q=80',
    accent: '#6ee7b7',
    stats: [{ value: '80%', label: 'Max Off' }, { value: '500+', label: 'Brands' }, { value: 'Daily', label: 'New Deals' }],
  },
  {
    tag: 'Safe & Secure',
    title: () => <>Shop with<br /><span style={{ color: '#fca5a5' }}>Full Confidence</span></>,
    sub: '100% secure payments, easy 7-day returns & buyer protection on every single order.',
    cta: { label: 'Shop Now', to: '/', icon: <ShoppingBag size={16} /> },
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1400&q=80',
    accent: '#fca5a5',
    stats: [{ value: '100%', label: 'Secure Pay' }, { value: '7-Day', label: 'Returns' }, { value: '24/7', label: 'Help' }],
  },
]

export function Hero() {
  const { user } = useAuth()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setCurrent(p => (p + 1) % SLIDES.length), 4500)
    return () => clearInterval(t)
  }, [paused])

  const slide = SLIDES[current]
  const firstName = user?.name?.split(' ')[0]
  const prev = () => setCurrent(p => (p - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setCurrent(p => (p + 1) % SLIDES.length)

  return (
    <section
      className="relative overflow-hidden rounded-3xl mb-3"
      style={{ minHeight: 260 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${slide.img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(115deg, rgba(5,8,28,0.88) 0%, rgba(5,8,28,0.62) 50%, rgba(5,8,28,0.22) 100%)' }}
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current + '-c'}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.42, ease: 'easeOut' }}
          className="relative z-10 flex flex-col md:flex-row items-center gap-10 p-6 md:p-8 lg:p-10"
        >
          <div className="flex-1 text-center md:text-left max-w-xl">
            {/* Tag pill */}
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-3"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: '#fff',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: slide.accent }} />
              {slide.tag}
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.15] mb-3 text-white tracking-tight">
              {slide.title(firstName)}
            </h1>

            <p className="text-sm mb-5 max-w-md mx-auto md:mx-0 leading-relaxed" style={{ color: 'rgba(255,255,255,0.68)' }}>
              {slide.sub}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-5">
              <Link
                to={slide.cta.to}
                className="flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all text-sm"
                style={{
                  background: slide.accent,
                  color: '#0f1420',
                  boxShadow: `0 6px 22px ${slide.accent}55`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 28px ${slide.accent}66` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 22px ${slide.accent}55` }}
              >
                {slide.cta.icon} {slide.cta.label}
              </Link>
              <Link
                to="/"
                className="flex items-center gap-2 font-medium px-6 py-3 rounded-xl transition-all text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.85)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
              >
                Explore <ArrowRight size={14} />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-6 justify-center md:justify-start">
              {slide.stats.map(({ value, label }, i) => (
                <div key={label} className="text-center md:text-left">
                  {i > 0 && <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-px h-6 bg-white/20" />}
                  <p className="text-lg font-extrabold tracking-tight" style={{ color: slide.accent }}>{value}</p>
                  <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-60 hover:opacity-100"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
      >
        <ChevronLeft size={18} className="text-white" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-60 hover:opacity-100"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
      >
        <ChevronRight size={18} className="text-white" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 22 : 6,
              height: 6,
              background: i === current ? slide.accent : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>
    </section>
  )
}

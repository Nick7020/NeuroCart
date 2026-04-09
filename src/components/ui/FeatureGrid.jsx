import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Search, Sparkles, Zap, Bell, ShieldCheck, Globe } from 'lucide-react'

const CARDS = {
  topLeft: {
    icon: Search,
    title: 'Smart Search',
    desc: 'Search kurtas, shoes, gadgets & more — AI finds the best match instantly.',
    accent: '#4F46E5',
    light: '#EEF2FF',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=75',
    imgPos: 'center bottom',
  },
  bottomLeft: {
    icon: Globe,
    title: 'Shop Any Category',
    desc: 'From ethnic wear to electronics — millions of products across every category.',
    accent: '#0284C7',
    light: '#F0F9FF',
    img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=75',
    imgPos: 'center center',
  },
  center: {
    icon: Sparkles,
    title: 'AI Recommendations',
    desc: 'Our AI learns your style — kurtas, sneakers, gadgets — and curates a personalized feed every visit.',
    accent: '#7C3AED',
    light: '#F5F3FF',
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=75',
    imgPos: 'center top',
  },
  topRight: {
    icon: Zap,
    title: 'Fast Checkout',
    desc: 'One-tap checkout for fashion, footwear & more — delivered to your door.',
    accent: '#D97706',
    light: '#FFFBEB',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=75',
    imgPos: 'center top',
  },
  bottomRight: {
    icon: Bell,
    title: 'Price Drop Alerts',
    desc: 'Get notified the moment your favourite shoes, kurtas or gadgets go on sale.',
    accent: '#16A34A',
    light: '#F0FDF4',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=75',
    imgPos: 'center center',
  },
}

function useTilt() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setTilt({
      x: ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -6,
      y: ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  6,
    })
  }
  const onEnter = () => setHovered(true)
  const onLeave = () => { setTilt({ x: 0, y: 0 }); setHovered(false) }
  return { hovered, onMove, onEnter, onLeave, tilt }
}

function SmallCard({ card, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const { hovered, onMove, onEnter, onLeave, tilt } = useTilt()
  const Icon = card.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: `1.5px solid ${hovered ? card.accent + '50' : '#E2E8F0'}`,
        borderRadius: 18,
        boxShadow: hovered ? `0 16px 40px ${card.accent}20, 0 2px 8px rgba(15,23,42,0.08)` : '0 1px 3px rgba(15,23,42,0.05)',
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${hovered ? -6 : 0}px)`,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        willChange: 'transform',
        cursor: 'default',
        height: '100%',
        minHeight: 160,
      }}
    >
      {/* Product image background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${card.img})`,
        backgroundSize: 'cover',
        backgroundPosition: card.imgPos,
        transform: hovered ? 'scale(1.07)' : 'scale(1)',
        transition: 'transform 0.5s ease',
      }} />

      {/* Gradient overlay — stronger at bottom for text readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.88) 45%, rgba(255,255,255,0.98) 100%)`,
      }} />

      {/* Accent tint on hover */}
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${card.accent}08 0%, transparent 60%)`,
        }} />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '22px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: card.light, color: card.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 10,
          boxShadow: `0 2px 8px ${card.accent}20`,
        }}>
          <Icon size={16} />
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 5px' }}>{card.title}</h3>
        <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
        <div style={{
          marginTop: 12, height: 2, borderRadius: 99,
          background: hovered ? card.accent : '#E2E8F0',
          width: hovered ? '55%' : '28%',
          transition: 'all 0.35s ease',
        }} />
      </div>
    </motion.div>
  )
}

function CenterCard({ delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const { hovered, onMove, onEnter, onLeave, tilt } = useTilt()
  const card = CARDS.center
  const Icon = card.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: `1.5px solid ${hovered ? card.accent + '60' : '#C7D2FE'}`,
        borderRadius: 20,
        boxShadow: hovered ? `0 24px 56px ${card.accent}25, 0 4px 16px rgba(15,23,42,0.1)` : '0 4px 20px rgba(79,70,229,0.1)',
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${hovered ? -6 : 0}px)`,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        willChange: 'transform',
        cursor: 'default',
        height: '100%',
      }}
    >
      {/* Product image background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${card.img})`,
        backgroundSize: 'cover',
        backgroundPosition: card.imgPos,
        transform: hovered ? 'scale(1.06)' : 'scale(1)',
        transition: 'transform 0.5s ease',
      }} />

      {/* Strong gradient overlay for center card */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(238,242,255,0.3) 0%, rgba(248,250,252,0.82) 40%, rgba(245,243,255,0.97) 70%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-end', textAlign: 'center',
        padding: '40px 28px', height: '100%',
      }}>
        <motion.div
          animate={{ scale: hovered ? 1.1 : 1, rotate: hovered ? 8 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            width: 64, height: 64, borderRadius: 18,
            background: card.light, color: card.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
            boxShadow: `0 8px 24px ${card.accent}30`,
          }}
        >
          <Icon size={28} />
        </motion.div>

        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          {card.title}
        </h3>
        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, margin: '0 0 20px', maxWidth: 220 }}>
          {card.desc}
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11.5, fontWeight: 600, color: card.accent,
          background: card.light, padding: '6px 14px',
          borderRadius: 99, border: `1px solid ${card.accent}30`,
          boxShadow: `0 2px 8px ${card.accent}15`,
        }}>
          <ShieldCheck size={12} /> Powered by NeuroAI
        </div>
      </div>
    </motion.div>
  )
}

export function FeatureGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section style={{ marginBottom: 40 }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 24 }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Everything you need
        </h2>
        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
          From kurtas to kicks — discover, compare and buy with confidence.
        </p>
      </motion.div>

      <div className="feature-grid-responsive" style={{ display: 'grid', gap: 20 }}>
        <SmallCard card={CARDS.topLeft}     delay={0}    />
        <SmallCard card={CARDS.bottomLeft}  delay={0.1}  />
        <CenterCard                         delay={0.05} />
        <SmallCard card={CARDS.topRight}    delay={0.15} />
        <SmallCard card={CARDS.bottomRight} delay={0.2}  />
      </div>

      <style>{`
        .feature-grid-responsive {
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: auto;
        }
        @media (min-width: 1024px) {
          .feature-grid-responsive {
            grid-template-columns: 1fr 1.4fr 1fr !important;
            grid-template-rows: 200px 200px !important;
            height: 420px;
          }
          .feature-grid-responsive > *:nth-child(1) { grid-column: 1; grid-row: 1; }
          .feature-grid-responsive > *:nth-child(2) { grid-column: 1; grid-row: 2; }
          .feature-grid-responsive > *:nth-child(3) { grid-column: 2; grid-row: 1 / 3; }
          .feature-grid-responsive > *:nth-child(4) { grid-column: 3; grid-row: 1; }
          .feature-grid-responsive > *:nth-child(5) { grid-column: 3; grid-row: 2; }
        }
        @media (max-width: 640px) {
          .feature-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}

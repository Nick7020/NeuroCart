import { useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { Sparkles, ShieldCheck, Shirt, Layers, Monitor, Watch } from 'lucide-react'
import { Link } from 'react-router-dom'

import kurta    from '../../assets/products/Clothing/photo-1621951753163-ee63e7fc147e.jpg'
import fashion  from '../../assets/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg'
import headphone from '../../assets/products/Electronics/headphone.jpg'
import laptop   from '../../assets/products/Electronics/laptop.jpg'
import watchImg from '../../assets/products/Electronics/Watch/Gemini_Generated_Image_2yafks2yafks2yaf.png'

const CARDS = {
  topLeft:     { icon: Shirt,    title: 'Ethnic & Casual Wear',  desc: 'Explore kurtas, sarees, shirts & more — top brands, latest trends, best prices.',                              accent: '#4F46E5', img: kurta,      imgPos: 'center center', to: '/products?category=Clothing'    },
  bottomLeft:  { icon: Layers,   title: 'Trending Fashion',      desc: 'Stay ahead with the latest styles — new arrivals added daily across all categories.',                          accent: '#0284C7', img: fashion,    imgPos: 'center top',    to: '/products?category=Clothing'    },
  center:      { icon: Sparkles, title: 'AI Picks for You',      desc: 'Our AI listens to your style — headphones, gadgets, fashion — and builds a feed made just for you.',           accent: '#7C3AED', img: headphone,  imgPos: 'center center', to: '/products'                      },
  topRight:    { icon: Monitor,  title: 'Top Electronics',       desc: 'Laptops, tablets, accessories — premium tech at unbeatable prices, delivered fast.',                           accent: '#D97706', img: laptop,     imgPos: 'center center', to: '/products?category=Electronics' },
  bottomRight: { icon: Watch,    title: 'Watches & Accessories', desc: 'Smart watches, luxury timepieces & accessories — find your perfect match.',                                    accent: '#16A34A', img: watchImg,   imgPos: 'center center', to: '/products?category=Electronics' },
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
    <Link to={card.to} style={{ display: 'block', height: '100%', textDecoration: 'none' }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, delay, ease: 'easeOut' }}
        onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 18, height: '100%', minHeight: 180,
          border: `1.5px solid ${hovered ? card.accent + '60' : '#E2E8F0'}`,
          boxShadow: hovered ? `0 16px 40px ${card.accent}25, 0 2px 8px rgba(15,23,42,0.08)` : '0 1px 3px rgba(15,23,42,0.05)',
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${hovered ? -6 : 0}px)`,
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
          willChange: 'transform', cursor: 'pointer',
        }}
      >
        <img src={card.img} alt={card.title} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: card.imgPos,
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
          transition: 'transform 0.5s ease',
        }} />

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,20,0.78) 0%, rgba(10,10,20,0.35) 50%, rgba(10,10,20,0.05) 100%)' }} />

        {hovered && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${card.accent}18 0%, transparent 60%)` }} />}

        <div style={{ position: 'relative', zIndex: 2, padding: '18px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, border: '1px solid rgba(255,255,255,0.25)' }}>
            <Icon size={15} />
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{card.title}</h3>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.55, margin: 0 }}>{card.desc}</p>
          <div style={{ marginTop: 10, height: 2, borderRadius: 99, background: hovered ? card.accent : 'rgba(255,255,255,0.3)', width: hovered ? '55%' : '28%', transition: 'all 0.35s ease' }} />
        </div>
      </motion.div>
    </Link>
  )
}

function CenterCard({ delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const { hovered, onMove, onEnter, onLeave, tilt } = useTilt()
  const card = CARDS.center
  const Icon = card.icon

  return (
    <Link to={card.to} style={{ display: 'block', height: '100%', textDecoration: 'none' }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay, ease: 'easeOut' }}
        onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20, height: '100%',
          border: `1.5px solid ${hovered ? card.accent + '70' : '#C7D2FE'}`,
          boxShadow: hovered ? `0 24px 56px ${card.accent}30, 0 4px 16px rgba(15,23,42,0.1)` : '0 4px 20px rgba(79,70,229,0.12)',
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${hovered ? -6 : 0}px)`,
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
          willChange: 'transform', cursor: 'pointer',
        }}
      >
        <img src={card.img} alt={card.title} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: card.imgPos,
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.5s ease',
        }} />

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,25,0.88) 0%, rgba(10,10,25,0.55) 45%, rgba(10,10,25,0.15) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${card.accent}35 0%, transparent 65%)` }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'center', padding: '32px 28px', height: '100%' }}>
          <motion.div
            animate={{ scale: hovered ? 1.1 : 1, rotate: hovered ? 8 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '1px solid rgba(255,255,255,0.3)', boxShadow: `0 8px 24px ${card.accent}40` }}
          >
            <Icon size={26} />
          </motion.div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{card.title}</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 1.65, margin: '0 0 18px', maxWidth: 220 }}>{card.desc}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.25)' }}>
            <ShieldCheck size={12} /> Powered by NeuroAI
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export function FeatureGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section style={{ marginBottom: 40 }}>
      <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4 }} style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Everything you need</h2>
        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>From kurtas to kicks — discover, compare and buy with confidence.</p>
      </motion.div>

      <div className="feature-grid-responsive" style={{ display: 'grid', gap: 20 }}>
        <SmallCard card={CARDS.topLeft}     delay={0}    />
        <SmallCard card={CARDS.bottomLeft}  delay={0.1}  />
        <CenterCard                         delay={0.05} />
        <SmallCard card={CARDS.topRight}    delay={0.15} />
        <SmallCard card={CARDS.bottomRight} delay={0.2}  />
      </div>

      <style>{`
        .feature-grid-responsive { grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 1024px) {
          .feature-grid-responsive {
            grid-template-columns: 1fr 1.4fr 1fr !important;
            grid-template-rows: 210px 210px !important;
            height: 440px;
          }
          .feature-grid-responsive > *:nth-child(1) { grid-column: 1; grid-row: 1; }
          .feature-grid-responsive > *:nth-child(2) { grid-column: 1; grid-row: 2; }
          .feature-grid-responsive > *:nth-child(3) { grid-column: 2; grid-row: 1 / 3; }
          .feature-grid-responsive > *:nth-child(4) { grid-column: 3; grid-row: 1; }
          .feature-grid-responsive > *:nth-child(5) { grid-column: 3; grid-row: 2; }
        }
        @media (max-width: 640px) {
          .feature-grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

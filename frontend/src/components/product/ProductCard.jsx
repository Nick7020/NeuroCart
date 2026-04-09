import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Heart, Zap } from 'lucide-react'
import { formatCurrency } from '../../utils'
import { useCart } from '../../context/CartContext'
import { useNotification } from '../../context/NotificationContext'
import { useState } from 'react'

function getTag(product) {
  if (product.discount >= 30) return { label: 'Hot Deal', bg: '#fef2f2', color: '#ef4444' }
  if (product.discount >= 15) return { label: 'Best Seller', bg: '#fffbeb', color: '#d97706' }
  if (Number(product._id) <= 3) return { label: 'New', bg: '#f0fdf4', color: '#16a34a' }
  return { label: 'Popular', bg: '#eff6ff', color: '#2563eb' }
}

export function ProductCard({ product }) {
  const { addItem } = useCart()
  const { notify } = useNotification()
  const [adding, setAdding] = useState(false)
  const [liked, setLiked] = useState(false)
  const tag = getTag(product)

  const handleAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    try {
      await addItem(product._id)
      notify(`${product.name} added to cart! 🛒`, 'success')
    } catch {
      notify('Failed to add to cart', 'error')
    } finally {
      setTimeout(() => setAdding(false), 600)
    }
  }

  return (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
      <Link to={`/products/${product._id}`}
        className="block bg-white rounded-2xl overflow-hidden group transition-all duration-300"
        style={{ border: '1px solid #e8edf2', boxShadow: '0 2px 12px rgba(26,50,99,0.06)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A3263'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(26,50,99,0.12)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8edf2'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,50,99,0.06)' }}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-gray-50">
          <img
            src={product.images?.[0] || `https://placehold.co/300x300/f0f4ff/1A3263?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to top, rgba(26,50,99,0.15), transparent)' }} />

          {/* Tag */}
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: tag.bg, color: tag.color }}>
            {tag.label}
          </span>

          {/* Discount */}
          {product.discount > 0 && (
            <span className="absolute top-3 right-10 text-[10px] font-bold px-2 py-1 rounded-full bg-red-500 text-white">
              -{product.discount}%
            </span>
          )}

          {/* Wishlist */}
          <button onClick={(e) => { e.preventDefault(); setLiked(!liked) }}
            className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110">
            <Heart size={13} style={{ color: liked ? '#ef4444' : '#9ca3af', fill: liked ? '#ef4444' : 'none' }} />
          </button>

          {/* Quick add on hover */}
          <motion.button onClick={handleAdd} disabled={product.stock === 0 || adding}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 whitespace-nowrap shadow-lg"
            style={{ background: '#1A3263', color: '#fff' }}
            whileTap={{ scale: 0.95 }}>
            {adding
              ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}><Zap size={13} /></motion.div>
              : <ShoppingCart size={13} />}
            {adding ? 'Adding...' : 'Quick Add'}
          </motion.button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[11px] font-semibold mb-1 uppercase tracking-wide text-blue-500">{product.category}</p>
          <h3 className="text-sm font-semibold text-gray-800 truncate mb-2">{product.name}</h3>

          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} style={{ color: i < 4 ? '#f59e0b' : '#d1d5db', fill: i < 4 ? '#f59e0b' : 'none' }} />
              ))}
            </div>
            <span className="text-[11px] text-gray-400">(4.0)</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-base font-extrabold text-gray-900">{formatCurrency(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through ml-1.5">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>
            <motion.button onClick={handleAdd} disabled={product.stock === 0 || adding}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 shadow-sm"
              style={{ background: '#1A3263' }}>
              <ShoppingCart size={14} className="text-white" />
            </motion.button>
          </div>

          {product.stock === 0 && <p className="text-xs text-red-500 mt-2 font-medium">Out of Stock</p>}
        </div>
      </Link>
    </motion.div>
  )
}

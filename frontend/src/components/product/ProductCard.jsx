import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Heart, Zap } from 'lucide-react'
import { formatCurrency } from '../../utils'
import { useCart } from '../../context/CartContext'
import { useNotification } from '../../context/NotificationContext'
import { useState } from 'react'

const TAG_STYLES = {
  'Best Seller': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'New':         'bg-green-500/20 text-green-400 border-green-500/30',
  'Popular':     'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Discount':    'bg-red-500/20 text-red-400 border-red-500/30',
  'AI Pick':     'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
}

function getTag(product) {
  if (product.discount >= 30) return 'Discount'
  if (product.discount >= 15) return 'Best Seller'
  if (product._id <= '3') return 'New'
  return 'Popular'
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
      notify(`${product.name} added to cart!`, 'success')
    } catch {
      notify('Failed to add to cart', 'error')
    } finally {
      setTimeout(() => setAdding(false), 600)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        to={`/products/${product._id}`}
        className="block bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-indigo-500/10 hover:shadow-2xl"
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 aspect-square">
          <img
            src={product.images?.[0] || `https://placehold.co/300x300/1e1b4b/818cf8?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Tag */}
          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full border ${TAG_STYLES[tag]}`}>
            {tag}
          </span>

          {/* Discount badge */}
          {product.discount > 0 && (
            <span className="absolute top-3 right-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
              -{product.discount}%
            </span>
          )}

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); setLiked(!liked) }}
            className="absolute top-3 right-3 w-7 h-7 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-black/60"
          >
            <Heart size={13} className={liked ? 'fill-pink-500 text-pink-500' : 'text-white'} />
          </button>

          {/* Quick add button on hover */}
          <motion.button
            onClick={handleAdd}
            disabled={product.stock === 0 || adding}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 whitespace-nowrap shadow-lg"
            whileTap={{ scale: 0.95 }}
          >
            {adding ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}>
                <Zap size={13} />
              </motion.div>
            ) : (
              <ShoppingCart size={13} />
            )}
            {adding ? 'Adding...' : 'Quick Add'}
          </motion.button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[11px] text-indigo-400 font-medium mb-1 uppercase tracking-wide">{product.category}</p>
          <h3 className="text-sm font-semibold text-gray-100 truncate mb-2">{product.name}</h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />
              ))}
            </div>
            <span className="text-[11px] text-gray-500">(4.0)</span>
          </div>

          {/* Price + Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-base font-bold text-white">{formatCurrency(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-gray-500 line-through ml-1.5">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>
            <motion.button
              onClick={handleAdd}
              disabled={product.stock === 0 || adding}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shadow-md shadow-indigo-500/20"
            >
              <ShoppingCart size={14} className="text-white" />
            </motion.button>
          </div>

          {product.stock === 0 && (
            <p className="text-xs text-red-400 mt-2">Out of Stock</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, Star, Shield, Truck, RotateCcw, Plus, Minus } from 'lucide-react'
import { useFetch } from '../../hooks/useFetch'
import { productService } from '../../services'
import { useCart } from '../../context/CartContext'
import { useNotification } from '../../context/NotificationContext'
import { ImageCarousel } from '../../components/product/ImageCarousel'
import { ProductCard } from '../../components/product/ProductCard'
import { PageLoader, Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils'

function RelatedProducts({ category, currentId }) {
  const { data, loading } = useFetch(
    () => productService.getAll({ category }),
    [category]
  )
  const products = (data?.products || data || []).filter(p => String(p._id) !== String(currentId)).slice(0, 5)

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>
  if (!products.length) return null

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-5" style={{ color: '#0f172a' }}>Related Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map(p => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  )
}

export function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { notify } = useNotification()
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  const { data, loading } = useFetch(() => productService.getById(id), [id])
  const product = data?.product || data

  // Normalize images: backend detail returns [{image_url, ...}], carousel needs string[]
  const imageUrls = (product?.images || []).map(img =>
    typeof img === 'string' ? img : img.image_url
  ).filter(Boolean)

  const handleAdd = async () => {
    setAdding(true)
    try {
      await addItem(product.id, qty)
      notify(`${product.name} added to cart! 🛒`, 'success')
    } catch { notify('Failed to add', 'error') }
    finally { setAdding(false) }
  }

  if (loading) return <PageLoader />
  if (!product) return <div className="text-center py-20 text-gray-400">Product not found</div>

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-700 mb-6 text-sm group transition-colors">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        <ImageCarousel images={imageUrls} productName={product.name} />

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
          <div>
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full mb-3">{product.category}</span>
            <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={14} style={{ color: i < 4 ? '#f59e0b' : '#d1d5db', fill: i < 4 ? '#f59e0b' : 'none' }} />)}</div>
              <span className="text-sm text-gray-400">4.0 (128 reviews)</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-4xl font-extrabold text-gray-900">{formatCurrency(product.price)}</span>
            {product.originalPrice > product.price && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 line-through text-xl">{formatCurrency(product.originalPrice)}</span>
                <span className="bg-red-50 text-red-500 text-sm font-bold px-2 py-0.5 rounded-lg">-{product.discount}% OFF</span>
              </div>
            )}
          </div>


          <p className="text-gray-500 leading-relaxed">{product.description}</p>

          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl w-fit ${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
          </span>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"><Minus size={14} /></button>
              <span className="w-10 text-center font-bold text-gray-900">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={product.stock === 0} className="w-10 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-40"><Plus size={14} /></button>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={product.stock === 0 || adding}
              className="btn-primary flex-1 py-3 disabled:opacity-50">
              <ShoppingCart size={18} /> {adding ? 'Adding...' : 'Add to Cart'}
            </motion.button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Truck size={16} />, label: 'Free Delivery', sub: '2-3 days' },
              { icon: <Shield size={16} />, label: 'Secure Pay', sub: '100% safe' },
              { icon: <RotateCcw size={16} />, label: 'Easy Return', sub: '30 days' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                <span style={{ color: '#1A3263' }}>{icon}</span>
                <span className="text-xs font-semibold text-gray-700">{label}</span>
                <span className="text-[10px] text-gray-400">{sub}</span>
              </div>
            ))}
          </div>

          {product.specs && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-400 mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-400">{k}</span>
                    <span className="text-gray-800 font-medium text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <RelatedProducts category={product.category} currentId={product._id} />
    </div>
  )
}

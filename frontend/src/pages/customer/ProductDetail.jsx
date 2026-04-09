import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { productService } from '../../services'
import { useCart } from '../../context/CartContext'
import { useNotification } from '../../context/NotificationContext'
import { ImageCarousel } from '../../components/product/ImageCarousel'
import { RecommendationSection } from '../../components/ai/RecommendationSection'
import { PageLoader } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils'

export function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { notify } = useNotification()
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  const { data, loading } = useFetch(() => productService.getById(id), [id])
  const product = data?.product || data

  if (loading) return <PageLoader />
  if (!product) return <div className="text-center py-20 text-gray-400">Product not found</div>

  const handleAddToCart = async () => {
    setAdding(true)
    try {
      await addItem(product._id, qty)
      notify('Added to cart!', 'success')
    } catch {
      notify('Failed to add to cart', 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm">
        ← Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        <ImageCarousel images={product.images} />

        <div className="flex flex-col gap-5">
          <div>
            <span className="badge bg-indigo-500/20 text-indigo-300 mb-2">{product.category}</span>
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-white">{formatCurrency(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-gray-500 line-through text-lg">{formatCurrency(product.originalPrice)}</span>
            )}
          </div>

          <p className="text-gray-400 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-2">
            <span className={`badge ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {product.stock > 0 ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded-lg transition-colors">−</button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded-lg transition-colors">+</button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {adding ? 'Adding...' : '🛒 Add to Cart'}
            </button>
          </div>

          {product.specs && (
            <div className="card p-4 mt-2">
              <h3 className="font-semibold mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="text-sm">
                    <span className="text-gray-400">{k}: </span>
                    <span className="text-gray-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <RecommendationSection productId={id} title="🔗 Related Products" />
    </div>
  )
}

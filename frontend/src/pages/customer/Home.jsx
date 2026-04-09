import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, TrendingUp, Sparkles } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Hero } from '../../components/ui/Hero'
import { CategorySection } from '../../components/ui/CategorySection'
import { FeatureGrid } from '../../components/ui/FeatureGrid'
import { OfferBanner } from '../../components/ui/OfferBanner'
import { ProductCard } from '../../components/product/ProductCard'
import { RecommendationSection } from '../../components/ai/RecommendationSection'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { productService } from '../../services'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = ['All', 'Electronics', 'Sports', 'Clothing', 'Books', 'Home', 'Beauty']

const PRICE_RANGES = [
  { label: 'All',        min: 0,     max: undefined },
  { label: 'Under ₹1K', min: 0,     max: 1000 },
  { label: '₹1K–₹10K',  min: 1000,  max: 10000 },
  { label: '₹10K–₹50K', min: 10000, max: 50000 },
  { label: '₹50K+',     min: 50000, max: undefined },
]

export function Home() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState('All')
  const [priceIdx, setPriceIdx] = useState(0)
  const [sort, setSort]         = useState('default')

  const urlSearch = searchParams.get('search') || ''

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const range = PRICE_RANGES[priceIdx]
      const params = {
        ...(urlSearch              && { search: urlSearch }),
        ...(category !== 'All'     && { category }),
        ...(range.min > 0          && { minPrice: range.min }),
        ...(range.max !== undefined && { maxPrice: range.max }),
      }
      const { data } = await productService.getAll(params)
      let list = data.products || data || []
      if (sort === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price)
      if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
      if (sort === 'discount')   list = [...list].sort((a, b) => (b.discount || 0) - (a.discount || 0))
      setProducts(list)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [urlSearch, category, priceIdx, sort])

  useEffect(() => {
    const t = setTimeout(fetchProducts, 200)
    return () => clearTimeout(t)
  }, [fetchProducts])

  return (
    <div>
      <Hero />
      <CategorySection onCategorySelect={(c) => setCategory(prev => prev === c ? 'All' : c)} />
      <FeatureGrid />
      <OfferBanner />

      {/* Products Section */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {category !== 'All' ? category : urlSearch ? `Results for "${urlSearch}"` : 'Featured Products'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{products.length} products</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
              {PRICE_RANGES.map((r, i) => (
                <button key={r.label} onClick={() => setPriceIdx(i)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap ${priceIdx === i ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {r.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
              <SlidersHorizontal size={14} className="text-gray-400" />
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer">
                <option value="default">Default</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${category === c ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : !products.length ? (
          <EmptyState title="No products found" description="Try different filters or search terms" />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* AI Recommendations */}
      {user && (
        <section className="mt-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-purple-400" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI Picks for You
            </h2>
          </div>
          <RecommendationSection />
        </section>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { ProductGrid } from '../../components/product/ProductGrid'
import { RecommendationSection } from '../../components/ai/RecommendationSection'
import { productService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty']

export function Home() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [priceRange, setPriceRange] = useState([0, 100000])

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 400)
    return () => clearTimeout(timer)
  }, [search, category, priceRange])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {
        ...(search && { search }),
        ...(category !== 'All' && { category }),
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      }
      const { data } = await productService.getAll(params)
      setProducts(data.products || data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-gray-900 border border-indigo-500/20 p-10 md:p-16">
        <div className="relative z-10 max-w-xl">
          <span className="badge bg-indigo-500/20 text-indigo-300 mb-4">🤖 AI-Powered Shopping</span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Shop Smarter with <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">NeuroCart</span>
          </h1>
          <p className="text-gray-400 mb-6">Personalized recommendations powered by AI. Discover products made for you.</p>
          <Link to="/products" className="btn-primary inline-block">Explore Products →</Link>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 bg-gradient-to-l from-indigo-500 to-transparent" />
      </section>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === c ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 min-w-fit">
          <span className="text-sm text-gray-400">Max:</span>
          <input
            type="range"
            min={0}
            max={100000}
            step={500}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, Number(e.target.value)])}
            className="w-28 accent-indigo-500"
          />
          <span className="text-sm text-indigo-400 min-w-[60px]">₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <ProductGrid products={products} loading={loading} />

      {user && <RecommendationSection />}
    </div>
  )
}

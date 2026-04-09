import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { recommendationService } from '../../services'
import { ProductCard } from '../product/ProductCard'

const SKELETON_COUNT = 5

function SkeletonCard() {
  return (
    <div
      className="animate-pulse bg-gray-800 rounded-2xl flex-shrink-0"
      style={{ width: 200, aspectRatio: '1/1' }}
    />
  )
}

export function RecommendationSection({
  endpoint = 'trending',
  productId,
  title = 'Recommended for You',
}) {
  const { user } = useAuth()

  const fetchFn =
    endpoint === 'user' && !user
      ? null
      : endpoint === 'product'
      ? () => recommendationService.getByProduct(productId)
      : endpoint === 'user'
      ? () => recommendationService.getForUser()
      : () => recommendationService.getTrending()

  const { data, loading, error } = useFetch(fetchFn, [endpoint, productId, user])

  if (endpoint === 'user' && !user) return null

  if (loading) {
    return (
      <section className="mt-12">
        <div className="flex gap-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (error) return null

  const products = Array.isArray(data) ? data : data?.results ?? []
  if (!products.length) return null

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        {title}
      </h2>
      <div
        className="flex gap-4 overflow-x-auto"
        style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
      >
        {products.map((p) => (
          <div key={p.id || p._id} className="flex-shrink-0 w-[200px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}

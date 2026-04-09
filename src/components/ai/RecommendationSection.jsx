import { useFetch } from '../../hooks/useFetch'
import { aiService } from '../../services'
import { ProductCard } from '../product/ProductCard'
import { Spinner } from '../ui/Spinner'

export function RecommendationSection({ productId, title = '✨ Recommended for You' }) {
  const { data, loading } = useFetch(
    () => aiService.recommendations(productId ? { productId } : {}),
    [productId]
  )

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>
  if (!data?.products?.length) return null

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {data.products.slice(0, 5).map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  )
}

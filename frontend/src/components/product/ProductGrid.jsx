import { ProductCard } from './ProductCard'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'

export function ProductGrid({ products, loading }) {
  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!products?.length) return <EmptyState icon="🛍️" title="No products found" description="Try adjusting your filters" />
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((p) => <ProductCard key={p._id} product={p} />)}
    </div>
  )
}

export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' }[size]
  return <div className={`${s} border-gray-200 border-t-blue-600 rounded-full animate-spin`} style={{ borderTopColor: '#1A3263' }} />
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  )
}

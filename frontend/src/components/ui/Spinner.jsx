export function Spinner({ size = 'md' }) {
  const dim = { sm: 16, md: 28, lg: 44 }[size]
  const border = { sm: 2, md: 2.5, lg: 3 }[size]
  return (
    <div
      className="rounded-full animate-spin flex-shrink-0"
      style={{
        width: dim,
        height: dim,
        border: `${border}px solid rgba(26,47,107,0.1)`,
        borderTopColor: '#1a2f6b',
        borderRightColor: 'rgba(26,47,107,0.4)',
      }}
    />
  )
}

export function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#f4f6f9' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Spinner size="lg" />
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: 'rgba(26,47,107,0.3)', animationDuration: '1.4s' }}
          />
        </div>
        <p className="text-sm font-medium" style={{ color: '#9898a8' }}>Loading…</p>
      </div>
    </div>
  )
}

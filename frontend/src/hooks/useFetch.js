import { useState, useEffect, useRef } from 'react'

export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(fn != null)
  const [error, setError] = useState(null)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    if (!fnRef.current) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(null)
    fnRef.current()
      .then(({ data: d }) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}

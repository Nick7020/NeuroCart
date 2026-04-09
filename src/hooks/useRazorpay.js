import { useState, useCallback } from 'react'

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

function loadScript() {
  return new Promise((resolve, reject) => {
    // Already loaded — resolve immediately
    if (window.Razorpay) {
      resolve()
      return
    }

    // Script tag already injected but not yet loaded
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')))
      return
    }

    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_URL
    script.async = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load Razorpay script'))
    document.body.appendChild(script)
  })
}

export function useRazorpay() {
  const [scriptLoaded, setScriptLoaded] = useState(!!window.Razorpay)

  const openCheckout = useCallback(async (options) => {
    const { onPaymentFailed, ...rzpOptions } = options
    await loadScript()
    setScriptLoaded(true)
    const rzp = new window.Razorpay(rzpOptions)
    if (typeof onPaymentFailed === 'function') {
      rzp.on('payment.failed', onPaymentFailed)
    }
    rzp.open()
  }, [])

  return { openCheckout, scriptLoaded }
}

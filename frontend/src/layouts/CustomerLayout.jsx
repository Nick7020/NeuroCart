import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Navbar } from './Navbar'
import { Chatbot } from '../components/ai/Chatbot'
import { CartSidebar } from '../components/cart/CartSidebar'
import { Footer } from '../components/ui/Footer'

export function CustomerLayout() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: '#ffedce' }}>
      <Navbar onCartClick={() => setCartOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <Chatbot />
    </div>
  )
}

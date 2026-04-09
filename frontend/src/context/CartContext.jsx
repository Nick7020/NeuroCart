import { createContext, useContext, useState, useEffect } from 'react'
import { cartService } from '../services'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.role === 'customer') fetchCart()
    else setItems([])
  }, [user])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const { data } = await cartService.get()
      setItems(data.items || [])
    } catch {}
    finally { setLoading(false) }
  }

  const addItem = async (productId, quantity = 1) => {
    const { data } = await cartService.add({ productId, quantity })
    setItems(data.items)
  }

  const updateItem = async (itemId, quantity) => {
    const { data } = await cartService.update(itemId, { quantity })
    setItems(data.items)
  }

  const removeItem = async (itemId) => {
    const { data } = await cartService.remove(itemId)
    setItems(data.items)
  }

  const clearCart = async () => {
    await cartService.clear()
    setItems([])
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, loading, total, count, addItem, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

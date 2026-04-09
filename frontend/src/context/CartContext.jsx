import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { MOCK_MODE } from '../services/api'
import { cartService } from '../services'
import { MOCK_PRODUCTS } from '../utils/mockData'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      // vendors and admins don't have a cart
      if (user.role === 'vendor' || user.role === 'admin') { setItems([]); return }
      if (MOCK_MODE) {
        const saved = sessionStorage.getItem('mockCart')
        setItems(saved ? JSON.parse(saved) : [])
      } else {
        fetchCart()
      }
    } else {
      setItems([])
    }
  }, [user])

  // persist mock cart
  useEffect(() => {
    if (MOCK_MODE) sessionStorage.setItem('mockCart', JSON.stringify(items))
  }, [items])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const { data } = await cartService.get()
      setItems(data.items || [])
    } catch {}
    finally { setLoading(false) }
  }

  const addItem = async (productId, quantity = 1) => {
    if (MOCK_MODE) {
      const product = MOCK_PRODUCTS.find(p => p._id === productId)
      if (!product) return
      setItems(prev => {
        const existing = prev.find(i => i.productId === productId)
        if (existing) {
          return prev.map(i => i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
          )
        }
        return [...prev, {
          _id: 'cart-' + productId,
          productId,
          product,
          price: product.price,
          quantity,
        }]
      })
      return
    }
    const { data } = await cartService.add({ product_id: productId, quantity })
    setItems(data.items)
  }

  const updateItem = async (itemId, quantity) => {
    if (quantity < 1) return removeItem(itemId)
    if (MOCK_MODE) {
      setItems(prev => prev.map(i => i._id === itemId ? { ...i, quantity } : i))
      return
    }
    const { data } = await cartService.update(itemId, { quantity })
    setItems(data.items)
  }

  const removeItem = async (itemId) => {
    if (MOCK_MODE) {
      setItems(prev => prev.filter(i => i._id !== itemId))
      return
    }
    const { data } = await cartService.remove(itemId)
    setItems(data.items)
  }

  const clearCart = async () => {
    if (MOCK_MODE) { setItems([]); return }
    await cartService.clear()
    setItems([])
  }

  const total = items.reduce((s, i) => s + (i.product?.price ?? i.price ?? 0) * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, loading, total, count, addItem, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
